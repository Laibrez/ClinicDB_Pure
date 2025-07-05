// Appointment Booking Management - Handles all appointment-related functionality
class AppointmentBookingManager {
  constructor() {
    this.currentView = 'list'; // 'list', 'book', 'details'
    this.selectedPatientId = null;
    this.selectedAppointmentId = null;
  }

  // Render appointment list view
  renderAppointmentList() {
    const appointments = window.clinicData.appointments;
    const stats = window.clinicData.getStatistics();
    
    return `
      <div class="appointment-dashboard">
        <div class="dashboard-header">
          <h2>📅 Appointment Management</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>${stats.totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>
            <div class="stat-card">
              <h3>${stats.completedAppointments}</h3>
              <p>Completed</p>
            </div>
            <div class="stat-card">
              <h3>${appointments.filter(a => a.status === 'Scheduled').length}</h3>
              <p>Scheduled</p>
            </div>
          </div>
        </div>

        <div class="actions-section">
          <button onclick="appointmentBooking.showBookingForm()" class="btn-success">
            ➕ Book New Appointment
          </button>
          <button onclick="appointmentBooking.showCalendarView()" class="btn-secondary">
            📅 Calendar View
          </button>
        </div>

        <div class="appointments-list">
          ${this.renderAppointmentsTable(appointments)}
        </div>
      </div>
    `;
  }

  // Render appointments table
  renderAppointmentsTable(appointments) {
    if (appointments.length === 0) {
      return `
        <div class="empty-state">
          <h3>No appointments found</h3>
          <p>Book your first appointment to get started</p>
          <button onclick="appointmentBooking.showBookingForm()" class="btn-primary">
            Book Appointment
          </button>
        </div>
      `;
    }

    // Sort appointments by date
    const sortedAppointments = appointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    return `
      <table class="appointments-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${sortedAppointments.map(appointment => this.renderAppointmentRow(appointment)).join('')}
        </tbody>
      </table>
    `;
  }

  // Render individual appointment row
  renderAppointmentRow(appointment) {
    const patient = window.clinicData.getPatient(appointment.patient_id);
    const doctor = window.clinicData.doctors.find(d => d.id == appointment.doctor_id);
    const appointmentDate = new Date(appointment.date);
    const isToday = appointmentDate.toDateString() === new Date().toDateString();
    const isPast = appointmentDate < new Date();

    return `
      <tr class="appointment-row ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}" data-appointment-id="${appointment.id}">
        <td>
          <div class="patient-info">
            <strong>${patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}</strong>
            <small>${patient ? patient.phone : ''}</small>
          </div>
        </td>
        <td>
          <div class="doctor-info">
            <strong>${doctor ? doctor.name : 'Unknown Doctor'}</strong>
            <small>${doctor ? doctor.specialty : ''}</small>
          </div>
        </td>
        <td>
          <div class="datetime-info">
            <strong>${appointmentDate.toLocaleDateString()}</strong>
            <small>${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
          </div>
        </td>
        <td>
          <span class="status-badge ${appointment.status.toLowerCase()}">${appointment.status}</span>
        </td>
        <td>
          <div class="notes-info">
            ${appointment.notes || 'No notes'}
          </div>
        </td>
        <td>
          <div class="action-buttons">
            <button onclick="appointmentBooking.viewAppointmentDetails(${appointment.id})" class="btn-small">
              👁️ View
            </button>
            <button onclick="appointmentBooking.editAppointment(${appointment.id})" class="btn-small btn-secondary">
              ✏️ Edit
            </button>
            <button onclick="appointmentBooking.cancelAppointment(${appointment.id})" class="btn-small btn-danger">
              ❌ Cancel
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Render booking form
  renderBookingForm(patientId = null) {
    const patients = window.clinicData.patients;
    const doctors = window.clinicData.doctors;
    
    return `
      <div class="form-container">
        <h2>📅 Book New Appointment</h2>
        <form onsubmit="appointmentBooking.handleBookAppointment(event)">
          <div class="form-grid">
            <div class="form-group">
              <label for="patientSelect">Patient *</label>
              <select id="patientSelect" required ${patientId ? 'disabled' : ''}>
                <option value="">Choose a patient...</option>
                ${patients.map(patient => `
                  <option value="${patient.patient_id}" ${patientId == patient.patient_id ? 'selected' : ''}>
                    ${patient.first_name} ${patient.last_name} - ${patient.city}
                  </option>
                `).join('')}
              </select>
              ${patientId ? `<input type="hidden" id="patientSelectHidden" value="${patientId}">` : ''}
            </div>

            <div class="form-group">
              <label for="doctorSelect">Doctor *</label>
              <select id="doctorSelect" required onchange="appointmentBooking.updatePriceEstimate()">
                <option value="">Choose a doctor...</option>
                ${doctors.map(doctor => `
                  <option value="${doctor.id}" data-specialty="${doctor.specialty}">
                    ${doctor.name} - ${doctor.specialty}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="appointmentDate">Date *</label>
              <input type="date" id="appointmentDate" required 
                     min="${new Date().toISOString().split('T')[0]}"
                     onchange="appointmentBooking.updateAvailableDoctors()">
            </div>

            <div class="form-group">
              <label for="appointmentTime">Time *</label>
              <input type="time" id="appointmentTime" required min="08:00" max="18:00">
            </div>

            <div class="form-group">
              <label for="appointmentType">Appointment Type</label>
              <select id="appointmentType" onchange="appointmentBooking.updatePriceEstimate()">
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="surgery">Surgery</option>
              </select>
            </div>

            <div class="form-group">
              <label for="priceEstimate">Estimated Price</label>
              <input type="text" id="priceEstimate" readonly value="$0.00">
            </div>
          </div>

          <div class="form-group">
            <label for="appointmentNotes">Notes</label>
            <textarea id="appointmentNotes" rows="3" placeholder="Any additional notes for this appointment..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" onclick="appointmentBooking.showAppointmentList()" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-success">
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // Render appointment details
  renderAppointmentDetails(appointmentId) {
    const appointment = window.clinicData.appointments.find(a => a.id == appointmentId);
    if (!appointment) return this.renderAppointmentList();

    const patient = window.clinicData.getPatient(appointment.patient_id);
    const doctor = window.clinicData.doctors.find(d => d.id == appointment.doctor_id);
    const appointmentDate = new Date(appointment.date);

    return `
      <div class="appointment-details">
        <div class="details-header">
          <button onclick="appointmentBooking.showAppointmentList()" class="btn-secondary">
            ← Back to Appointments
          </button>
          <h2>📅 Appointment Details</h2>
          <div class="appointment-actions">
            <button onclick="appointmentBooking.editAppointment(${appointmentId})" class="btn-secondary">
              ✏️ Edit
            </button>
            <button onclick="appointmentBooking.cancelAppointment(${appointmentId})" class="btn-danger">
              ❌ Cancel
            </button>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-card">
            <h3>📋 Appointment Information</h3>
            <div class="info-grid">
              <div><strong>Appointment ID:</strong> ${appointment.id}</div>
              <div><strong>Date:</strong> ${appointmentDate.toLocaleDateString()}</div>
              <div><strong>Time:</strong> ${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              <div><strong>Status:</strong> <span class="status-badge ${appointment.status.toLowerCase()}">${appointment.status}</span></div>
              <div><strong>Type:</strong> ${appointment.appointmentType || 'Consultation'}</div>
              <div><strong>Created:</strong> ${new Date(appointment.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="details-card">
            <h3>👤 Patient Information</h3>
            <div class="info-grid">
              <div><strong>Name:</strong> ${patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}</div>
              <div><strong>Email:</strong> ${patient ? patient.email : 'N/A'}</div>
              <div><strong>Phone:</strong> ${patient ? patient.phone : 'N/A'}</div>
              <div><strong>City:</strong> ${patient ? patient.city : 'N/A'}</div>
            </div>
          </div>

          <div class="details-card">
            <h3>👨‍⚕️ Doctor Information</h3>
            <div class="info-grid">
              <div><strong>Name:</strong> ${doctor ? doctor.name : 'Unknown'}</div>
              <div><strong>Specialty:</strong> ${doctor ? doctor.specialty : 'N/A'}</div>
              <div><strong>Availability:</strong> ${doctor ? doctor.availability.join(', ') : 'N/A'}</div>
            </div>
          </div>
        </div>

        <div class="notes-section">
          <h3>📝 Notes</h3>
          <div class="notes-content">
            ${appointment.notes || 'No notes available for this appointment.'}
          </div>
        </div>

        <div class="actions-section">
          <button onclick="paymentCapture.showPaymentForm(${appointment.patient_id}, ${appointment.id})" class="btn-primary">
            💳 Process Payment
          </button>
          <button onclick="appointmentBooking.sendReminder(${appointmentId})" class="btn-secondary">
            📧 Send Reminder
          </button>
        </div>
      </div>
    `;
  }

  // Event handlers
  handleBookAppointment(event) {
    event.preventDefault();
    
    const patientId = document.getElementById('patientSelectHidden')?.value || document.getElementById('patientSelect').value;
    const doctorId = document.getElementById('doctorSelect').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const appointmentType = document.getElementById('appointmentType').value;
    const notes = document.getElementById('appointmentNotes').value;

    if (!patientId || !doctorId || !date || !time) {
      alert('Please fill in all required fields');
      return;
    }

    const appointmentData = {
      patient_id: parseInt(patientId),
      doctor_id: parseInt(doctorId),
      date: `${date}T${time}`,
      appointmentType: appointmentType,
      notes: notes,
      status: 'Scheduled'
    };

    window.clinicData.addAppointment(appointmentData);
    this.showAppointmentList();
  }

  // Utility methods
  updatePriceEstimate() {
    const doctorSelect = document.getElementById('doctorSelect');
    const appointmentType = document.getElementById('appointmentType').value;
    const priceEstimate = document.getElementById('priceEstimate');
    
    if (doctorSelect.value) {
      const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];
      const specialty = selectedOption.dataset.specialty;
      const price = window.clinicData.calculatePriceEstimate(specialty, appointmentType);
      priceEstimate.value = `$${price.toFixed(2)}`;
    } else {
      priceEstimate.value = '$0.00';
    }
  }

  updateAvailableDoctors() {
    const date = document.getElementById('appointmentDate').value;
    const doctorSelect = document.getElementById('doctorSelect');
    const availableDoctors = window.clinicData.getAvailableDoctors(date);
    
    // Reset and populate with available doctors
    doctorSelect.innerHTML = '<option value="">Choose a doctor...</option>';
    availableDoctors.forEach(doctor => {
      const option = document.createElement('option');
      option.value = doctor.id;
      option.dataset.specialty = doctor.specialty;
      option.textContent = `${doctor.name} - ${doctor.specialty}`;
      doctorSelect.appendChild(option);
    });
  }

  // Navigation methods
  showAppointmentList() {
    this.currentView = 'list';
    const root = document.getElementById('root');
    root.innerHTML = this.renderAppointmentList();
  }

  showBookingForm(patientId = null) {
    this.currentView = 'book';
    this.selectedPatientId = patientId;
    const root = document.getElementById('root');
    root.innerHTML = this.renderBookingForm(patientId);
  }

  viewAppointmentDetails(appointmentId) {
    this.currentView = 'details';
    this.selectedAppointmentId = appointmentId;
    const root = document.getElementById('root');
    root.innerHTML = this.renderAppointmentDetails(appointmentId);
  }

  editAppointment(appointmentId) {
    // For now, redirect to booking form with pre-filled data
    // In a full implementation, you'd create an edit form
    alert('Edit functionality will be implemented in the next version');
  }

  cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      window.clinicData.cancelAppointment(appointmentId);
      this.showAppointmentList();
    }
  }

  sendReminder(appointmentId) {
    alert('Reminder sent successfully! (This would integrate with email/SMS service)');
  }

  showCalendarView() {
    alert('Calendar view will be implemented in the next version');
  }
}

// Create global instance
window.appointmentBooking = new AppointmentBookingManager();