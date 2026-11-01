// Shared sample data and LocalStorage helpers keep all dashboards in sync.
(function () {
  const storageKey = "academicAdvisingAppointments";
  const advisors = [
    { id: "ADV001", name: "Dr. Maya Chen", specialty: "Degree planning & course selection", email: "maya.chen@example.edu", initials: "MC" },
    { id: "ADV002", name: "Prof. Daniel Brooks", specialty: "Academic success & study strategies", email: "daniel.brooks@example.edu", initials: "DB" },
    { id: "ADV003", name: "Dr. Aisha Patel", specialty: "Career pathways & major exploration", email: "aisha.patel@example.edu", initials: "AP" }
  ];
  const sampleAppointments = [
    { id: "DEMO-1001", studentName: "Jordan Lee", studentId: "S1001", advisorId: "ADV001", date: "2027-01-19", time: "10:00 AM", purpose: "Review next semester course options", status: "Accepted", createdAt: "2026-10-25T10:00:00.000Z" },
    { id: "DEMO-1002", studentName: "Taylor Morgan", studentId: "S1002", advisorId: "ADV002", date: "2027-01-21", time: "02:00 PM", purpose: "Discuss study strategies", status: "Pending", createdAt: "2026-10-26T10:00:00.000Z" },
    { id: "DEMO-1003", studentName: "Riley Carter", studentId: "S1003", advisorId: "ADV003", date: "2027-01-23", time: "11:00 AM", purpose: "Explore major and career options", status: "Pending", createdAt: "2026-10-27T10:00:00.000Z" }
  ];

  function loadAppointments(onError) {
    try {
      const savedRecords = localStorage.getItem(storageKey);
      if (savedRecords === null) {
        localStorage.setItem(storageKey, JSON.stringify(sampleAppointments));
        return sampleAppointments;
      }
      const records = JSON.parse(savedRecords);
      if (!Array.isArray(records)) throw new Error("Appointment data is not a list.");
      return records;
    } catch (error) {
      onError(error);
      console.error("Unable to read or initialize appointment records:", error);
      return [];
    }
  }

  function saveAppointments(records, onError) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
      return true;
    } catch (error) {
      onError(error);
      console.error("Unable to save appointment records:", error);
      return false;
    }
  }

  window.PortalData = { advisors, loadAppointments, saveAppointments };
}());
