const form = document.querySelector("#login-form");

// ---------- Signup success banner ----------
const params = new URLSearchParams(window.location.search);
if (params.get("signup") === "success") {
    const messageEl = document.querySelector("#form-message");
    messageEl.textContent = "Account created! Please log in.";
    messageEl.classList.add("success");
    messageEl.hidden = false;

    window.history.replaceState({}, "", "login.html");
}

// ---------- Login ----------
form.addEventListener("submit", function (event) {
    event.preventDefault();

    document.querySelectorAll(".field.error").forEach((field) => {
        field.classList.remove("error");
        field.querySelector(".error-message").textContent = "";
    });

    const messageEl = document.querySelector("#form-message");
    messageEl.hidden = true;
    messageEl.textContent = "";
    messageEl.classList.remove("success", "error");

    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    function markError(input, text) {
        const field = input.closest(".field");
        field.classList.add("error");
        field.querySelector(".error-message").textContent = text;
    }

    let valid = true;
    if (!username) {
        markError(usernameInput, "Username is required");
        valid = false;
    }
    if (!password) {
        markError(passwordInput, "Password is required");
        valid = false;
    }
    if (!valid) return;

    async function handleLogin() {
        const submitButton = document.querySelector("button[type='submit']");
        const originalLabel = submitButton.textContent;
        const overlay = document.querySelector("#loading-overlay");
        const loadingText = overlay.querySelector(".loading-text");

        submitButton.disabled = true;
        submitButton.textContent = "Signing in...";
        loadingText.textContent = "Signing in...";
        overlay.hidden = false;

        let redirecting = false;

        try {
            const response = await fetch(
                `http://${window.location.hostname}:8000/login/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        username,
                        password,
                    }).toString(),
                },
            );

            if (response.ok) {
                const data = await response.json();

                // Save auth details
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("token_type", data.token_type || "bearer");
                localStorage.setItem("user_id", data.user_id);
                localStorage.setItem("username", data.username || username);

                messageEl.textContent =
                    "Signed in! Redirecting to dashboard...";
                messageEl.classList.add("success");
                messageEl.hidden = false;

                loadingText.textContent = "Welcome back! Loading dashboard...";
                redirecting = true;
                setTimeout(() => {
                    window.location.href = "home.html";
                }, 800);
            } else if (response.status === 401) {
                overlay.hidden = true;
                messageEl.textContent = "Invalid username or password.";
                messageEl.classList.add("error");
                messageEl.hidden = false;
            } else {
                overlay.hidden = true;
                const data = await response.json().catch(() => ({}));
                console.log("Unexpected error:", data);
                messageEl.textContent = "Login failed. Please try again.";
                messageEl.classList.add("error");
                messageEl.hidden = false;
            }
        } catch (error) {
            overlay.hidden = true;
            console.error("Network error:", error);
            messageEl.textContent =
                "Can't reach the server. Is the backend running?";
            messageEl.classList.add("error");
            messageEl.hidden = false;
        } finally {
            if (!redirecting) {
                submitButton.disabled = false;
                submitButton.textContent = originalLabel;
            }
        }
    }

    handleLogin();
});
