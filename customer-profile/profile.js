const db = window.ATHAQ_SUPABASE;

let currentChatConversation = null;
let chatRealtimeChannel = null;
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
function openLiveChat() {
    const chat = document.getElementById("liveChatWindow");

    if (chat) {
        chat.classList.remove("hidden");
    }

    setTimeout(() => {
        const input = document.getElementById("chatMessageInput");

        if (input) {
            input.focus();
        }
    }, 100);
}


function closeLiveChat() {
    const chat = document.getElementById("liveChatWindow");

    if (chat) {
        chat.classList.add("hidden");
    }
}


function handleChatKey(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendChatMessage();
    }
}


async function sendChatMessage() {

    const input = document.getElementById("chatMessageInput");
    const messages = document.getElementById("chatMessages");
    const status = document.getElementById("chatStatus");

    if (!input || !messages) {
        console.error("Chat elements not found.");
        return;
    }

    const message = input.value.trim();

    if (!message) {
        return;
    }

    if (!db) {
        alert("Supabase is not configured.");
        console.error("ATHAQ_SUPABASE not found.");
        return;
    }

    input.disabled = true;

    if (status) {
        status.textContent = "Sending...";
        status.classList.remove("hidden");
    }

    try {

        // Check Supabase login
        const { data: authData, error: authError } =
            await db.auth.getUser();

        if (authError || !authData.user) {
            console.error("AUTH ERROR:", authError);
            throw new Error("Customer is not logged in to Supabase.");
        }

        const user = authData.user;

        // Get customer information
        const currentUser =
            JSON.parse(localStorage.getItem("loggedInUser")) ||
            JSON.parse(localStorage.getItem("user")) ||
            {};

        // Find existing conversation
        let { data: conversation, error: conversationError } =
            await db
                .from("chat_conversations")
                .select("*")
                .eq("customer_id", user.id)
                .eq("status", "open")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

        if (conversationError) {
            console.error("CONVERSATION ERROR:", conversationError);
            throw conversationError;
        }

        // Create conversation if none exists
        if (!conversation) {

            const { data: newConversation, error: createError } =
                await db
                    .from("chat_conversations")
                    .insert({
                        customer_id: user.id,
                        customer_name:
                            currentUser.name ||
                            user.user_metadata?.full_name ||
                            "Customer",
                        customer_email:
                            currentUser.email ||
                            user.email,
                        status: "open",
                        unread_for_admin: 0,
                        unread_for_customer: 0
                    })
                    .select()
                    .single();

            if (createError) {
                console.error("CREATE CONVERSATION ERROR:", createError);
                throw createError;
            }

            conversation = newConversation;
        }

        currentChatConversation = conversation;

        // Insert message
        const { data: savedMessage, error: messageError } =
            await db
                .from("chat_messages")
                .insert({
                    conversation_id: conversation.id,
                    sender_id: user.id,
                    sender_role: "customer",
                    message: message,
                    is_read: false
                })
                .select()
                .single();

        if (messageError) {
            console.error("MESSAGE INSERT ERROR:", messageError);
            throw messageError;
        }

        console.log("MESSAGE SENT:", savedMessage);

        // Update admin unread count
        const newUnreadCount =
            (conversation.unread_for_admin || 0) + 1;

        const { error: updateError } =
            await db
                .from("chat_conversations")
                .update({
                    unread_for_admin: newUnreadCount,
                    updated_at: new Date().toISOString()
                })
                .eq("id", conversation.id);

        if (updateError) {
            console.warn("Unread count update failed:", updateError);
        }

        // Show sent message
        messages.insertAdjacentHTML(
            "beforeend",
            `
            <div class="flex justify-end">
                <div class="bg-[#004232] text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] shadow-sm">
                    <p class="text-xs">
                        ${escapeChatHTML(message)}
                    </p>
                </div>
            </div>
            `
        );

        input.value = "";

        messages.scrollTop = messages.scrollHeight;

        if (status) {
            status.textContent = "Message sent ✓";

            setTimeout(() => {
                status.classList.add("hidden");
            }, 1500);
        }

    } catch (error) {

        console.error("SEND CHAT ERROR:", error);

        alert(
            "Message could not be sent.\n\n" +
            (error.message || "Unknown error")
        );

        if (status) {
            status.textContent = "Failed to send message";
        }

    } finally {

        input.disabled = false;
        input.focus();
    }
}
async function getOrCreateChatConversation() {

    if (!db) {
        console.error("Supabase is not configured.");
        return null;
    }

    const currentUser =
        JSON.parse(localStorage.getItem("loggedInUser")) ||
        JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
        console.error("Customer is not logged in.");
        return null;
    }

    const {
        data: authData,
        error: authError
    } = await db.auth.getUser();

    if (authError || !authData.user) {
        console.error("Supabase user not found:", authError);
        return null;
    }

    const user = authData.user;

    // Existing conversation
    const {
        data: existing,
        error: existingError
    } = await db
        .from("chat_conversations")
        .select("*")
        .eq("customer_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (existingError) {
        console.error(
            "Conversation load error:",
            existingError
        );
        return null;
    }

    if (existing) {
        currentChatConversation = existing;
        return existing;
    }

    // Create new conversation
    const {
        data: newConversation,
        error: createError
    } = await db
        .from("chat_conversations")
        .insert({
            customer_id: user.id,
            customer_name:
                currentUser.name ||
                user.user_metadata?.full_name ||
                "Customer",
            customer_email:
                currentUser.email ||
                user.email,
            status: "open",
            unread_for_admin: 0,
            unread_for_customer: 0
        })
        .select()
        .single();

    if (createError) {
        console.error(
            "Conversation creation error:",
            createError
        );
        return null;
    }

    currentChatConversation = newConversation;

    return newConversation;
}
function escapeChatHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
