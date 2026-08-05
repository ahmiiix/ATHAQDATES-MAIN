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
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

if(menuBtn){

menuBtn.addEventListener("click",()=>{

mobileMenu.classList.toggle("hidden");

});

}