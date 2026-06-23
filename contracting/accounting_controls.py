from __future__ import annotations

import frappe
from frappe import _


def _leaf_account(company: str, **filters):
	filters.update({"company": company, "is_group": 0, "disabled": 0})
	return frappe.db.get_value("Account", filters, "name")


@frappe.whitelist()
def ensure_default_chart_of_accounts(company: str) -> dict:
	if not {"System Manager", "Accounts Manager"}.intersection(frappe.get_roles()):
		frappe.throw(_("You need the System Manager or Accounts Manager role."), frappe.PermissionError)
	if not company or not frappe.db.exists("Company", company):
		frappe.throw(_("Select a valid company."))

	company_doc = frappe.get_doc("Company", company)
	account_count = frappe.db.count("Account", {"company": company})
	created = False
	if not account_count:
		if not company_doc.chart_of_accounts:
			company_doc.chart_of_accounts = "Standard"
		company_doc.create_default_accounts()
		created = True

	mapping = {
		"default_receivable_account": {"account_type": "Receivable"},
		"default_payable_account": {"account_type": "Payable"},
		"default_cash_account": {"account_type": "Cash"},
		"default_income_account": {"root_type": "Income"},
		"default_expense_account": {"root_type": "Expense"},
		"round_off_account": {"account_type": "Round Off"},
	}
	repaired = []
	for fieldname, filters in mapping.items():
		if not company_doc.meta.has_field(fieldname) or company_doc.get(fieldname):
			continue
		account = _leaf_account(company, **filters)
		if account:
			company_doc.db_set(fieldname, account, update_modified=False)
			repaired.append(fieldname)

	frappe.clear_cache(doctype="Company", docname=company)
	return {"created": created, "repaired": repaired, "account_count": frappe.db.count("Account", {"company": company})}
