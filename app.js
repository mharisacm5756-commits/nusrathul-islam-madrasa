// ==========================================
// NUSRATHUL ISLAM MADRASA
// Daily Habit Tracker
// Frontend Application
// ==========================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbx-nBChl4X7ArI6qOxHu6XqZW-lvF66bJMPHy9EHXw3VQd84yMpSFyGjpJb2dhflQeuYA/exec";

let currentSession = null;

// ==========================================
// API REQUEST
// ==========================================

async function apiRequest(action, data = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: action,
        ...data
      })
    });

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {
      console.error("Invalid JSON response:", text);
      throw new Error("Server response ശരിയായ format-ൽ അല്ല.");
    }

    if (result.success === false) {
      throw new Error(result.message || "Request failed.");
    }

    return result;

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// ==========================================
// LOCAL STORAGE
// ==========================================

function saveSession(session) {
  localStorage.setItem(
    "nusrathul_islam_session",
    JSON.stringify(session)
  );

  currentSession = session;
}

function getSession() {
  try {
    const saved = localStorage.getItem(
      "nusrathul_islam_session"
    );

    if (!saved) return null;

    return JSON.parse(saved);

  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(
    "nusrathul_islam_session"
  );

  currentSession = null;
}

// ==========================================
// UI HELPERS
// ==========================================

function showLoading(message = "Loading...") {
  const overlay = document.getElementById("loadingOverlay");

  if (overlay) {
    overlay.style.display = "flex";

    const text = overlay.querySelector(".loading-text");

    if (text) {
      text.textContent = message;
    }
  }
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");

  if (overlay) {
    overlay.style.display = "none";
  }
}

function showMessage(message, type = "success") {
  const container =
    document.getElementById("messageContainer");

  if (!container) {
    alert(message);
    return;
  }

  container.innerHTML = "";

  const messageBox = document.createElement("div");

  messageBox.className =
    "message-box " + type;

  messageBox.textContent = message;

  container.appendChild(messageBox);

  setTimeout(() => {
    messageBox.remove();
  }, 4000);
}

// ==========================================
// PAGE SWITCHING
// ==========================================

function showLoginPage() {
  const loginPage =
    document.getElementById("loginPage");

  const studentDashboard =
    document.getElementById("studentDashboard");

  const adminDashboard =
    document.getElementById("adminDashboard");

  if (loginPage) {
    loginPage.style.display = "block";
  }

  if (studentDashboard) {
    studentDashboard.style.display = "none";
  }

  if (adminDashboard) {
    adminDashboard.style.display = "none";
  }
}

function showStudentDashboard() {
  const loginPage =
    document.getElementById("loginPage");

  const studentDashboard =
    document.getElementById("studentDashboard");

  const adminDashboard =
    document.getElementById("adminDashboard");

  if (loginPage) {
    loginPage.style.display = "none";
  }

  if (studentDashboard) {
    studentDashboard.style.display = "block";
  }

  if (adminDashboard) {
    adminDashboard.style.display = "none";
  }
}

function showAdminDashboard() {
  const loginPage =
    document.getElementById("loginPage");

  const studentDashboard =
    document.getElementById("studentDashboard");

  const adminDashboard =
    document.getElementById("adminDashboard");

  if (loginPage) {
    loginPage.style.display = "none";
  }

  if (studentDashboard) {
    studentDashboard.style.display = "none";
  }

  if (adminDashboard) {
    adminDashboard.style.display = "block";
  }
}

// ==========================================
// LOGIN
// ==========================================

async function handleLogin(event) {
  event.preventDefault();

  const usernameElement =
    document.getElementById("username");

  const passwordElement =
    document.getElementById("password");

  const roleElement =
    document.getElementById("loginRole");

  if (!usernameElement || !passwordElement) {
    return;
  }

  const username =
    usernameElement.value.trim();

  const password =
    passwordElement.value.trim();

  const role =
    roleElement
      ? roleElement.value
      : "student";

  if (!username || !password) {
    showMessage(
      "Username, Student ID അല്ലെങ്കിൽ Password നൽകുക.",
      "error"
    );

    return;
  }

  try {
    showLoading("Login ചെയ്യുന്നു...");

    let result;

    if (role === "admin") {

      result = await apiRequest(
        "loginAdmin",
        {
          username: username,
          password: password
        }
      );

    } else {

      result = await apiRequest(
        "loginStudent",
        {
          username: username,
          password: password
        }
      );
    }

    const session =
      result.data || result;

    saveSession(session);

    showMessage(
      "Login വിജയിച്ചു.",
      "success"
    );

    if (role === "admin") {

      showAdminDashboard();

      await loadAdminDashboard();

    } else {

      showStudentDashboard();

      await loadStudentDashboard();
    }

  } catch (error) {

    console.error(error);

    showMessage(
      error.message ||
      "Login ചെയ്യാൻ കഴിഞ്ഞില്ല.",
      "error"
    );

  } finally {

    hideLoading();
  }
}

// ==========================================
// STUDENT DASHBOARD
// ==========================================

async function loadStudentDashboard() {

  if (!currentSession) return;

  try {

    showLoading(
      "Student dashboard loading..."
    );

    const studentId =
      currentSession.studentId ||
      currentSession.StudentID ||
      currentSession.id;

    if (!studentId) {
      throw new Error(
        "Student ID session-ൽ ലഭ്യമല്ല."
      );
    }

    const result =
      await apiRequest(
        "getStudentDashboard",
        {
          studentId: studentId
        }
      );

    const data =
      result.data || result;

    renderStudentDashboard(data);

  } catch (error) {

    console.error(error);

    showMessage(
      error.message ||
      "Dashboard load ചെയ്യാൻ കഴിഞ്ഞില്ല.",
      "error"
    );

  } finally {

    hideLoading();
  }
}

// ==========================================
// RENDER STUDENT DASHBOARD
// ==========================================

function renderStudentDashboard(data) {

  if (!data) return;

  const student =
    data.student || {};

  const today =
    data.today || {};

  const stats =
    data.stats || {};

  const nameElement =
    document.getElementById("studentName");

  if (nameElement) {

    nameElement.textContent =
      student.studentName ||
      student.name ||
      currentSession.studentName ||
      "Student";
  }

  const todayScoreElement =
    document.getElementById("todayScore");

  if (todayScoreElement) {

    todayScoreElement.textContent =
      today.totalScore ??
      stats.todayScore ??
      0;
  }

  const streakElement =
    document.getElementById("currentStreak");

  if (streakElement) {

    streakElement.textContent =
      stats.currentStreak ??
      data.currentStreak ??
      0;
  }

  const bestStreakElement =
    document.getElementById("bestStreak");

  if (bestStreakElement) {

    bestStreakElement.textContent =
      stats.bestStreak ??
      data.bestStreak ??
      0;
  }

  const activeDaysElement =
    document.getElementById("activeDays");

  if (activeDaysElement) {

    activeDaysElement.textContent =
      stats.activeDays ??
      data.activeDays ??
      0;
  }

  const monthlyAverageElement =
    document.getElementById("monthlyAverage");

  if (monthlyAverageElement) {

    monthlyAverageElement.textContent =
      stats.monthlyAverage ??
      data.monthlyAverage ??
      0;
  }
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

async function loadAdminDashboard() {

  if (!currentSession) return;

  try {

    showLoading(
      "Admin dashboard loading..."
    );

    const result =
      await apiRequest(
        "getAdminDashboard",
        {
          username:
            currentSession.username ||
            currentSession.Username ||
            ""
        }
      );

    const data =
      result.data || result;

    renderAdminDashboard(data);

  } catch (error) {

    console.error(error);

    showMessage(
      error.message ||
      "Admin dashboard load ചെയ്യാൻ കഴിഞ്ഞില്ല.",
      "error"
    );

  } finally {

    hideLoading();
  }
}

// ==========================================
// RENDER ADMIN DASHBOARD
// ==========================================

function renderAdminDashboard(data) {

  if (!data) return;

  const stats =
    data.stats ||
    data.summary ||
    {};

  const totalStudentsElement =
    document.getElementById(
      "totalStudents"
    );

  if (totalStudentsElement) {

    totalStudentsElement.textContent =
      stats.totalStudents ??
      data.totalStudents ??
      0;
  }

  const todaySubmittedElement =
    document.getElementById(
      "todaySubmitted"
    );

  if (todaySubmittedElement) {

    todaySubmittedElement.textContent =
      stats.todaySubmitted ??
      data.todaySubmitted ??
      0;
  }

  const todayAverageElement =
    document.getElementById(
      "todayAverage"
    );

  if (todayAverageElement) {

    todayAverageElement.textContent =
      stats.todayAverage ??
      data.todayAverage ??
      0;
  }

  const activeStreakStudentsElement =
    document.getElementById(
      "activeStreakStudents"
    );

  if (activeStreakStudentsElement) {

    activeStreakStudentsElement.textContent =
      stats.activeStreakStudents ??
      data.activeStreakStudents ??
      0;
  }
}

// ==========================================
// LOGOUT
// ==========================================

function logout() {

  clearSession();

  showLoginPage();

  const username =
    document.getElementById("username");

  const password =
    document.getElementById("password");

  if (username) {
    username.value = "";
  }

  if (password) {
    password.value = "";
  }

  showMessage(
    "Logout വിജയിച്ചു.",
    "success"
  );
}

// ==========================================
// RESTORE SESSION
// ==========================================

async function restoreSession() {

  const session =
    getSession();

  if (!session) {

    showLoginPage();

    return;
  }

  currentSession =
    session;

  try {

    if (
      session.role === "admin" ||
      session.Role === "Admin" ||
      session.userType === "admin"
    ) {

      showAdminDashboard();

      await loadAdminDashboard();

    } else {

      showStudentDashboard();

      await loadStudentDashboard();
    }

  } catch (error) {

    console.error(
      "Session restore error:",
      error
    );

    clearSession();

    showLoginPage();
  }
}

// ==========================================
// LOGIN ROLE
// ==========================================

function setupLoginRole() {

  const roleButtons =
    document.querySelectorAll(
      "[data-role]"
    );

  const roleInput =
    document.getElementById(
      "loginRole"
    );

  roleButtons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function() {

          const role =
            button.dataset.role;

          if (roleInput) {
            roleInput.value = role;
          }

          roleButtons.forEach(
            function(item) {
              item.classList.remove(
                "active"
              );
            }
          );

          button.classList.add(
            "active"
          );
        }
      );
    }
  );
}

// ==========================================
// EVENT LISTENERS
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    setupLoginRole();

    const loginForm =
      document.getElementById(
        "loginForm"
      );

    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        handleLogin
      );
    }

    const logoutButtons =
      document.querySelectorAll(
        "[data-action='logout']"
      );

    logoutButtons.forEach(
      function(button) {

        button.addEventListener(
          "click",
          logout
        );
      }
    );

    restoreSession();
  }
);
