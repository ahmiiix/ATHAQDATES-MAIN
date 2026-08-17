// ==========================================
// ATHAQ DATES - CART ENGINE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    updateCartCount();
    updateWishlistCount();
});


// ==========================================
// GET CART
// ==========================================

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("athaqCart")) || [];
    } catch (error) {
        console.error("Cart loading error:", error);
        return [];
    }
}


// ==========================================
// SAVE CART
// ==========================================

function saveCart(cart) {
    localStorage.setItem("athaqCart", JSON.stringify(cart));

    renderCart();
    updateCartCount();

    // If another tab/page is open
    window.dispatchEvent(new Event("storage"));
}


// ==========================================
// RENDER CART
// ==========================================

function renderCart() {

    const cartItemsList = document.getElementById("cartItemsList");
    const cartContainer = document.getElementById("cartContainer");
    const cartSummary = document.getElementById("cartSummary");
    const emptyCart = document.getElementById("emptyCart");

    const subtotalAmount = document.getElementById("subtotalAmount");
    const totalAmount = document.getElementById("totalAmount");

    if (!cartItemsList) return;

    const cart = getCart();

    // ======================================
    // EMPTY CART
    // ======================================

    if (cart.length === 0) {

        cartItemsList.innerHTML = "";

        if (cartContainer) {
            cartContainer.classList.add("hidden");
        }

        if (emptyCart) {
            emptyCart.classList.remove("hidden");
        }

        if (subtotalAmount) {
            subtotalAmount.textContent = "SAR 0.00";
        }

        if (totalAmount) {
            totalAmount.textContent = "SAR 0.00";
        }

        return;
    }

    // ======================================
    // SHOW CART
    // ======================================

    if (cartContainer) {
        cartContainer.classList.remove("hidden");
    }

    if (emptyCart) {
        emptyCart.classList.add("hidden");
    }

    let subtotal = 0;

    cartItemsList.innerHTML = cart.map((item, index) => {

        const quantity = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const itemTotal = price * quantity;

        subtotal += itemTotal;

        return `
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">

                <div class="flex flex-col sm:flex-row gap-4">

                    <!-- Product Image -->
                    <div class="w-full sm:w-28 h-28 flex-shrink-0">
                        <img
                            src="${item.image || 'https://via.placeholder.com/300'}"
                            alt="${escapeHTML(item.name)}"
                            class="w-full h-full object-cover rounded-xl border border-gray-100"
                            onerror="this.src='https://via.placeholder.com/300'"
                        >
                    </div>


                    <!-- Product Information -->
                    <div class="flex-1 flex flex-col justify-between">

                        <div>

                            <div class="flex justify-between items-start gap-3">

                                <div>
                                    <h3 class="text-lg font-bold text-[#004232]">
                                        ${escapeHTML(item.name)}
                                    </h3>

                                    <p class="text-xs text-gray-500 mt-1">
                                        Price: SAR ${price.toFixed(2)}
                                    </p>
                                </div>

                                <!-- DELETE BUTTON -->
                                <button
                                    type="button"
                                    onclick="removeCartItem(${index})"
                                    class="w-9 h-9 flex-shrink-0 rounded-full border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 transition-all flex items-center justify-center"
                                    title="Remove product"
                                    aria-label="Remove ${escapeHTML(item.name)}"
                                >
                                    <i class="fa-solid fa-trash-can text-sm"></i>
                                </button>

                            </div>

                        </div>


                        <!-- Bottom Row -->
                        <div class="flex flex-wrap items-center justify-between gap-4 mt-5">

                            <!-- Quantity -->
                            <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">

                                <button
                                    type="button"
                                    onclick="decreaseQuantity(${index})"
                                    class="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                                >
                                    <i class="fa-solid fa-minus text-xs"></i>
                                </button>

                                <span
                                    id="qty-${index}"
                                    class="w-10 text-center text-sm font-bold text-gray-800"
                                >
                                    ${quantity}
                                </span>

                                <button
                                    type="button"
                                    onclick="increaseQuantity(${index})"
                                    class="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                                >
                                    <i class="fa-solid fa-plus text-xs"></i>
                                </button>

                            </div>


                            <!-- Product Total -->
                            <div class="text-right">

                                <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                    Item Total
                                </p>

                                <p class="text-lg font-extrabold text-[#004232]">
                                    SAR ${itemTotal.toFixed(2)}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        `;

    }).join("");


    // ======================================
    // SHIPPING
    // ======================================

    const shipping = 25;

    const total = subtotal + shipping;


    if (subtotalAmount) {
        subtotalAmount.textContent = `SAR ${subtotal.toFixed(2)}`;
    }

    if (totalAmount) {
        totalAmount.textContent = `SAR ${total.toFixed(2)}`;
    }
}


// ==========================================
// REMOVE PRODUCT
// ==========================================

function removeCartItem(index) {

    const cart = getCart();

    if (!cart[index]) return;

    const productName = cart[index].name || "this product";

    const confirmed = confirm(
        `Remove "${productName}" from your cart?`
    );

    if (!confirmed) return;

    // Remove product
    cart.splice(index, 1);

    // Save updated cart
    localStorage.setItem("athaqCart", JSON.stringify(cart));

    // Refresh cart
    renderCart();
    updateCartCount();

    console.log("Product removed:", productName);
}


// ==========================================
// INCREASE QUANTITY
// ==========================================

function increaseQuantity(index) {

    const cart = getCart();

    if (!cart[index]) return;

    cart[index].quantity = (Number(cart[index].quantity) || 1) + 1;

    saveCart(cart);
}


// ==========================================
// DECREASE QUANTITY
// ==========================================

function decreaseQuantity(index) {

    const cart = getCart();

    if (!cart[index]) return;

    const currentQuantity = Number(cart[index].quantity) || 1;

    if (currentQuantity > 1) {

        cart[index].quantity = currentQuantity - 1;

        saveCart(cart);

    } else {

        // If quantity is already 1,
        // remove product
        removeCartItem(index);
    }
}


// ==========================================
// CART COUNT
// ==========================================

function updateCartCount() {

    const cartCount = document.getElementById("cartCount");

    if (!cartCount) return;

    const cart = getCart();

    let totalQuantity = 0;

    cart.forEach(item => {
        totalQuantity += Number(item.quantity) || 1;
    });

    cartCount.textContent = totalQuantity;
}


// ==========================================
// WISHLIST COUNT
// ==========================================

function updateWishlistCount() {

    const wishlistCount = document.getElementById("wishlistCount");

    if (!wishlistCount) return;

    try {

        const wishlist =
            JSON.parse(localStorage.getItem("athaqWishlist")) || [];

        wishlistCount.textContent = wishlist.length;

    } catch (error) {

        wishlistCount.textContent = "0";

    }
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(str) {

    const div = document.createElement("div");

    div.textContent = str ?? "";

    return div.innerHTML;
}


// ==========================================
// STORAGE SYNC
// ==========================================

window.addEventListener("storage", () => {

    renderCart();
    updateCartCount();

});