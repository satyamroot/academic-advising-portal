const { advisors } = window.PortalData;

const bookingForm = document.getElementById("booking-form");
const appointmentBody = document.getElementById("appointment-table-body");
const studentMessage = document.getElementById("student-message");

function readAppointments() {
  return window.PortalData.loadAppointments(() => {
    showMessage("Appointment records could not be read. Please clear the portal's demonstration data and refresh.", "error");
  });
}

function saveAppointments(records) {
  return window.PortalData.saveAppointments(records, () => {
    showMessage("Your changes could not be saved in this browser. Check storage availability and try again.", "error");
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}

function showMessage(text, type) {
  studentMessage.textContent = text;
  studentMessage.className = `message message-${type}`;
  studentMessage.hidden = false;
}

function advisorFor(id) {
  return advisors.find((advisor) => advisor.id === id);
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isUpcoming(appointment) {
  return appointment.status !== "Rejected" && appointment.status !== "Cancelled" && appointment.date >= new Date().toISOString().slice(0, 10);
}

function renderAdvisors() {
  document.getElementById("advisor-count").textContent = advisors.length;
  document.getElementById("advisor-select").innerHTML = '<option value="">Choose an advisor</option>' +
    advisors.map((advisor) => `<option value="${advisor.id}">${escapeHTML(advisor.name)} — ${escapeHTML(advisor.specialty)}</option>`).join("");
  document.getElementById("advisor-list").innerHTML = advisors.map((advisor) => `
    <div class="advisor-card">
      <span class="advisor-avatar" aria-hidden="true">${advisor.initials}</span>
      <div><strong>${escapeHTML(advisor.name)}</strong><small>${escapeHTML(advisor.specialty)}</small><small>${escapeHTML(advisor.email)}</small></div>
    </div>`).join("");
}

function renderAppointments() {
  const allAppointments = readAppointments();
  const studentId = document.getElementById("student-id").value.trim().toLowerCase();
  const studentAppointments = studentId
    ? allAppointments.filter((appointment) => String(appointment.studentId).toLowerCase() === studentId)
    : allAppointments.filter((appointment) => appointment.studentId === "S1001");

  document.getElementById("total-appointments").textContent = studentAppointments.length;
  document.getElementById("upcoming-appointments").textContent = studentAppointments.filter(isUpcoming).length;
  document.getElementById("empty-appointments").hidden = studentAppointments.length > 0;
  appointmentBody.innerHTML = studentAppointments.map((appointment) => {
    const advisor = advisorFor(appointment.advisorId);
    const statusClass = appointment.status.toLowerCase();
    return `<tr>
      <td>${escapeHTML(advisor ? advisor.name : "Unknown advisor")}</td>
      <td>${escapeHTML(formatDate(appointment.date))}<br>${escapeHTML(appointment.time)}</td>
      <td>${escapeHTML(appointment.purpose)}</td>
      <td><span class="status status-${statusClass}">${escapeHTML(appointment.status)}</span></td>
      <td>${appointment.status === "Pending" || appointment.status === "Accepted"
        ? `<button class="button button-danger cancel-button" type="button" data-appointment-id="${escapeHTML(appointment.id)}">Cancel</button>`
        : "—"}</td>
    </tr>`;
  }).join("");
}

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;

  const formData = new FormData(bookingForm);
  const appointment = {
    id: `APT-${Date.now()}`,
    studentName: String(formData.get("studentName")).trim(),
    studentId: String(formData.get("studentId")).trim(),
    advisorId: String(formData.get("advisorId")),
    date: String(formData.get("date")),
    time: String(formData.get("time")),
    purpose: String(formData.get("purpose")).trim(),
    status: "Pending",
    createdAt: new Date().toISOString()
  };
  const allAppointments = readAppointments();
  allAppointments.push(appointment);
  if (!saveAppointments(allAppointments)) return;
  bookingForm.reset();
  document.getElementById("student-id").value = appointment.studentId;
  document.getElementById("appointment-date").min = new Date().toISOString().slice(0, 10);
  renderAppointments();
  showMessage("Appointment request submitted. It is now visible in the advisor dashboard.", "success");
});

document.getElementById("student-id").addEventListener("input", renderAppointments);
appointmentBody.addEventListener("click", (event) => {
  const button = event.target.closest(".cancel-button");
  if (!button) return;
  const appointments = readAppointments();
  const appointment = appointments.find((record) => record.id === button.dataset.appointmentId);
  if (!appointment) {
    showMessage("That appointment could not be found. Refresh the page and try again.", "error");
    return;
  }
  appointment.status = "Cancelled";
  if (saveAppointments(appointments)) {
    renderAppointments();
    showMessage("Appointment cancelled.", "success");
  }
});

document.getElementById("appointment-date").min = new Date().toISOString().slice(0, 10);
renderAdvisors();
renderAppointments();
