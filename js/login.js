const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!username || !password || !role) {
    loginError.textContent = "Please enter a username, password, and select a role.";
    loginError.hidden = false;
    return;
  }

  const destinations = {
    student: "student.html",
    advisor: "advisor.html",
    administrator: "admin.html"
  };
  window.location.href = destinations[role];
});
