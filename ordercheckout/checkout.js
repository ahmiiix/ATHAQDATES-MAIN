// ==========================================
// ATHAQ DATES - CHECKOUT & PAYMENT ENGINE
// Supabase-backed customer + order checkout
// CUSTOMER ↔ ORDER FOREIGN KEY FIXED
// ==========================================

const TARGET_WHATSAPP_NUMBER = "923256989906";

// Add your real Moyasar publishable key here
const MOYASAR_API_KEY = "pk_test_YOUR_API_KEY";

// IMPORTANT:
// Make sure supabase-config.js loads BEFORE this file.
const db = window.ATHAQ_SUPABASE;

let currentGrandTotal = 0;
let currentSelectedPaymentMethod = "CARD";
let moyasarReady = false;
let orderBeingSaved = false;


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    loadSavedCustomerDetails();

    renderCheckoutSummary();

    const checkoutForm =
        document.getElementById("checkoutForm");

    if (checkoutForm) {

        checkoutForm.addEventListener(
            "submit",
            handleOrderSubmit
        );

    }

    [
        "custName",
        "custPhone",
        "custEmail",
        "custAddress",
        "custCity",
        "custPostal"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) {

            el.addEventListener(
                "input",
                saveCustomerDraft
            );

        }

    });

});


// ==========================================
// GET SUPABASE CLIENT
// ==========================================

function getSupabaseClient() {

    const client =
        window.ATHAQ_SUPABASE || db;

    if (!client) {

        throw new Error(
            "Supabase is not configured. Please check supabase-config.js."
        );

    }

    return client;
}


// ==========================================
// AUTHENTICATED CUSTOMER
// ==========================================

async function getAuthenticatedCustomer() {

    const supabase =
        getSupabaseClient();

    const {
        data,
        error
    } = await supabase.auth.getUser();

    if (error) {

        throw new Error(
            `Unable to get customer account: ${error.message}`
        );

    }

    const user =
        data?.user;

    if (!user) {

        throw new Error(
            "Please log in to your customer account before placing an order."
        );

    }

    if (!user.id) {

        throw new Error(
            "Customer account ID could not be determined."
        );

    }

    return user;
}


// ==========================================
// CUSTOMER DRAFT
// ==========================================

function getCustomerDraft() {

    return {

        full_name:
            document
                .getElementById("custName")
                ?.value
                .trim() || "",

        phone:
            document
                .getElementById("custPhone")
                ?.value
                .trim() || "",

        email:
            document
                .getElementById("custEmail")
                ?.value
                .trim() || "",

        street_address:
            document
                .getElementById("custAddress")
                ?.value
                .trim() || "",

        city:
            document
                .getElementById("custCity")
                ?.value
                .trim() || "",

        postal_code:
            document
                .getElementById("custPostal")
                ?.value
                .trim() || ""

    };

}


// ==========================================
// SAVE CUSTOMER DRAFT
// ==========================================

function saveCustomerDraft() {

    localStorage.setItem(
        "athaqCheckoutCustomer",
        JSON.stringify(
            getCustomerDraft()
        )
    );

}


// ==========================================
// LOAD CUSTOMER DRAFT
// ==========================================

function loadSavedCustomerDetails() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "athaqCheckoutCustomer"
                )
            );

        if (!saved) return;

        const map = {

            custName:
                saved.full_name,

            custPhone:
                saved.phone,

            custEmail:
                saved.email,

            custAddress:
                saved.street_address,

            custCity:
                saved.city,

            custPostal:
                saved.postal_code

        };

        Object.entries(map)
            .forEach(([id, value]) => {

                const el =
                    document.getElementById(id);

                if (el && value) {

                    el.value = value;

                }

            });

    } catch (error) {

        console.warn(
            "Could not load saved checkout details:",
            error
        );

    }

}


// ==========================================
// CHECKOUT SUMMARY
// ==========================================

function renderCheckoutSummary() {

    const itemsContainer =
        document.getElementById(
            "checkoutItemsList"
        );

    const subtotalElem =
        document.getElementById(
            "summarySubtotal"
        );

    const totalElem =
        document.getElementById(
            "summaryTotal"
        );

    const submitBtn =
        document.getElementById(
            "submitOrderBtn"
        );

    const cart =
        JSON.parse(
            localStorage.getItem(
                "athaqCart"
            )
        ) || [];


    if (!itemsContainer) return;


    if (cart.length === 0) {

        currentGrandTotal = 0;

        itemsContainer.innerHTML = `
            <div class="py-8 text-center">

                <div class="w-12 h-12 mx-auto mb-3
                            rounded-full bg-gray-100
                            flex items-center justify-center">

                    <i class="fa-solid
                              fa-cart-shopping
                              text-gray-400"></i>

                </div>

                <p class="text-sm font-semibold text-gray-500">
                    Your cart is empty.
                </p>

                <a href="index.html"
                   class="inline-flex mt-4 px-4 py-2
                          rounded-lg bg-[#004232]
                          text-white text-xs font-bold">

                    Continue Shopping

                </a>

            </div>
        `;


        if (subtotalElem) {

            subtotalElem.textContent =
                "SAR 0.00";

        }


        if (totalElem) {

            totalElem.textContent =
                "SAR 0.00";

        }


        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.classList.add(
                "opacity-50",
                "cursor-not-allowed"
            );

        }

        return;

    }


    if (submitBtn) {

        submitBtn.disabled = false;

        submitBtn.classList.remove(
            "opacity-50",
            "cursor-not-allowed"
        );

    }


    currentGrandTotal = 0;


    itemsContainer.innerHTML =
        cart.map((item, index) => {

            const itemQty =
                Number(item.quantity) || 1;

            const itemPrice =
                Number(item.price) || 0;

            const itemTotal =
                itemPrice * itemQty;


            currentGrandTotal +=
                itemTotal;


            return `

                <div class="py-4 flex items-center
                            justify-between gap-3"
                     data-cart-index="${index}">

                    <div class="flex items-center
                                gap-3 min-w-0">

                        <img
                            src="${escapeHTML(
                                item.image ||
                                "https://via.placeholder.com/60"
                            )}"

                            class="w-14 h-14 rounded-xl
                                   object-cover border
                                   border-gray-200"

                            alt="${escapeHTML(
                                item.name
                            )}"
                        >

                        <div class="min-w-0">

                            <h4 class="font-bold
                                       text-gray-800
                                       text-sm truncate">

                                ${escapeHTML(
                                    item.name
                                )}

                            </h4>

                            <p class="text-xs text-gray-500 mt-1">

                                Qty:
                                ${itemQty}
                                × SAR
                                ${itemPrice.toFixed(2)}

                            </p>

                            <p class="text-xs
                                      font-semibold
                                      text-[#004232] mt-1">

                                SAR
                                ${itemTotal.toFixed(2)}

                            </p>

                        </div>

                    </div>


                    <div class="flex flex-col
                                items-end gap-2">

                        <span class="font-bold
                                     text-gray-900
                                     text-sm">

                            SAR
                            ${itemTotal.toFixed(2)}

                        </span>

                        <button
                            type="button"
                            onclick="removeCheckoutItem(${index})"
                            class="px-2.5 py-1.5
                                   rounded-lg text-[10px]
                                   font-bold text-red-600
                                   bg-red-50">

                            <i class="fa-solid
                                      fa-trash-can"></i>

                            Remove

                        </button>

                    </div>

                </div>

            `;

        }).join("");


    if (subtotalElem) {

        subtotalElem.textContent =
            `SAR ${currentGrandTotal.toFixed(2)}`;

    }


    if (totalElem) {

        totalElem.textContent =
            `SAR ${currentGrandTotal.toFixed(2)}`;

    }


    initMoyasarCardPayment();

}


// ==========================================
// REMOVE CART ITEM
// ==========================================

function removeCheckoutItem(index) {

    const cart =
        JSON.parse(
            localStorage.getItem(
                "athaqCart"
            )
        ) || [];


    if (
        index < 0 ||
        index >= cart.length
    ) {

        return;

    }


    const removedProduct =
        cart[index];


    if (
        !confirm(
            `"${removedProduct.name}" remove from your cart?`
        )
    ) {

        return;

    }


    cart.splice(index, 1);


    localStorage.setItem(
        "athaqCart",
        JSON.stringify(cart)
    );


    renderCheckoutSummary();

}


// ==========================================
// PAYMENT METHOD
// ==========================================

function togglePaymentMethod(method) {

    currentSelectedPaymentMethod =
        method;


    const cardContainer =
        document.getElementById(
            "cardPaymentContainer"
        );


    const submitBtnText =
        document.getElementById(
            "submitBtnText"
        );


    if (method === "CARD") {

        if (cardContainer) {

            cardContainer.classList.remove(
                "hidden"
            );

        }


        if (submitBtnText) {

            submitBtnText.textContent =
                "Confirm & Pay with Card";

        }


        initMoyasarCardPayment();

    } else {

        if (cardContainer) {

            cardContainer.classList.add(
                "hidden"
            );

        }


        if (submitBtnText) {

            submitBtnText.textContent =
                "Confirm & Place Order (COD)";

        }

    }

}


// ==========================================
// MOYASAR
// ==========================================

function initMoyasarCardPayment() {

    const customFields =
        document.getElementById(
            "customCardFields"
        );


    const mount =
        document.querySelector(
            ".mysr-form"
        );


    if (
        !mount ||
        currentSelectedPaymentMethod !== "CARD" ||
        currentGrandTotal <= 0
    ) {

        return;

    }


    if (
        typeof Moyasar !== "undefined" &&
        !MOYASAR_API_KEY.includes(
            "YOUR_API_KEY"
        )
    ) {

        if (
            moyasarReady ||
            mount.dataset.initialized === "true"
        ) {

            return;

        }


        try {

            Moyasar.init({

                element:
                    ".mysr-form",

                amount:
                    Math.round(
                        currentGrandTotal * 100
                    ),

                currency:
                    "SAR",

                description:
                    "ATHAQ DATES Order",

                publishable_api_key:
                    MOYASAR_API_KEY,

                callback_url:
                    window.location.href,

                methods: [
                    "creditcard",
                    "mada",
                    "applepay"
                ],

                on_completed:
                    async function(payment) {

                        if (
                            payment &&
                            payment.status === "paid"
                        ) {

                            await processSuccessfulOrder(
                                payment.id,
                                "ONLINE_CARD"
                            );

                        } else {

                            alert(
                                "Payment was not completed."
                            );

                        }

                    }

            });


            mount.dataset.initialized =
                "true";


            moyasarReady =
                true;


            if (customFields) {

                customFields.style.display =
                    "none";

            }


        } catch (error) {

            moyasarReady =
                false;


            console.error(
                "Moyasar initialization failed:",
                error
            );


            if (customFields) {

                customFields.style.display =
                    "none";

            }

        }

    }

}


// ==========================================
// SUBMIT ORDER
// ==========================================

async function handleOrderSubmit(e) {

    e.preventDefault();


    const cart =
        JSON.parse(
            localStorage.getItem(
                "athaqCart"
            )
        ) || [];


    if (cart.length === 0) {

        alert(
            "Your cart is empty!"
        );

        return;

    }


    const customer =
        getCustomerDraft();


    if (
        !customer.full_name ||
        !customer.phone ||
        !customer.street_address ||
        !customer.city
    ) {

        alert(
            "Please complete your name, phone, address and city."
        );

        return;

    }


    saveCustomerDraft();


    if (
        currentSelectedPaymentMethod ===
        "CARD"
    ) {

        if (!moyasarReady) {

            alert(
                "Online card payment is not configured yet."
            );

            return;

        }


        const moyasarForm =
            document.querySelector(
                ".mysr-form form"
            );


        if (!moyasarForm) {

            alert(
                "Secure payment form is not ready."
            );

            return;

        }


        if (
            typeof moyasarForm.requestSubmit ===
            "function"
        ) {

            moyasarForm.requestSubmit();

        } else {

            moyasarForm.submit();

        }


        return;

    }


    await processSuccessfulOrder(
        null,
        "COD"
    );

}


// ==========================================
// FIND / CREATE CUSTOMER
//
// IMPORTANT:
// orders.customer_id MUST contain
// customers.id because of:
//
// orders_customer_id_fkey
//
// We DO NOT blindly use authUser.id.
// ==========================================

async function getOrCreateCustomer(
    authUser,
    customer
) {

    const supabase =
        getSupabaseClient();


    let customerRecord =
        null;


    // --------------------------------------
    // 1. FIRST TRY AUTH USER ID
    // --------------------------------------

    const {
        data: customerById,
        error: idSearchError
    } = await supabase
        .from("customers")
        .select("id")
        .eq("id", authUser.id)
        .maybeSingle();


    if (idSearchError) {

        throw new Error(
            `Unable to check customer account: ${idSearchError.message}`
        );

    }


    if (customerById) {

        customerRecord =
            customerById;

    }


    // --------------------------------------
    // 2. IF NOT FOUND, TRY EMAIL
    // --------------------------------------

    if (
        !customerRecord &&
        (
            customer.email ||
            authUser.email
        )
    ) {

        const emailToFind =
            (
                customer.email ||
                authUser.email
            )
            .trim()
            .toLowerCase();


        const {
            data: customerByEmail,
            error: emailSearchError
        } = await supabase
            .from("customers")
            .select("id")
            .ilike(
                "email",
                emailToFind
            )
            .limit(1)
            .maybeSingle();


        if (emailSearchError) {

            throw new Error(
                `Unable to find customer by email: ${emailSearchError.message}`
            );

        }


        if (customerByEmail) {

            customerRecord =
                customerByEmail;

        }

    }


    // --------------------------------------
    // 3. IF NOT FOUND, TRY PHONE
    // --------------------------------------

    if (
        !customerRecord &&
        customer.phone
    ) {

        const {
            data: customerByPhone,
            error: phoneSearchError
        } = await supabase
            .from("customers")
            .select("id")
            .eq(
                "phone",
                customer.phone
            )
            .limit(1)
            .maybeSingle();


        if (phoneSearchError) {

            throw new Error(
                `Unable to find customer by phone: ${phoneSearchError.message}`
            );

        }


        if (customerByPhone) {

            customerRecord =
                customerByPhone;

        }

    }


    // --------------------------------------
    // 4. CUSTOMER FOUND
    // --------------------------------------

    if (customerRecord) {

        // Update customer's latest checkout
        // information.
        //
        // If RLS blocks UPDATE, we keep the
        // existing customer and continue.

        const {
            error: updateCustomerError
        } = await supabase
            .from("customers")
            .update({

                full_name:
                    customer.full_name,

                phone:
                    customer.phone,

                email:
                    customer.email ||
                    authUser.email ||
                    null,

                street_address:
                    customer.street_address,

                city:
                    customer.city,

                postal_code:
                    customer.postal_code ||
                    null

            })
            .eq(
                "id",
                customerRecord.id
            );


        if (updateCustomerError) {

            console.warn(
                "Customer update warning:",
                updateCustomerError
            );

        }


        return customerRecord;

    }


    // --------------------------------------
    // 5. CUSTOMER NOT FOUND
    //
    // Create customer using AUTH USER ID.
    //
    // Because customers.id is UUID, the
    // Supabase Auth UUID can safely be used
    // when there is no existing customer row.
    // --------------------------------------

    const {
        data: newCustomer,
        error: createCustomerError
    } = await supabase
        .from("customers")
        .insert({

            id:
                authUser.id,

            full_name:
                customer.full_name,

            phone:
                customer.phone,

            email:
                customer.email ||
                authUser.email ||
                null,

            street_address:
                customer.street_address,

            city:
                customer.city,

            postal_code:
                customer.postal_code ||
                null

        })
        .select("id")
        .single();


    if (createCustomerError) {

        throw new Error(
            `Customer could not be created: ${createCustomerError.message}`
        );

    }


    if (
        !newCustomer ||
        !newCustomer.id
    ) {

        throw new Error(
            "Customer was created but no customer ID was returned."
        );

    }


    return newCustomer;

}


// ==========================================
// SAVE ORDER TO SUPABASE
// ==========================================

async function saveOrderToSupabase(
    paymentId,
    paymentType
) {

    const supabase =
        getSupabaseClient();


    const customer =
        getCustomerDraft();


    const cart =
        JSON.parse(
            localStorage.getItem(
                "athaqCart"
            )
        ) || [];


    if (cart.length === 0) {

        throw new Error(
            "Your cart is empty."
        );

    }


    // --------------------------------------
    // CALCULATE TOTAL
    // --------------------------------------

    const subtotal =
        cart.reduce(
            (sum, item) => {

                return sum +
                    (
                        (Number(item.price) || 0) *
                        (Number(item.quantity) || 1)
                    );

            },
            0
        );


    // --------------------------------------
    // AUTH CUSTOMER
    // --------------------------------------

    const authUser =
        await getAuthenticatedCustomer();


    // --------------------------------------
    // GET REAL customers.id
    // --------------------------------------

    const customerRecord =
        await getOrCreateCustomer(
            authUser,
            customer
        );


    const customerId =
        customerRecord.id;


    if (!customerId) {

        throw new Error(
            "Customer ID is missing. Order cannot be created."
        );

    }


    console.log(
        "ATHAQ customer_id used for order:",
        customerId
    );


    // --------------------------------------
    // ORDER REFERENCE
    // --------------------------------------

    const orderRef =
        "ATH-" +
        Date.now()
            .toString()
            .slice(-8);


    const orderId =
        crypto.randomUUID();


    // --------------------------------------
    // SAVE ORDER
    // --------------------------------------

    const {
        data: savedOrder,
        error: orderError
    } = await supabase
        .from("orders")
        .insert({

            id:
                orderId,

            order_ref:
                orderRef,

            // VERY IMPORTANT:
            // This is customers.id,
            // NOT blindly authUser.id.
            customer_id:
                customerId,

            customer_name:
                customer.full_name,

            customer_phone:
                customer.phone,

            customer_email:
                customer.email ||
                authUser.email ||
                null,

            shipping_address:
                customer.street_address,

            shipping_city:
                customer.city,

            shipping_postal_code:
                customer.postal_code ||
                null,

            payment_method:
                paymentType,

            payment_status:
                paymentType === "COD"
                    ? "pending"
                    : "paid",

            order_status:
                "new",

            subtotal:
                subtotal,

            shipping_amount:
                0,

            total_amount:
                subtotal,

            moyasar_payment_id:
                paymentId ||
                null

        })
        .select(
            "id, order_ref, customer_id, order_status, total_amount"
        )
        .single();


    if (orderError) {

        console.error(
            "ORDER INSERT ERROR:",
            orderError
        );


        throw new Error(
            `Order could not be saved: ${orderError.message}`
        );

    }


    if (!savedOrder) {

        throw new Error(
            "Order was not returned after saving."
        );

    }


    // --------------------------------------
    // ORDER ITEMS
    // --------------------------------------

    const items =
        cart.map(item => {

            const quantity =
                Number(item.quantity) || 1;

            const unitPrice =
                Number(item.price) || 0;


            return {

                order_id:
                    orderId,

                product_id:
                    item.id != null
                        ? String(item.id)
                        : null,

                product_name:
                    item.name ||
                    "Product",

                unit_price:
                    unitPrice,

                quantity:
                    quantity,

                line_total:
                    unitPrice *
                    quantity

            };

        });


    const {
        error: itemsError
    } = await supabase
        .from("order_items")
        .insert(items);


    if (itemsError) {

        console.error(
            "ORDER ITEMS ERROR:",
            itemsError
        );


        throw new Error(
            `Order was created, but order items could not be saved: ${itemsError.message}`
        );

    }


    // --------------------------------------
    // RETURN ORDER
    // --------------------------------------

    return {

        orderId:
            savedOrder.id,

        orderRef:
            savedOrder.order_ref,

        customerId:
            savedOrder.customer_id,

        customer,

        paymentType,

        subtotal

    };

}


// ==========================================
// SUCCESS
// ==========================================

async function processSuccessfulOrder(
    paymentId,
    paymentType
) {

    if (orderBeingSaved) {

        return;

    }


    orderBeingSaved =
        true;


    const submitBtn =
        document.getElementById(
            "submitOrderBtn"
        );


    if (submitBtn) {

        submitBtn.disabled =
            true;

        submitBtn.classList.add(
            "opacity-60",
            "cursor-not-allowed"
        );

    }


    try {

        const savedOrder =
            await saveOrderToSupabase(
                paymentId,
                paymentType
            );


        const {
            orderRef,
            customer,
            subtotal
        } = savedOrder;


        const statusText =
            paymentType === "ONLINE_CARD"
                ? "Paid Online"
                : "Cash on Delivery";


        // ----------------------------------
        // RECEIPT ELEMENTS
        // ----------------------------------

        const invoiceId =
            document.getElementById(
                "invoiceId"
            );


        const invName =
            document.getElementById(
                "invName"
            );


        const invPhone =
            document.getElementById(
                "invPhone"
            );


        const invAddress =
            document.getElementById(
                "invAddress"
            );


        const invStatus =
            document.getElementById(
                "invStatus"
            );


        const invTotal =
            document.getElementById(
                "invTotal"
            );


        if (invoiceId) {

            invoiceId.textContent =
                `#${orderRef}`;

        }


        if (invName) {

            invName.textContent =
                customer.full_name;

        }


        if (invPhone) {

            invPhone.textContent =
                customer.phone;

        }


        if (invAddress) {

            invAddress.textContent =
                `${customer.street_address}, ${customer.city}`;

        }


        if (invStatus) {

            invStatus.textContent =
                statusText;

        }


        if (invTotal) {

            invTotal.textContent =
                `SAR ${subtotal.toFixed(2)}`;

        }


        // ----------------------------------
        // SHOW SUCCESS RECEIPT
        // ----------------------------------

        const modal =
            document.getElementById(
                "orderSuccessModal"
            );


        if (modal) {

            modal.classList.remove(
                "hidden"
            );

            modal.classList.add(
                "flex"
            );

        }


        // ----------------------------------
        // SAVE LAST ORDER LOCALLY
        //
        // Useful for receipt / tracking
        // button on current browser.
        // ----------------------------------

        localStorage.setItem(
            "athaqLastOrder",
            JSON.stringify({

                order_id:
                    savedOrder.orderId,

                order_ref:
                    savedOrder.orderRef,

                customer_id:
                    savedOrder.customerId,

                status:
                    "new",

                total:
                    subtotal,

                created_at:
                    new Date().toISOString()

            })
        );


        // ----------------------------------
        // WHATSAPP
        // ----------------------------------

        let itemsTextList = "";


        const cart =
            JSON.parse(
                localStorage.getItem(
                    "athaqCart"
                )
            ) || [];


        cart.forEach(
            (item, index) => {

                const qty =
                    Number(item.quantity) || 1;


                const itemTotal =
                    (
                        Number(item.price) || 0
                    ) * qty;


                itemsTextList +=
                    `${index + 1}. *${item.name}* ` +
                    `(Qty: ${qty}) - ` +
                    `SAR ${itemTotal.toFixed(2)}\n`;

            }
        );


        const message =
`🛍️ *NEW ORDER CONFIRMED!*
--------------------------------
🆔 *Order Ref:* #${orderRef}
💳 *Payment:* ${statusText}

👤 *Customer Details:*
• *Name:* ${customer.full_name}
• *Phone:* ${customer.phone}
• *Email:* ${customer.email || "N/A"}

📍 *Shipping Address:*
• *Address:* ${customer.street_address}
• *City:* ${customer.city}
• *Postal Code:* ${customer.postal_code || "N/A"}

📦 *Order Items:*
${itemsTextList}
💰 *Total Amount:* SAR ${subtotal.toFixed(2)}
--------------------------------`;


        const encodedMessage =
            encodeURIComponent(
                message
            );


        const whatsappUrl =
            `https://wa.me/${TARGET_WHATSAPP_NUMBER}?text=${encodedMessage}`;


        window.open(
            whatsappUrl,
            "_blank"
        );


    } catch (error) {

        console.error(
            "ATHAQ CHECKOUT ERROR:",
            error
        );


        alert(
            `Order could not be saved.\n\n${
                error.message ||
                "Please try again."
            }`
        );


    } finally {

        orderBeingSaved =
            false;


        if (submitBtn) {

            submitBtn.disabled =
                false;

            submitBtn.classList.remove(
                "opacity-60",
                "cursor-not-allowed"
            );

        }

    }

}


// ==========================================
// FINISH ORDER
// ==========================================

function finishOrder() {

    localStorage.removeItem(
        "athaqCart"
    );


    window.location.href =
        "index.html";

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(str) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        str ?? "";


    return div.innerHTML;

}