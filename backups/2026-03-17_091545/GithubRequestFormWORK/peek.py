# peek.py
from models import SessionLocal, Customer, Job, InvoiceItem


def print_header(title: str):
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)


def main():
    db = SessionLocal()

    try:
        # --- basic counts ---
        total_customers = db.query(Customer).count()
        total_jobs = db.query(Job).count()
        total_invoice_items = db.query(InvoiceItem).count()

        print_header("SUMMARY COUNTS")
        print(f"Total customers      : {total_customers}")
        print(f"Total jobs (FORM)    : {total_jobs}")
        print(f"Total invoice items  : {total_invoice_items}")

        # --- first 10 customers ---
        print_header("FIRST 10 CUSTOMERS")
        first_10 = db.query(Customer).order_by(Customer.id).limit(10).all()
        if not first_10:
            print("No customers found.")
        else:
            for c in first_10:
                print(
                    f"[{c.id}] "
                    f"{(c.first_name or '')} {(c.last_name or '')} "
                    f"| email: {c.email or '-'} "
                    f"| phone: {c.phone or '-'} "
                    f"| company: {c.company or '-'}"
                )

        # --- customers missing email ---
        print_header("CUSTOMERS MISSING EMAIL")
        missing_email = (
            db.query(Customer)
            .filter((Customer.email.is_(None)) | (Customer.email == ""))
            .order_by(Customer.id)
            .limit(20)
            .all()
        )
        if not missing_email:
            print("None 🎉")
        else:
            for c in missing_email:
                print(
                    f"[{c.id}] "
                    f"{(c.first_name or '')} {(c.last_name or '')} "
                    f"| phone: {c.phone or '-'} "
                    f"| company: {c.company or '-'}"
                )
            if len(missing_email) == 20:
                print("...showing first 20 only")

        # --- customers missing phone ---
        print_header("CUSTOMERS MISSING PHONE")
        missing_phone = (
            db.query(Customer)
            .filter((Customer.phone.is_(None)) | (Customer.phone == ""))
            .order_by(Customer.id)
            .limit(20)
            .all()
        )
        if not missing_phone:
            print("None 🎉")
        else:
            for c in missing_phone:
                print(
                    f"[{c.id}] "
                    f"{(c.first_name or '')} {(c.last_name or '')} "
                    f"| email: {c.email or '-'} "
                    f"| company: {c.company or '-'}"
                )
            if len(missing_phone) == 20:
                print("...showing first 20 only")

        # --- sample: show one customer with their invoices ---
        print_header("SAMPLE CUSTOMER + THEIR INVOICE ITEMS")
        sample = (
            db.query(Customer)
            .order_by(Customer.id)
            .first()
        )

        if not sample:
            print("No customers to show.")
        else:
            print(
                f"Customer [{sample.id}]: "
                f"{(sample.first_name or '')} {(sample.last_name or '')} "
                f"| email: {sample.email or '-'} "
                f"| phone: {sample.phone or '-'}"
            )

            items = (
                db.query(InvoiceItem)
                .filter(InvoiceItem.customer_id == sample.id)
                .order_by(InvoiceItem.invoice_date, InvoiceItem.invoice_number)
                .limit(20)
                .all()
            )

            if not items:
                print("  (No invoice items for this customer.)")
            else:
                for it in items:
                    print(
                        f"  Invoice {it.invoice_number or '-'} | "
                        f"Date: {it.invoice_date or '-'} | "
                        f"Service: {it.service or '-'} | "
                        f"LineTotal: {it.line_total}"
                    )

    finally:
        db.close()


if __name__ == "__main__":
    main()
