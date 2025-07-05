// Patient Profile Management - Handles all patient-related functionality
class PatientProfileManager {
  constructor() {
    this.currentView = 'list'; // 'list', 'add', 'edit', 'details'
    this.selectedPatientId = null;
  }

  // Render patient list view
  renderPatientList() {
    const patients = window.clinicData.patients;
    const stats = window.clinicData.getStatistics();
    
    return `
      <div class="patient-dashboard">
        <div class="dashboard-header">
          <h2>👥 Patient Management</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>${stats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
            <div class="stat-card">
              <h3>${stats.totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>
            <div class="stat-card">
              <h3>$${stats.totalRevenue.toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div class="search-section">
          <input type="text" id="patient-search" placeholder="🔍 Search patients by name, city, or email..." 
                 onkeyup="patientProfile.handleSearch()">
          <button onclick="patientProfile.showAddPatientForm()" class="btn-success">
            ➕ Add New Patient
          </button>
        </div>

        <div class="patients-list">
          ${this.renderPatientsTable(patients)}
        </div>
      </div>
    `;
  }

  // Render patients table
  renderPatientsTable(patients) {
    if (patients.length === 0) {
      return `
        <div class="empty-state">
          <h3>No patients found</h3>
          <p>Add your first patient to get started</p>
          <button onclick="patientProfile.showAddPatientForm()" class="btn-primary">
            Add Patient
          </button>
        </div>
      `;
    }

    return `
      <table class="patients-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>City</th>
            <th>Appointments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${patients.map(patient => this.renderPatientRow(patient)).join('')}
        </tbody>
      </table>
    `;
  }

  // Render individual patient row
  renderPatientRow(patient) {
    const appointments = window.clinicData.getAppointmentsByPatient(patient.patient_id);
    const payments = window.clinicData.getPaymentsByPatient(patient.patient_id);
    
    return `
      <tr class="patient-row" data-patient-id="${patient.patient_id}">
        <td>
          <div class="patient-info">
            <strong>${patient.first_name} ${patient.last_name}</strong>
            <small>ID: ${patient.patient_id}</small>
          </div>
        </td>
        <td>
          <div class="contact-info">
            <div>📧 ${patient.email}</div>
            <div>📞 ${patient.phone}</div>
          </div>
        </td>
        <td>🏙️ ${patient.city}</td>
        <td>
          <div class="appointment-count">
            <span class="badge">${appointments.length} appointments</span>
            <span class="badge success">$${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
          </div>
        </td>
        <td>
          <div class="action-buttons">
            <button onclick="patientProfile.viewPatientDetails(${patient.patient_id})" class="btn-small">
              👁️ View
            </button>
            <button onclick="patientProfile.editPatient(${patient.patient_id})" class="btn-small btn-secondary">
              ✏️ Edit
            </button>
            <button onclick="patientProfile.deletePatient(${patient.patient_id})" class="btn-small btn-danger">
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Render add patient form
  renderAddPatientForm() {
    return `
      <div class="form-container">
        <h2>➕ Add New Patient</h2>
        <form onsubmit="patientProfile.handleAddPatient(event)">
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">First Name *</label>
              <input type="text" id="firstName" required>
            </div>
            <div class="form-group">
              <label for="lastName">Last Name *</label>
              <input type="text" id="lastName" required>
            </div>
            <div class="form-group">
              <label for="email">Email *</label>
              <input type="email" id="email" required>
            </div>
            <div class="form-group">
              <label for="phone">Phone *</label>
              <input type="tel" id="phone" required>
            </div>
            <div class="form-group">
              <label for="dateOfBirth">Date of Birth</label>
              <input type="date" id="dateOfBirth">
            </div>
            <div class="form-group">
              <label for="city">City *</label>
              <input type="text" id="city" required>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" onclick="patientProfile.showPatientList()" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-success">
              Add Patient
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // Render edit patient form
  renderEditPatientForm(patientId) {
    const patient = window.clinicData.getPatient(patientId);
    if (!patient) return this.renderPatientList();

    return `
      <div class="form-container">
        <h2>✏️ Edit Patient</h2>
        <form onsubmit="patientProfile.handleEditPatient(event, ${patientId})">
          <div class="form-grid">
            <div class="form-group">
              <label for="editFirstName">First Name *</label>
              <input type="text" id="editFirstName" value="${patient.first_name}" required>
            </div>
            <div class="form-group">
              <label for="editLastName">Last Name *</label>
              <input type="text" id="editLastName" value="${patient.last_name}" required>
            </div>
            <div class="form-group">
              <label for="editEmail">Email *</label>
              <input type="email" id="editEmail" value="${patient.email}" required>
            </div>
            <div class="form-group">
              <label for="editPhone">Phone *</label>
              <input type="tel" id="editPhone" value="${patient.phone}" required>
            </div>
            <div class="form-group">
              <label for="editDateOfBirth">Date of Birth</label>
              <input type="date" id="editDateOfBirth" value="${patient.date_of_birth || ''}">
            </div>
            <div class="form-group">
              <label for="editCity">City *</label>
              <input type="text" id="editCity" value="${patient.city}" required>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" onclick="patientProfile.showPatientList()" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-success">
              Update Patient
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // Render patient details view
  renderPatientDetails(patientId) {
    const patient = window.clinicData.getPatient(patientId);
    if (!patient) return this.renderPatientList();

    const appointments = window.clinicData.getAppointmentsByPatient(patientId);
    const payments = window.clinicData.getPaymentsByPatient(patientId);
    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

    return `
      <div class="patient-details">
        <div class="details-header">
          <button onclick="patientProfile.showPatientList()" class="btn-secondary">
            ← Back to Patients
          </button>
          <h2>👤 ${patient.first_name} ${patient.last_name}</h2>
          <div class="patient-actions">
            <button onclick="patientProfile.editPatient(${patientId})" class="btn-secondary">
              ✏️ Edit
            </button>
            <button onclick="appointmentBooking.showBookingForm(${patientId})" class="btn-primary">
              📅 Book Appointment
            </button>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-card">
            <h3>📋 Personal Information</h3>
            <div class="info-grid">
              <div><strong>Patient ID:</strong> ${patient.patient_id}</div>
              <div><strong>Email:</strong> ${patient.email}</div>
              <div><strong>Phone:</strong> ${patient.phone}</div>
              <div><strong>City:</strong> ${patient.city}</div>
              <div><strong>Date of Birth:</strong> ${patient.date_of_birth || 'Not specified'}</div>
              <div><strong>Member Since:</strong> ${new Date(patient.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="details-card">
            <h3>📊 Statistics</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-number">${appointments.length}</span>
                <span class="stat-label">Total Appointments</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${appointments.filter(a => a.status === 'Completed').length}</span>
                <span class="stat-label">Completed</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">$${totalSpent.toFixed(2)}</span>
                <span class="stat-label">Total Spent</span>
              </div>
            </div>
          </div>
        </div>

        <div class="appointments-section">
          <h3>📅 Recent Appointments</h3>
          ${this.renderPatientAppointments(appointments)}
        </div>

        <div class="payments-section">
          <h3>💳 Payment History</h3>
          ${this.renderPatientPayments(payments)}
        </div>
      </div>
    `;
  }

  // Render patient appointments
  renderPatientAppointments(appointments) {
    if (appointments.length === 0) {
      return '<p>No appointments found.</p>';
    }

    return `
      <div class="appointments-list">
        ${appointments.map(appointment => {
          const doctor = window.clinicData.doctors.find(d => d.id == appointment.doctor_id);
          return `
            <div class="appointment-item">
              <div class="appointment-info">
                <strong>${doctor ? doctor.name : 'Unknown Doctor'}</strong>
                <span class="appointment-date">${new Date(appointment.date).toLocaleString()}</span>
                <span class="status-badge ${appointment.status.toLowerCase()}">${appointment.status}</span>
              </div>
              <div class="appointment-notes">${appointment.notes || 'No notes'}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Render patient payments
  renderPatientPayments(payments) {
    if (payments.length === 0) {
      return '<p>No payments found.</p>';
    }

    return `
      <div class="payments-list">
        ${payments.map(payment => `
          <div class="payment-item">
            <div class="payment-info">
              <strong>$${payment.amount.toFixed(2)}</strong>
              <span class="payment-date">${new Date(payment.date).toLocaleDateString()}</span>
              <span class="payment-method">${payment.method}</span>
              <span class="status-badge ${payment.status.toLowerCase()}">${payment.status}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Event handlers
  handleSearch() {
    const searchTerm = document.getElementById('patient-search').value;
    const filteredPatients = window.clinicData.searchPatients(searchTerm);
    const patientsList = document.querySelector('.patients-list');
    if (patientsList) {
      patientsList.innerHTML = this.renderPatientsTable(filteredPatients);
    }
  }

  handleAddPatient(event) {
    event.preventDefault();
    
    const patientData = {
      first_name: document.getElementById('firstName').value,
      last_name: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      date_of_birth: document.getElementById('dateOfBirth').value,
      city: document.getElementById('city').value
    };

    window.clinicData.addPatient(patientData);
    this.showPatientList();
  }

  handleEditPatient(event, patientId) {
    event.preventDefault();
    
    const updates = {
      first_name: document.getElementById('editFirstName').value,
      last_name: document.getElementById('editLastName').value,
      email: document.getElementById('editEmail').value,
      phone: document.getElementById('editPhone').value,
      date_of_birth: document.getElementById('editDateOfBirth').value,
      city: document.getElementById('editCity').value
    };

    window.clinicData.updatePatient(patientId, updates);
    this.showPatientList();
  }

  // Navigation methods
  showPatientList() {
    this.currentView = 'list';
    const root = document.getElementById('root');
    root.innerHTML = this.renderPatientList();
  }

  showAddPatientForm() {
    this.currentView = 'add';
    const root = document.getElementById('root');
    root.innerHTML = this.renderAddPatientForm();
  }

  editPatient(patientId) {
    this.currentView = 'edit';
    this.selectedPatientId = patientId;
    const root = document.getElementById('root');
    root.innerHTML = this.renderEditPatientForm(patientId);
  }

  viewPatientDetails(patientId) {
    this.currentView = 'details';
    this.selectedPatientId = patientId;
    const root = document.getElementById('root');
    root.innerHTML = this.renderPatientDetails(patientId);
  }

  deletePatient(patientId) {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      window.clinicData.deletePatient(patientId);
      this.showPatientList();
    }
  }
}

// Create global instance
window.patientProfile = new PatientProfileManager();
