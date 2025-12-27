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
from pydantic import field_validator


from models import SessionLocal, Customer, Job, InvoiceItem
from models import Customer, Job, InvoiceItem
from models import init_db
from models import engine


from fastapi import Depends, HTTPException, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy import or_
from sqlalchemy import text

import os


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
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)



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

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str):
        # protect against bcrypt-style limits and abuse
        if len(v.encode("utf-8")) > 256:
            raise ValueError("Password is too long.")
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


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
    if not RESET_ZAPIER_WEBHOOK_URL:
        print("RESET_ZAPIER_WEBHOOK_URL missing")
        return

    payload = {
        "email": email,
        "temp_password": temp_password,
    }

    print("Sending reset webhook:", payload)
    requests.post(RESET_ZAPIER_WEBHOOK_URL, json=payload, timeout=5)

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


from passlib.exc import UnknownHashError

def verify_password(plain_password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    try:
        return pwd_context.verify(plain_password, password_hash)
    except UnknownHashError:
        return False
    except Exception:
        return False

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


async def get_current_customer(
    request: Request,
    token: str = Depends(oauth2_scheme),
) -> Customer:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    print("COOKIES:", request.cookies)


    # If no Authorization header token, fall back to cookie token (browser login)
    if not token:
        token = request.cookies.get("access_token") or ""

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


ADMIN_EMAILS = set(
    e.strip().lower()
    for e in os.getenv("ADMIN_EMAILS", "ryan@ryanowenphotography.com").split(",")
    if e.strip()
)

async def require_admin(current_customer: Customer = Depends(get_current_customer)) -> Customer:
    email = (current_customer.email or "").strip().lower()
    if email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_customer

def require_customer_sync_key(request: Request) -> None:
    expected = os.getenv("CUSTOMER_SYNC_KEY", "")
    if not expected:
        raise HTTPException(status_code=500, detail="CUSTOMER_SYNC_KEY not configured")

    provided = request.headers.get("x-api-key", "")
    if provided != expected:
        raise HTTPException(status_code=401, detail="Invalid sync key")


@app.get("/admin/customers/export")
def export_customers(request: Request):
    # No login required; protected by CUSTOMER_SYNC_KEY
    require_customer_sync_key(request)

    db = SessionLocal()
    try:
        customers = (
            db.query(Customer)
            .filter(Customer.merged_into_customer_id.is_(None))
            .order_by(Customer.id.asc())
            .all()
        )


        out = []
        for c in customers:
            out.append({
                "customer_id": c.id,
                "first_name": c.first_name,
                "last_name": c.last_name,
                "email": c.email,
                "phone": c.phone,
                "company": c.company,
                "has_account": bool(getattr(c, "password_hash", None)),
                "created_at": c.created_at.isoformat() if getattr(c, "created_at", None) else None,
                "updated_at": c.updated_at.isoformat() if getattr(c, "updated_at", None) else None,
                "alt_emails": c.alt_emails,
                "alt_phones": c.alt_phones,

            })

        return {"count": len(out), "customers": out}
    finally:
        db.close()

class CustomerMergeRequest(BaseModel):
    source_customer_id: int
    target_customer_id: int


@app.post("/admin/customers/merge")
def merge_customers(req: CustomerMergeRequest, request: Request):
    # Protected by CUSTOMER_SYNC_KEY, no user login required
    require_customer_sync_key(request)

    source_id = int(req.source_customer_id)
    target_id = int(req.target_customer_id)

    if source_id == target_id:
        raise HTTPException(status_code=400, detail="source_customer_id cannot equal target_customer_id")

    db = SessionLocal()
    try:
        source = db.query(Customer).get(source_id)
        target = db.query(Customer).get(target_id)

        if not source or not target:
            raise HTTPException(status_code=404, detail="Source or target customer not found")

        # ---- Re-point related rows (jobs + invoice_items) ----
        db.query(Job).filter(Job.customer_id == source_id).update(
            {Job.customer_id: target_id}, synchronize_session=False
        )
        db.query(InvoiceItem).filter(InvoiceItem.customer_id == source_id).update(
            {InvoiceItem.customer_id: target_id}, synchronize_session=False
        )

        # ---- Preserve identity info in customers table (no extra tables) ----
        def append_unique(existing: str, value: str) -> str:
            existing = (existing or "").strip()
            value = (value or "").strip()
            if not value:
                return existing
            parts = [p.strip() for p in existing.split(",") if p.strip()] if existing else []
            if value.lower() in [p.lower() for p in parts]:
                return existing
            parts.append(value)
            return ", ".join(parts)

        # Fill blanks on target from source (safe)
        if not (target.first_name or "").strip() and (source.first_name or "").strip():
            target.first_name = source.first_name
        if not (target.last_name or "").strip() and (source.last_name or "").strip():
            target.last_name = source.last_name
        if not (target.company or "").strip() and (source.company or "").strip():
            target.company = source.company

        # Append source email/phone into target alt_* if different
        src_email = (source.email or "").strip()
        tgt_email = (target.email or "").strip()
        if src_email and src_email.lower() != tgt_email.lower():
            target.alt_emails = append_unique(target.alt_emails, src_email)

        src_phone = (source.phone or "").strip()
        tgt_phone = (target.phone or "").strip()
        if src_phone and normalize_phone(src_phone) != normalize_phone(tgt_phone):
            target.alt_phones = append_unique(target.alt_phones, src_phone)

        # Mark source as merged so export hides it
        source.merged_into_customer_id = target_id



        db.commit()

        return {
            "status": "ok",
            "merged_source": source_id,
            "into_target": target_id,
        }
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
    db = SessionLocal()
    try:
        customer = get_customer_by_email(db, req.email)

        if customer and customer.email:
            if customer.updated_at and (datetime.utcnow() - customer.updated_at).total_seconds() < 30:
                return {"message": "If that email exists, a reset email will be sent shortly."}

            temp_password = secrets.token_urlsafe(8)
            customer.password_hash = get_password_hash(temp_password)
            customer.updated_at = datetime.utcnow()
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
            # Hide cancelled jobs from the customer Profile history
            .filter(or_(Job.status.is_(None), Job.status != "CANCELLED"))
            .order_by(Job.job_date.desc().nullslast(), Job.id.desc())
            .limit(20)
            .all()
        )

        return jobs
    finally:
        db.close()

# ------------------------------------------------------------
# Admin: Customers (HTML)
# ------------------------------------------------------------

def _admin_page(title: str, body_html: str) -> str:
    return f"""<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <style>
      body {{ font-family: Arial, sans-serif; margin: 24px; }}
      table {{ border-collapse: collapse; width: 100%; }}
      th, td {{ border-bottom: 1px solid #eee; padding: 8px; text-align: left; }}
      th {{ font-size: 12px; color: #444; text-transform: uppercase; letter-spacing: .04em; }}
      input {{ padding: 8px; width: 360px; }}
      .btn {{ padding: 8px 10px; }}
      .top {{ margin-bottom: 14px; }}
    </style>
  </head>
  <body>
    <div class="top">
      <a href="/admin/customers">Admin Customers</a>
    </div>
    {body_html}
  </body>
</html>"""


@app.get("/admin/customers", response_class=HTMLResponse)
async def admin_customers(q: str = "", current_admin: Customer = Depends(require_admin)):
    db = SessionLocal()
    try:
        query = db.query(Customer)
        q_clean = (q or "").strip()
        if q_clean:
            like = f"%{q_clean}%"
            filters = []
            if q_clean.isdigit():
                filters.append(Customer.id == int(q_clean))
            filters += [
                Customer.first_name.ilike(like),
                Customer.last_name.ilike(like),
                Customer.email.ilike(like),
                Customer.phone.ilike(like),
                Customer.company.ilike(like),
            ]
            query = query.filter(or_(*filters))

        customers = query.order_by(Customer.id.desc()).limit(200).all()

        rows = "".join(
            f"<tr>"
            f"<td><a href='/admin/customers/{c.id}'>{c.id}</a></td>"
            f"<td>{c.first_name or ''}</td>"
            f"<td>{c.last_name or ''}</td>"
            f"<td>{c.email or ''}</td>"
            f"<td>{c.phone or ''}</td>"
            f"<td>{c.company or ''}</td>"
            f"</tr>"
            for c in customers
        )

        body = f"""
          <h1>Customers</h1>
          <form method="get" action="/admin/customers" style="margin: 12px 0;">
            <input name="q" value="{q_clean}" placeholder="id, name, email, phone, company" />
            <button class="btn" type="submit">Search</button>
            <a href="/admin/customers">Clear</a>
          </form>
          <table>
            <tr><th>ID</th><th>First</th><th>Last</th><th>Email</th><th>Phone</th><th>Company</th></tr>
            {rows or "<tr><td colspan='6'>No matches</td></tr>"}
          </table>
        """
        return HTMLResponse(_admin_page("Admin Customers", body))
    finally:
        db.close()


@app.get("/admin/customers/{customer_id}", response_class=HTMLResponse)
async def admin_customer_detail(customer_id: int, current_admin: Customer = Depends(require_admin)):
    db = SessionLocal()
    try:
        customer = db.query(Customer).get(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        body = f"""
          <h1>Customer #{customer.id}</h1>
          <form method="post" action="/admin/customers/{customer.id}">
            <div>First: <input name="first_name" value="{customer.first_name or ''}" /></div><br/>
            <div>Last: <input name="last_name" value="{customer.last_name or ''}" /></div><br/>
            <div>Email: <input name="email" value="{customer.email or ''}" /></div><br/>
            <div>Phone: <input name="phone" value="{customer.phone or ''}" /></div><br/>
            <div>Company: <input name="company" value="{customer.company or ''}" /></div><br/>
            <button type="submit">Save</button>
            <a href="/admin/customers">Back</a>
          </form>
        """
        return HTMLResponse(_admin_page(f"Customer {customer.id}", body))
    finally:
        db.close()


@app.post("/admin/customers/{customer_id}")
async def admin_customer_save(
    customer_id: int,
    first_name: str = Form(""),
    last_name: str = Form(""),
    email: str = Form(""),
    phone: str = Form(""),
    company: str = Form(""),
    current_admin: Customer = Depends(require_admin),
):
    db = SessionLocal()
    try:
        customer = db.query(Customer).get(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        customer.first_name = clean_text(first_name)
        customer.last_name = clean_text(last_name)
        customer.email = clean_text(email)
        customer.phone = normalize_phone(phone)
        customer.company = clean_text(company)

        db.commit()
        return RedirectResponse(url=f"/admin/customers/{customer.id}", status_code=303)
    finally:
        db.close()

# =========================
# Sheets Sync (X-API-Key)
# =========================

def require_customer_sync_key(request: Request):
    expected = os.getenv("CUSTOMER_SYNC_KEY", "").strip()
    provided = (request.headers.get("X-API-Key") or "").strip()
    if not expected or provided != expected:
        raise HTTPException(status_code=401, detail="Not authenticated")


class CustomerUpdateRequest(BaseModel):
    customer_id: int
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    company_id: int | None = None
    alt_emails: str | None = None
    alt_phones: str | None = None


@app.post("/admin/customers_sync/update")
def update_customer(request: Request, req: CustomerUpdateRequest):
    require_customer_sync_key(request)

    db = SessionLocal()
    try:
        c = db.query(Customer).get(int(req.customer_id))
        if not c:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Allowed edits only (no passwords / ids / merges / jobs / invoices)
        if req.first_name is not None: c.first_name = req.first_name
        if req.last_name is not None: c.last_name = req.last_name
        if req.email is not None: c.email = req.email
        if req.phone is not None: c.phone = req.phone
        if req.company is not None: c.company = req.company
        if req.company_id is not None: c.company_id = req.company_id
        if req.alt_emails is not None: c.alt_emails = req.alt_emails
        if req.alt_phones is not None: c.alt_phones = req.alt_phones

        db.commit()
        return {"status": "ok", "customer_id": c.id}
    finally:
        db.close()

@app.get("/admin/jobs_sync/export")
def export_jobs_sync(request: Request, include_cancelled: int = 0):
    """
    Sheets export for JOBS_HISTORY.
    Default excludes CANCELLED.
    """
    require_customer_sync_key(request)

    db = SessionLocal()
    try:
        q = db.query(Job)

        if not include_cancelled:
            # treat NULL status as active (legacy rows)
            q = q.filter(or_(Job.status.is_(None), Job.status != "CANCELLED"))

        jobs = q.order_by(Job.id.desc()).limit(5000).all()

        out = []
        for j in jobs:
            out.append({
                "job_id": j.id,
                "customer_id": j.customer_id,
                "invoice_number": j.invoice_number,
                "job_date": j.job_date.isoformat() if j.job_date else None,
                "service_raw": j.service_raw,
                "bedrooms_raw": j.bedrooms_raw,
                "price_range_raw": j.price_range_raw,
                "sq_ft_raw": j.sq_ft_raw,
                "address": j.address,
                "city": j.city,
                "sale_type": j.sale_type,
                "source": j.source,
                "status": (j.status or "SCHEDULED"),
                "cancelled_at": (j.cancelled_at.isoformat() if j.cancelled_at else None),
            })

        return {"count": len(out), "jobs": out}
    finally:
        db.close()

@app.post("/admin/jobs_sync/update")
def update_job_sync(request: Request, payload: dict):
    require_customer_sync_key(request)

    job_id = payload.get("job_id")
    status = payload.get("status")

    if not job_id:
        raise HTTPException(status_code=400, detail="Missing job_id")

    db = SessionLocal()
    try:
        job = db.query(Job).get(int(job_id))
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        if status is not None:
            status = str(status).strip().upper()

            if status == "CANCELLED":
                job.status = "CANCELLED"
                job.cancelled_at = datetime.utcnow()
            elif status == "":
                # blank means "do nothing"
                pass
            else:
                raise HTTPException(
                    status_code=422,
                    detail="Invalid status. Only CANCELLED or blank allowed."
                )

        db.commit()
        return {"status": "ok", "job_id": job.id}
    finally:
        db.close()
