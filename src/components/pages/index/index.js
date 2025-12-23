// Подключение функционала "Чертоги Фрилансера"
import { FLS } from "@js/common/functions.js";

// Получение названия месяца в родительном падеже
function getMonthNameInGenitive(monthIndex) {
	const months = [
		"Январе",
		"Феврале",
		"Марте",
		"Апреле",
		"Мае",
		"Июне",
		"Июле",
		"Августе",
		"Сентябре",
		"Октябре",
		"Ноябре",
		"Декабре",
	];
	return months[monthIndex];
}

// Обновление месяца в бейдже
function updateMonthBadge() {
	const monthBadge = document.querySelector("[data-fls-month-badge]");
	const monthNameElement = document.querySelector("[data-fls-month-name]");

	if (monthBadge && monthNameElement) {
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth();
		const monthName = getMonthNameInGenitive(currentMonth);
		monthNameElement.textContent = monthName;
	}
}

// Сообщения об успешной отправке
function showSuccessMessage() {
	const message = document.createElement("div");
	message.className = "success-message";
	message.textContent = "Ваша заявка успешно отправлена";
	message.style.cssText = `
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #e39157;
		color: #fff;
		padding: 20px 36px;
		border-radius: 12px;
		font-size: 18px;
		font-weight: 600;
		z-index: 10000;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
		animation: fadeIn 0.25s ease;
	`;

	const style = document.createElement("style");
	style.textContent = `
		@keyframes fadeIn {
			from { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
			to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
		}
		@keyframes fadeOut {
			from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
			to { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
		}
	`;
	document.head.appendChild(style);
	document.body.appendChild(message);

	setTimeout(() => {
		message.style.animation = "fadeOut 0.25s ease";
		setTimeout(() => {
			message.remove();
			style.remove();
		}, 250);
	}, 3500);
}

function showContactSuccessMessage(form) {
	const statusId = "contact-status-message";
	let statusElement = form.querySelector(`#${statusId}`);

	if (!statusElement) {
		statusElement = document.createElement("div");
		statusElement.id = statusId;
		statusElement.className = "form__status";
		statusElement.style.cssText = `
			margin-top: 10px;
			color: #2d8a52;
			font-size: 15px;
			font-weight: 600;
		`;
		form.appendChild(statusElement);
	}

	statusElement.textContent = "Ваша заявка отправлена";
	statusElement.setAttribute("role", "status");
	if (statusElement._hideTimeout) {
		clearTimeout(statusElement._hideTimeout);
	}
	statusElement._hideTimeout = setTimeout(() => {
		statusElement.remove();
	}, 4000);
}

function showOrderSuccessMessage() {
	const existingMessage = document.querySelector(".order-success-message");
	if (existingMessage) existingMessage.remove();

	const message = document.createElement("div");
	message.className = "order-success-message";
	message.textContent = "Покупка совершена успешно";
	message.style.cssText = `
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #e39157;
		color: #fff;
		padding: 20px 36px;
		border-radius: 12px;
		font-size: 18px;
		font-weight: 600;
		z-index: 99999;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
		animation: fadeIn 0.25s ease;
		pointer-events: none;
		white-space: nowrap;
	`;

	if (!document.getElementById("success-message-animations")) {
		const style = document.createElement("style");
		style.id = "success-message-animations";
		style.textContent = `
			@keyframes fadeIn {
				from { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
				to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
			}
			@keyframes fadeOut {
				from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
				to { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
			}
			.order-success-message { animation: fadeIn 0.25s ease; }
		`;
		document.head.appendChild(style);
	}

	document.body.appendChild(message);

	setTimeout(() => {
		message.style.animation = "fadeOut 0.25s ease";
		setTimeout(() => message.remove(), 250);
	}, 3500);
}

// Обновление цены в заказе
function updateOrderPrice(select) {
	if (!select) return;
	const selectedOption = select.options[select.selectedIndex];
	const price = selectedOption?.getAttribute("data-price");
	const priceElement = document.getElementById("total-price");

	if (priceElement && price) {
		priceElement.textContent = price;
	}
}

function bindPriceWatcher(select) {
	if (!select || select.dataset.priceBound) return;
	select.addEventListener("change", () => updateOrderPrice(select));
	select.dataset.priceBound = "true";
	// Первичная отрисовка цены
	updateOrderPrice(select);
}

// Обработчик отправки форм и работы с попапом
function initFormHandler() {
	document.addEventListener("formSent", (e) => {
		const form = e.detail.form;
		const formId = form.getAttribute("data-fls-form");
		const formType = form.getAttribute("data-fls-form-type");

		const isOrderForm = formType === "order" || formId === "order";
		const isContactForm = formType === "contact" || formId === "contact";

		if (window.flsPopup && window.flsPopup.isOpen) {
			window.flsPopup.close();
			setTimeout(() => {
				if (isOrderForm) {
					showOrderSuccessMessage();
				} else if (isContactForm) {
					showContactSuccessMessage(form);
				} else {
					showSuccessMessage();
				}
			}, 600);
		} else {
			if (isOrderForm) {
				showOrderSuccessMessage();
			} else if (isContactForm) {
				showContactSuccessMessage(form);
			} else {
				showSuccessMessage();
			}
		}
	});

	document.addEventListener("afterPopupOpen", (e) => {
		if (!e.detail?.popup) return;
		const popup = e.detail.popup;
		const popupElement = popup.targetOpen.element;
		if (!popupElement) return;

		const popupId = popupElement.getAttribute("data-fls-popup");
		const form = popupElement.querySelector("[data-fls-form]");
		if (form && (popupId === "form-popup" || popupId === "order-popup")) {
			form.reset();
			const inputs = form.querySelectorAll("input, textarea, select");
			inputs.forEach((input) => {
				input.classList.remove("--form-error", "--form-success", "--form-focus");
				input.parentElement?.classList.remove("--form-error", "--form-success", "--form-focus");
				input.parentElement?.querySelector("[data-fls-form-error]")?.remove();
			});

			if (popupId === "order-popup") {
				const select = form.querySelector('select[name="package"]');
				updateOrderPrice(select);
				bindPriceWatcher(select);
			}
		}
	});
}

// Работа с выбором пакета услуг
function initServicePackages() {
	document.querySelectorAll("[data-service-package]").forEach((button) => {
		button.addEventListener("click", function () {
			const packageValue = this.getAttribute("data-service-package");
			sessionStorage.setItem("selectedPackage", packageValue);
		});
	});

	document.addEventListener("afterPopupOpen", (e) => {
		const popup = e.detail?.popup;
		const popupElement = popup?.targetOpen?.element;
		if (!popupElement || popupElement.getAttribute("data-fls-popup") !== "order-popup") return;

		const selectedPackage = sessionStorage.getItem("selectedPackage");
		if (selectedPackage) {
			setTimeout(() => {
				const originalSelect = popupElement.querySelector('select[name="package"]');
				if (originalSelect) {
					originalSelect.value = selectedPackage;
					originalSelect.dispatchEvent(new Event("change", { bubbles: true }));
					updateOrderPrice(originalSelect);
					sessionStorage.removeItem("selectedPackage");
				}
			}, 100);
		}
		// Всегда актуализируем цену при открытии
		const select = popupElement?.querySelector('select[name="package"]');
		if (select) {
			updateOrderPrice(select);
			bindPriceWatcher(select);
		}
	});

	document.addEventListener("change", (e) => {
		if (e.target?.name === "package" && e.target.hasAttribute("data-fls-select")) {
			updateOrderPrice(e.target);
		}
	});

	// Поддержка кастомного select из шаблона
	document.addEventListener("selectCallback", (e) => {
		const select = e.detail?.select;
		if (select?.name === "package") {
			updateOrderPrice(select);
		}
	});
}

// Инициализация при загрузке
if (document.querySelector("[data-fls-month-badge]")) {
	window.addEventListener("load", updateMonthBadge);
}
window.addEventListener("load", initFormHandler);
window.addEventListener("load", initServicePackages);
