import re
from datetime import datetime
from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from models import init_db, SessionLocal, Customer, Job, InvoiceItem

# DATA_DIR is the current folder (ROM_DATA)
DATA_DIR = Path(__file__).parent


# ---------- helpers ----------

def clean_email(email):
    if not email or pd.isna(email):
        return None
    email = str(email).strip().lower()
    return email or None


def normalize_phone(phone):
    if not phone or pd.isna(phone):
        return None
    digits = re.sub(r"\D", "", str(phone))
    if len(digits) >= 10:
        digits = digits[-10:]
    return digits or None


def clean_text(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    value = str(value).strip()
    return value or None


def parse_date(value):
    if not value or pd.isna(value):
        return None
    value = str(value).strip()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%m/%d/%y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


# ---------- customer resolution ----------

def get_or_create_customer(db: Session, email, phone, first, last, company, cache):
    email = clean_email(email)
    phone = normalize_phone(phone)
    first = clean_text(first)
    last = clean_text(last)
    company = clean_text(company)

    email_index = cache["email_index"]
    phone_index = cache["phone_index"]
    name_index = cache["name_index"]
    id_index = cache["id_index"]

    # 1) email
    if email and email in email_index:
        cid = email_index[email]
        return id_index[cid]

    # 2) phone
    if phone and phone in phone_index:
        cid = phone_index[phone]
        return id_index[cid]

    # 3) name + company
    key = (first, last, company)
    if key in name_index:
        cid = name_index[key]
        return id_index[cid]

    # 4) create new
    cust = Customer(
        first_name=first,
        last_name=last,
        email=email,
        phone=phone,
        company=company,
    )
    db.add(cust)
    db.flush()  # assign id

    id_index[cust.id] = cust
    if email:
        email_index[email] = cust.id
    if phone:
        phone_index[phone] = cust.id
    name_index[key] = cust.id

    return cust


def init_customer_cache(db: Session):
    cache = {
        "email_index": {},
        "phone_index": {},
        "name_index": {},
        "id_index": {},
    }

    for cust in db.query(Customer).all():
        cache["id_index"][cust.id] = cust
        if cust.email:
            cache["email_index"][cust.email] = cust.id
        if cust.phone:
            cache["phone_index"][cust.phone] = cust.id
        key = (cust.first_name, cust.last_name, cust.company)
        cache["name_index"][key] = cust.id

    return cache


# ---------- FORM_DATA import (jobs) ----------

def import_form_2026(db: Session, cache: dict, csv_path: Path):
    if not csv_path.exists():
        print(f"FORM_DATA file not found: {csv_path}")
        return

    print(f"Importing FORM_DATA from {csv_path}")
    df = pd.read_csv(csv_path)

    for _, row in df.iterrows():
        # Define when a row is "empty" for our purposes:
        key_fields = [
            row.get("ClientFirstName"),
            row.get("ClientLastName"),
            row.get("ClientEmail"),
            row.get("Listing Address"),
        ]
        # if ALL of those are empty/NaN -> skip
        if all(not clean_text(v) for v in key_fields):
            continue

        cust = get_or_create_customer(
            db=db,
            email=row.get("ClientEmail"),
            phone=row.get("ClientPhone"),
            first=row.get("ClientFirstName"),
            last=row.get("ClientLastName"),
            company=row.get("Company"),
            cache=cache,
        )

        job = Job(
            customer_id=cust.id,
            invoice_number=clean_text(row.get("InvoiceNumber")),
            job_date=parse_date(row.get("InvoiceDate")),
            service_raw=clean_text(row.get("Service")),
            bedrooms_raw=clean_text(row.get("Bedrooms")),
            price_range_raw=clean_text(row.get("List Price")),
            sq_ft_raw=clean_text(row.get("Sq Ft")),
            address=clean_text(row.get("Listing Address")),
            source="2026_FORM_DATA",
        )
        db.add(job)




# ---------- INV_DATA import (invoice_items) ----------

def import_inv_data(db: Session, cache, csv_path: Path, source_name: str):
    if not csv_path.exists():
        print(f"INV_DATA file not found: {csv_path}")
        return

    print(f"Importing INV_DATA from {csv_path}")
    df = pd.read_csv(csv_path)

    invoice_customer_map = {}

    for _, row in df.iterrows():
        invoice_number = clean_text(row.get("InvoiceNumber"))
        email = row.get("ClientEmail")
        phone = row.get("ClientPhone")
        first = row.get("ClientFirstName")
        last = row.get("ClientLastName")

        if (not clean_text(email)) and (not clean_text(phone)) and (not clean_text(first)) and (not clean_text(last)):
            if invoice_number and invoice_number in invoice_customer_map:
                cust_id = invoice_customer_map[invoice_number]
                cust = db.query(Customer).get(cust_id)
                if cust is None:
                    print(f"Warning: mapped customer_id {cust_id} not found for invoice {invoice_number}")
                    continue
            else:
                print(f"Skipping line with invoice {invoice_number} (no identity)")
                continue
        else:
            cust = get_or_create_customer(
                db=db,
                email=email,
                phone=phone,
                first=first,
                last=last,
                company=None,
                cache=cache,
            )
            if invoice_number:
                invoice_customer_map[invoice_number] = cust.id

        item = InvoiceItem(
            customer_id=cust.id,
            invoice_number=invoice_number,
            invoice_date=parse_date(row.get("InvoiceDate")),
            service=clean_text(row.get("Service")),
            units=float(row.get("Units")) if not pd.isna(row.get("Units")) else None,
            price_per_unit=float(row.get("PricePerUnit")) if not pd.isna(row.get("PricePerUnit")) else None,
            line_total=float(row.get("LineTotal")) if not pd.isna(row.get("LineTotal")) else None,
            source=source_name,
        )
        db.add(item)

def merge_customer(db, source_id: int, target_id: int):
    """
    Merge source customer into target:
    - Move all Jobs and InvoiceItems from source -> target
    - Fill in missing fields on target from source (email/phone/company/name)
    - Delete the source customer
    """
    if source_id == target_id:
        return

    src = db.query(Customer).get(source_id)
    tgt = db.query(Customer).get(target_id)

    if src is None:
        print(f"merge_customer: source {source_id} not found, skipping.")
        return
    if tgt is None:
        print(f"merge_customer: target {target_id} not found, skipping.")
        return

    print(f"Merging customer {source_id} into {target_id}...")

    # Reassign jobs
    db.query(Job).filter(Job.customer_id == source_id).update(
        {Job.customer_id: target_id}
    )

    # Reassign invoice items
    db.query(InvoiceItem).filter(InvoiceItem.customer_id == source_id).update(
        {InvoiceItem.customer_id: target_id}
    )

    # Fill in missing contact info on target from source
    if (not tgt.email) and src.email:
        tgt.email = src.email
    if (not tgt.phone) and src.phone:
        tgt.phone = src.phone
    if (not tgt.company) and src.company:
        tgt.company = src.company
    if (not tgt.first_name) and src.first_name:
        tgt.first_name = src.first_name
    if (not tgt.last_name) and src.last_name:
        tgt.last_name = src.last_name

    # Delete the source customer
    db.delete(src)


def apply_manual_fixes(db):
    """
    Apply your known, hand-curated fixes so they persist
    every time sync.py is run.
    """

    # 1) Merges: source -> target
    merges = [
        (101, 51),
        (79, 26),
        (80, 27),
        (129, 35),
        (66, 65),
    ]

    for source_id, target_id in merges:
        merge_customer(db, source_id, target_id)

    # 2) Fix missing first name on customer 53
    cust_53 = db.query(Customer).get(53)
    if cust_53 is not None:
        if not cust_53.first_name:
            cust_53.first_name = "Nicholas"
            print("Set first_name='Nicholas' for customer 53")
    else:
        print("Warning: customer 53 not found when trying to set first name.")

# ---------- main ----------

def main():
    init_db()

    db = SessionLocal()
    try:
        # Clear existing data so sync is from scratch
        db.query(InvoiceItem).delete()
        db.query(Job).delete()
        db.query(Customer).delete()
        db.commit()

        # Fresh empty cache
        cache = {
            "email_index": {},
            "phone_index": {},
            "name_index": {},
            "id_index": {},
        }

        # 1) Form data (jobs)
        form_2026 = DATA_DIR / "ROM_FINACIALS_MASTER - 2026 FORM_DATA.csv"
        import_form_2026(db, cache, form_2026)

        # 2) Invoice data 2023–2025
        inv_2023 = DATA_DIR / "ROM_FINACIALS_MASTER - 2023 INV_DATA.csv"
        inv_2024 = DATA_DIR / "ROM_FINACIALS_MASTER - 2024 INV_DATA.csv"
        inv_2025 = DATA_DIR / "ROM_FINACIALS_MASTER - 2025 INV_DATA.csv"

        import_inv_data(db, cache, inv_2023, "2023_INV_DATA")
        import_inv_data(db, cache, inv_2024, "2024_INV_DATA")
        import_inv_data(db, cache, inv_2025, "2025_INV_DATA")

        # 3) Apply your hand-picked corrections
        apply_manual_fixes(db)

        db.commit()
        print("Sync complete. crm.db rebuilt from CSVs (with manual fixes).")
    except Exception as e:
        db.rollback()
        print("Error during sync:", e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
