from datetime import datetime
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime
from sqlalchemy import DateTime


# We keep the DB file (crm.db) in the same ROM_DATA folder.
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crm.db")

# Render sometimes provides postgres://...; SQLAlchemy expects postgresql://...
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)


engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    phone = Column(String, nullable=True, index=True)
    company = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Merge + alternate contact info (keeps everything in customers table)
    merged_into_customer_id = Column(Integer, nullable=True, index=True)
    alt_emails = Column(String, nullable=True)
    alt_phones = Column(String, nullable=True)


    # NEW:
    password_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    jobs = relationship("Job", back_populates="customer")
    invoice_items = relationship("InvoiceItem", back_populates="customer")
    aliases = relationship("CustomerAlias", back_populates="customer", cascade="all, delete-orphan")

class CustomerAlias(Base):
    __tablename__ = "customer_aliases"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)

    # Where it came from (helps audits/undo)
    source_customer_id = Column(Integer, nullable=True, index=True)

    # "email", "phone", "name"
    alias_type = Column(String, nullable=False, index=True)
    alias_value = Column(String, nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="aliases")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    invoice_number = Column(String, nullable=True)
    job_date = Column(Date, nullable=True)

    service_raw = Column(String, nullable=True)
    bedrooms_raw = Column(String, nullable=True)
    price_range_raw = Column(String, nullable=True)
    sq_ft_raw = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    sale_type = Column(String, nullable=True)
    source = Column(String, nullable=True)

    # NEW: full raw form payload from the app as JSON
    form_data_json = Column(String, nullable=True)

    customer = relationship("Customer", back_populates="jobs")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    invoice_number = Column(String, nullable=True, index=True)
    invoice_date = Column(Date, nullable=True)
    service = Column(String, nullable=True)
    units = Column(Float, nullable=True)
    price_per_unit = Column(Float, nullable=True)
    line_total = Column(Float, nullable=True)
    source = Column(String, nullable=True)

    customer = relationship("Customer", back_populates="invoice_items")


def init_db():
    Base.metadata.create_all(bind=engine)

    # IMPORTANT: create_all() won't add new columns to existing Postgres tables.
    # So we add our merge/alt-contact columns explicitly (safe if already present).
    if engine.dialect.name == "postgresql":
        stmts = [
            'ALTER TABLE customers ADD COLUMN IF NOT EXISTS merged_into_customer_id INTEGER',
            'ALTER TABLE customers ADD COLUMN IF NOT EXISTS alt_emails VARCHAR',
            'ALTER TABLE customers ADD COLUMN IF NOT EXISTS alt_phones VARCHAR',
        ]
        with engine.begin() as conn:
            for s in stmts:
                conn.execute(text(s))

