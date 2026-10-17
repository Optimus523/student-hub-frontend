const params = new URLSearchParams(window.location.search);
if (params.get("signup") === "success") {
    const messageEl = document.querySelector("#form-message");
    messageEl.textContent = "Account created! Please log in.";
    messageEl.classList.add("success");
    messageEl.hidden = false;

    window.history.replaceState({}, "", "login.html");
}
