# api.py
import os
import json
import secrets
from typing import List, Optional
from datetime import datetime, timedelta

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, ConfigDict

from models import SessionLocal, Customer, Job

from models import init_db


# ------------------------------------------------------------
# FastAPI app + static + CORS
# ------------------------------------------------------------

app = FastAPI(title="ROM Backend API")

# =========================================================
# Startup: ensure database schema exists
# =========================================================
from models import init_db

@app.on_event("startup")
def startup_event():
    init_db()


# Serve static files (e.g. /static/image.jpg)
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://127.0.0.1:8001",
    "http://localhost:8001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------
# Config / env
# ------------------------------------------------------------

load_dotenv()
ZAPIER_WEBHOOK_URL = os.getenv("ZAPIER_WEBHOOK_URL")
RESET_ZAPIER_WEBHOOK_URL = os.getenv("RESET_ZAPIER_WEBHOOK_URL")

if not ZAPIER_WEBHOOK_URL:
    print("WARNING: ZAPIER_WEBHOOK_URL not set in .env. /jobs emails will be skipped.")

FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:8000")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------

class JobCreate(BaseModel):
    # customer info
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None

    # NEW: from form
    is_first_time: Optional[bool] = None
    agency: Optional[str] = None

    # usage
    usage: Optional[str] = None

    # property location
    address: str
    city: str
    building_name: Optional[str] = None

    # bedrooms / bathrooms / size (as labels from your form)
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    listing_size: Optional[str] = None

    # views
    views: Optional[List[str]] = None

    # finished basement
    finished_basement: Optional[str] = None

    # price band
    estimated_price_band: Optional[str] = None

    # dates
    date_listing_ready: Optional[str] = None
    date_to_go_live: Optional[str] = None
    desired_date: Optional[str] = None

    # occupancy & shoot conditions
    is_vacant: Optional[str] = None
    during_shoot_agreement: Optional[bool] = None

    # access
    access_type: Optional[str] = None
    access_code: Optional[str] = None
    owner_contact_info: Optional[str] = None

    # services requested
    services: List[str]

    # notes
    notes_for_photographer: Optional[str] = None

class EstimateLineItem(BaseModel):
    code: str
    label: str
    qty: float = 1
    unit_price: float
    line_total: float


class EstimateResponse(BaseModel):
    currency: str = "USD"
    subtotal: float
    total: float
    line_items: List[EstimateLineItem]
    # Keep structure open for future distance/scheduling:
    meta: dict = {}


class JobResponse(BaseModel):
    job_id: int
    customer_id: int
    estimate: Optional[EstimateResponse] = None

class JobSummary(BaseModel):
    id: int
    job_date: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    service_raw: Optional[str] = None
    invoice_number: Optional[str] = None
    source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    customer_id: Optional[int] = None


class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    agency: Optional[str] = None  # maps to Customer.company


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ChangePassword(BaseModel):
    old_password: str
    new_password: str


class CustomerMe(BaseModel):
    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    company: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    agency: Optional[str] = None  # maps to Customer.company


# ------------------------------------------------------------
# Helper functions
# ------------------------------------------------------------

def clean_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def normalize_phone(phone: Optional[str]) -> Optional[str]:
    import re

    if not phone:
        return None
    digits = re.sub(r"\D", "", phone)
    if len(digits) >= 10:
        digits = digits[-10:]
    return digits or None


def get_or_create_customer(db, first_name, last_name, email, phone, company) -> Customer:
    """
    Simple dedupe logic for live app:
    - Try match by email
    - Else try match by phone
    - Else create new customer
    """
    email = clean_text(email)
    phone = normalize_phone(phone)
    first_name = clean_text(first_name)
    last_name = clean_text(last_name)
    company = clean_text(company)

    # 1) match by email
    if email:
        existing = (
            db.query(Customer)
            .filter(Customer.email == email)
            .order_by(Customer.id)
            .first()
        )
        if existing:
            if phone and not existing.phone:
                existing.phone = phone
            if company and not existing.company:
                existing.company = company
            if first_name and not existing.first_name:
                existing.first_name = first_name
            if last_name and not existing.last_name:
                existing.last_name = last_name
            return existing

    # 2) match by phone
    if phone:
        existing = (
            db.query(Customer)
            .filter(Customer.phone == phone)
            .order_by(Customer.id)
            .first()
        )
        if existing:
            if email and not existing.email:
                existing.email = email
            if company and not existing.company:
                existing.company = company
            if first_name and not existing.first_name:
                existing.first_name = first_name
            if last_name and not existing.last_name:
                existing.last_name = last_name
            return existing

    # 3) create new
    cust = Customer(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        company=company,
    )
    db.add(cust)
    db.flush()
    return cust


def send_booking_email_via_zapier(payload: dict):
    """
    POSTs the booking payload to a Zapier webhook.
    """
    if not ZAPIER_WEBHOOK_URL:
        print("ZAPIER_WEBHOOK_URL not set; skipping Zapier notification.")
        return

    try:
        resp = requests.post(ZAPIER_WEBHOOK_URL, json=payload, timeout=10)
        if resp.status_code >= 400:
            print(f"Zapier webhook returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"Error calling Zapier webhook: {e}")


def send_password_reset_email_via_zapier(email: str, temp_password: str):
    """
    Sends a password reset email via Zapier.
    The Zap should send an email with:
      - this temp_password
      - a link back to your site (e.g. https://www.ryanowenphotography.com/#change-password)
    """
    if not RESET_ZAPIER_WEBHOOK_URL:
        print("RESET_ZAPIER_WEBHOOK_URL not set; skipping password reset email.")
        return

    payload = {
        "email": email,
        "temp_password": temp_password,
        "reset_link": f"{FRONTEND_BASE_URL}/#change-password",
    }

    try:
        resp = requests.post(RESET_ZAPIER_WEBHOOK_URL, json=payload, timeout=10)
        if resp.status_code >= 400:
            print(f"Password reset Zapier webhook returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"Error calling password reset Zapier webhook: {e}")


#Pricing Setup-----------------------------

PRICING_FILE = os.getenv("PRICING_FILE", "pricing.json")


def load_pricing_config() -> dict:
    with open(PRICING_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_sqft_label(label: Optional[str]) -> Optional[int]:
    if not label:
        return None
    # e.g. "3000 sqft", "Larger than 5000 sqft"
    digits = "".join(ch for ch in label if ch.isdigit())
    if digits:
        return int(digits)
    if "Larger than" in label:
        return 5001
    return None


def choose_tier_multiplier(sqft: Optional[int], tiers: list) -> float:
    if sqft is None:
        return 1.0
    for t in tiers:
        if sqft <= int(t["max_sqft"]):
            return float(t["multiplier"])
    return 1.0

def build_estimate(job_in: JobCreate) -> EstimateResponse:
    cfg = load_pricing_config()

    sqft = parse_sqft_label(job_in.listing_size)
    sqft_mult = choose_tier_multiplier(sqft, cfg.get("sqft_tiers", []))

    price_mult = float(cfg.get("price_band_multipliers", {}).get(job_in.estimated_price_band or "", 1.0))
    bed_mult = float(cfg.get("room_multipliers", {}).get("bedrooms", {}).get(job_in.bedrooms or "", 1.0))
    bath_mult = float(cfg.get("room_multipliers", {}).get("bathrooms", {}).get(job_in.bathrooms or "", 1.0))
    finished_key = clean_text(job_in.finished_basement) or ""
    finished_map = {clean_text(k): v for k, v in (cfg.get("finished_basement_multipliers", {}) or {}).items()}
    finished_mult = float(finished_map.get(finished_key, 1.0))


    # Combined multiplier (v1)
    multiplier = sqft_mult * price_mult * bed_mult * bath_mult * finished_mult

    services_cfg = cfg.get("services", {})
    line_items: List[EstimateLineItem] = []

    # Base subtotal BEFORE multipliers (for transparency)
    raw_subtotal = 0.0

    # Build line items (apply multipliers per service)
    for s in (job_in.services or []):
        svc = services_cfg.get(s) or {}
        base = float(svc.get("base", 0))
        apply_mult = bool(svc.get("apply_multipliers", False))

        raw_subtotal += base

        unit_price = base * multiplier if apply_mult else base
        unit_price = round(unit_price, 2)

        line_items.append(
            EstimateLineItem(
                code=f"svc:{s}",
                label=s,
                qty=1.0,
                unit_price=unit_price,
                line_total=unit_price,
            )
        )

    # Total is now the sum of displayed line items
    total = round(sum(li.line_total for li in line_items), 2)

    return EstimateResponse(
        currency=cfg.get("currency", "USD"),
        subtotal=round(raw_subtotal, 2),
        total=total,
        line_items=line_items,
        meta={
            "sqft": sqft,
            "sqft_multiplier": sqft_mult,
            "price_band_multiplier": price_mult,
            "bedroom_multiplier": bed_mult,
            "bathroom_multiplier": bath_mult,
            "finished_basement_multiplier": finished_mult,
            "combined_multiplier": multiplier,
            "address": job_in.address,
            "city": job_in.city,
            # future expansion points:
            "distance_miles": None,
            "travel_time_minutes": None,
        },
    )


# ------------------------------------------------------------
# Auth helper functions
# ------------------------------------------------------------

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_customer_by_email(db, email: str) -> Optional[Customer]:
    email = clean_text(email)
    if not email:
        return None
    return (
        db.query(Customer)
        .filter(Customer.email == email)
        .order_by(Customer.id)
        .first()
    )


def authenticate_customer(db, email: str, password: str) -> Optional[Customer]:
    customer = get_customer_by_email(db, email)
    if not customer or not customer.password_hash:
        return None
    if not verify_password(password, customer.password_hash):
        return None
    return customer


async def get_current_customer(token: str = Depends(oauth2_scheme)) -> Customer:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        customer_id = int(sub)
    except (JWTError, ValueError):
        raise credentials_exception

    db = SessionLocal()
    try:
        customer = db.query(Customer).get(customer_id)
        if customer is None:
            raise credentials_exception
        return customer
    finally:
        db.close()


# ------------------------------------------------------------
# API endpoints
# ------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.options("/jobs")
def options_jobs():
    # This lets the browser's CORS preflight succeed (when served from 8001)
    return Response(status_code=200)


@app.get("/", response_class=HTMLResponse)
def booking_form():
    """
    Serve the booking form HTML from the same origin as the API.
    """
    with open("booking_form.html", encoding="utf-8") as f:
        return f.read()


@app.post("/jobs", response_model=JobResponse)
def create_job(job_in: JobCreate):
    """
    Create a new job from the app and send details to Zapier.
    """
    db = SessionLocal()
    try:
        # ---------- Build price estimate (NEW) ----------
        estimate = build_estimate(job_in)

        raw_form = job_in.dict()
        raw_form["estimate"] = estimate.model_dump()
        # ----------------------------------------------

        customer = get_or_create_customer(
            db,
            first_name=job_in.first_name,
            last_name=job_in.last_name,
            email=job_in.email,
            phone=job_in.phone,
            company=job_in.agency,
        )

        service_raw = ", ".join(job_in.services)
        job = Job(
            customer_id=customer.id,
            invoice_number=None,
            job_date=None,
            service_raw=service_raw,
            bedrooms_raw=clean_text(job_in.bedrooms),
            price_range_raw=clean_text(job_in.estimated_price_band),
            sq_ft_raw=clean_text(job_in.listing_size),
            address=clean_text(job_in.address),
            city=clean_text(job_in.city),
            sale_type=clean_text(job_in.usage),
            source="APP_BOOKING",
            form_data_json=json.dumps(raw_form),  # now includes estimate snapshot
        )
        db.add(job)
        db.flush()

        zap_payload = {
            "customer_id": customer.id,
            "job_id": job.id,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "email": customer.email,
            "phone": customer.phone,
            "agency": job_in.agency,
            "is_first_time": job_in.is_first_time,
            "usage": job_in.usage,
            "address": job.address,
            "city": job.city,
            "building_name": job_in.building_name,
            "bedrooms": job_in.bedrooms,
            "bathrooms": job_in.bathrooms,
            "listing_size": job_in.listing_size,
            "views": job_in.views,
            "finished_basement": job_in.finished_basement,
            "estimated_price_band": job_in.estimated_price_band,
            "date_listing_ready": job_in.date_listing_ready,
            "date_to_go_live": job_in.date_to_go_live,
            "desired_date": job_in.desired_date,
            "is_vacant": job_in.is_vacant,
            "during_shoot_agreement": job_in.during_shoot_agreement,
            "access_type": job_in.access_type,
            "access_code": job_in.access_code,
            "owner_contact_info": job_in.owner_contact_info,
            "services": job_in.services,
            "services_str": ", ".join(job_in.services),
            "notes_for_photographer": job_in.notes_for_photographer,
            "source": "APP",
            "raw_form_json": raw_form,
            "estimate": estimate.model_dump(),  # optional: include estimate in zap payload too
            "estimate_total": estimate.total,
            "estimate_subtotal": estimate.subtotal,
            "estimate_currency": estimate.currency,
            "estimate_multiplier": estimate.meta.get("combined_multiplier"),
            "estimate_line_items": estimate.model_dump().get("line_items", []),
            "estimate_line_items_str": "; ".join(
                [f"{li.label}: ${li.line_total:.2f}" for li in estimate.line_items]
            ),

        }

        send_booking_email_via_zapier(zap_payload)
        db.commit()

        return JobResponse(job_id=job.id, customer_id=customer.id, estimate=estimate)
    except Exception as e:
        db.rollback()
        print("Error in /jobs:", e)
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()



@app.post("/auth/register", response_model=Token)
def register(user_in: UserRegister):
    """
    Register a new account (or set a password for an existing Customer with this email),
    then return an access token.
    """
    db = SessionLocal()
    try:
        existing = get_customer_by_email(db, user_in.email)
        if existing and existing.password_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )

        if existing:
            customer = existing
            customer.first_name = customer.first_name or user_in.first_name
            customer.last_name = customer.last_name or user_in.last_name
            customer.phone = customer.phone or user_in.phone
            customer.company = customer.company or user_in.agency
        else:
            customer = Customer(
                first_name=user_in.first_name,
                last_name=user_in.last_name,
                email=clean_text(user_in.email),
                phone=normalize_phone(user_in.phone),
                company=clean_text(user_in.agency),
            )
            db.add(customer)
            db.flush()

        customer.password_hash = get_password_hash(user_in.password)
        db.commit()

        access_token = create_access_token({"sub": str(customer.id)})
        return Token(access_token=access_token, token_type="bearer")
    finally:
        db.close()


@app.post("/auth/login", response_model=Token)
def login(user_in: UserLogin):
    """
    Log in with email + password, return an access token.
    """
    db = SessionLocal()
    try:
        customer = authenticate_customer(db, user_in.email, user_in.password)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token({"sub": str(customer.id)})
        return Token(access_token=access_token, token_type="bearer")
    finally:
        db.close()


@app.post("/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    """
    Start a password reset:
      - If a customer with this email exists, generate a temporary password,
        save it as their new password, and send it via Zapier.
      - Always return a generic success message so we don't reveal whether
        the email exists or not.
    """
    db = SessionLocal()
    try:
        customer = get_customer_by_email(db, req.email)
        if customer and customer.email:
            temp_password = secrets.token_urlsafe(8)
            customer.password_hash = get_password_hash(temp_password)
            db.commit()
            send_password_reset_email_via_zapier(customer.email, temp_password)

        return {"message": "If that email exists, a reset email will be sent shortly."}
    finally:
        db.close()


@app.post("/auth/change-password")
async def change_password(
    body: ChangePassword,
    current_customer: Customer = Depends(get_current_customer),
):
    db = SessionLocal()
    try:
        # IMPORTANT: re-load the customer inside THIS db session
        customer = db.query(Customer).filter(Customer.id == current_customer.id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found.")

        if not customer.password_hash:
            raise HTTPException(status_code=400, detail="No password set for this account.")

        if not verify_password(body.old_password, customer.password_hash):
            raise HTTPException(status_code=400, detail="Old password is incorrect.")

        customer.password_hash = get_password_hash(body.new_password)
        db.commit()

        return {"status": "ok", "message": "Password updated successfully."}
    finally:
        db.close()

@app.get("/me", response_model=CustomerMe)
async def read_me(current_customer: Customer = Depends(get_current_customer)):
    """
    Return the currently authenticated customer's profile.
    """
    return current_customer


@app.put("/me", response_model=CustomerMe)
async def update_me(
    update: ProfileUpdate,
    current_customer: Customer = Depends(get_current_customer),
):
    """
    Update the currently authenticated customer's profile:
    - first/last name
    - email
    - phone
    - agency (company)
    """
    db = SessionLocal()
    try:
        customer = db.query(Customer).get(current_customer.id)
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer not found.")

        # Handle email change with a simple uniqueness check
        if update.email is not None:
            new_email = clean_text(update.email)
            if new_email != customer.email:
                existing = get_customer_by_email(db, new_email)
                if existing and existing.id != customer.id and existing.password_hash:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Another account already uses this email address.",
                    )
                customer.email = new_email

        if update.first_name is not None:
            customer.first_name = clean_text(update.first_name)

        if update.last_name is not None:
            customer.last_name = clean_text(update.last_name)

        if update.phone is not None:
            customer.phone = normalize_phone(update.phone)

        if update.agency is not None:
            customer.company = clean_text(update.agency)

        db.commit()
        db.refresh(customer)
        return customer
    finally:
        db.close()


@app.get("/my-jobs", response_model=List[JobSummary])
async def my_jobs(current_customer: Customer = Depends(get_current_customer)):
    """
    Return recent jobs for the currently authenticated customer.
    Includes both imported invoice jobs and new app bookings.
    """
    db = SessionLocal()
    try:
        jobs = (
            db.query(Job)
            .filter(Job.customer_id == current_customer.id)
            .order_by(Job.job_date.desc().nullslast(), Job.id.desc())
            .limit(20)
            .all()
        )
        return jobs
    finally:
        db.close()
