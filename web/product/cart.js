document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateNavbarCounters();
});

function getCart() {
  return JSON.parse(localStorage.getItem('athaqCart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('athaqCart', JSON.stringify(cart));
  renderCart();
  updateNavbarCounters();
}

function renderCart() {
  const cart = getCart();
  const cartContainer = document.getElementById('cartContainer');
  const emptyCartState = document.getElementById('emptyCart');
  const cartItemsList = document.getElementById('cartItemsList');
  const subtotalElement = document.getElementById('subtotalAmount');
  const totalElement = document.getElementById('totalAmount');

  if (cart.length === 0) {
    cartContainer.classList.add('hidden');
    emptyCartState.classList.remove('hidden');
    return;
  }

  cartContainer.classList.remove('hidden');
  emptyCartState.classList.add('hidden');

  cartItemsList.innerHTML = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * (item.quantity || 1);
    subtotal += itemTotal;

    const itemCard = document.createElement('div');
    itemCard.className = 'bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between';
    
    itemCard.innerHTML = `
      <div class="flex items-center gap-4 w-full sm:w-auto">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-xl bg-gray-50 flex-shrink-0">
        <div>
          <h3 class="font-bold text-[#004232] text-base mb-1">${item.name}</h3>
          <span class="text-xs font-bold text-gray-500">SAR ${item.price.toFixed(2)}</span>
        </div>
      </div>

      <div class="flex items-center justify-between w-full sm:w-auto gap-6">
        <!-- Quantity Controls -->
        <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          <button onclick="decreaseQuantity(${index})" class="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors font-bold text-xs">-</button>
          <span class="px-4 py-1.5 text-xs font-bold text-[#004232]">${item.quantity || 1}</span>
          <button onclick="increaseQuantity(${index})" class="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors font-bold text-xs">+</button>
        </div>

        <!-- Item Total Price -->
        <span class="font-extrabold text-[#004232] text-sm min-w-[80px] text-right">SAR ${itemTotal.toFixed(2)}</span>

        <!-- Remove Button -->
        <button onclick="removeItem(${index})" class="text-gray-400 hover:text-rose-600 transition-colors p-2" title="Remove item">
          <i class="fa-solid fa-trash-can text-sm"></i>
        </button>
      </div>
    `;

    cartItemsList.appendChild(itemCard);
  });

  const shipping = 25.00;
  const grandTotal = subtotal + shipping;

  subtotalElement.textContent = `SAR ${subtotal.toFixed(2)}`;
  totalElement.textContent = `SAR ${grandTotal.toFixed(2)}`;
}

function increaseQuantity(index) {
  let cart = getCart();
  cart[index].quantity = (cart[index].quantity || 1) + 1;
  saveCart(cart);
}

function decreaseQuantity(index) {
  let cart = getCart();
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }
  saveCart(cart);
}

function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateNavbarCounters() {
  const cart = getCart();
  const totalCartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartBadge = document.getElementById('cartCount');
  if (cartBadge) cartBadge.textContent = totalCartCount;

  const wishlist = JSON.parse(localStorage.getItem('athaqWishlist')) || [];
  const wishlistBadge = document.getElementById('wishlistCount');
  if (wishlistBadge) wishlistBadge.textContent = wishlist.length;
}

function proceedToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  window.location.href = '../checkout.html';
}