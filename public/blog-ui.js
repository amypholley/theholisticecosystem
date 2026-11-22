"use strict";

document.querySelectorAll(".navigation-toggle").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", () => {
    button.setAttribute("aria-expanded", String(button.getAttribute("aria-expanded") !== "true"));
  });
});

document.querySelectorAll(".health-topics").forEach((menu) => {
  const summary = menu.querySelector("summary");
  document.addEventListener("click", (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  menu.parentElement.addEventListener("keydown", (event) => {
    if (menu.open && event.key === "Escape") {
      menu.open = false;
      summary.focus();
    }
  });
});

document.querySelectorAll("[data-copy-link]").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", async () => {
    const share = button.closest(".post-share");
    const status = share.querySelector("[role='status']");
    try {
      await navigator.clipboard.writeText(button.dataset.copyLink);
      status.textContent = "Link copied.";
    } catch {
      const field = share.querySelector("input") || document.createElement("input");
      field.readOnly = true;
      field.setAttribute("aria-label", "Post link");
      field.value = button.dataset.copyLink;
      share.append(field);
      field.select();
      status.textContent = "Copy the selected link.";
    }
  });
});
