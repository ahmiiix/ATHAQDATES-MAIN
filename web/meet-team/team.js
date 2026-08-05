const cards = document.querySelectorAll(".team-card, .leader-card");

cards.forEach((card, i) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(50px)";

  setTimeout(() => {
    card.style.transition = "0.6s";
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  }, i * 200);
});