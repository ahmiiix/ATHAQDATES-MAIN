let currentLang = "en";

function toggleLanguage() {
  currentLang = currentLang === "en" ? "ar" : "en";

  // Direction change
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

  // Text change
  document.querySelectorAll(`[data-${currentLang}]`).forEach(el => {
    el.textContent = el.getAttribute(`data-${currentLang}`);
  });
}

function shareWebsite() {
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: "Athaq Dates Factory",
      text: "Premium Dates Products 🟤",
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copied! Now share it 👍");
  }
}
<!-- Instant & Zero-Lag JavaScript Toggle Function -->
    function toggleSidebar() {
        const sidebar = document.getElementById('mobile-menu');
        const overlay = document.getElementById('sidebar-overlay');
        
        // Check if menu is currently closed
        if (sidebar.classList.contains('translate-x-full')) {
            // Open Instantly
            sidebar.classList.remove('translate-x-full');
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            overlay.classList.add('opacity-100');
        } else {
            // Close Instantly
            sidebar.classList.add('translate-x-full');
            overlay.classList.remove('opacity-100');
            overlay.classList.add('opacity-0', 'pointer-events-none');
        }
    }
