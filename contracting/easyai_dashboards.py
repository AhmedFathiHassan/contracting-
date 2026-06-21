import frappe
from frappe.utils import add_months, get_first_day, get_last_day, getdate, today


def metric(key, label, doctype, aggregate="count", field=None, filters=None, currency=False, hint="", icon="◇"):
	return {
		"key": key,
		"label": label,
		"doctype": doctype,
		"aggregate": aggregate,
		"field": field,
		"filters": filters or {},
		"currency": currency,
		"hint": hint,
		"icon": icon,
	}


def shortcut(label, target, action="new", icon="+"):
	return {"label": label, "target": target, "action": action, "icon": icon}


PROFILES = {
	"home": {
		"title": "Business Overview",
		"subtitle": "A clear view of your business today.",
		"metrics": [
			metric("sales", "Total Sales", "Sales Invoice", "sum", "grand_total", {"docstatus": 1}, True, "Submitted invoices", "↗"),
			metric("purchases", "Total Purchases", "Purchase Invoice", "sum", "grand_total", {"docstatus": 1}, True, "Submitted purchases", "⌑"),
			metric("customers", "Customers", "Customer", hint="Active records", icon="◎"),
			metric("projects", "Projects", "Project", hint="All projects", icon="▣"),
		],
		"chart": ("Sales Overview", "Sales Invoice", "posting_date", "sum", "grand_total", {"docstatus": 1}, True),
		"activity": (("Sales Invoice", "Invoice"), ("Purchase Order", "Purchase Order"), ("Customer", "Customer"), ("Project", "Project")),
		"shortcuts": [shortcut("Add Invoice", "Sales Invoice"), shortcut("Add Customer", "Customer", icon="◎"), shortcut("Add Item", "Item", icon="◇"), shortcut("New Purchase", "Purchase Order", icon="⌑"), shortcut("View Reports", "Sales Analytics", "route", "↗")],
	},
	"buying": {
		"title": "Buying Overview",
		"subtitle": "Purchasing, suppliers, and material demand at a glance.",
		"metrics": [
			metric("purchases", "Purchase Invoices", "Purchase Invoice", "sum", "grand_total", {"docstatus": 1}, True, "Submitted invoices", "⌑"),
			metric("orders", "Purchase Orders", "Purchase Order", filters={"docstatus": 1}, hint="Submitted orders", icon="▤"),
			metric("suppliers", "Suppliers", "Supplier", hint="Supplier records", icon="◎"),
			metric("requests", "Material Requests", "Material Request", filters={"docstatus": 1}, hint="Submitted requests", icon="▣"),
		],
		"chart": ("Purchase Overview", "Purchase Invoice", "posting_date", "sum", "grand_total", {"docstatus": 1}, True),
		"activity": (("Purchase Invoice", "Purchase Invoice"), ("Purchase Order", "Purchase Order"), ("Supplier", "Supplier"), ("Material Request", "Material Request")),
		"shortcuts": [shortcut("Purchase Order", "Purchase Order"), shortcut("Purchase Invoice", "Purchase Invoice", icon="⌑"), shortcut("Add Supplier", "Supplier", icon="◎"), shortcut("Material Request", "Material Request", icon="▣"), shortcut("Purchase Analytics", "Purchase Analytics", "route", "↗")],
	},
	"selling": {
		"title": "Selling Overview",
		"subtitle": "Revenue, customers, quotations, and sales activity.",
		"metrics": [
			metric("sales", "Sales Invoices", "Sales Invoice", "sum", "grand_total", {"docstatus": 1}, True, "Submitted invoices", "↗"),
			metric("orders", "Sales Orders", "Sales Order", filters={"docstatus": 1}, hint="Submitted orders", icon="▤"),
			metric("customers", "Customers", "Customer", hint="Customer records", icon="◎"),
			metric("quotations", "Quotations", "Quotation", filters={"docstatus": 1}, hint="Submitted quotations", icon="◇"),
		],
		"chart": ("Sales Overview", "Sales Invoice", "posting_date", "sum", "grand_total", {"docstatus": 1}, True),
		"activity": (("Sales Invoice", "Sales Invoice"), ("Sales Order", "Sales Order"), ("Quotation", "Quotation"), ("Customer", "Customer")),
		"shortcuts": [shortcut("Sales Invoice", "Sales Invoice"), shortcut("Sales Order", "Sales Order", icon="▤"), shortcut("Quotation", "Quotation", icon="◇"), shortcut("Add Customer", "Customer", icon="◎"), shortcut("Sales Analytics", "Sales Analytics", "route", "↗")],
	},
	"stock": {
		"title": "Stock Overview",
		"subtitle": "Items, warehouses, stock movements, and material demand.",
		"metrics": [metric("items", "Items", "Item", filters={"disabled": 0}, hint="Enabled items"), metric("warehouses", "Warehouses", "Warehouse", filters={"disabled": 0}, hint="Active warehouses", icon="▦"), metric("entries", "Stock Entries", "Stock Entry", filters={"docstatus": 1}, hint="Submitted entries", icon="↗"), metric("requests", "Material Requests", "Material Request", filters={"docstatus": 1}, hint="Submitted requests", icon="▣")],
		"chart": ("Stock Movement", "Stock Entry", "posting_date", "count", None, {"docstatus": 1}, False),
		"activity": (("Stock Entry", "Stock Entry"), ("Material Request", "Material Request"), ("Item", "Item"), ("Warehouse", "Warehouse")),
		"shortcuts": [shortcut("Stock Entry", "Stock Entry"), shortcut("Add Item", "Item", icon="◇"), shortcut("Material Request", "Material Request", icon="▣"), shortcut("Stock Reconciliation", "Stock Reconciliation", icon="⌑"), shortcut("Stock Analytics", "Stock Analytics", "route", "↗")],
	},
	"accounting": {
		"title": "Accounting Overview",
		"subtitle": "Receivables, payables, journals, and payments.",
		"metrics": [metric("receivables", "Receivables", "Sales Invoice", "sum", "outstanding_amount", {"docstatus": 1}, True, "Outstanding sales", "↗"), metric("payables", "Payables", "Purchase Invoice", "sum", "outstanding_amount", {"docstatus": 1}, True, "Outstanding purchases", "⌑"), metric("journals", "Journal Entries", "Journal Entry", filters={"docstatus": 1}, hint="Submitted journals", icon="▤"), metric("payments", "Payment Entries", "Payment Entry", filters={"docstatus": 1}, hint="Submitted payments", icon="◎")],
		"chart": ("Receivables Trend", "Sales Invoice", "posting_date", "sum", "grand_total", {"docstatus": 1}, True),
		"activity": (("Payment Entry", "Payment Entry"), ("Journal Entry", "Journal Entry"), ("Sales Invoice", "Sales Invoice"), ("Purchase Invoice", "Purchase Invoice")),
		"shortcuts": [shortcut("Journal Entry", "Journal Entry"), shortcut("Payment Entry", "Payment Entry", icon="◎"), shortcut("General Ledger", "General Ledger", "route", "↗"), shortcut("Accounts Receivable", "Accounts Receivable", "route", "▤")],
	},
	"projects": {
		"title": "Projects Overview",
		"subtitle": "Projects, tasks, timesheets, and delivery progress.",
		"metrics": [metric("projects", "Projects", "Project", hint="All projects", icon="▣"), metric("tasks", "Tasks", "Task", hint="All tasks", icon="✓"), metric("open_tasks", "Open Tasks", "Task", filters={"status": ["not in", ["Completed", "Cancelled"]]}, hint="Work remaining", icon="↗"), metric("timesheets", "Timesheets", "Timesheet", filters={"docstatus": 1}, hint="Submitted timesheets", icon="⌑")],
		"chart": ("Task Activity", "Task", "creation", "count", None, {}, False),
		"activity": (("Project", "Project"), ("Task", "Task"), ("Timesheet", "Timesheet")),
		"shortcuts": [shortcut("New Project", "Project"), shortcut("New Task", "Task", icon="✓"), shortcut("Timesheet", "Timesheet", icon="⌑"), shortcut("Project Summary", "Project Summary", "route", "↗")],
	},
	"assets": {
		"title": "Assets Overview", "subtitle": "Assets, maintenance, repairs, and receipts.",
		"metrics": [metric("assets", "Assets", "Asset", hint="Asset records"), metric("maintenance", "Maintenance", "Asset Maintenance", hint="Maintenance plans", icon="▤"), metric("repairs", "Repairs", "Asset Repair", hint="Repair records", icon="⌑"), metric("receipts", "Purchase Receipts", "Purchase Receipt", filters={"docstatus": 1}, hint="Submitted receipts", icon="↗")],
		"chart": ("Asset Activity", "Asset", "creation", "count", None, {}, False), "activity": (("Asset", "Asset"), ("Asset Maintenance", "Maintenance"), ("Asset Repair", "Repair")),
		"shortcuts": [shortcut("Add Asset", "Asset"), shortcut("Maintenance", "Asset Maintenance", icon="▤"), shortcut("Asset Repair", "Asset Repair", icon="⌑")],
	},
	"manufacturing": {
		"title": "Manufacturing Overview", "subtitle": "Production, work orders, BOMs, and job cards.",
		"metrics": [metric("work_orders", "Work Orders", "Work Order", hint="All work orders", icon="▤"), metric("open_orders", "Open Orders", "Work Order", filters={"status": ["not in", ["Completed", "Stopped"]]}, hint="Work in progress", icon="↗"), metric("boms", "BOMs", "BOM", filters={"is_active": 1}, hint="Active BOMs"), metric("job_cards", "Job Cards", "Job Card", hint="Operation cards", icon="⌑")],
		"chart": ("Production Activity", "Work Order", "creation", "count", None, {}, False), "activity": (("Work Order", "Work Order"), ("Job Card", "Job Card"), ("BOM", "BOM")),
		"shortcuts": [shortcut("Work Order", "Work Order"), shortcut("Production Plan", "Production Plan", icon="▤"), shortcut("BOM", "BOM"), shortcut("Job Card", "Job Card", icon="⌑")],
	},
	"quality": {
		"title": "Quality Overview", "subtitle": "Inspections, reviews, actions, and compliance.",
		"metrics": [metric("inspections", "Inspections", "Quality Inspection", hint="Quality inspections", icon="✓"), metric("reviews", "Reviews", "Quality Review", hint="Quality reviews", icon="◎"), metric("actions", "Actions", "Quality Action", hint="Corrective actions", icon="↗"), metric("non_conformance", "Non Conformance", "Non Conformance", hint="Recorded issues", icon="!")],
		"chart": ("Inspection Activity", "Quality Inspection", "creation", "count", None, {}, False), "activity": (("Quality Inspection", "Inspection"), ("Quality Review", "Review"), ("Quality Action", "Action")),
		"shortcuts": [shortcut("Inspection", "Quality Inspection"), shortcut("Review", "Quality Review", icon="◎"), shortcut("Quality Action", "Quality Action", icon="↗")],
	},
	"support": {
		"title": "Support Overview", "subtitle": "Issues, service levels, and customer support activity.",
		"metrics": [metric("issues", "Issues", "Issue", hint="All issues", icon="◎"), metric("open_issues", "Open Issues", "Issue", filters={"status": "Open"}, hint="Awaiting action", icon="!"), metric("sla", "Service Levels", "Service Level Agreement", hint="SLA records", icon="▤"), metric("customers", "Customers", "Customer", hint="Customer records")],
		"chart": ("Issue Activity", "Issue", "creation", "count", None, {}, False), "activity": (("Issue", "Issue"), ("Customer", "Customer")),
		"shortcuts": [shortcut("New Issue", "Issue"), shortcut("Issue List", "Issue", "list", "◎"), shortcut("Service Levels", "Service Level Agreement", "list", "▤")],
	},
	"users": {
		"title": "Users Overview", "subtitle": "Users, roles, permissions, and assignments.",
		"metrics": [metric("users", "Enabled Users", "User", filters={"enabled": 1}, hint="Active accounts", icon="◎"), metric("roles", "Roles", "Role", hint="System roles"), metric("permissions", "User Permissions", "User Permission", hint="Permission rules", icon="▤"), metric("todos", "Open ToDos", "ToDo", filters={"status": "Open"}, hint="Pending assignments", icon="✓")],
		"chart": ("User Activity", "User", "creation", "count", None, {}, False), "activity": (("User", "User"), ("User Permission", "Permission"), ("ToDo", "ToDo")),
		"shortcuts": [shortcut("Add User", "User"), shortcut("Roles", "Role", "list"), shortcut("Permissions", "User Permission", "new", "▤")],
	},
	"website": {
		"title": "Website Overview", "subtitle": "Pages, forms, posts, and website users.",
		"metrics": [metric("pages", "Web Pages", "Web Page", hint="Published content", icon="▤"), metric("forms", "Web Forms", "Web Form", hint="Public forms"), metric("posts", "Blog Posts", "Blog Post", hint="Blog content", icon="↗"), metric("users", "Website Users", "User", filters={"user_type": "Website User", "enabled": 1}, hint="Enabled users", icon="◎")],
		"chart": ("Content Activity", "Web Page", "creation", "count", None, {}, False), "activity": (("Web Page", "Web Page"), ("Web Form", "Web Form"), ("Blog Post", "Blog Post")),
		"shortcuts": [shortcut("Web Page", "Web Page"), shortcut("Web Form", "Web Form"), shortcut("Blog Post", "Blog Post", icon="↗")],
	},
	"crm": {
		"title": "CRM Overview", "subtitle": "Leads, opportunities, customers, and quotations.",
		"metrics": [metric("leads", "Leads", "Lead", hint="Lead records", icon="◎"), metric("opportunities", "Opportunities", "Opportunity", hint="Sales opportunities", icon="↗"), metric("customers", "Customers", "Customer", hint="Customer records"), metric("quotations", "Quotations", "Quotation", filters={"docstatus": 1}, hint="Submitted quotations", icon="▤")],
		"chart": ("Lead Activity", "Lead", "creation", "count", None, {}, False), "activity": (("Lead", "Lead"), ("Opportunity", "Opportunity"), ("Customer", "Customer"), ("Quotation", "Quotation")),
		"shortcuts": [shortcut("Add Lead", "Lead"), shortcut("Opportunity", "Opportunity", icon="↗"), shortcut("Customer", "Customer"), shortcut("Quotation", "Quotation", icon="▤")],
	},
}


def readable(doctype):
	return bool(frappe.db.exists("DocType", doctype) and frappe.has_permission(doctype, "read"))


def aggregate(doctype, operation="count", field=None, filters=None):
	if not readable(doctype):
		return 0
	function = "SUM" if operation == "sum" else "COUNT"
	try:
		rows = frappe.get_list(doctype, fields=[f"{function}({field or 'name'}) AS total"], filters=filters or {}, limit_page_length=1)
		return rows[0].total if rows and rows[0].total is not None else 0
	except (frappe.PermissionError, frappe.ValidationError):
		return 0


@frappe.whitelist()
def get_dashboard_data(module="home"):
	if frappe.session.user == "Guest":
		frappe.throw("Login required", frappe.PermissionError)

	module_key = (module or "home").strip().lower().replace("_", "-")
	profile = PROFILES.get(module_key, PROFILES["home"])
	currency = frappe.db.get_single_value("Global Defaults", "default_currency") or "USD"
	metrics = []
	for config in profile["metrics"]:
		data = {key: config[key] for key in ("key", "label", "currency", "hint", "icon")}
		data["value"] = aggregate(config["doctype"], config["aggregate"], config["field"], config["filters"])
		metrics.append(data)

	chart_title, chart_doctype, date_field, operation, field, base_filters, chart_currency = profile["chart"]
	monthly = []
	for offset in range(5, -1, -1):
		month_date = add_months(today(), -offset)
		filters = dict(base_filters)
		filters[date_field] = ["between", [get_first_day(month_date), get_last_day(month_date)]]
		monthly.append({"month": getdate(month_date).strftime("%b"), "total": aggregate(chart_doctype, operation, field, filters)})

	recent = []
	for doctype, label in profile["activity"]:
		if not readable(doctype):
			continue
		try:
			for row in frappe.get_list(doctype, fields=["name", "modified"], order_by="modified desc", limit_page_length=3):
				recent.append({"doctype": doctype, "label": label, "name": row.name, "modified": row.modified})
		except (frappe.PermissionError, frappe.ValidationError):
			continue
	recent.sort(key=lambda row: row["modified"], reverse=True)

	shortcuts = []
	for config in profile["shortcuts"]:
		target = config["target"]
		if config["action"] == "route" or not frappe.db.exists("DocType", target):
			shortcuts.append(config)
		elif frappe.has_permission(target, "create" if config["action"] == "new" else "read"):
			shortcuts.append(config)

	return {
		"module": module_key,
		"title": profile["title"],
		"subtitle": profile["subtitle"],
		"currency": currency,
		"metrics": metrics,
		"chart": {"title": chart_title, "currency": chart_currency, "values": monthly},
		"shortcuts": shortcuts,
		"recent_activity": recent[:6],
	}
