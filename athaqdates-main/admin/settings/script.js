// ===========================
// ATHAQ SETTINGS PANEL
// ===========================

// Load Saved Settings
window.addEventListener("load", function () {

    // Theme
    const theme = localStorage.getItem("theme");
    if (theme) {
        document.body.className = theme;
    }

    // Language
    const language = localStorage.getItem("language");
    if (language) {
        document.getElementById("language").value = language;
        document.documentElement.dir = (language === "ar") ? "rtl" : "ltr";
    }

    // Name
    const adminName = localStorage.getItem("adminName");
    if (adminName) {
        document.getElementById("name").value = adminName;
    }

    // Email
    const adminEmail = localStorage.getItem("adminEmail");
    if (adminEmail) {
        document.getElementById("email").value = adminEmail;
    }

});
// ===========================
// SAVE SETTINGS
// ===========================

const saveBtn = document.getElementById("saveBtn");

if (saveBtn) {
    saveBtn.addEventListener("click", function () {

        localStorage.setItem("adminName", document.getElementById("name").value);
        localStorage.setItem("adminEmail", document.getElementById("email").value);
        localStorage.setItem("language", document.getElementById("language").value);

        alert("✅ Settings Saved Successfully!");
    });
}

// ===========================
// THEME
// ===========================

document.querySelectorAll(".theme").forEach(btn => {

    btn.addEventListener("click", function (e) {

        e.preventDefault();

        document.querySelectorAll(".theme")
        .forEach(x => x.classList.remove("active"));

        this.classList.add("active");

        document.body.className = this.dataset.theme;

        localStorage.setItem("theme", this.dataset.theme);

    });

});

// ===========================
// RESET
// ===========================
const resetBtn = document.querySelector(".danger");

if (resetBtn) {

    resetBtn.addEventListener("click", function () {

        if (confirm("Are you sure you want to reset all settings?")) {

            localStorage.removeItem("theme");
            localStorage.removeItem("language");
            localStorage.removeItem("adminName");
            localStorage.removeItem("adminEmail");
            localStorage.removeItem("password");

            location.reload();

        }

    });

}

// ===========================
// LOGOUT
// ===========================
const logoutBtn = document.querySelector(".logout");

if (logoutBtn) {

    logoutBtn.addEventListener("click", function () {

        if (confirm("Are you sure you want to logout?")) {

            window.location.href = "../../login/index.html";

        }

    });

}

// ===========================
// CHANGE PASSWORD
// ===========================
const changeBtn = document.querySelector(".changeBtn");

if (changeBtn) {

    changeBtn.addEventListener("click", function () {

        const pass = document.querySelectorAll("input[type='password']");

        const current = pass[0].value.trim();
        const newPass = pass[1].value.trim();
        const confirmPass = pass[2].value.trim();

        if (current === "") {
            alert("Please enter current password.");
            return;
        }

        if (newPass.length < 6) {
            alert("New password must be at least 6 characters.");
            return;
        }

        if (newPass !== confirmPass) {
            alert("Passwords do not match.");
            return;
        }

        localStorage.setItem("password", newPass);

        alert("Password changed successfully.");

        pass.forEach(input => input.value = "");

    });

}

// ===========================
// LANGUAGE
// ===========================

const languageSelect = document.getElementById("language");

if (languageSelect) {

    languageSelect.addEventListener("change", function () {

        const lang = this.value;

        localStorage.setItem("language", lang);

        if (lang === "ar") {
            document.documentElement.dir = "rtl";
        } else {
            document.documentElement.dir = "ltr";
        }

    });

}

// ===========================
// Notification Switch
// ===========================
const toggle = document.querySelector(".switch input");

if (toggle) {

    toggle.addEventListener("change", function () {

        if (this.checked) {
            alert("Notifications Enabled");
        } else {
            alert("Notifications Disabled");
        }

    });

}

// ===========================
// Auto Save
// ===========================

document.querySelectorAll("input").forEach(input => {

    input.addEventListener("input", function () {

        if (this.id) {
            localStorage.setItem(this.id, this.value);
        }

    });

});