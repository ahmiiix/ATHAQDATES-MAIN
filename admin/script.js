// ==========================================
// ATHAQ DATES - PRODUCT MANAGEMENT SYSTEM
// ==========================================

let products = JSON.parse(localStorage.getItem("athaqProducts")) || [];
let wishlist = JSON.parse(localStorage.getItem("athaqWishlist")) || [];
let cart = JSON.parse(localStorage.getItem("athaqCart")) || [];

let editingProductId = null;


// ==========================================
// ADD PRODUCT MODAL
// ==========================================

function openAddProductModal() {

    editingProductId = null;

    const modal = document.getElementById("addProductModal");

    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // Reset form
    const form = document.getElementById("productForm");

    if (form) {
        form.reset();
    }

    // Reset modal text
    const heading = modal.querySelector("h2");
    const description = modal.querySelector("h2 + p");
    const submitButton = modal.querySelector('button[type="submit"]');

    if (heading) {
        heading.textContent = "Add New Product";
    }

    if (description) {
        description.textContent = "Add product details and image";
    }

    if (submitButton) {
        submitButton.textContent = "Add Product";
    }

    // Image is required when adding
    const imageInput = document.getElementById("productImage");

    if (imageInput) {
        imageInput.required = true;
    }
}


// ==========================================
// CLOSE ADD / EDIT PRODUCT MODAL
// ==========================================

function closeAddProductModal() {

    const modal = document.getElementById("addProductModal");

    if (!modal) return;

    modal.classList.add("hidden");
    modal.classList.remove("flex");

    editingProductId = null;

    const form = document.getElementById("productForm");

    if (form) {
        form.reset();
    }

    // Restore Add Product mode
    const heading = modal.querySelector("h2");
    const description = modal.querySelector("h2 + p");
    const submitButton = modal.querySelector('button[type="submit"]');

    if (heading) {
        heading.textContent = "Add New Product";
    }

    if (description) {
        description.textContent = "Add product details and image";
    }

    if (submitButton) {
        submitButton.textContent = "Add Product";
    }

    const imageInput = document.getElementById("productImage");

    if (imageInput) {
        imageInput.required = true;
    }
}


// ==========================================
// ADD / EDIT PRODUCT
// ==========================================

document.getElementById("productForm")?.addEventListener(
    "submit",
    function (e) {

        e.preventDefault();

        const name =
            document.getElementById("productName").value.trim();

        const sku =
            document.getElementById("productSKU").value.trim();

        const category =
            document.getElementById("productCategory").value;

        const price =
            Number(document.getElementById("productPrice").value);

        const stock =
            Number(document.getElementById("productStock").value);

        const quality =
            document.getElementById("productQuality").value;

        const description =
            document.getElementById("productDescription").value.trim();

        const imageInput =
            document.getElementById("productImage");

        const imageFile =
            imageInput?.files[0];


        // ======================================
        // EDIT EXISTING PRODUCT
        // ======================================

        if (editingProductId !== null) {

            const product =
                products.find(
                    product => product.id === editingProductId
                );

            if (!product) {

                alert("Product not found.");

                return;
            }


            // Update product information

            product.name = name;
            product.sku = sku;
            product.category = category;
            product.price = price;
            product.stock = stock;
            product.quality = quality;
            product.description = description;


            // If new image selected, replace old image
            if (imageFile) {

                const reader = new FileReader();

                reader.onload = function (event) {

                    product.image =
                        event.target.result;

                    saveProducts();

                    document
                        .getElementById("productForm")
                        .reset();

                    closeAddProductModal();

                    renderProducts();

                    alert("Product updated successfully!");
                };

                reader.readAsDataURL(imageFile);

                return;
            }


            // Keep existing image

            saveProducts();

            document
                .getElementById("productForm")
                .reset();

            closeAddProductModal();

            renderProducts();

            alert("Product updated successfully!");

            return;
        }


        // ======================================
        // ADD NEW PRODUCT
        // ======================================

        if (!imageFile) {

            alert("Please select a product image.");

            return;
        }


        const reader = new FileReader();


        reader.onload = function (event) {

            const newProduct = {

                id: Date.now(),

                name: name,

                sku: sku,

                category: category,

                price: price,

                stock: stock,

                quality: quality,

                description: description,

                image: event.target.result,

                createdAt:
                    new Date().toISOString()
            };


            products.push(newProduct);


            saveProducts();


            document
                .getElementById("productForm")
                .reset();


            closeAddProductModal();


            renderProducts();


            alert("Product added successfully!");
        };


        reader.readAsDataURL(imageFile);
    }
);


// ==========================================
// SAVE PRODUCTS
// ==========================================

function saveProducts() {

    localStorage.setItem(
        "athaqProducts",
        JSON.stringify(products)
    );
}


// ==========================================
// EDIT PRODUCT
// ==========================================

function editProduct(id) {

    const product =
        products.find(
            product => product.id === id
        );


    if (!product) {

        alert("Product not found.");

        return;
    }


    editingProductId = id;


    const modal =
        document.getElementById("addProductModal");


    if (!modal) return;


    modal.classList.remove("hidden");
    modal.classList.add("flex");


    // ======================================
    // CHANGE MODAL TEXT
    // ======================================

    const heading =
        modal.querySelector("h2");

    const description =
        modal.querySelector("h2 + p");

    const submitButton =
        modal.querySelector('button[type="submit"]');


    if (heading) {

        heading.textContent =
            "Edit Product";
    }


    if (description) {

        description.textContent =
            "Update product details and image";
    }


    if (submitButton) {

        submitButton.textContent =
            "Update Product";
    }


    // ======================================
    // FILL FORM
    // ======================================

    document.getElementById("productName").value =
        product.name || "";


    document.getElementById("productSKU").value =
        product.sku || "";


    document.getElementById("productCategory").value =
        product.category || "Premium Dates";


    document.getElementById("productPrice").value =
        product.price ?? "";


    document.getElementById("productStock").value =
        product.stock ?? "";


    document.getElementById("productQuality").value =
        product.quality || "★★★★★";


    document.getElementById("productDescription").value =
        product.description || "";


    // ======================================
    // IMAGE NOT REQUIRED DURING EDIT
    // ======================================

    const imageInput =
        document.getElementById("productImage");


    if (imageInput) {

        imageInput.required = false;

        imageInput.value = "";
    }
}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {

    const container =
        document.getElementById("productList");


    if (!container) {

        updateProductCount();

        return;
    }


    container.innerHTML = "";


    // ======================================
    // NO PRODUCTS
    // ======================================

    if (products.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-12 text-gray-400">
                    No products added yet.
                </td>
            </tr>
        `;

        updateProductCount();

        return;
    }


    // ======================================
    // PRODUCTS
    // ======================================

    products.forEach(product => {

        const stock =
            Number(product.stock) || 0;


        const stockColor =
            stock <= 10
                ? "bg-red-600"
                : "bg-green-900";


        const row =
            document.createElement("tr");


        row.className =
            "border-b hover:bg-gray-50";


        row.innerHTML = `

            <!-- PRODUCT -->

            <td class="px-5 py-4">

                <div class="flex items-center gap-3">

                    <img
                        src="${product.image || ""}"
                        class="w-12 h-12 rounded-lg object-cover border"
                        alt="${escapeHTML(product.name)}">

                    <div>

                        <div class="font-semibold text-gray-900">
                            ${escapeHTML(product.name)}
                        </div>

                        <div class="text-xs text-gray-500">
                            SKU: ${escapeHTML(product.sku)}
                        </div>

                    </div>

                </div>

            </td>


            <!-- CATEGORY -->

            <td class="px-5 py-4">

                <span
                    class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs">

                    ${escapeHTML(product.category)}

                </span>

            </td>


            <!-- STOCK -->

            <td class="px-5 py-4">

                <div class="flex items-center gap-2">

                    <div
                        class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">

                        <div
                            class="${stockColor} h-full"
                            style="width:${Math.min(stock, 100)}%">
                        </div>

                    </div>

                    <span class="text-sm font-medium">
                        ${stock}
                    </span>

                </div>

            </td>


            <!-- QUALITY -->

            <td class="px-5 py-4 text-yellow-600">
                ${escapeHTML(product.quality)}
            </td>


            <!-- PRICE -->

            <td class="px-5 py-4 font-semibold">

                $${Number(product.price || 0).toFixed(2)}

            </td>


            <!-- ACTIONS -->

            <td class="px-5 py-4">

                <div class="flex gap-2 justify-end">

                    <!-- EDIT -->

                    <button
                        onclick="editProduct(${product.id})"
                        title="Edit Product"
                        class="px-3 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50">

                        ✏️

                    </button>


                    <!-- WISHLIST -->

                    <button
                        onclick="addToWishlist(${product.id})"
                        title="Wishlist"
                        class="px-3 py-2 border rounded-lg hover:bg-yellow-50">

                        ♡

                    </button>


                    <!-- BUY -->

                    <button
                        onclick="buyNow(${product.id})"
                        class="px-3 py-2 bg-green-900 text-white rounded-lg">

                        Buy

                    </button>


                    <!-- DELETE -->

                    <button
                        onclick="deleteProduct(${product.id})"
                        title="Delete Product"
                        class="px-3 py-2 border border-red-200 text-red-600 rounded-lg">

                        🗑

                    </button>

                </div>

            </td>

        `;


        container.appendChild(row);

    });


    updateProductCount();
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// ==========================================
// DELETE PRODUCT
// ==========================================

function deleteProduct(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmDelete) return;


    products =
        products.filter(
            product => product.id !== id
        );


    saveProducts();


    renderProducts();
}


// ==========================================
// WISHLIST
// ==========================================

function addToWishlist(id) {

    const product =
        products.find(
            product => product.id === id
        );


    if (!product) return;


    const alreadyAdded =
        wishlist.some(
            item => item.id === id
        );


    if (alreadyAdded) {

        alert(
            "Product is already in your wishlist."
        );

        return;
    }


    wishlist.push(product);


    localStorage.setItem(
        "athaqWishlist",
        JSON.stringify(wishlist)
    );


    alert(
        "Product added to wishlist ❤️"
    );
}


// ==========================================
// BUY NOW
// ==========================================

function buyNow(id) {

    const product =
        products.find(
            product => product.id === id
        );


    if (!product) return;


    if (product.stock <= 0) {

        alert(
            "This product is out of stock."
        );

        return;
    }


    cart = [

        {
            ...product,
            quantity: 1
        }

    ];


    localStorage.setItem(
        "athaqCart",
        JSON.stringify(cart)
    );


    openCheckout();
}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart(id) {

    const product =
        products.find(
            product => product.id === id
        );


    if (!product) return;


    if (product.stock <= 0) {

        alert(
            "This product is out of stock."
        );

        return;
    }


    const existing =
        cart.find(
            item => item.id === id
        );


    if (existing) {

        if (existing.quantity >= product.stock) {

            alert(
                "You cannot add more than available stock."
            );

            return;
        }


        existing.quantity++;

    } else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    localStorage.setItem(
        "athaqCart",
        JSON.stringify(cart)
    );


    alert(
        "Product added to cart 🛒"
    );
}


// ==========================================
// CHECKOUT
// ==========================================

function openCheckout() {

    // Remove existing checkout if already open

    const existingModal =
        document.getElementById("checkoutModal");


    if (existingModal) {

        existingModal.remove();
    }


    const total =
        cart.reduce(
            (sum, item) =>
                sum + (item.price * item.quantity),
            0
        );


    const items =
        cart.map(item => `

            <div class="flex items-center gap-3 border-b py-3">

                <img
                    src="${item.image}"
                    class="w-14 h-14 rounded-lg object-cover">

                <div class="flex-1">

                    <div class="font-semibold">
                        ${escapeHTML(item.name)}
                    </div>

                    <div class="text-sm text-gray-500">
                        Quantity: ${item.quantity}
                    </div>

                </div>

                <div class="font-semibold">

                    $${(
                        item.price * item.quantity
                    ).toFixed(2)}

                </div>

            </div>

        `).join("");


    const checkoutHTML = `

        <div
            id="checkoutModal"
            class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">

            <div class="bg-white rounded-2xl w-full max-w-lg p-6">

                <div class="flex justify-between items-center mb-5">

                    <h2 class="text-2xl font-bold text-green-900">
                        Checkout
                    </h2>

                    <button
                        onclick="closeCheckout()"
                        class="text-2xl">

                        ×

                    </button>

                </div>


                <div class="max-h-60 overflow-y-auto">

                    ${items}

                </div>


                <div class="flex justify-between text-xl font-bold mt-5">

                    <span>Total</span>

                    <span class="text-green-900">

                        $${total.toFixed(2)}

                    </span>

                </div>


                <div class="mt-5 space-y-3">

                    <input
                        id="customerName"
                        placeholder="Full Name"
                        class="w-full border rounded-lg px-4 py-3">

                    <input
                        id="customerPhone"
                        placeholder="Phone Number"
                        class="w-full border rounded-lg px-4 py-3">

                    <input
                        id="customerAddress"
                        placeholder="Delivery Address"
                        class="w-full border rounded-lg px-4 py-3">

                </div>


                <button
                    onclick="placeOrder()"
                    class="w-full mt-5 bg-green-900 text-white py-3 rounded-lg font-bold">

                    Confirm Order

                </button>

            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        checkoutHTML
    );
}


// ==========================================
// CLOSE CHECKOUT
// ==========================================

function closeCheckout() {

    const modal =
        document.getElementById("checkoutModal");


    if (modal) {

        modal.remove();
    }
}


// ==========================================
// PLACE ORDER
// ==========================================

function placeOrder() {

    const name =
        document.getElementById("customerName")
            ?.value.trim();


    const phone =
        document.getElementById("customerPhone")
            ?.value.trim();


    const address =
        document.getElementById("customerAddress")
            ?.value.trim();


    if (!name || !phone || !address) {

        alert(
            "Please complete all checkout fields."
        );

        return;
    }


    // ======================================
    // REDUCE STOCK
    // ======================================

    cart.forEach(cartItem => {

        const product =
            products.find(
                product =>
                    product.id === cartItem.id
            );


        if (product) {

            product.stock =
                Math.max(
                    0,
                    product.stock -
                    cartItem.quantity
                );
        }

    });


    saveProducts();


    // ======================================
    // CLEAR CART
    // ======================================

    cart = [];


    localStorage.removeItem(
        "athaqCart"
    );


    closeCheckout();


    renderProducts();


    alert(
        "Order placed successfully! Thank you for shopping with ATHAQ DATES."
    );
}


// ==========================================
// PRODUCT COUNT
// ==========================================

function updateProductCount() {

    const count =
        document.getElementById("totalProducts");


    if (count) {

        count.textContent =
            products.length;
    }
}


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderProducts();

        updateProductCount();

    }
);
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("productForm");

    if (!form) {
        console.log("Product form not found.");
        return;
    }

    console.log("Product form found.");

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        console.log("PRODUCT FORM SUBMITTED");

        const imageInput = document.getElementById("productImage");
        const imageFile = imageInput?.files[0];

        if (!imageFile) {
            alert("Please select a product image.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            const newProduct = {

                id: Date.now(),

                name: document.getElementById("productName").value.trim(),

                sku: document.getElementById("productSKU").value.trim(),

                category: document.getElementById("productCategory").value,

                price: Number(
                    document.getElementById("productPrice").value
                ),

                stock: Number(
                    document.getElementById("productStock").value
                ),

                quality: document.getElementById("productQuality").value,

                description:
                    document.getElementById("productDescription").value.trim(),

                image: event.target.result,

                createdAt: new Date().toISOString()
            };

            products.push(newProduct);

            localStorage.setItem(
                "athaqProducts",
                JSON.stringify(products)
            );

            console.log("PRODUCT SAVED:", newProduct);

            form.reset();

            closeAddProductModal();

            renderProducts();

            updateProductCount();

            alert("Product added successfully!");

        };

        reader.readAsDataURL(imageFile);

    });

});