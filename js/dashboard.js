const menuToggle = document.querySelector("#menuToggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector("#sidebarOverlay");

function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    document.body.classList.add("no-scroll");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

menuToggle.addEventListener("click", function () {
    if (sidebar.classList.contains("open")) {
        closeSidebar();
    } else {
        openSidebar();
    }
});

overlay.addEventListener("click", closeSidebar);

const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeSidebar();
    });
});
