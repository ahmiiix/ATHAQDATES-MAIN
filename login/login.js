function handlelogin(event) {
    event.preventdefault();

    const userInput = document
        .getelementbyid("loginInput")
        .value
        .trim();

    const password = document
        .getelementbyid("loginPassword")
        .value
        .trim();

    const errorMsg = document.getelementbyid("errorMsg");

    errorMsg.classList.add("hidden");
    errorMsg.textContent = "";

    // Old sessions clear karein taake conflict na ho
    sessionStorage.clear();
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    // ==========================================
    // ADMIN LOGIN
    // ==========================================
    if (userInput.toLowerCase() === "admin" && password === "1234") {
        const adminUser = {
            name: "Admin",
            email: "admin@athaqdates.com",
            role: "admin"
        };

        // SessionStorage mein save karein
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userRole", "admin");
        sessionStorage.setItem("userName", "Admin");

        // LocalStorage mein bhi backup save karein taake header/other pages read kar sakein
        localStorage.setItem("loggedInUser", JSON.stringify(adminUser));
        localStorage.setItem("user", JSON.stringify(adminUser));
        localStorage.setItem("userRole", "admin");

        window.location.href = "../admin/index.html";
        return;
    }

    // ==========================================
    // CUSTOMER LOGIN
    // ==========================================
    const users = JSON.parse(localStorage.getItem("athaqUsers")) || [];

    const foundUser = users.find(function(user) {
        return (
            (
                user.email &&
                user.email.toLowerCase() === userInput.toLowerCase()
            ) ||
            (
                user.name &&
                user.name.toLowerCase() === userInput.toLowerCase()
            )
        ) &&
        user.password === password;
    });

    // CUSTOMER FOUND
    if (foundUser) {
        // SessionStorage mein save karein
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userRole", "customer");
        sessionStorage.setItem("userName", foundUser.name);
        sessionStorage.setItem("userEmail", foundUser.email);

        // LocalStorage mein bhi save karein taake baqi pages par data match ho jaye
        localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
        localStorage.setItem("user", JSON.stringify(foundUser));
        localStorage.setItem("userRole", "customer");

        window.location.href = "../customer-profile/index.html";
        return;
    }

    // INVALID LOGIN
    errorMsg.classList.remove("hidden");
    errorMsg.textContent = "Invalid username/email or password!";
}