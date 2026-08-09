// ==========================================
// ATHAQ DATES - CHECKOUT & PAYMENT ENGINE
// ==========================================

const TARGET_WHATSAPP_NUMBER = "923256989906"; // WhatsApp Engine Number
const MOYASAR_API_KEY = "pk_test_YOUR_API_KEY"; // Apni Moyasar Key Add Karein (Optional)

let currentGrandTotal = 0;
let currentSelectedPaymentMethod = "CARD";

document.addEventListener("DOMContentLoaded", function () {
    renderCheckoutSummary();

    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", handleOrderSubmit);
    }
});

// 1. RENDER CHECKOUT ITEMS & CALCULATE TOTAL
function renderCheckoutSummary() {
    const itemsContainer = document.getElementById("checkoutItemsList");
    const subtotalElem = document.getElementById("summarySubtotal");
    const totalElem = document.getElementById("summaryTotal");

    const cart = JSON.parse(localStorage.getItem("athaqCart")) || [];

    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `<p class="text-center text-gray-400 py-6 text-sm">Your cart is empty. Please add products from store.</p>`;
        if (subtotalElem) subtotalElem.textContent = "SAR 0.00";
        if (totalElem) totalElem.textContent = "SAR 0.00";
        return;
    }

    currentGrandTotal = 0;

    itemsContainer.innerHTML = cart.map(item => {
        const itemQty = item.quantity || 1;
        const itemTotal = Number(item.price) * itemQty;
        currentGrandTotal += itemTotal;

        return `
            <div class="py-3 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <img src="${item.image || 'https://via.placeholder.com/50'}" class="w-12 h-12 rounded-lg object-cover border border-gray-200" alt="${escapeHTML(item.name)}">
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm">${escapeHTML(item.name)}</h4>
                        <p class="text-xs text-gray-500">Qty: ${itemQty} x SAR ${Number(item.price).toFixed(2)}</p>
                    </div>
                </div>
                <span class="font-bold text-gray-900 text-sm">SAR ${itemTotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    if (subtotalElem) subtotalElem.textContent = `SAR ${currentGrandTotal.toFixed(2)}`;
    if (totalElem) totalElem.textContent = `SAR ${currentGrandTotal.toFixed(2)}`;

    // Try Moyasar Initialization
    initMoyasarCardPayment();
}

// 2. TOGGLE PAYMENT METHODS
function togglePaymentMethod(method) {
    currentSelectedPaymentMethod = method;
    const cardContainer = document.getElementById("cardPaymentContainer");
    const submitBtnText = document.getElementById("submitBtnText");

    if (method === 'CARD') {
        if (cardContainer) cardContainer.classList.remove("hidden");
        if (submitBtnText) submitBtnText.textContent = "Confirm & Pay with Card";
    } else {
        if (cardContainer) cardContainer.classList.add("hidden");
        if (submitBtnText) submitBtnText.textContent = "Confirm & Place Order (COD)";
    }
}

// 3. INITIALIZE MOYASAR (OR SHOW FALLBACK INPUTS)
function initMoyasarCardPayment() {
    const customFields = document.getElementById("customCardFields");

    if (typeof Moyasar !== 'undefined' && currentGrandTotal > 0 && !MOYASAR_API_KEY.includes("YOUR_API_KEY")) {
        try {
            Moyasar.init({
                element: '.mysr-form',
                amount: Math.round(currentGrandTotal * 100),
                currency: 'SAR',
                description: 'ATHAQ DATES Payment',
                publishable_api_key: MOYASAR_API_KEY,
                callback_url: window.location.href,
                methods: ['creditcard', 'mada', 'applepay'],
                on_completed: function (payment) {
                    if (payment.status === 'paid') {
                        processSuccessfulOrder(payment.id, "ONLINE_CARD");
                    }
                }
            });
            if (customFields) customFields.style.display = 'none'; // Hide native inputs if SDK loaded
            return;
        } catch (e) {
            console.log("Moyasar Fallback Active");
        }
    }

    // Keep custom card fields visible if Moyasar isn't active
    if (customFields) customFields.style.display = 'block';
}

// 4. HANDLE FORM SUBMIT
function handleOrderSubmit(e) {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem("athaqCart")) || [];
    if (cart.length === 0) {
        alert("Your cart is empty! Please add products before placing an order.");
        return;
    }

    if (currentSelectedPaymentMethod === "CARD") {
        const cardNum = document.getElementById("cardNumber")?.value;
        if (!cardNum && document.querySelector('.mysr-form').children.length === 0) {
            alert("Please enter your card details.");
            return;
        }
    }

    const orderId = "ATH-" + Math.floor(100000 + Math.random() * 900000);
    const paymentType = currentSelectedPaymentMethod === "CARD" ? "ONLINE_CARD" : "COD";

    processSuccessfulOrder(orderId, paymentType);
}

// 5. PROCESS ORDER & REDIRECT TO WHATSAPP
function processSuccessfulOrder(orderRef, paymentType) {
    const name = document.getElementById("custName")?.value || "Customer";
    const phone = document.getElementById("custPhone")?.value || "N/A";
    const email = document.getElementById("custEmail")?.value || "N/A";
    const address = document.getElementById("custAddress")?.value || "N/A";
    const city = document.getElementById("custCity")?.value || "N/A";
    const postal = document.getElementById("custPostal")?.value || "N/A";

    const cart = JSON.parse(localStorage.getItem("athaqCart")) || [];

    let itemsTextList = "";
    cart.forEach((item, index) => {
        const qty = item.quantity || 1;
        const itemTotal = Number(item.price) * qty;
        itemsTextList += `${index + 1}. *${item.name}* (Qty: ${qty}) - SAR ${itemTotal.toFixed(2)}\n`;
    });

    const statusText = paymentType === "ONLINE_CARD" ? "Paid Online (Card)" : "Cash on Delivery";

    const message = 
`🛍️ *NEW ORDER CONFIRMED!*
--------------------------------
🆔 *Order Ref:* #${orderRef}
💳 *Payment:* ${statusText}

👤 *Customer Details:*
• *Name:* ${name}
• *Phone:* ${phone}
• *Email:* ${email}

📍 *Shipping Address:*
• *Address:* ${address}
• *City:* ${city}
• *Postal Code:* ${postal}

📦 *Order Items:*
${itemsTextList}
💰 *Total Amount:* SAR ${currentGrandTotal.toFixed(2)}
--------------------------------`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${TARGET_WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Update Modal
    document.getElementById("invoiceId").textContent = `#${orderRef}`;
    document.getElementById("invName").textContent = name;
    document.getElementById("invPhone").textContent = phone;
    document.getElementById("invAddress").textContent = `${address}, ${city}`;
    document.getElementById("invStatus").textContent = statusText;
    document.getElementById("invTotal").textContent = `SAR ${currentGrandTotal.toFixed(2)}`;

    // Show Invoice Modal
    const modal = document.getElementById("orderSuccessModal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }

    window.open(whatsappUrl, "_blank");
}

function finishOrder() {
    localStorage.removeItem("athaqCart");
    window.location.href = "index.html";
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}