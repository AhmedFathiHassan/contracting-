import frappe


EASYAI_PRINT_CSS = r"""
@page {
	size: A4;
	margin: 15mm 13mm 17mm;
}

:root {
	--easyai-accent: #f97316;
	--easyai-accent-dark: #c2410c;
	--easyai-soft: #fff7ed;
	--easyai-ink: #1f2937;
	--easyai-muted: #667085;
	--easyai-border: #e5e7eb;
}

.print-format {
	position: relative;
	padding: 0 !important;
	color: var(--easyai-ink);
	font-family: Inter, "Segoe UI", Arial, sans-serif !important;
	font-size: 9pt;
	line-height: 1.55;
}

.print-format::before {
	content: "EasyAi";
	display: block;
	margin-bottom: 9mm;
	padding: 0 0 4mm;
	border-bottom: 2px solid var(--easyai-accent);
	color: var(--easyai-ink);
	font-size: 20pt;
	font-weight: 800;
	letter-spacing: -1px;
}

.print-format::after {
	content: "EasyAi  •  Simple business management";
	display: block;
	margin-top: 10mm;
	padding-top: 3mm;
	border-top: 1px solid var(--easyai-border);
	color: var(--easyai-muted);
	font-size: 7.5pt;
	text-align: center;
}

.print-format h1,
.print-format h2,
.print-format h3,
.print-format h4,
.print-format h5 {
	margin-bottom: 3mm;
	color: var(--easyai-ink);
	font-weight: 750;
	letter-spacing: -0.2px;
}

.print-format h1 { font-size: 20pt; }
.print-format h2 { font-size: 15pt; }
.print-format h3 { font-size: 12pt; }
.print-format h4,
.print-format h5 { font-size: 10pt; }

.print-format .print-heading {
	margin-bottom: 7mm;
	padding: 4mm 5mm;
	border: 1px solid #fed7aa;
	border-radius: 3mm;
	background: linear-gradient(135deg, #ffffff, var(--easyai-soft));
	text-align: left;
}

.print-format .print-heading h2 {
	margin: 0;
	color: var(--easyai-accent-dark);
	font-size: 18pt;
}

.print-format .document-title,
.print-format .document-name {
	color: var(--easyai-accent-dark);
	font-weight: 750;
}

.print-format .letter-head,
.print-format .letter-head-footer {
	color: var(--easyai-ink);
}

.print-format .row {
	margin-right: -2mm;
	margin-left: -2mm;
}

.print-format [class*="col-"] {
	padding-right: 2mm;
	padding-left: 2mm;
}

.print-format .section-break,
.print-format .section-head,
.print-format .print-format-section {
	margin-top: 5mm;
	margin-bottom: 3mm;
	color: var(--easyai-accent-dark);
	font-weight: 750;
}

.print-format table {
	width: 100%;
	margin: 4mm 0;
	border: 1px solid var(--easyai-border) !important;
	border-collapse: separate !important;
	border-spacing: 0;
	border-radius: 2.5mm;
	overflow: hidden;
}

.print-format table th {
	padding: 2.6mm 2.2mm !important;
	border-color: #dfe3e8 !important;
	background: #f1f4f8 !important;
	color: #344054 !important;
	font-size: 8pt;
	font-weight: 750;
	text-transform: none;
}

.print-format table td {
	padding: 2.5mm 2.2mm !important;
	border-color: #e8ebef !important;
	background: #ffffff;
	vertical-align: top;
}

.print-format table tbody tr:nth-child(even) td {
	background: #fbfcfd;
}

.print-format table tbody tr:last-child td {
	border-bottom: 0 !important;
}

.print-format .important,
.print-format .text-danger,
.print-format .grand-total-row td,
.print-format .total-row td {
	color: var(--easyai-accent-dark) !important;
	font-weight: 750;
}

.print-format .grand-total-row td,
.print-format .total-row td {
	background: var(--easyai-soft) !important;
}

.print-format .label,
.print-format .field-label,
.print-format .text-muted {
	color: var(--easyai-muted) !important;
	font-size: 8pt;
}

.print-format .value,
.print-format .field-value {
	color: var(--easyai-ink);
	font-weight: 550;
}

.print-format .alert,
.print-format .well {
	padding: 3mm 4mm;
	border: 1px solid #fed7aa;
	border-radius: 2.5mm;
	background: var(--easyai-soft);
}

.print-format .signature-section,
.print-format .terms {
	margin-top: 8mm;
	padding-top: 4mm;
	border-top: 1px solid var(--easyai-border);
}

.print-format img {
	max-width: 100%;
}

[dir="rtl"] .print-format,
.print-format.rtl {
	direction: rtl;
	font-family: Tahoma, Arial, sans-serif !important;
	text-align: right;
}

[dir="rtl"] .print-format .print-heading,
.print-format.rtl .print-heading {
	text-align: right;
}

@media print {
	.print-format {
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}

	.print-format table tr,
	.print-format .row {
		break-inside: avoid;
	}
}
"""


def install_branding():
	"""Install the site-wide EasyAi document style and make it the default."""
	style_name = "EasyAi"
	if frappe.db.exists("Print Style", style_name):
		print_style = frappe.get_doc("Print Style", style_name)
	else:
		print_style = frappe.new_doc("Print Style")
		print_style.print_style_name = style_name

	print_style.disabled = 0
	# Custom styles remain editable and can still be selected as the site default.
	print_style.standard = 0
	print_style.css = EASYAI_PRINT_CSS
	print_style.save(ignore_permissions=True)

	print_settings = frappe.get_single("Print Settings")
	print_settings.print_style = style_name
	print_settings.font = "Inter"
	print_settings.font_size = 9
	print_settings.save(ignore_permissions=True)

	frappe.clear_cache()
