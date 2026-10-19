// ---------- Auth guard ----------
if (!localStorage.getItem("access_token")) {
    window.location.href = "login.html";
}

// ---------- Populate user info & Avatar ----------
const username = localStorage.getItem("username") || "Student";
const displayName = username.charAt(0).toUpperCase() + username.slice(1);

const userAvatar = document.querySelector("#userAvatar");
const userName = document.querySelector("#userName");
const welcomeHeading = document.querySelector("#welcomeHeading");
const todayDateEl = document.querySelector("#todayDate");

if (userName) userName.textContent = displayName;
if (welcomeHeading) welcomeHeading.textContent = `Welcome back, ${displayName}`;
if (todayDateEl) {
    const now = new Date();
    todayDateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
}

// Fetch user profile to get the avatar URL
const API_BASE = `http://${window.location.hostname}:8000`;
if (userAvatar) {
    const token = localStorage.getItem("access_token");
    if (token) {
        fetch(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data && data.avatar_url) {
                    userAvatar.style.backgroundImage = `url(${API_BASE}${data.avatar_url})`;
                    userAvatar.style.backgroundSize = "cover";
                    userAvatar.style.backgroundPosition = "center";
                    userAvatar.textContent = "";
                } else {
                    userAvatar.textContent = username.charAt(0).toUpperCase();
                }
            })
            .catch(() => {
                userAvatar.textContent = username.charAt(0).toUpperCase();
            });
    } else {
        userAvatar.textContent = username.charAt(0).toUpperCase();
    }
}

// ---------- Sidebar toggle ----------
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

if (menuToggle) {
    menuToggle.addEventListener("click", function () {
        if (sidebar.classList.contains("open")) closeSidebar();
        else openSidebar();
    });
}
if (overlay) {
    overlay.addEventListener("click", closeSidebar);
}

const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
    link.addEventListener("click", () => closeSidebar());
});

// ---------- Logout ----------
const logoutBtn = document.querySelector("#logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("user_id");
        localStorage.removeItem("username");
        window.location.href = "login.html";
    });
}

// ---------- Shared Helpers ----------
function formatTimeAgo(dateString) {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

// ---------- Announcements ----------
async function loadAnnouncements() {
    const feed = document.querySelector("#announcementsFeed");
    if (!feed) return;

    const currentUserId = parseInt(localStorage.getItem("user_id"), 10);
    const token = localStorage.getItem("access_token");

    try {
        const response = await fetch(`${API_BASE}/announcements/`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        const statEl = document.querySelector(
            '[data-stat="announcements"] .stat-value',
        );
        if (statEl) statEl.textContent = data.length;

        if (data.length === 0) {
            feed.innerHTML = `<li class="announcement" style="color:#6b7280;font-size:0.9rem;">No announcements yet.</li>`;
            return;
        }

        const isHomePage =
            window.location.pathname.includes("home.html") ||
            window.location.pathname === "/";
        const displayData = isHomePage ? data.slice(0, 3) : data;

        feed.innerHTML = displayData
            .map((ann) => {
                const canDelete = token && ann.author_id === currentUserId;
                return `
                <li class="announcement" data-id="${ann.id}">
                    <div class="announcement-meta-row">
                        <span class="ann-source">${ann.author_username || "Unknown"}</span>
                        <span class="ann-date">${formatTimeAgo(ann.created_at)}</span>
                    </div>
                    <p class="announcement-title">${ann.title}</p>
                    <p class="announcement-body">${ann.body}</p>
                    ${canDelete ? `<button class="btn-delete-ann" data-id="${ann.id}">🗑 Delete</button>` : ""}
                </li>
                `;
            })
            .join("");

        feed.querySelectorAll(".btn-delete-ann").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (
                    !confirm("Delete this announcement? This cannot be undone.")
                )
                    return;

                try {
                    const res = await fetch(`${API_BASE}/announcements/${id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (res.ok) loadAnnouncements();
                    else if (res.status === 401) {
                        alert("Session expired. Please log in again.");
                        localStorage.clear();
                        window.location.href = "login.html";
                    } else if (res.status === 403) {
                        alert("You can only delete your own announcements.");
                    } else if (res.status === 404) {
                        alert("Announcement not found. Refreshing…");
                        loadAnnouncements();
                    } else alert("Could not delete. Try again.");
                } catch (err) {
                    console.error(err);
                    alert("Network error.");
                }
            });
        });
    } catch (error) {
        console.error("Error loading announcements:", error);
        feed.innerHTML = `<li class="announcement" style="color:#ef4444;font-size:0.9rem;">Failed to load announcements. Is the backend running?</li>`;
    }
}

// Announcement form (only on announcements.html)
const createForm = document.querySelector("#createAnnouncementForm");
if (createForm) {
    createForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.querySelector("#annTitle").value.trim();
        const body = document.querySelector("#annBody").value.trim();
        const token = localStorage.getItem("access_token");

        if (!token) {
            alert("You must be logged in to post.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/announcements/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, body }),
            });

            if (response.ok) {
                createForm.reset();
                loadAnnouncements();
            } else if (response.status === 401) {
                alert("Session expired. Please log in again.");
                localStorage.removeItem("access_token");
                window.location.href = "login.html";
            } else {
                const err = await response.json().catch(() => ({}));
                alert(`Error: ${err.detail || "Could not post announcement"}`);
            }
        } catch (error) {
            console.error("Error posting:", error);
            alert("Network error.");
        }
    });
}

// ---------- Assignments ----------
function renderAssignmentRow(a, showDelete, token, currentUserId) {
    const due = new Date(a.due_date);
    const day = due.getDate().toString().padStart(2, "0");
    const month = due.toLocaleString("en", { month: "short" }).toUpperCase();
    const time = due.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    const now = new Date();
    const diffHours = (due - now) / (1000 * 60 * 60);
    let pill = "";
    if (diffHours < 0)
        pill = `<span class="status-pill pill-danger">Overdue</span>`;
    else if (diffHours < 24)
        pill = `<span class="status-pill pill-warning">Due today</span>`;
    else if (diffHours < 72)
        pill = `<span class="status-pill pill-info">Due soon</span>`;

    const canDelete = showDelete && token && a.author_id === currentUserId;

    return `
        <li class="list-item" data-id="${a.id}">
            <div class="date-block">
                <span class="date-day">${day}</span>
                <span class="date-month">${month}</span>
            </div>
            <div class="item-body">
                <p class="item-title">${a.title}</p>
                <p class="item-meta">${a.course_code} · ${time} · by ${a.author_username}</p>
            </div>
            ${pill}
            ${canDelete ? `<button class="btn-delete-ann btn-delete-asg" data-id="${a.id}" style="margin-left: 0.5rem;">🗑</button>` : ""}
        </li>
    `;
}

async function loadAssignments() {
    const feed = document.querySelector("#assignmentsFeed");
    const dashFeed = document.querySelector("#deadlinesFeed");
    if (!feed && !dashFeed) return;

    const currentUserId = parseInt(localStorage.getItem("user_id"), 10);
    const token = localStorage.getItem("access_token");

    try {
        const response = await fetch(`${API_BASE}/assignments/`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const dueThisWeek = data.filter(
            (a) => new Date(a.due_date) <= weekFromNow,
        ).length;
        const statEl = document.querySelector(
            '[data-stat="assignments"] .stat-value',
        );
        if (statEl) statEl.textContent = dueThisWeek;

        if (dashFeed) {
            if (data.length === 0) {
                dashFeed.innerHTML = `<li class="list-item" style="color:#6b7280;font-size:0.85rem;">No assignments yet.</li>`;
            } else {
                dashFeed.innerHTML = data
                    .slice(0, 2)
                    .map((a) =>
                        renderAssignmentRow(a, false, token, currentUserId),
                    )
                    .join("");
            }
        }

        if (feed) {
            if (data.length === 0) {
                feed.innerHTML = `<li class="list-item" style="color:#6b7280;font-size:0.9rem;">No assignments yet. Add one above!</li>`;
            } else {
                feed.innerHTML = data
                    .map((a) =>
                        renderAssignmentRow(a, true, token, currentUserId),
                    )
                    .join("");

                feed.querySelectorAll(".btn-delete-asg").forEach((btn) => {
                    btn.addEventListener("click", async () => {
                        const id = btn.dataset.id;
                        if (!confirm("Delete this assignment?")) return;
                        try {
                            const res = await fetch(
                                `${API_BASE}/assignments/${id}`,
                                {
                                    method: "DELETE",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                },
                            );
                            if (res.ok) loadAssignments();
                            else if (res.status === 403)
                                alert(
                                    "You can only delete your own assignments.",
                                );
                            else if (res.status === 401) {
                                localStorage.clear();
                                window.location.href = "login.html";
                            } else alert("Could not delete.");
                        } catch (err) {
                            console.error(err);
                            alert("Network error.");
                        }
                    });
                });
            }
        }
    } catch (error) {
        console.error("Error loading assignments:", error);
        if (feed)
            feed.innerHTML = `<li class="list-item" style="color:#ef4444;font-size:0.9rem;">Failed to load assignments.</li>`;
        if (dashFeed)
            dashFeed.innerHTML = `<li class="list-item" style="color:#ef4444;font-size:0.85rem;">Failed to load.</li>`;
    }
}

// Assignment form (only on assignments.html)
const asgForm = document.querySelector("#createAssignmentForm");
if (asgForm) {
    asgForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.querySelector("#asgTitle").value.trim();
        const description = document.querySelector("#asgDesc").value.trim();
        const course_code = document.querySelector("#asgCourse").value.trim();
        const dueRaw = document.querySelector("#asgDue").value;

        if (!dueRaw) {
            alert("Please set a due date.");
            return;
        }

        const due_date = new Date(dueRaw).toISOString();

        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("You must be logged in.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/assignments/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    course_code,
                    due_date,
                }),
            });

            if (response.ok) {
                asgForm.reset();
                loadAssignments();
            } else if (response.status === 401) {
                localStorage.clear();
                window.location.href = "login.html";
            } else {
                const err = await response.json().catch(() => ({}));
                alert(`Error: ${err.detail || "Could not create assignment"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Network error.");
        }
    });
}

// ---------- Load data on page load ----------
loadAnnouncements();
loadAssignments();
