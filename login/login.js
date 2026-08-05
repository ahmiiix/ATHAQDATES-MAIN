document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "1234") {
    sessionStorage.setItem("isLoggedIn", "true");
    window.location.href = "../admin/index.html";
  } else {
    alert("Invalid Credentials");
  }
});