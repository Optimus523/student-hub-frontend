// ---------- Profile Page Logic ----------
const PROFILE_API = `http://${window.location.hostname}:8000`;
const profileMessage = document.querySelector("#profileMessage");

function showProfileMessage(text, type = "success") {
    if (!profileMessage) return;
    profileMessage.textContent = text;
    profileMessage.classList.remove("success", "error");
    profileMessage.classList.add(type);
    profileMessage.hidden = false;
    setTimeout(() => {
        profileMessage.hidden = true;
    }, 4000);
}

// ---------- Avatar Rendering ----------
const avatarPreview = document.querySelector("#avatarPreview");
const avatarImage = document.querySelector("#avatarImage");
const avatarLetter = document.querySelector("#avatarLetter");
const avatarInput = document.querySelector("#avatarInput");
const chooseAvatarBtn = document.querySelector("#chooseAvatarBtn");

function renderAvatar(url, username) {
    if (!avatarImage || !avatarLetter) return;

    if (url) {
        avatarImage.src = `${PROFILE_API}${url}`;
        avatarImage.hidden = false;
        avatarLetter.hidden = true;
    } else {
        avatarImage.hidden = true;
        avatarLetter.hidden = false;
        avatarLetter.textContent = (username || "?").charAt(0).toUpperCase();
    }
}

// ---------- Load Profile ----------
async function loadProfile() {
    const token = localStorage.getItem("access_token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${PROFILE_API}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) throw new Error("Failed to load profile");

        const data = await response.json();

        // Update text fields
        const profileIdEl = document.querySelector("#profileId");
        const profileUsernameEl = document.querySelector("#profileUsername");

        if (profileIdEl) profileIdEl.textContent = data.id;
        if (profileUsernameEl) profileUsernameEl.textContent = data.username;

        // Render the avatar
        renderAvatar(data.avatar_url, data.username);
    } catch (error) {
        console.error("Error loading profile:", error);
        showProfileMessage("Failed to load profile.", "error");
    }
}

// ---------- Avatar Upload ----------
if (chooseAvatarBtn && avatarInput) {
    chooseAvatarBtn.addEventListener("click", () => avatarInput.click());

    avatarInput.addEventListener("change", async () => {
        const file = avatarInput.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showProfileMessage("File too large (max 2 MB).", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("access_token");
        chooseAvatarBtn.disabled = true;
        chooseAvatarBtn.textContent = "Uploading…";

        try {
            const res = await fetch(`${PROFILE_API}/users/me/avatar`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                renderAvatar(data.avatar_url, data.username);
                showProfileMessage("Profile picture updated.", "success");
            } else if (res.status === 401) {
                localStorage.clear();
                window.location.href = "login.html";
            } else {
                const err = await res.json().catch(() => ({}));
                showProfileMessage(err.detail || "Upload failed.", "error");
            }
        } catch (error) {
            console.error("Avatar upload error:", error);
            showProfileMessage("Network error.", "error");
        } finally {
            chooseAvatarBtn.disabled = false;
            chooseAvatarBtn.textContent = "Choose picture";
            avatarInput.value = "";
        }
    });
}

// ---------- Username Form ----------
const usernameForm = document.querySelector("#usernameForm");
if (usernameForm) {
    usernameForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access_token");
        const newUsername = document.querySelector("#newUsername").value.trim();

        if (!newUsername) return;

        try {
            const response = await fetch(`${PROFILE_API}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username: newUsername }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                localStorage.setItem("username", data.username);
                const userNameEl = document.querySelector("#userName");
                const userAvatarEl = document.querySelector("#userAvatar");
                const displayName =
                    data.username.charAt(0).toUpperCase() +
                    data.username.slice(1);

                if (userNameEl) userNameEl.textContent = displayName;

                // If user has an avatar, keep it. Otherwise update the letter.
                if (
                    userAvatarEl &&
                    !userAvatarEl.style.backgroundImage.includes("url")
                ) {
                    userAvatarEl.textContent = data.username
                        .charAt(0)
                        .toUpperCase();
                }

                document.querySelector("#profileUsername").textContent =
                    data.username;
                usernameForm.reset();
                showProfileMessage("Username updated successfully.", "success");
            } else if (response.status === 409) {
                showProfileMessage("That username is already taken.", "error");
            } else if (response.status === 422) {
                showProfileMessage(
                    "Username must be 3–30 characters.",
                    "error",
                );
            } else if (response.status === 401) {
                localStorage.clear();
                window.location.href = "login.html";
            } else if (response.status === 400) {
                showProfileMessage("Nothing to update.", "error");
            } else {
                showProfileMessage("Could not update username.", "error");
            }
        } catch (error) {
            console.error("Error updating username:", error);
            showProfileMessage("Network error.", "error");
        }
    });
}

// ---------- Password Form ----------
const passwordForm = document.querySelector("#passwordForm");
if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access_token");
        const currentPassword =
            document.querySelector("#currentPassword").value;
        const newPassword = document.querySelector("#newPassword").value;
        const confirmPassword =
            document.querySelector("#confirmPassword").value;

        if (newPassword !== confirmPassword) {
            showProfileMessage("New passwords do not match.", "error");
            return;
        }

        if (newPassword.length < 8) {
            showProfileMessage(
                "Password must be at least 8 characters.",
                "error",
            );
            return;
        }

        try {
            const response = await fetch(`${PROFILE_API}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            if (response.ok) {
                passwordForm.reset();
                showProfileMessage("Password updated successfully.", "success");
            } else if (response.status === 401) {
                showProfileMessage("Current password is incorrect.", "error");
            } else if (response.status === 422) {
                showProfileMessage(
                    "Password must be 8–128 characters.",
                    "error",
                );
            } else {
                showProfileMessage("Could not update password.", "error");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            showProfileMessage("Network error.", "error");
        }
    });
}

// ---------- Initialize ----------
loadProfile();
