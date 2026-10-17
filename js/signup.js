const form = document.querySelector("form");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    //clears previous errors
    document.querySelectorAll(".field.error").forEach((field) => {
        field.classList.remove("error");
        field.querySelector(".error-message").textContent = "";
    });
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;

    console.log("Username", username);
    console.log("Password", password);
    console.log("Confirm", confirmPassword);

    if (password != confirmPassword) {
        const confirmField = document
            .querySelector("#confirm-password")
            .closest(".field");
        confirmField.classList.add("error");
        confirmField.querySelector(".error-message").textContent =
            "Passwords do not match";
        return;
    }
    async function handleSignup() {
        try {
            const response = await fetch(
                `http://${window.location.hostname}:8000/users/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                },
            );

            const data = await response.json();
            if (response.ok) {
                const messageEl = document.querySelector("#form-message");
                messageEl.textContent =
                    "Account created! Redirecting to login...";
                messageEl.classList.add("success");
                messageEl.hidden = false;

                const submitButton = document.querySelector(
                    "button[type='submit']",
                );
                submitButton.disabled = true;
                setTimeout(() => {
                    window.location.href = "login.html?signup=success";
                }, 1500);
            } else if (response.status === 409) {
                const usernameField = document
                    .querySelector("#username")
                    .closest(".field");
                usernameField.classList.add("error");
                usernameField.querySelector(".error-message").textContent =
                    data.detail;
            } else {
                console.log("Unexpected error:", data);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    }
    handleSignup();
});
