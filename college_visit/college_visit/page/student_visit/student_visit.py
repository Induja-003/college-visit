import frappe
from frappe.utils import getdate, today


@frappe.whitelist()
def register_student_visit(data):

    # Convert JSON string to dictionary
    data = frappe.parse_json(data)

    # --------------------------------------------------
    # 1. Validate visit date
    # --------------------------------------------------

    visit_date = data.get("visit_date")

    if not visit_date:
        frappe.throw("Visit date is required.")

    if getdate(visit_date) < getdate(today()):
        frappe.throw(
            "Past visit dates are not allowed. "
            "Please select today or a future date."
        )

    # --------------------------------------------------
    # 2. Validate phone number
    # --------------------------------------------------

    phone_number = str(
        data.get("phone_number") or ""
    ).strip()

    if not phone_number.isdigit() or len(phone_number) != 10:
        frappe.throw(
            "Phone number must contain exactly 10 digits."
        )

    # --------------------------------------------------
    # 3. Check duplicate registration
    # --------------------------------------------------

    existing = frappe.db.exists(
        "Students Visit Registration",
        {
            "student_name": data.get("student_name"),
            "college_name": data.get("college_name"),
            "visit_date": visit_date
        }
    )

    if existing:
        frappe.throw(
            "This student is already registered for this date."
        )

    # --------------------------------------------------
    # 4. Create registration
    # --------------------------------------------------

    doc = frappe.get_doc({
        "doctype": "Students Visit Registration",

        "student_name": data.get("student_name"),

        "college_name": data.get("college_name"),

        "department": data.get("department"),

        "year": data.get("year"),

        "email": data.get("email"),

        "phone_number": phone_number,

        "visit_date": visit_date,

        "purpose_of_visit": data.get("purpose_of_visit")
    })

    # --------------------------------------------------
    # 5. Save
    # --------------------------------------------------

    doc.insert()

    return doc.name


# ======================================================
# GET TODAY'S VISITS
# ======================================================

@frappe.whitelist()
def get_today_visits_count():

    today_date = today()

    records = frappe.get_all(
        "Students Visit Registration",
        filters={
            "visit_date": today_date
        },
        fields=["name"]
    )

    return len(records)