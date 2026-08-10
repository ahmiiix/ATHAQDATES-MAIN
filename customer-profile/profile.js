document.addEventListener("DOMContentLoaded", () => {
    // 1. Check if user is logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const userRole = sessionStorage.getItem("userRole");

    if (isLoggedIn !== "true") {
        window.location.href = "./login/index.html";
        return;
    }

    // 2. Fetch User Data from Session Storage
    const userName = sessionStorage.getItem("userName") || "Valued Customer";
    const userEmail = sessionStorage.getItem("userEmail") || "customer@athaq.com";
    const userPhone = sessionStorage.getItem("userPhone") || "+966 50 123 4567";
    const userAddress = sessionStorage.getItem("userAddress") || "King Salman Road, Al Bukayriyah";
    const joinDate = sessionStorage.getItem("userJoinDate") || "January 2026";

    // 3. Populate Data into HTML Elements
    document.getElementById("navUserName").textContent = userName;
    document.getElementById("profileFullName").textContent = userName;
    document.getElementById("profileEmail").textContent = userEmail;
    document.getElementById("profilePhone").textContent = userPhone;
    document.getElementById("profileAddress").textContent = userAddress;
    document.getElementById("profileJoinDate").textContent = joinDate;
    document.getElementById("profileRole").textContent = userRole === "admin" ? "Administrator" : "Retail Customer";

    // 4. Handle Profile Picture Display
    const savedPic = localStorage.getItem("userProfilePic");
    if (savedPic) {
        displayProfilePic(savedPic);
    } else {
        const firstLetter = userName.charAt(0).toUpperCase();
        document.getElementById("userAvatarText").textContent = firstLetter;
    }

    // 5. Load Dynamic Orders
    loadUserOrders();
});

// Profile Picture Upload Handler
function uploadProfilePic(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            localStorage.setItem("userProfilePic", base64Image);
            displayProfilePic(base64Image);
        };
        reader.readAsDataURL(file);
    }
}

// Helper function to show image
function displayProfilePic(imageSrc) {
    const avatarImg = document.getElementById("userAvatarImg");
    const avatarText = document.getElementById("userAvatarText");

    if (avatarImg && avatarText) {
        avatarImg.src = imageSrc;
        avatarImg.classList.remove("hidden");
        avatarText.classList.add("hidden");
    }
}

// Load and Display Orders from LocalStorage with Checkout Option for Pending Orders
function loadUserOrders() {
    const ordersContainer = document.getElementById("ordersContainer");
    
    let orders = JSON.parse(localStorage.getItem("userOrders")) || [
        { id: "ATH-9824", title: "Premium Ajwa Dates (1kg)", date: "Feb 12, 2026", price: "120 SAR", status: "Processing", statusColor: "text-amber-600 bg-amber-50" },
        { id: "ATH-8512", title: "Khalas Selection Box (3kg)", date: "Jan 20, 2026", price: "250 SAR", status: "Delivered", statusColor: "text-green-600 bg-green-50" }
    ];

    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="text-center py-8 text-gray-400 text-sm">
                <i class="fa-solid fa-box-open text-3xl mb-2"></i>
                <p>No recent orders found.</p>
            </div>
        `;
        return;
    }

    let ordersHTML = "";
    orders.forEach(order => {
        // Agar order "Processing" (pending) hai toh sath mein Checkout/Pay Now ka button show hoga
        let checkoutButton = "";
        if (order.status.toLowerCase() === "processing") {
            checkoutButton = `
                <a href="/web/checkout/index.html?orderId=${order.id}" class="mt-3 inline-flex items-center gap-1.5 text-xs bg-[#004232] text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-[#002e23] transition-colors shadow-sm">
                    <i class="fa-solid fa-credit-card"></i> Proceed to Checkout
                </a>
            `;
        }

        ordersHTML += `
            <div class="p-4 bg-[#faf9f4] rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Order #${order.id}</span>
                        <h4 class="font-bold mt-2 text-sm text-gray-800">${order.title}</h4>
                        <p class="text-xs text-gray-500">Placed on: ${order.date}</p>
                    </div>
                    <div class="text-right">
                        <span class="block font-bold text-[#004232]">${order.price}</span>
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded ${order.statusColor}">${order.status}</span>
                    </div>
                </div>
                ${checkoutButton}
            </div>
        `;
    });

    ordersContainer.innerHTML = ordersHTML;
}

// Logout Function
function logoutUser() {
    sessionStorage.clear();
    alert("You have been logged out successfully.");
    window.location.href = "/index.html";
}

// Edit Profile Handler
function openEditModal() {
    const newName = prompt("Enter your new name:", sessionStorage.getItem("userName") || "");
    if (newName && newName.trim() !== "") {
        sessionStorage.setItem("userName", newName.trim());
        document.getElementById("profileFullName").textContent = newName.trim();
        document.getElementById("navUserName").textContent = newName.trim();
        
        const savedPic = localStorage.getItem("userProfilePic");
        if (!savedPic) {
            document.getElementById("userAvatarText").textContent = newName.charAt(0).toUpperCase();
        }
        
        alert("Profile updated successfully!");
    }
}