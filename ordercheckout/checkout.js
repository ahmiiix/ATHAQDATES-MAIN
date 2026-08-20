// ==========================================
// ATHAQ DATES - CHECKOUT & PAYMENT ENGINE
// Supabase-backed customer + order checkout
// ==========================================

const TARGET_WHATSAPP_NUMBER = "923256989906";
// Add your real Moyasar publishable key here when you are ready for online payments.
// Example: pk_test_... or pk_live_...
const MOYASAR_API_KEY = "pk_test_YOUR_API_KEY";

const db = window.ATHAQ_SUPABASE;

let currentGrandTotal = 0;
let currentSelectedPaymentMethod = "CARD";
let moyasarReady = false;
let orderBeingSaved = false;

// ------------------------------------------
// INITIALIZE
// ------------------------------------------
document.addEventListener("DOMContentLoaded", async function () {
    loadSavedCustomerDetails();
    renderCheckoutSummary();

    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", handleOrderSubmit);
    }

    // Save the customer's current form locally as they type.
    ["custName", "custPhone", "custEmail", "custAddress", "custCity", "custPostal"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", saveCustomerDraft);
    });
});

// ------------------------------------------
// CUSTOMER DRAFT
// ------------------------------------------
function getCustomerDraft() {
    return {
        full_name: document.getElementById("custName")?.value.trim() || "",
        phone: document.getElementById("custPhone")?.value.trim() || "",
        email: document.getElementById("custEmail")?.value.trim() || "",
        street_address: document.getElementById("custAddress")?.value.trim() || "",
        city: document.getElementById("custCity")?.value.trim() || "",
        postal_code: document.getElementById("custPostal")?.value.trim() || ""
    };
}

function saveCustomerDraft() {
    localStorage.setItem("athaqCheckoutCustomer", JSON.stringify(getCustomerDraft()));
}

function loadSavedCustomerDetails() {
    try {
        const saved = JSON.parse(localStorage.getItem("athaqCheckoutCustomer"));
        if (!saved) return;

        const map = {
            custName: saved.full_name,
            custPhone: saved.phone,
            custEmail: saved.email,
            custAddress: saved.street_address,
            custCity: saved.city,
            custPostal: saved.postal_code
        };

        Object.entries(map).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el && value) el.value = value;
        });
    } catch (error) {
        console.warn("Could not load saved checkout details", error);
    }
}

// ------------------------------------------
// RENDER CHECKOUT ITEMS & CALCULATE TOTAL
// ------------------------------------------
function renderCheckoutSummary() {
    const itemsContainer = document.getElementById("checkoutItemsList");
    const subtotalElem = document.getElementById("summarySubtotal");
    const totalElem = document.getElementById("summaryTotal");
    const submitBtn = document.getElementById("submitOrderBtn");

    const cart = JSON.parse(localStorage.getItem("athaqCart")) || [];

    if (!itemsContainer) return;

    if (cart.length === 0) {
        currentGrandTotal = 0;
        itemsContainer.innerHTML = `
            <div class="py-8 text-center">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <i class="fa-solid fa-cart-shopping text-gray-400"></i>
                </div>
                <p class="text-sm font-semibold text-gray-500">Your cart is empty.</p>
                <a href="/web/product/index.html" class="inline-flex mt-4 px-4 py-2 rounded-lg bg-[#004232] text-white text-xs font-bold hover:bg-[#002e23] transition">
                    Continue Shopping
                </a>
            </div>
        `;

        if (subtotalElem) subtotalElem.textContent = "SAR 0.00";
        if (totalElem) totalElem.textContent = "SAR 0.00";

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add("opacity-50", "cursor-not-allowed");
        }
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }

    currentGrandTotal = 0;

    itemsContainer.innerHTML = cart.map((item, index) => {
        const itemQty = Number(item.quantity) || 1;
        const itemPrice = Number(item.price) || 0;
        const itemTotal = itemPrice * itemQty;
        currentGrandTotal += itemTotal;

        return `
            <div class="py-4 flex items-center justify-between gap-3" data-cart-index="${index}">
                <div class="flex items-center gap-3 min-w-0">
                    <img src="${escapeHTML(item.image || 'https://via.placeholder.com/60')}"
                         class="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                         alt="${escapeHTML(item.name)}"
                         onerror="this.src='https://via.placeholder.com/60';">
                    <div class="min-w-0">
                        <h4 class="font-bold text-gray-800 text-sm truncate">${escapeHTML(item.name)}</h4>
                        <p class="text-xs text-gray-500 mt-1">Qty: ${itemQty} × SAR ${itemPrice.toFixed(2)}</p>
                        <p class="text-xs font-semibold text-[#004232] mt-1">SAR ${itemTotal.toFixed(2)}</p>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-2 flex-shrink-0">
                    <span class="font-bold text-gray-900 text-sm">SAR ${itemTotal.toFixed(2)}</span>
                    <button type="button" onclick="removeCheckoutItem(${index})"
                            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all">
                        <i class="fa-solid fa-trash-can text-[10px]"></i>
                        <span>Remove</span>
                    </button>
                </div>
            </div>
        `;
    }).join("");

    if (subtotalElem) subtotalElem.textContent = `SAR ${currentGrandTotal.toFixed(2)}`;
    if (totalElem) totalElem.textContent = `SAR ${currentGrandTotal.toFixed(2)}`;

    initMoyasarCardPayment();
}

// ------------------------------------------
// REMOVE ITEM
// ------------------------------------------
function removeCheckoutItem(index) {
    const cart = JSON.parse(localStorage.getItem("athaqCart")) || [];
    if (index < 0 || index >= cart.length) return;

    const removedProduct = cart[index];
    if (!confirm(`"${removedProduct.name}" remove from your cart?`)) return;

    cart.splice(index, 1);
    localStorage.setItem("athaqCart", JSON.stringify(cart));
    renderCheckoutSummary();
}

// ------------------------------------------
// PAYMENT METHOD
// ------------------------------------------
function togglePaymentMethod(method) {
    currentSelectedPaymentMethod = method;

    const cardContainer = document.getElementById("cardPaymentContainer");
    const submitBtnText = document.getElementById("submitBtnText");

    if (method === "CARD") {
        if (cardContainer) cardContainer.classList.remove("hidden");
        if (submitBtnText) submitBtnText.textContent = "Confirm & Pay with Card";
        initMoyasarCardPayment();
    } else {
        if (cardContainer) cardContainer.classList.add("hidden");
        if (submitBtnText) submitBtnText.textContent = "Confirm & Place Order (COD)";
    }
}

// ------------------------------------------
// MOYASAR
// ------------------------------------------
function initMoyasarCardPayment() {
    const customFields = document.getElementById("customCardFields");
    const mount = document.querySelector(".mysr-form");

    if (!mount || currentSelectedPaymentMethod !== "CARD" || currentGrandTotal <= 0) return;

    if (typeof Moyasar !== "undefined" && !MOYASAR_API_KEY.includes("YOUR_API_KEY")) {
        // Avoid initializing the gateway repeatedly on every render.
        if (moyasarReady || mount.dataset.initialized === "true") return;

        try {
            Moyasar.init({
                element: ".mysr-form",
                amount: Math.round(currentGrandTotal * 100),
                currency: "SAR",
                description: "ATHAQ DATES Order",
                publishable_api_key: MOYASAR_API_KEY,
                callback_url: window.location.href,
                methods: ["creditcard", "mada", "applepay"],
                on_completed: async function (payment) {
                    if (payment && payment.status === "paid") {
                        await processSuccessfulOrder(payment.id, "ONLINE_CARD");
                    } else {
                        alert("Payment was not completed.");
                    }
                }
            });

            mount.dataset.initialized = "true";
            moyasarReady = true;
            if (customFields) customFields.style.display = "none";
        } catch (error) {
            moyasarReady = false;
            console.error("Moyasar initialization failed", error);
            if (customFields) customFields.style.display = "none";
        }
    } else {
        // Never collect card data in our own HTML fields.
        // Without Moyasar, online card checkout is unavailable.
        if (customFields) customFields.style.display = "none";
        if (mount) {
            mount.innerHTML = `
                <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Online card payment is not configured yet. Please use Cash on Delivery or add your Moyasar publishable key in checkout.js.
                </div>
            `;
        }
    }
}

// ------------------------------------------
// SUBMIT
// ------------------------------------------
async function handleOrderSubmit(e) {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem("athaqCart")) || [];
    if (cart.length === 0) {
        alert("Your cart is empty! Please add products before placing an order.");
        return;
    }

    const customer = getCustomerDraft();
    if (!customer.full_name || !customer.phone || !customer.street_address || !customer.city) {
        alert("Please complete your name, phone, address and city.");
        return;
    }

    saveCustomerDraft();

    if (currentSelectedPaymentMethod === "CARD") {
        if (!moyasarReady) {
            alert("Online card payment is not configured yet. Please select Cash on Delivery or configure Moyasar.");
            return;
        }

        // Moyasar creates the secure payment form. Submit that form instead of
        // ever reading/storing card number, expiry or CVV ourselves.
        const moyasarForm = document.querySelector(".mysr-form form");
        if (!moyasarForm) {
            alert("Secure payment form is not ready. Please refresh the page and try again.");
            return;
        }

        moyasarForm.requestSubmit ? moyasarForm.requestSubmit() : moyasarForm.submit();
        return;
    }

    await processSuccessfulOrder(null, "COD");
}

// ------------------------------------------
// SAVE CUSTOMER + ORDER + ITEMS IN SUPABASE
// ------------------------------------------
async function saveOrderToSupabase(paymentId, paymentType) {
    if (!db) throw new Error("Supabase is not configured.");

    const customer = getCustomerDraft();
    const cart = JSON.parse(localStorage.getItem("athaqCart")) || [];

    const subtotal = cart.reduce((sum, item) => {
        return sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1));
    }, 0);

    const orderRef = "ATH-" + Date.now().toString().slice(-8);
    const customerId = crypto.randomUUID();
    const orderId = crypto.randomUUID();

    // 1) Save customer snapshot. IDs are generated in the browser so we do
    // not need to grant anonymous SELECT access to customer records.
    const { error: customerError } = await db
        .from("customers")
        .insert({
            id: customerId,
            full_name: customer.full_name,
            phone: customer.phone,
            email: customer.email || null,
            street_address: customer.street_address,
            city: customer.city,
            postal_code: customer.postal_code || null
        });

    if (customerError) throw customerError;

    // 2) Save order
    const { error: orderError } = await db
        .from("orders")
        .insert({
            id: orderId,
            order_ref: orderRef,
            customer_id: customerId,
            customer_name: customer.full_name,
            customer_phone: customer.phone,
            customer_email: customer.email || null,
            shipping_address: customer.street_address,
            shipping_city: customer.city,
            shipping_postal_code: customer.postal_code || null,
            payment_method: paymentType,
            // Online payment is confirmed in the browser by Moyasar here, but
            // a production webhook/Edge Function should be used as the final
            // source of truth before changing this to "paid" server-side.
            payment_status: "pending",
            order_status: "new",
            subtotal: subtotal,
            shipping_amount: 0,
            total_amount: subtotal,
            moyasar_payment_id: paymentId || null
        });

    if (orderError) throw orderError;

    // 3) Save every order item
    const items = cart.map(item => {
        const quantity = Number(item.quantity) || 1;
        const unitPrice = Number(item.price) || 0;
        return {
            order_id: orderId,
            product_id: item.id != null ? String(item.id) : null,
            product_name: item.name || "Product",
            unit_price: unitPrice,
            quantity: quantity,
            line_total: unitPrice * quantity
        };
    });

    const { error: itemsError } = await db.from("order_items").insert(items);
    if (itemsError) throw itemsError;

    return {
        orderRef,
        customer,
        paymentType,
        subtotal
    };
}

// ------------------------------------------
// COMPLETE SUCCESS FLOW
// ------------------------------------------
async function processSuccessfulOrder(paymentId, paymentType) {
    if (orderBeingSaved) return;
    orderBeingSaved = true;

    const submitBtn = document.getElementById("submitOrderBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-60", "cursor-not-allowed");
    }

    try {
        const savedOrder = await saveOrderToSupabase(paymentId, paymentType);
        const { orderRef, customer, subtotal } = savedOrder;
        const cart = JSON.parse(localStorage.getItem("athaqCart")) || [];

        let itemsTextList = "";
        cart.forEach((item, index) => {
            const qty = Number(item.quantity) || 1;
            const itemTotal = (Number(item.price) || 0) * qty;
            itemsTextList += `${index + 1}. *${item.name}* (Qty: ${qty}) - SAR ${itemTotal.toFixed(2)}\n`;
        });

        const statusText = paymentType === "ONLINE_CARD"
            ? "Paid Online (Card / MADA / Apple Pay)"
            : "Cash on Delivery";

        const message =
`🛍️ *NEW ORDER CONFIRMED!*\n` +
`--------------------------------\n` +
`🆔 *Order Ref:* #${orderRef}\n` +
`💳 *Payment:* ${statusText}\n\n` +
`👤 *Customer Details:*\n` +
`• *Name:* ${customer.full_name}\n` +
`• *Phone:* ${customer.phone}\n` +
`• *Email:* ${customer.email || "N/A"}\n\n` +
`📍 *Shipping Address:*\n` +
`• *Address:* ${customer.street_address}\n` +
`• *City:* ${customer.city}\n` +
`• *Postal Code:* ${customer.postal_code || "N/A"}\n\n` +
`📦 *Order Items:*\n` +
`${itemsTextList}` +
`💰 *Total Amount:* SAR ${subtotal.toFixed(2)}\n` +
`--------------------------------`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${TARGET_WHATSAPP_NUMBER}?text=${encodedMessage}`;

        // Keep the last order reference locally so the customer can track it later.
        localStorage.setItem("athaqLastOrder", JSON.stringify({
            order_ref: orderRef,
            phone: customer.phone
        }));

        document.getElementById("invoiceId").textContent = `#${orderRef}`;
        document.getElementById("invName").textContent = customer.full_name;
        document.getElementById("invPhone").textContent = customer.phone;
        document.getElementById("invAddress").textContent = `${customer.street_address}, ${customer.city}`;
        document.getElementById("invStatus").textContent = statusText;
        document.getElementById("invTotal").textContent = `SAR ${subtotal.toFixed(2)}`;

        const modal = document.getElementById("orderSuccessModal");
        if (modal) {
            modal.classList.remove("hidden");
            modal.classList.add("flex");
        }

        // Keep the existing WhatsApp notification flow.
        window.open(whatsappUrl, "_blank");
    } catch (error) {
        console.error("Checkout error:", error);
        alert(`Order could not be saved.\n\n${error.message || "Please try again."}`);
    } finally {
        orderBeingSaved = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("opacity-60", "cursor-not-allowed");
        }
    }
}

// ------------------------------------------
// FINISH ORDER
// ------------------------------------------
function trackCurrentOrder() {
    const saved = JSON.parse(localStorage.getItem("athaqLastOrder") || "null");
    const orderRef = saved?.order_ref || document.getElementById("invoiceId")?.textContent?.replace(/^#/, "");
    const phone = saved?.phone || document.getElementById("invPhone")?.textContent || "";

    const params = new URLSearchParams();
    if (orderRef) params.set("order", orderRef);
    if (phone) params.set("phone", phone);

    window.location.href = `track-order.html${params.toString() ? "?" + params.toString() : ""}`;
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
