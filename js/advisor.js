const { advisors } = window.PortalData;
const messageBox = document.getElementById("advisor-message");
const requestBody = document.getElementById("request-table-body");
const filter = document.getElementById("advisor-filter");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message message-${type}`;
  messageBox.hidden = false;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}

function getAppointments() {
  return window.PortalData.loadAppointments(() => {
    showMessage("Appointment records could not be read. Please clear the portal's demonstration data and refresh.", "error");
  });
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function advisorFor(id) { return advisors.find((advisor) => advisor.id === id); }

function renderProfile() {
  const advisor = advisorFor(filter.value);
  document.getElementById("advisor-profile").innerHTML = `
    <span class="advisor-avatar">${advisor.initials}</span>
    <div><strong>${escapeHTML(advisor.name)}</strong><small>${escapeHTML(advisor.specialty)}</small><small>${escapeHTML(advisor.email)}</small></div>`;
}

function renderRequests() {
  const requests = getAppointments().filter((appointment) => appointment.advisorId === filter.value);
  const upcoming = requests.filter((appointment) => !["Rejected", "Cancelled"].includes(appointment.status) && appointment.date >= new Date().toISOString().slice(0, 10));
  document.getElementById("request-count").textContent = requests.length;
  document.getElementById("upcoming-count").textContent = upcoming.length;
  document.getElementById("pending-count").textContent = requests.filter((appointment) => appointment.status === "Pending").length;
  document.getElementById("empty-requests").hidden = requests.length > 0;
  requestBody.innerHTML = requests.map((appointment) => `
    <tr>
      <td>${escapeHTML(appointment.studentName)}</td>
      <td>${escapeHTML(appointment.studentId)}</td>
      <td>${escapeHTML(formatDate(appointment.date))}<br>${escapeHTML(appointment.time)}</td>
      <td>${escapeHTML(appointment.purpose)}</td>
      <td><span class="status status-${appointment.status.toLowerCase()}">${escapeHTML(appointment.status)}</span></td>
      <td><div class="request-actions">
        <button class="detail-button" type="button" data-action="view" data-id="${escapeHTML(appointment.id)}">View</button>
        ${appointment.status === "Pending" ? `<button class="button button-primary" type="button" data-action="accept" data-id="${escapeHTML(appointment.id)}">Accept</button><button class="button button-danger" type="button" data-action="reject" data-id="${escapeHTML(appointment.id)}">Reject</button>` : ""}
      </div></td>
    </tr>`).join("");
}

filter.innerHTML = advisors.map((advisor) => `<option value="${advisor.id}">${escapeHTML(advisor.name)}</option>`).join("");
filter.addEventListener("change", () => { renderProfile(); renderRequests(); });
requestBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const appointments = getAppointments();
  const appointment = appointments.find((record) => record.id === button.dataset.id);
  if (!appointment) {
    showMessage("That appointment could not be found. Refresh the page and try again.", "error");
    return;
  }

  if (button.dataset.action === "view") {
    const advisor = advisorFor(appointment.advisorId);
    const details = [
      ["Student", appointment.studentName],
      ["Student ID", appointment.studentId],
      ["Advisor", advisor ? advisor.name : "Unknown advisor"],
      ["Date", formatDate(appointment.date)],
      ["Time", appointment.time],
      ["Purpose", appointment.purpose],
      ["Status", appointment.status]
    ];
    document.getElementById("appointment-details").innerHTML = details.map(([label, value]) => `<dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd>`).join("");
    document.getElementById("appointment-dialog").showModal();
    return;
  }

  appointment.status = button.dataset.action === "accept" ? "Accepted" : "Rejected";
  if (window.PortalData.saveAppointments(appointments, () => {
    showMessage("Your changes could not be saved in this browser. Check storage availability and try again.", "error");
  })) {
    renderRequests();
    showMessage(`Appointment ${appointment.status.toLowerCase()}.`, "success");
  }
});

document.getElementById("close-dialog").addEventListener("click", () => document.getElementById("appointment-dialog").close());
document.getElementById("appointment-dialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
renderProfile();
renderRequests();
