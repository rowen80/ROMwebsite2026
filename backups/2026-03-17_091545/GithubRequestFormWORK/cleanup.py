# cleanup.py
from sqlalchemy import func
from models import SessionLocal, Customer, Job, InvoiceItem


def print_header(title: str):
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)


def show_basic_summary(db):
    total_customers = db.query(Customer).count()
    total_jobs = db.query(Job).count()
    total_invoice_items = db.query(InvoiceItem).count()

    print_header("SUMMARY")
    print(f"Total customers          : {total_customers}")
    print(f"Total jobs (FORM)        : {total_jobs}")
    print(f"Total invoice line items : {total_invoice_items}")


def show_missing_contact_info(db):
    print_header("CUSTOMERS MISSING EMAIL")
    missing_email = (
        db.query(Customer)
        .filter((Customer.email.is_(None)) | (Customer.email == ""))
        .order_by(Customer.id)
        .limit(50)
        .all()
    )
    if not missing_email:
        print("None 🎉")
    else:
        for c in missing_email:
            print(
                f"[{c.id}] {(c.first_name or '')} {(c.last_name or '')} "
                f"| phone: {c.phone or '-'} | company: {c.company or '-'}"
            )
        if len(missing_email) == 50:
            print("...showing first 50 only")

    print_header("CUSTOMERS MISSING PHONE")
    missing_phone = (
        db.query(Customer)
        .filter((Customer.phone.is_(None)) | (Customer.phone == ""))
        .order_by(Customer.id)
        .limit(50)
        .all()
    )
    if not missing_phone:
        print("None 🎉")
    else:
        for c in missing_phone:
            print(
                f"[{c.id}] {(c.first_name or '')} {(c.last_name or '')} "
                f"| email: {c.email or '-'} | company: {c.company or '-'}"
            )
        if len(missing_phone) == 50:
            print("...showing first 50 only")


def show_duplicate_emails(db):
    print_header("POSSIBLE DUPLICATES: SAME EMAIL")

    # emails used by more than one customer
    dup_emails = (
        db.query(Customer.email, func.count(Customer.id))
        .filter(Customer.email.isnot(None), Customer.email != "")
        .group_by(Customer.email)
        .having(func.count(Customer.id) > 1)
        .all()
    )

    if not dup_emails:
        print("No duplicate emails found.")
        return

    for email, count in dup_emails:
        print(f"\nEmail '{email}' used by {count} customers:")
        customers = (
            db.query(Customer)
            .filter(Customer.email == email)
            .order_by(Customer.id)
            .all()
        )
        for c in customers:
            print(
                f"  [{c.id}] {(c.first_name or '')} {(c.last_name or '')} "
                f"| phone: {c.phone or '-'} | company: {c.company or '-'}"
            )


def show_duplicate_phones(db):
    print_header("POSSIBLE DUPLICATES: SAME PHONE")

    dup_phones = (
        db.query(Customer.phone, func.count(Customer.id))
        .filter(Customer.phone.isnot(None), Customer.phone != "")
        .group_by(Customer.phone)
        .having(func.count(Customer.id) > 1)
        .all()
    )

    if not dup_phones:
        print("No duplicate phones found.")
        return

    for phone, count in dup_phones:
        print(f"\nPhone '{phone}' used by {count} customers:")
        customers = (
            db.query(Customer)
            .filter(Customer.phone == phone)
            .order_by(Customer.id)
            .all()
        )
        for c in customers:
            print(
                f"  [{c.id}] {(c.first_name or '')} {(c.last_name or '')} "
                f"| email: {c.email or '-'} | company: {c.company or '-'}"
            )


def show_duplicate_name_company(db):
    print_header("POSSIBLE DUPLICATES: SAME NAME + COMPANY")

    # group by (first_name, last_name, company)
    dup_name_company = (
        db.query(
            Customer.first_name,
            Customer.last_name,
            Customer.company,
            func.count(Customer.id),
        )
        .group_by(Customer.first_name, Customer.last_name, Customer.company)
        .having(func.count(Customer.id) > 1)
        .all()
    )

    if not dup_name_company:
        print("No name+company duplicates found.")
        return

    for first, last, company, count in dup_name_company:
        display_name = f"{first or ''} {last or ''}".strip() or "<no name>"
        print(
            f"\nName '{display_name}', Company '{company or '-'}' "
            f"appears {count} times:"
        )
        customers = (
            db.query(Customer)
            .filter(
                Customer.first_name == first,
                Customer.last_name == last,
                Customer.company == company,
            )
            .order_by(Customer.id)
            .all()
        )
        for c in customers:
            print(
                f"  [{c.id}] email: {c.email or '-'} | phone: {c.phone or '-'}"
            )


def show_customer_summary(db, export_csv: bool = True):
    print_header("CUSTOMER SUMMARY (COUNTS + TOTAL SPEND)")

    # build an aggregate view per customer
    results = (
        db.query(
            Customer.id,
            Customer.first_name,
            Customer.last_name,
            Customer.email,
            Customer.phone,
            Customer.company,
            func.count(func.distinct(Job.id)).label("job_count"),
            func.count(InvoiceItem.id).label("invoice_item_count"),
            func.coalesce(func.sum(InvoiceItem.line_total), 0).label(
                "total_spent"
            ),
        )
        .outerjoin(Job, Job.customer_id == Customer.id)
        .outerjoin(InvoiceItem, InvoiceItem.customer_id == Customer.id)
        .group_by(
            Customer.id,
            Customer.first_name,
            Customer.last_name,
            Customer.email,
            Customer.phone,
            Customer.company,
        )
        .order_by(func.coalesce(func.sum(InvoiceItem.line_total), 0).desc())
        .all()
    )

    # print top 20 by total_spent
    for row in results[:20]:
        name = f"{row.first_name or ''} {row.last_name or ''}".strip() or "<no name>"
        print(
            f"[{row.id}] {name} | email: {row.email or '-'} | phone: {row.phone or '-'} "
            f"| jobs: {row.job_count} | invoice lines: {row.invoice_item_count} "
            f"| total_spent: {row.total_spent:.2f}"
        )

    if export_csv:
        import csv

        filename = "customer_summary.csv"
        with open(filename, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(
                [
                    "id",
                    "first_name",
                    "last_name",
                    "email",
                    "phone",
                    "company",
                    "job_count",
                    "invoice_item_count",
                    "total_spent",
                ]
            )
            for row in results:
                writer.writerow(
                    [
                        row.id,
                        row.first_name or "",
                        row.last_name or "",
                        row.email or "",
                        row.phone or "",
                        row.company or "",
                        row.job_count,
                        row.invoice_item_count,
                        f"{row.total_spent:.2f}",
                    ]
                )

        print(f"\nFull customer summary exported to {filename} in this folder.")


def main():
    db = SessionLocal()
    try:
        show_basic_summary(db)
        show_missing_contact_info(db)
        show_duplicate_emails(db)
        show_duplicate_phones(db)
        show_duplicate_name_company(db)
        show_customer_summary(db, export_csv=True)
    finally:
        db.close()


if __name__ == "__main__":
    main()
