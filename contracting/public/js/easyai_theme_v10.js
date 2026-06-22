(() => {
	"use strict";

	const STORAGE_COLOR = "easyai-color";
	const COLORS = ["orange", "ocean", "forest", "violet"];
	const COLOR_LABELS = {
		orange: "Orange",
		ocean: "Ocean",
		forest: "Forest",
		violet: "Violet",
	};
	const EASYAI_THEME_REVISION = "14";
	if (localStorage.getItem("easyai-theme-revision") !== EASYAI_THEME_REVISION) {
		localStorage.setItem(STORAGE_COLOR, "orange");
		localStorage.setItem("easyai-theme-revision", EASYAI_THEME_REVISION);
	}

	const translations = {
		en: {
			appearance: "Appearance",
			appearanceHint: "Choose your EasyAi color and language.",
			welcome: "Your work, simplified.",
			description: "A clear view of projects, customers, sales and daily operations.",
			eyebrow: "EASYAI WORKSPACE",
			newProject: "New Project",
			projects: "View Projects",
			newCustomer: "New Customer",
			newQuotation: "New Quotation",
			density: "Display density",
			comfortable: "Comfortable",
			compact: "Compact",
			focus: "Focus mode",
			focusHint: "Hide distractions",
			quickAddItem: "Quick Add Item",
			createItem: "Create a new item",
			itemCreated: "Item created and added to the invoice",
			dashboardSubtitle: "Here is what is happening with your business today.",
			totalSales: "Total Sales",
			totalPurchases: "Total Purchases",
			customers: "Customers",
			projectsCount: "Projects",
			salesOverview: "Sales Overview",
			shortcuts: "Shortcuts",
			recentActivity: "Recent Activity",
			addInvoice: "Add Invoice",
			addCustomer: "Add Customer",
			addItem: "Add Item",
			newPurchase: "New Purchase",
			viewReports: "View Reports",
		},
		ar: {
			appearance: "المظهر",
			appearanceHint: "اختر لون EasyAi واللغة المفضلة.",
			welcome: "أعمالك أصبحت أبسط.",
			description: "نظرة واضحة على المشاريع والعملاء والمبيعات والعمليات اليومية.",
			eyebrow: "مساحة عمل EASYAI",
			newProject: "مشروع جديد",
			projects: "عرض المشاريع",
			newCustomer: "عميل جديد",
			newQuotation: "عرض سعر جديد",
			density: "كثافة العرض",
			comfortable: "مريح",
			compact: "مدمج",
			focus: "وضع التركيز",
			focusHint: "إخفاء المشتتات",
			quickAddItem: "إضافة صنف سريعاً",
			createItem: "إنشاء صنف جديد",
			itemCreated: "تم إنشاء الصنف وإضافته إلى الفاتورة",
			dashboardSubtitle: "إليك ملخص ما يحدث في أعمالك اليوم.",
			totalSales: "إجمالي المبيعات",
			totalPurchases: "إجمالي المشتريات",
			customers: "العملاء",
			projectsCount: "المشاريع",
			salesOverview: "نظرة عامة على المبيعات",
			shortcuts: "اختصارات",
			recentActivity: "النشاط الأخير",
			addInvoice: "إضافة فاتورة",
			addCustomer: "إضافة عميل",
			addItem: "إضافة صنف",
			newPurchase: "طلب شراء جديد",
			viewReports: "عرض التقارير",
		},
	};

	function currentLanguage() {
		const bootLanguage = window.frappe?.boot?.lang;
		const documentLanguage = document.documentElement.lang;
		return String(bootLanguage || documentLanguage || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
	}

	function copy() {
		return translations[currentLanguage()];
	}

	function brandMarkup(extraClass = "") {
		return `<span class="easyai-brand ${extraClass}" aria-label="EasyAi"><span>Easy</span><span class="easyai-brand__ai">Ai</span><span class="easyai-brand__dot"></span></span>`;
	}

	function applyColor(color) {
		const safeColor = COLORS.includes(color) ? color : "orange";
		document.documentElement.dataset.easyaiColor = safeColor;
		localStorage.setItem(STORAGE_COLOR, safeColor);
		document.querySelectorAll(".easyai-color-option").forEach((button) => {
			button.classList.toggle("is-active", button.dataset.color === safeColor);
		});
	}

	function applyDensity(density) {
		const safeDensity = density === "compact" ? "compact" : "comfortable";
		document.documentElement.dataset.easyaiDensity = safeDensity;
		localStorage.setItem("easyai-density", safeDensity);
		document.querySelectorAll("[data-density]").forEach((button) => {
			button.classList.toggle("is-active", button.dataset.density === safeDensity);
		});
	}

	function toggleFocus(force) {
		const active = typeof force === "boolean" ? force : !document.documentElement.classList.contains("easyai-focus");
		document.documentElement.classList.toggle("easyai-focus", active);
		localStorage.setItem("easyai-focus", active ? "1" : "0");
		const button = document.querySelector("[data-easyai-focus]");
		button?.classList.toggle("is-active", active);
		button?.setAttribute("aria-pressed", String(active));
	}

	async function changeLanguage(language) {
		const lang = language === "ar" ? "ar" : "en";
		document.cookie = `preferred_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
		localStorage.setItem("easyai-language", lang);
		document.documentElement.lang = lang;
		document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

		try {
			if (window.frappe?.session?.user && frappe.session.user !== "Guest" && frappe.db?.set_value) {
				await frappe.db.set_value("User", frappe.session.user, "language", lang);
			}
		} catch (error) {
			console.info("EasyAi: language saved for this browser only.", error);
		}

		window.location.reload();
	}

	function mountBrand() {
		document.documentElement.classList.add("easyai-theme");
		document.title = document.title.replace(/ERPNext|Frappe/gi, "EasyAi");

		const navbarBrand = document.querySelector(".navbar .navbar-brand, .navbar .navbar-home");
		if (navbarBrand && !navbarBrand.querySelector(".easyai-brand")) {
			navbarBrand.innerHTML = brandMarkup();
		}

		const loginHead = document.querySelector(".login-content .page-card-head, .page-card-head");
		if (loginHead && !loginHead.querySelector(".easyai-login-brand")) {
			loginHead.insertAdjacentHTML(
				"afterbegin",
				`${brandMarkup("easyai-login-brand")}<p class="easyai-login-subtitle">Simple business management, built for your team.</p>`
			);
		}
	}

	function mountSidebarBrand() {
		if (window.frappe?.session?.user === "Guest" || !window.location.pathname.startsWith("/app")) return;
		if (document.querySelector(".easyai-sidebar-brand")) return;
		document.body.insertAdjacentHTML(
			"afterbegin",
			`<a class="easyai-sidebar-brand" href="/app/home" aria-label="EasyAi Home" title="Go to Home"><span class="easyai-word-logo" dir="ltr">Easy<span>Ai</span><i></i></span></a>`
		);
	}

	const EASYAI_NAV = [
		["Overview", [["Home", "home", "M4 10.5 12 4l8 6.5V20H5v-9.5Z"]]],
		["Operations", [["Selling", "selling", "M4 19V9m8 10V5m8 14v-7M3 19h18"], ["Buying", "buying", "M4 5h2l2 10h9l2-7H7m2 11h.01M17 19h.01"], ["Stock", "stock", "m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5"]]],
		["Finance", [["Accounting", "accounting", "M5 3h14v18H5V3Zm3 5h8m-8 4h3m2 0h3m-8 4h3m2 0h3"], ["Assets", "assets", "M5 8h14v11H5V8Zm3 0V5h8v3"]]],
		["Work", [["Projects", "projects", "M4 7h6l2 2h8v10H4V7Z"], ["HR & Payroll", "hr", "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 0v6m3-3h-6"], ["Support", "support", "M4 13v-2a8 8 0 0 1 16 0v2M4 13h3v6H4v-6Zm16 0h-3v6h3v-6Z"]]],
		["Insights", [["Reports", "query-report/General-Ledger", "M5 20V10m5 10V4m5 16v-7m5 7V7"], ["Settings", "settings", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"]]],
	];

	function easyaiNavIcon(path) {
		return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
	}

	function updateNavigationState() {
		const path = decodeURIComponent(window.location.pathname).toLowerCase();
		document.querySelectorAll(".easyai-app-nav__link").forEach((link) => {
			const route = link.dataset.route;
			const active = route === "home" ? /\/app\/?(home)?$/.test(path) : path.includes(route);
			link.classList.toggle("is-active", active);
			if (active) link.closest(".easyai-app-nav__section")?.classList.add("is-open");
		});
	}

	function mountAppSidebar() {
		if (window.frappe?.session?.user === "Guest" || !window.location.pathname.startsWith("/app")) return;
		if (document.querySelector(".easyai-app-sidebar")) {
			updateNavigationState();
			return;
		}
		const sections = EASYAI_NAV.map(([title, items]) => `<section class="easyai-app-nav__section is-open"><button class="easyai-app-nav__section-toggle" type="button" aria-expanded="true"><span>${title}</span><svg viewBox="0 0 20 20"><path d="m6 8 4 4 4-4"/></svg></button><div class="easyai-app-nav__items">${items.map(([label, route, icon]) => `<a class="easyai-app-nav__link" href="/app/${route}" data-route="${route.toLowerCase()}"><span class="easyai-app-nav__icon">${easyaiNavIcon(icon)}</span><span class="easyai-app-nav__label">${label}</span></a>`).join("")}</div></section>`).join("");
		document.body.insertAdjacentHTML("afterbegin", `<aside class="easyai-app-sidebar" aria-label="Primary navigation"><nav class="easyai-app-nav">${sections}</nav><footer><div class="easyai-sidebar-preferences"><button class="easyai-sidebar-preference" type="button" data-easyai-sidebar-language><span class="easyai-sidebar-preference__icon">${currentLanguage() === "ar" ? "EN" : "AR"}</span><span>Language</span></button><button class="easyai-sidebar-preference" type="button" data-easyai-sidebar-theme aria-expanded="false"><span class="easyai-sidebar-color-dot"></span><span>Theme color</span></button><div class="easyai-sidebar-palette" hidden>${COLORS.map((color) => `<button type="button" data-easyai-sidebar-color="${color}" title="${COLOR_LABELS[color]}"><span style="--swatch:${{ orange: "#ff6500", ocean: "#0ea5e9", forest: "#10b981", violet: "#8b5cf6" }[color]}"></span>${COLOR_LABELS[color]}</button>`).join("")}</div></div><button type="button" data-easyai-sidebar-collapse aria-label="Collapse navigation">${easyaiNavIcon("M5 7h14M5 12h10M5 17h14")}<span>Collapse menu</span></button></footer></aside><button class="easyai-sidebar-scrim" type="button" aria-label="Close navigation"></button>`);
		document.querySelector("[data-easyai-sidebar-language]")?.remove();
		document.body.classList.add("easyai-nav-mounted");
		document.documentElement.classList.toggle("easyai-sidebar-collapsed", localStorage.getItem("easyai-sidebar-collapsed") === "1");
		const sidebar = document.querySelector(".easyai-app-sidebar");
		sidebar.addEventListener("click", (event) => {
			const languageButton = event.target.closest("[data-easyai-sidebar-language]");
			const themeButton = event.target.closest("[data-easyai-sidebar-theme]");
			const colorButton = event.target.closest("[data-easyai-sidebar-color]");
			if (languageButton) changeLanguage(currentLanguage() === "ar" ? "en" : "ar");
			if (themeButton) {
				const palette = sidebar.querySelector(".easyai-sidebar-palette");
				palette.hidden = !palette.hidden;
				themeButton.setAttribute("aria-expanded", String(!palette.hidden));
			}
			if (colorButton) {
				applyColor(colorButton.dataset.easyaiSidebarColor);
				sidebar.querySelector(".easyai-sidebar-palette").hidden = true;
			}
			const sectionButton = event.target.closest(".easyai-app-nav__section-toggle");
			if (sectionButton) {
				const section = sectionButton.closest(".easyai-app-nav__section");
				section.classList.toggle("is-open");
				sectionButton.setAttribute("aria-expanded", String(section.classList.contains("is-open")));
			}
			if (event.target.closest(".easyai-app-nav__link")) document.documentElement.classList.remove("easyai-mobile-nav-open");
			if (event.target.closest("[data-easyai-sidebar-collapse]")) {
				const collapsed = !document.documentElement.classList.contains("easyai-sidebar-collapsed");
				document.documentElement.classList.toggle("easyai-sidebar-collapsed", collapsed);
				localStorage.setItem("easyai-sidebar-collapsed", collapsed ? "1" : "0");
			}
		});
		document.querySelector(".easyai-sidebar-scrim")?.addEventListener("click", () => document.documentElement.classList.remove("easyai-mobile-nav-open"));
		updateNavigationState();
	}

	function applyWhiteLabel() {
		mountAppSidebar();
		const blockedParents = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		const nodes = [];
		let node;
		while ((node = walker.nextNode())) nodes.push(node);

		nodes.forEach((textNode) => {
			if (!textNode.parentElement || blockedParents.has(textNode.parentElement.tagName)) return;
			if (/ERPNext|Frappe/i.test(textNode.nodeValue)) {
				textNode.nodeValue = textNode.nodeValue.replace(/ERPNext|Frappe/gi, "EasyAi");
			}
		});

		document.querySelectorAll("[title], [aria-label], [placeholder]").forEach((element) => {
			["title", "aria-label", "placeholder"].forEach((attribute) => {
				const value = element.getAttribute(attribute);
				if (value && /ERPNext|Frappe/i.test(value)) {
					element.setAttribute(attribute, value.replace(/ERPNext|Frappe/gi, "EasyAi"));
				}
			});
		});

		const loginTitle = document.querySelector(".login-content .page-card-head h4, .for-login .page-card-head h4");
		if (loginTitle) loginTitle.textContent = currentLanguage() === "ar" ? "تسجيل الدخول إلى EasyAi" : "Welcome to EasyAi";

		const homeTitle = document.querySelector(".workspace-container .page-title .title-text");
		if (homeTitle && homeTitle.textContent.trim() === "Home") {
			homeTitle.textContent = currentLanguage() === "ar" ? "الرئيسية" : "EasyAi Home";
		}

		document.querySelectorAll(".dropdown-menu li, .dropdown-menu a").forEach((item) => {
			if (/Documentation|Frappe Support|ERPNext Support/i.test(item.textContent)) {
				item.closest("li")?.classList.add("easyai-hidden-vendor-link");
			}
		});

		document.querySelectorAll(".standard-sidebar-label").forEach((label) => {
			for (const textNode of label.childNodes) {
				if (textNode.nodeType === Node.TEXT_NODE && textNode.nodeValue.trim().toUpperCase() === "PUBLIC") {
					textNode.nodeValue = currentLanguage() === "ar" ? "مساحات العمل" : "Workspaces";
				}
			}
		});

		let favicon = document.querySelector('link[rel="icon"]');
		if (!favicon) {
			favicon = document.createElement("link");
			favicon.rel = "icon";
			document.head.appendChild(favicon);
		}
		favicon.href = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#f97316"/><text x="32" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="white">EA</text></svg>');
	}

	function controlsMarkup() {
		const text = copy();
		const language = currentLanguage();
		const density = localStorage.getItem("easyai-density") || "comfortable";
		const focusActive = localStorage.getItem("easyai-focus") === "1";
		return `
			<div class="easyai-tools">
				<button class="easyai-tool-button easyai-nav-trigger" type="button" data-easyai-mobile-navigation aria-label="Open navigation">${easyaiNavIcon("M5 7h14M5 12h14M5 17h14")}<span class="easyai-tool-button__label">Menu</span></button>
				<button class="easyai-tool-button" type="button" data-easyai-panel-toggle aria-expanded="false">
					<span class="easyai-tool-dot"></span><span class="easyai-tool-button__label">${text.appearance}</span>
				</button>
				<div class="easyai-theme-panel" hidden>
					<p class="easyai-theme-panel__title">${text.appearance}</p>
					<p class="easyai-theme-panel__hint">${text.appearanceHint}</p>
					<div class="easyai-color-options" aria-label="Color theme">
						${COLORS.map((color) => `<button type="button" class="easyai-color-option" data-color="${color}" title="${COLOR_LABELS[color]}" style="--swatch:${{ orange: "#f97316", ocean: "#0ea5e9", forest: "#10b981", violet: "#8b5cf6" }[color]}"></button>`).join("")}
					</div>
					<div class="easyai-language-options">
						<button type="button" class="easyai-language-option ${language === "en" ? "is-active" : ""}" data-language="en">English</button>
						<button type="button" class="easyai-language-option ${language === "ar" ? "is-active" : ""}" data-language="ar">العربية</button>
					</div>
					<div class="easyai-preference-section">
						<span class="easyai-preference-label">${text.density}</span>
						<div class="easyai-density-options">
							<button type="button" class="easyai-preference-button ${density === "comfortable" ? "is-active" : ""}" data-density="comfortable">${text.comfortable}</button>
							<button type="button" class="easyai-preference-button ${density === "compact" ? "is-active" : ""}" data-density="compact">${text.compact}</button>
						</div>
						<button type="button" class="easyai-focus-button ${focusActive ? "is-active" : ""}" data-easyai-focus aria-pressed="${focusActive}">
							<span><strong>${text.focus}</strong><small>${text.focusHint}</small></span><span class="easyai-switch"></span>
						</button>
					</div>
				</div>
			</div>`;
	}

	function mountControls() {
		if (document.querySelector(".easyai-tools")) return;
		document.body.insertAdjacentHTML("beforeend", controlsMarkup());
		applyColor(localStorage.getItem(STORAGE_COLOR) || "orange");
		applyDensity(localStorage.getItem("easyai-density") || "comfortable");
		toggleFocus(localStorage.getItem("easyai-focus") === "1");

		const tools = document.querySelector(".easyai-tools");
		const panel = tools.querySelector(".easyai-theme-panel");
		const toggle = tools.querySelector("[data-easyai-panel-toggle]");

		toggle.addEventListener("click", () => {
			panel.hidden = !panel.hidden;
			toggle.setAttribute("aria-expanded", String(!panel.hidden));
		});

		tools.addEventListener("click", (event) => {
			const colorButton = event.target.closest("[data-color]");
			const languageButton = event.target.closest("[data-language]");
			const densityButton = event.target.closest("[data-density]");
			const focusButton = event.target.closest("[data-easyai-focus]");
			const quickLanguage = event.target.closest("[data-easyai-language-quick]");
			const navigationButton = event.target.closest("[data-easyai-mobile-navigation]");
			if (colorButton) applyColor(colorButton.dataset.color);
			if (languageButton) changeLanguage(languageButton.dataset.language);
			if (densityButton) applyDensity(densityButton.dataset.density);
			if (focusButton) toggleFocus();
			if (quickLanguage) changeLanguage(currentLanguage() === "ar" ? "en" : "ar");
			if (navigationButton) document.documentElement.classList.toggle("easyai-mobile-nav-open");
		});

		document.addEventListener("keydown", (event) => {
			if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "f") {
				event.preventDefault();
				toggleFocus();
			}
		});

		document.addEventListener("click", (event) => {
			if (!tools.contains(event.target)) {
				panel.hidden = true;
				toggle.setAttribute("aria-expanded", "false");
			}
		});
	}

	function currentDashboardModule() {
		const slug = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop() || "home").toLowerCase();
		return slug === "app" ? "home" : slug;
	}

	function workspaceHeroMarkup(moduleKey) {
		const text = copy();
		const user = window.frappe?.boot?.user?.first_name || window.frappe?.user?.full_name?.()?.split(" ")[0] || "";
		const hour = new Date().getHours();
		const greeting = currentLanguage() === "ar"
			? (hour < 12 ? "صباح الخير" : "مساء الخير")
			: (hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening");
		const safeUser = window.frappe?.utils?.escape_html ? frappe.utils.escape_html(user) : user;
		const today = new Intl.DateTimeFormat(currentLanguage() === "ar" ? "ar" : "en", { dateStyle: "medium" }).format(new Date());
		return `
			<section class="easyai-dashboard-shell" data-module="${moduleKey}">
				<header class="easyai-dashboard-header">
					<div><h2 data-dashboard-title>${greeting}${safeUser ? `, ${safeUser}` : ""}! <span>👋</span></h2><p data-dashboard-subtitle>${text.dashboardSubtitle}</p></div>
					<div class="easyai-dashboard-date">${today}</div>
				</header>
				<div class="easyai-dashboard-layout">
					<main class="easyai-dashboard-main">
						<div class="easyai-kpi-grid" data-kpi-grid>
							<article class="easyai-kpi-card" data-kpi="sales"><span class="easyai-kpi-icon">↗</span><div><small>${text.totalSales}</small><strong>—</strong><em>${currentLanguage() === "ar" ? "المبيعات المعتمدة" : "Submitted invoices"}</em></div></article>
							<article class="easyai-kpi-card" data-kpi="purchases"><span class="easyai-kpi-icon">⌑</span><div><small>${text.totalPurchases}</small><strong>—</strong><em>${currentLanguage() === "ar" ? "المشتريات المعتمدة" : "Submitted purchases"}</em></div></article>
							<article class="easyai-kpi-card" data-kpi="customers"><span class="easyai-kpi-icon">◎</span><div><small>${text.customers}</small><strong>—</strong><em>${currentLanguage() === "ar" ? "إجمالي العملاء" : "Active records"}</em></div></article>
							<article class="easyai-kpi-card" data-kpi="projects"><span class="easyai-kpi-icon">▣</span><div><small>${text.projectsCount}</small><strong>—</strong><em>${currentLanguage() === "ar" ? "إجمالي المشاريع" : "All projects"}</em></div></article>
						</div>
						<article class="easyai-analytics-card">
							<header><div><h3 data-chart-title>${text.salesOverview}</h3><p>${currentLanguage() === "ar" ? "آخر ستة أشهر" : "Last six months"}</p></div><span class="easyai-analytics-total" data-sales-total>—</span></header>
							<div class="easyai-sales-chart" data-sales-chart><div class="easyai-chart-loading"></div></div>
						</article>
					</main>
					<aside class="easyai-dashboard-aside">
						<article class="easyai-dashboard-panel"><header><h3>${text.shortcuts}</h3></header><div class="easyai-dashboard-shortcuts" data-shortcut-list>
							<button data-doctype="Sales Invoice" data-action="new"><span>＋</span>${text.addInvoice}</button>
							<button data-doctype="Customer" data-action="new"><span>◎</span>${text.addCustomer}</button>
							<button data-doctype="Item" data-action="new"><span>◇</span>${text.addItem}</button>
							<button data-doctype="Purchase Order" data-action="new"><span>⌑</span>${text.newPurchase}</button>
							<button data-doctype="Sales Analytics" data-action="route"><span>↗</span>${text.viewReports}</button>
						</div></article>
						<article class="easyai-dashboard-panel easyai-activity-panel"><header><h3>${text.recentActivity}</h3></header><div class="easyai-activity-list" data-activity-list><div class="easyai-chart-loading"></div></div></article>
					</aside>
				</div>
			</section>`;
	}

	function formatDashboardValue(value, currency, isCurrency) {
		const locale = currentLanguage() === "ar" ? "ar" : "en-US";
		if (isCurrency) {
			try {
				return new Intl.NumberFormat(locale, { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(value || 0);
			} catch (error) {
				return `${currency || ""} ${Number(value || 0).toLocaleString(locale)}`.trim();
			}
		}
		return Number(value || 0).toLocaleString(locale);
	}

	function renderSalesChart(shell, rows, currency) {
		const chart = shell.querySelector("[data-sales-chart]");
		const data = rows?.length ? rows : Array.from({ length: 6 }, (_, index) => ({ month: String(index + 1), total: 0 }));
		const values = data.map((row) => Number(row.total || 0));
		const max = Math.max(...values, 1);
		const width = 720;
		const height = 205;
		const padding = 24;
		const points = values.map((value, index) => {
			const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
			const y = height - padding - (value / max) * (height - padding * 2);
			return { x, y, value, label: data[index].month };
		});
		const line = points.map((point) => `${point.x},${point.y}`).join(" ");
		const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;
		chart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Sales trend"><defs><linearGradient id="easyaiArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--easyai-orange)" stop-opacity=".25"/><stop offset="1" stop-color="var(--easyai-orange)" stop-opacity="0"/></linearGradient></defs><g class="easyai-chart-grid"><line x1="${padding}" y1="${height * .28}" x2="${width - padding}" y2="${height * .28}"/><line x1="${padding}" y1="${height * .55}" x2="${width - padding}" y2="${height * .55}"/><line x1="${padding}" y1="${height * .82}" x2="${width - padding}" y2="${height * .82}"/></g><polygon points="${area}" fill="url(#easyaiArea)"/><polyline points="${line}" fill="none" stroke="var(--easyai-orange)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="white" stroke="var(--easyai-orange)" stroke-width="3"><title>${point.label}: ${formatDashboardValue(point.value, currency, true)}</title></circle>`).join("")}</svg><div class="easyai-chart-labels">${points.map((point) => `<span>${point.label}</span>`).join("")}</div>`;
	}

	async function loadDashboardData(shell, moduleKey) {
		if (shell.dataset.loaded) return;
		shell.dataset.loaded = "1";
		try {
			const response = await frappe.call({
				method: "contracting.easyai_dashboards.get_dashboard_data",
				args: { module: moduleKey },
			});
			const data = response.message || {};
			const escape = (value) => frappe.utils?.escape_html ? frappe.utils.escape_html(String(value || "")) : String(value || "");
			const title = shell.querySelector("[data-dashboard-title]");
			const subtitle = shell.querySelector("[data-dashboard-subtitle]");
			if (title) title.textContent = data.title || "EasyAi Overview";
			if (subtitle) subtitle.textContent = data.subtitle || "";

			const metricGrid = shell.querySelector("[data-kpi-grid]");
			if (metricGrid) {
				metricGrid.innerHTML = (data.metrics || []).map((item) => `<article class="easyai-kpi-card" data-kpi="${escape(item.key)}"><span class="easyai-kpi-icon">${escape(item.icon)}</span><div><small>${escape(item.label)}</small><strong>${escape(formatDashboardValue(item.value, data.currency, item.currency))}</strong><em>${escape(item.hint)}</em></div></article>`).join("");
			}

			const chartTitle = shell.querySelector("[data-chart-title]");
			if (chartTitle) chartTitle.textContent = data.chart?.title || "Activity Overview";
			const salesTotal = shell.querySelector("[data-sales-total]");
			const chartTotal = (data.chart?.values || []).reduce((total, row) => total + Number(row.total || 0), 0);
			if (salesTotal) salesTotal.textContent = formatDashboardValue(chartTotal, data.currency, data.chart?.currency);
			renderSalesChart(shell, data.chart?.values, data.currency);

			const shortcuts = shell.querySelector("[data-shortcut-list]");
			if (shortcuts) {
				shortcuts.innerHTML = (data.shortcuts || []).map((item) => `<button data-doctype="${escape(item.target)}" data-action="${escape(item.action)}"><span>${escape(item.icon)}</span>${escape(item.label)}</button>`).join("");
			}

			const activity = shell.querySelector("[data-activity-list]");
			if (activity) {
				const activityTime = (value) => {
					const date = new Date(String(value || "").replace(" ", "T"));
					if (Number.isNaN(date.getTime())) return "";
					return new Intl.DateTimeFormat(currentLanguage() === "ar" ? "ar" : "en", {
						month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
					}).format(date);
				};
				activity.innerHTML = data.recent_activity?.length
					? data.recent_activity.map((row) => `<button data-doctype="${escape(row.doctype)}" data-name="${escape(row.name)}"><span>${escape(row.label).slice(0, 1)}</span><div><strong>${escape(row.label)}</strong><small>${escape(row.name)}</small></div><time>${escape(activityTime(row.modified))}</time></button>`).join("")
					: `<div class="easyai-empty-activity">${currentLanguage() === "ar" ? "لا يوجد نشاط حديث" : "No recent activity yet"}</div>`;
			}
		} catch (error) {
			shell.querySelectorAll(".easyai-chart-loading").forEach((loader) => loader.remove());
			console.info("EasyAi dashboard data is unavailable.", error);
		}
	}

	function mountWorkspaceHero() {
		if (!window.frappe) return;
		const moduleKey = currentDashboardModule();
		const existing = document.querySelector(".easyai-dashboard-shell");
		if (existing?.dataset.module === moduleKey) return;
		existing?.remove();
		const workspace = document.querySelector(
			".layout-main-section .workspace-container, .layout-main-section .editor-js-container, .workspace-container, .editor-js-container"
		);
		if (!workspace) return;
		workspace.insertAdjacentHTML("afterbegin", workspaceHeroMarkup(moduleKey));
		const shell = workspace.querySelector(".easyai-dashboard-shell");
		loadDashboardData(shell, moduleKey);

		shell.addEventListener("click", (event) => {
			const actionButton = event.target.closest("[data-doctype]");
			if (!actionButton) return;
			const doctype = actionButton.dataset.doctype;
			if (actionButton.dataset.name) {
				frappe.set_route("Form", doctype, actionButton.dataset.name);
			} else if (actionButton.dataset.action === "new" && frappe.new_doc) {
				frappe.new_doc(doctype);
			} else if (actionButton.dataset.action === "route") {
				frappe.set_route("query-report", doctype);
			} else if (actionButton.dataset.action === "list") {
				frappe.set_route("List", doctype, "List");
			} else {
				frappe.set_route("List", doctype, "List");
			}
		});
	}

	function openQuickItemDialog(frm) {
		const text = copy();
		const dialog = new frappe.ui.Dialog({
			title: text.createItem,
			size: "small",
			fields: [
				{ fieldname: "item_code", fieldtype: "Data", label: __("Item Code"), reqd: 1 },
				{ fieldname: "item_name", fieldtype: "Data", label: __("Item Name") },
				{ fieldtype: "Column Break" },
				{ fieldname: "item_group", fieldtype: "Link", options: "Item Group", label: __("Item Group"), reqd: 1 },
				{ fieldname: "stock_uom", fieldtype: "Link", options: "UOM", label: __("Stock UOM"), reqd: 1, default: "Nos" },
				{ fieldtype: "Section Break" },
				{ fieldname: "standard_rate", fieldtype: "Currency", label: __("Standard Selling Rate"), default: 0 },
				{ fieldname: "is_stock_item", fieldtype: "Check", label: __("Maintain Stock"), default: 1 },
			],
			primary_action_label: __("Create and Add"),
			primary_action: async (values) => {
				dialog.disable_primary_action();
				try {
					const result = await frappe.call({
						method: "frappe.client.insert",
						args: {
							doc: {
								doctype: "Item",
								item_code: values.item_code,
								item_name: values.item_name || values.item_code,
								item_group: values.item_group,
								stock_uom: values.stock_uom,
								standard_rate: values.standard_rate || 0,
								is_stock_item: values.is_stock_item ? 1 : 0,
							},
						},
						freeze: true,
						freeze_message: __("Creating item..."),
					});

					const item = result.message;
					const grid = frm.fields_dict.items.grid;
					const targetRow = grid.grid_rows.find((row) => row.grid_form?.wrapper?.is(":visible"))
						|| grid.grid_rows.find((row) => row.doc.__islocal && !row.doc.item_code);

					if (targetRow) {
						await frappe.model.set_value(targetRow.doc.doctype, targetRow.doc.name, "item_code", item.name);
					} else {
						const child = frm.add_child("items");
						await frappe.model.set_value(child.doctype, child.name, "item_code", item.name);
					}

					frm.refresh_field("items");
					dialog.hide();
					frappe.show_alert({ message: text.itemCreated, indicator: "green" });
				} catch (error) {
					dialog.enable_primary_action();
					throw error;
				}
			},
		});

		dialog.show();
		dialog.get_field("item_code")?.set_focus();
	}

	function enhanceInvoiceItems() {
		const frm = window.cur_frm;
		if (!frm || !["Sales Invoice", "Purchase Invoice"].includes(frm.doctype)) return;
		const grid = frm.fields_dict?.items?.grid;
		if (!grid || grid.wrapper.find(".easyai-quick-item-button").length) return;
		if (frappe.model?.can_create && !frappe.model.can_create("Item")) return;

		const button = grid.add_custom_button(copy().quickAddItem, () => openQuickItemDialog(frm));
		button?.addClass("easyai-quick-item-button");
		grid.wrapper.find(".grid-add-row").addClass("easyai-grid-add-row");
	}

	function registerInvoiceEnhancements() {
		if (!window.frappe?.ui?.form || typeof frappe.ui.form.on !== "function" || window.__easyaiInvoiceEnhancementsRegistered) {
			enhanceInvoiceItems();
			return;
		}

		window.__easyaiInvoiceEnhancementsRegistered = true;
		["Sales Invoice", "Purchase Invoice"].forEach((doctype) => {
			frappe.ui.form.on(doctype, {
				refresh: enhanceInvoiceItems,
				onload_post_render: enhanceInvoiceItems,
				items_on_form_rendered: enhanceInvoiceItems,
			});
		});
		enhanceInvoiceItems();
	}

	function applyEasyAi() {
		mountBrand();
		mountSidebarBrand();
		mountControls();
		applyWhiteLabel();
		mountWorkspaceHero();
		registerInvoiceEnhancements();
	}

	applyColor(localStorage.getItem(STORAGE_COLOR) || "orange");
	applyDensity(localStorage.getItem("easyai-density") || "comfortable");
	toggleFocus(localStorage.getItem("easyai-focus") === "1");
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", applyEasyAi, { once: true });
	} else {
		applyEasyAi();
	}

	window.addEventListener("load", applyEasyAi, { once: true });
	const observer = new MutationObserver(() => {
		window.clearTimeout(window.__easyaiThemeTimer);
		window.__easyaiThemeTimer = window.setTimeout(applyEasyAi, 100);
	});
	observer.observe(document.documentElement, { childList: true, subtree: true });
})();
