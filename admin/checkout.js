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
// 1. RENDER CHECKOUT ITEMS & CALCULATE TOTAL
function renderCheckoutSummary() {
    const itemsContainer = document.getElementById("checkoutItemsList");
    const subtotalElem = document.getElementById("summarySubtotal");
    const totalElem = document.getElementById("summaryTotal");
    const submitBtn = document.getElementById("submitOrderBtn");

    let cart = JSON.parse(localStorage.getItem("athaqCart")) || [];

    if (!itemsContainer) return;

    // =========================
    // EMPTY CART
    // =========================
    if (cart.length === 0) {
        currentGrandTotal = 0;

        itemsContainer.innerHTML = `
            <div class="py-8 text-center">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <i class="fa-solid fa-cart-shopping text-gray-400"></i>
                </div>

                <p class="text-sm font-semibold text-gray-500">
                    Your cart is empty.
                </p>

                <a href="index.html"
                   class="inline-flex mt-4 px-4 py-2 rounded-lg bg-[#004232] text-white text-xs font-bold hover:bg-[#002e23] transition">
                    Continue Shopping
                </a>
            </div>
        `;

        if (subtotalElem) {
            subtotalElem.textContent = "SAR 0.00";
        }

        if (totalElem) {
            totalElem.textContent = "SAR 0.00";
        }

        // Disable checkout button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add("opacity-50", "cursor-not-allowed");
        }

        return;
    }

    // Enable checkout button
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }

    currentGrandTotal = 0;

    // =========================
    // RENDER CART ITEMS
    // =========================
    itemsContainer.innerHTML = cart.map((item, index) => {

        const itemQty = Number(item.quantity) || 1;
        const itemPrice = Number(item.price) || 0;
        const itemTotal = itemPrice * itemQty;

        currentGrandTotal += itemTotal;

        return `
            <div class="py-4 flex items-center justify-between gap-3"
                 data-cart-index="${index}">

                <!-- PRODUCT INFO -->
                <div class="flex items-center gap-3 min-w-0">

                    <img
                        src="${escapeHTML(item.image || 'https://via.placeholder.com/60')}"
                        class="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                        alt="${escapeHTML(item.name)}"
                        onerror="this.src='https://via.placeholder.com/60';"
                    >

                    <div class="min-w-0">

                        <h4 class="font-bold text-gray-800 text-sm truncate">
                            ${escapeHTML(item.name)}
                        </h4>

                        <p class="text-xs text-gray-500 mt-1">
                            Qty: ${itemQty} × SAR ${itemPrice.toFixed(2)}
                        </p>

                        <p class="text-xs font-semibold text-[#004232] mt-1">
                            SAR ${itemTotal.toFixed(2)}
                        </p>

                    </div>

                </div>


                <!-- RIGHT SIDE -->
                <div class="flex flex-col items-end gap-2 flex-shrink-0">

                    <span class="font-bold text-gray-900 text-sm">
                        SAR ${itemTotal.toFixed(2)}
                    </span>

                    <!-- DELETE / REMOVE BUTTON -->
                    <button
                        type="button"
                        onclick="removeCheckoutItem(${index})"
                        class="inline-flex items-center gap-1.5
                               px-2.5 py-1.5
                               rounded-lg
                               text-[10px] font-bold
                               text-red-600
                               bg-red-50
                               border border-red-100
                               hover:bg-red-100
                               hover:border-red-200
                               transition-all">

                        <i class="fa-solid fa-trash-can text-[10px]"></i>

                        <span>
                            Remove
                        </span>

                    </button>

                </div>

            </div>
        `;

    }).join("");

    // =========================
    // UPDATE TOTALS
    // =========================
    if (subtotalElem) {
        subtotalElem.textContent =
            `SAR ${currentGrandTotal.toFixed(2)}`;
    }

    if (totalElem) {
        totalElem.textContent =
            `SAR ${currentGrandTotal.toFixed(2)}`;
    }

    // Initialize Moyasar
    initMoyasarCardPayment();
}
// ==========================================
// REMOVE PRODUCT FROM CHECKOUT CART
// ==========================================

function removeCheckoutItem(index) {

    let cart =
        JSON.parse(localStorage.getItem("athaqCart")) || [];

    // Check valid index
    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }

    const removedProduct = cart[index];

    // Confirmation
    const confirmRemove = confirm(
        `"${removedProduct.name}" remove from your cart?`
    );

    if (!confirmRemove) {
        return;
    }

    // Remove selected product
    cart.splice(index, 1);

    // Save updated cart
    localStorage.setItem(
        "athaqCart",
        JSON.stringify(cart)
    );

    // Re-render checkout
    renderCheckoutSummary();
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