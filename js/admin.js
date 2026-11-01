const { advisors } = window.PortalData;
const adminMessage = document.getElementById("admin-message");

function showMessage(text) {
  adminMessage.textContent = text;
  adminMessage.className = "message message-error";
  adminMessage.hidden = false;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}

function getAppointments() {
  return window.PortalData.loadAppointments(() => {
    showMessage("Appointment records could not be read. Please clear the portal's demonstration data and refresh.");
  });
}

function advisorFor(id) { return advisors.find((advisor) => advisor.id === id); }
function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function renderDirectory() {
  document.getElementById("admin-advisor-list").innerHTML = advisors.map((advisor) => `
    <div class="directory-item"><span class="advisor-avatar">${advisor.initials}</span><div><strong>${escapeHTML(advisor.name)}</strong><small>${escapeHTML(advisor.specialty)} · ${escapeHTML(advisor.email)}</small></div></div>`).join("");
}

function renderAppointments() {
  const appointments = getAppointments();
  const students = new Map();
  appointments.forEach((appointment) => {
    if (!students.has(appointment.studentId)) students.set(appointment.studentId, appointment.studentName);
  });
  document.getElementById("student-count").textContent = students.size;
  document.getElementById("advisor-count").textContent = advisors.length;
  document.getElementById("appointment-count").textContent = appointments.length;
  document.getElementById("empty-admin").hidden = appointments.length > 0;
  document.getElementById("admin-table-body").innerHTML = appointments.map((appointment) => {
    const advisor = advisorFor(appointment.advisorId);
    return `<tr>
      <td>${escapeHTML(appointment.studentName)}</td>
      <td>${escapeHTML(appointment.studentId)}</td>
      <td>${escapeHTML(advisor ? advisor.name : "Unknown advisor")}</td>
      <td>${escapeHTML(formatDate(appointment.date))}<br>${escapeHTML(appointment.time)}</td>
      <td>${escapeHTML(appointment.purpose)}</td>
      <td><span class="status status-${appointment.status.toLowerCase()}">${escapeHTML(appointment.status)}</span></td>
    </tr>`;
  }).join("");
  document.getElementById("admin-student-list").innerHTML = [...students.entries()].map(([studentId, studentName]) => `
    <div class="directory-item"><span class="advisor-avatar">${escapeHTML(studentName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase())}</span><div><strong>${escapeHTML(studentName)}</strong><small>Student ID: ${escapeHTML(studentId)}</small></div></div>`).join("") ||
      '<p class="empty-state">No student records available yet.</p>';
}

renderDirectory();
renderAppointments();
