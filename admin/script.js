// ==========================================
// ATHAQ ADMIN DASHBOARD - SCRIPT ENGINE (UPDATED)
// ==========================================

let products = JSON.parse(localStorage.getItem("athaqProducts")) || [];
let editingIndex = null;

// Page load initialization
document.addEventListener("DOMContentLoaded", function () {
    renderProducts();
    updateStats();
    
    const form = document.getElementById("productForm");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
});

// 1. ADD / EDIT MODAL OPEN FUNCTION
function openAddProductModal() {
    editingIndex = null; // Reset edit mode
    
    const modalTitle = document.getElementById("modalTitle");
    const submitBtn = document.getElementById("submitBtn");
    if (modalTitle) modalTitle.textContent = "Add New Product";
    if (submitBtn) submitBtn.textContent = "Add Product";

    // Clear Form Fields
    const form = document.getElementById("productForm");
    if (form) form.reset();

    // Show Modal
    const modal = document.getElementById("addProductModal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

// 2. CLOSE MODAL FUNCTION
function closeAddProductModal() {
    const modal = document.getElementById("addProductModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

// 3. HANDLE FORM SUBMIT (ADD / EDIT LOGIC)
function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("productName")?.value || "";
    const sku = document.getElementById("productSKU")?.value || "";
    const category = document.getElementById("productCategory")?.value || "";
    const price = document.getElementById("productPrice")?.value || 0;
    const stock = document.getElementById("productStock")?.value || 0;
    const quality = document.getElementById("productQuality")?.value || "★★★★★";
    const description = document.getElementById("productDescription")?.value || "";
    const imageInput = document.getElementById("productImage");

    const processProductData = (imageUrl) => {
        const productData = {
            id: editingIndex !== null ? products[editingIndex].id : Date.now(),
            name: name,
            sku: sku,
            category: category,
            price: parseFloat(price),
            stock: parseInt(stock),
            quality: quality,
            description: description,
            image: imageUrl || (editingIndex !== null ? products[editingIndex].image : "https://via.placeholder.com/150")
        };

        if (editingIndex !== null) {
            products[editingIndex] = productData;
        } else {
            products.unshift(productData);
        }

        // Save to LocalStorage
        localStorage.setItem("athaqProducts", JSON.stringify(products));

        // Refresh UI
        renderProducts();
        updateStats();
        closeAddProductModal();
    };

    // Handle Image File Conversion
    if (imageInput && imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            processProductData(e.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        processProductData(null);
    }
}

// 4. RENDER PRODUCTS TABLE
function renderProducts() {
    const tbody = document.getElementById("productList");
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-400 font-medium">
                    No products added yet. Click "Add New Product" to get started.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map((product, index) => `
        <tr class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4 flex items-center gap-3">
                <img src="${product.image}" class="w-12 h-12 rounded-lg object-cover border border-gray-200" alt="${escapeHTML(product.name)}">
                <div>
                    <div class="font-bold text-gray-800">${escapeHTML(product.name)}</div>
                    <div class="text-xs text-gray-400">SKU: ${escapeHTML(product.sku)}</div>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-600">${escapeHTML(product.category)}</td>
            <td class="px-6 py-4 font-semibold ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}">
                ${product.stock > 0 ? product.stock + ' in stock' : 'Out of Stock'}
            </td>
            <td class="px-6 py-4 text-amber-500">${product.quality}</td>
            <td class="px-6 py-4 font-bold text-green-900">$${Number(product.price).toFixed(2)}</td>
            <td class="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                <button onclick="adminBuyNow(${index})" title="Buy Now" class="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-bolt"></i> Buy
                </button>

                <button onclick="adminAddToWishlist(${index})" title="Add to Wishlist" class="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-heart"></i>
                </button>

                <button onclick="editProduct(${index})" title="Edit Product" class="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">
                    Edit
                </button>

                <button onclick="deleteProduct(${index})" title="Delete Product" class="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

// 5. BUY NOW ACTION
function adminBuyNow(index) {
    const product = products[index];

    if (Number(product.stock || 0) <= 0) {
        alert("This item is out of stock!");
        return;
    }

    const itemToBuy = [{
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        sku: product.sku,
        quantity: 1
    }];

    localStorage.setItem("athaqCart", JSON.stringify(itemToBuy));

    // Redirect to Checkout (Relative Path Adjusted)
    window.location.href = "/admin/checkout.html"; 
}

// 6. ADD TO WISHLIST ACTION
function adminAddToWishlist(index) {
    const product = products[index];
    let wishlist = JSON.parse(localStorage.getItem("athaqWishlist")) || [];

    const exists = wishlist.some(item => String(item.id) === String(product.id));

    if (!exists) {
        wishlist.push(product);
        localStorage.setItem("athaqWishlist", JSON.stringify(wishlist));
        updateStats();
        alert(`"${product.name}" added to Wishlist!`);
    } else {
        alert(`"${product.name}" is already in Wishlist!`);
    }
}

// 7. EDIT PRODUCT FUNCTION
function editProduct(index) {
    editingIndex = index;
    const prod = products[index];

    if (document.getElementById("productName")) document.getElementById("productName").value = prod.name;
    if (document.getElementById("productSKU")) document.getElementById("productSKU").value = prod.sku;
    if (document.getElementById("productCategory")) document.getElementById("productCategory").value = prod.category;
    if (document.getElementById("productPrice")) document.getElementById("productPrice").value = prod.price;
    if (document.getElementById("productStock")) document.getElementById("productStock").value = prod.stock;
    if (document.getElementById("productQuality")) document.getElementById("productQuality").value = prod.quality;
    if (document.getElementById("productDescription")) document.getElementById("productDescription").value = prod.description || "";

    const modalTitle = document.getElementById("modalTitle");
    const submitBtn = document.getElementById("submitBtn");
    if (modalTitle) modalTitle.textContent = "Edit Product";
    if (submitBtn) submitBtn.textContent = "Save Changes";

    const modal = document.getElementById("addProductModal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

// 8. DELETE PRODUCT FUNCTION
function deleteProduct(index) {
    if (confirm("Are you sure you want to delete this product?")) {
        products.splice(index, 1);
        localStorage.setItem("athaqProducts", JSON.stringify(products));
        renderProducts();
        updateStats();
    }
}

// 9. STATS & MODAL CONTROLLERS
function updateStats() {
    const totalElem = document.getElementById("totalProducts");
    if (totalElem) totalElem.textContent = products.length;

    const cartItems = JSON.parse(localStorage.getItem("athaqCart")) || [];
    const wishlistItems = JSON.parse(localStorage.getItem("athaqWishlist")) || [];

    const cartElem = document.getElementById("cartCount");
    const wishElem = document.getElementById("wishlistCount");

    if (cartElem) cartElem.textContent = cartItems.length;
    if (wishElem) wishElem.textContent = wishlistItems.length;
}

function scrollToProducts() {
    const table = document.getElementById("productTableContainer");
    if (table) {
        table.scrollIntoView({ behavior: 'smooth' });
        table.classList.add("highlight-table");
        setTimeout(() => table.classList.remove("highlight-table"), 1500);
    }
}

function openWishlistModal() {
    const modal = document.getElementById("wishlistModal");
    const container = document.getElementById("wishlistContainer");
    const wishlist = JSON.parse(localStorage.getItem("athaqWishlist")) || [];

    if (container) {
        container.innerHTML = wishlist.length ? wishlist.map(item => `
            <div class="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                <div class="flex items-center gap-3">
                    <img src="${item.image || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded object-cover border border-gray-200">
                    <span class="font-bold text-gray-800">${escapeHTML(item.name)}</span>
                </div>
                <span class="text-green-800 font-bold">$${Number(item.price).toFixed(2)}</span>
            </div>
        `).join('') : '<p class="text-gray-400 text-center py-4">No wishlist items</p>';
    }

    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

function closeWishlistModal() {
    const modal = document.getElementById("wishlistModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

function openCartViewModal() {
    const modal = document.getElementById("cartModal");
    const container = document.getElementById("cartContainer");
    const cart = JSON.parse(localStorage.getItem("athaqCart")) || [];

    if (container) {
        container.innerHTML = cart.length ? cart.map(item => `
            <div class="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                <div class="flex items-center gap-3">
                    <img src="${item.image || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded object-cover border border-gray-200">
                    <div>
                        <div class="font-bold text-gray-800">${escapeHTML(item.name)}</div>
                        <div class="text-xs text-gray-500">Qty: ${item.quantity || 1}</div>
                    </div>
                </div>
                <span class="text-green-800 font-bold">$${Number(item.price).toFixed(2)}</span>
            </div>
        `).join('') : '<p class="text-gray-400 text-center py-4">Cart is empty</p>';
    }

    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

function closeCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}