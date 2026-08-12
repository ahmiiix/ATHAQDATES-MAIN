document.addEventListener("DOMContentLoaded", function () {

    // ============================================
    // CUSTOMER LOGIN SECURITY
    // ============================================

    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const userRole = sessionStorage.getItem("userRole");

    // Sirf logged-in customer profile access kar sakta hai
    if (isLoggedIn !== "true" || userRole !== "customer") {
        window.location.href = "../login/index.html";
        return;
    }


    // ============================================
    // GET CUSTOMER DATA
    // ============================================

    const userName =
        sessionStorage.getItem("userName") || "Valued Customer";

    const userEmail =
        sessionStorage.getItem("userEmail") || "customer@athaq.com";

    const userPhone =
        sessionStorage.getItem("userPhone") || "+966 50 123 4567";

    const userAddress =
        sessionStorage.getItem("userAddress") ||
        "King Salman Road, Al Bukayriyah";

    const joinDate =
        sessionStorage.getItem("userJoinDate") ||
        "January 2026";


    // ============================================
    // SHOW CUSTOMER NAME
    // ============================================

    const navUserName =
        document.getElementById("navUserName");

    const profileFullName =
        document.getElementById("profileFullName");

    const profileEmail =
        document.getElementById("profileEmail");

    const profilePhone =
        document.getElementById("profilePhone");

    const profileAddress =
        document.getElementById("profileAddress");

    const profileJoinDate =
        document.getElementById("profileJoinDate");

    const profileRole =
        document.getElementById("profileRole");


    if (navUserName) {
        navUserName.textContent = userName;
    }

    if (profileFullName) {
        profileFullName.textContent = userName;
    }

    if (profileEmail) {
        profileEmail.textContent = userEmail;
    }

    if (profilePhone) {
        profilePhone.textContent = userPhone;
    }

    if (profileAddress) {
        profileAddress.textContent = userAddress;
    }

    if (profileJoinDate) {
        profileJoinDate.textContent = joinDate;
    }

    if (profileRole) {
        profileRole.textContent = "RETAIL CUSTOMER";
    }


    // ============================================
    // PROFILE AVATAR
    // ============================================

    const savedPic =
        localStorage.getItem("userProfilePic");

    const avatarImg =
        document.getElementById("userAvatarImg");

    const avatarText =
        document.getElementById("userAvatarText");


    if (savedPic && avatarImg && avatarText) {

        avatarImg.src = savedPic;
        avatarImg.classList.remove("hidden");
        avatarText.classList.add("hidden");

    } else if (avatarText) {

        avatarText.textContent =
            userName.charAt(0).toUpperCase();

    }


    // ============================================
    // LOAD ORDERS
    // ============================================

    loadUserOrders();

});


// ============================================
// PROFILE PICTURE UPLOAD
// ============================================

function uploadProfilePic(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        const base64Image = e.target.result;

        localStorage.setItem(
            "userProfilePic",
            base64Image
        );

        displayProfilePic(base64Image);
    };

    reader.readAsDataURL(file);
}


// ============================================
// DISPLAY PROFILE PICTURE
// ============================================

function displayProfilePic(imageSrc) {

    const avatarImg =
        document.getElementById("userAvatarImg");

    const avatarText =
        document.getElementById("userAvatarText");

    if (!avatarImg || !avatarText) {
        return;
    }

    avatarImg.src = imageSrc;

    avatarImg.classList.remove("hidden");

    avatarText.classList.add("hidden");
}


// ============================================
// LOAD CUSTOMER ORDERS
// ============================================

function loadUserOrders() {

    const ordersContainer =
        document.getElementById("ordersContainer");

    if (!ordersContainer) {
        return;
    }

    const orders =
        JSON.parse(
            localStorage.getItem("userOrders")
        ) || [];


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


    orders.forEach(function (order) {

        let checkoutButton = "";

        if (
            order.status &&
            order.status.toLowerCase() === "processing"
        ) {

            checkoutButton = `
                <a
                    href="../web/checkout/index.html?orderId=${order.id}"
                    class="mt-3 inline-flex items-center gap-1.5 text-xs bg-[#004232] text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-[#002e23] transition-colors shadow-sm"
                >
                    <i class="fa-solid fa-credit-card"></i>
                    Proceed to Checkout
                </a>
            `;
        }


        ordersHTML += `
            <div class="p-4 bg-[#faf9f4] rounded-2xl border border-gray-100">

                <div class="flex items-center justify-between">

                    <div>

                        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                            Order #${order.id}
                        </span>

                        <h4 class="font-bold mt-2 text-sm text-gray-800">
                            ${order.title}
                        </h4>

                        <p class="text-xs text-gray-500">
                            Placed on: ${order.date}
                        </p>

                    </div>


                    <div class="text-right">

                        <span class="block font-bold text-[#004232]">
                            ${order.price}
                        </span>

                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded ${order.statusColor || ""}">
                            ${order.status}
                        </span>

                    </div>

                </div>

                ${checkoutButton}

            </div>
        `;
    });


    ordersContainer.innerHTML = ordersHTML;
}


// ============================================
// LOGOUT
// ============================================

function logoutUser() {

    sessionStorage.clear();

    window.location.href = "../login/index.html";
}


// ============================================
// EDIT PROFILE
// ============================================

function openEditModal() {

    const currentName =
        sessionStorage.getItem("userName") || "";

    const newName =
        prompt(
            "Enter your new name:",
            currentName
        );


    if (!newName || newName.trim() === "") {
        return;
    }


    const updatedName =
        newName.trim();


    // Update session
    sessionStorage.setItem(
        "userName",
        updatedName
    );


    // Update visible name
    const profileFullName =
        document.getElementById("profileFullName");

    const navUserName =
        document.getElementById("navUserName");

    const avatarText =
        document.getElementById("userAvatarText");

    const savedPic =
        localStorage.getItem("userProfilePic");


    if (profileFullName) {
        profileFullName.textContent = updatedName;
    }

    if (navUserName) {
        navUserName.textContent = updatedName;
    }

    if (!savedPic && avatarText) {
        avatarText.textContent =
            updatedName.charAt(0).toUpperCase();
    }


    // Also update customer in localStorage
    let users =
        JSON.parse(
            localStorage.getItem("athaqUsers")
        ) || [];


    const userEmail =
        sessionStorage.getItem("userEmail");


    users = users.map(function (user) {

        if (
            user.email &&
            userEmail &&
            user.email.toLowerCase() ===
            userEmail.toLowerCase()
        ) {

            user.name = updatedName;
        }

        return user;
    });


    localStorage.setItem(
        "athaqUsers",
        JSON.stringify(users)
    );


    alert("Profile updated successfully!");
}