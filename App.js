// Global state for the application
let patients = [];
let doctors = [];
let appointments = [];
let selectedPatient = null;
let priceEstimate = 0;

// Main Application Controller - Coordinates all modules
class AppController {
  constructor() {
    this.currentPage = 'home';
    this.modules = {};
  }

  // Initialize the application
  initialize() {
    // Load data from localStorage
    window.clinicData.loadFromLocalStorage();
    
    // Load default page
    this.loadPage('home');
  }

  // Main page loading function
  loadPage(page) {
    this.currentPage = page;
    const root = document.getElementById('root');
    
    switch (page) {
      case 'home':
        root.innerHTML = window.patientProfile.renderPatientList();
        break;
      case 'book':
        root.innerHTML = window.appointmentBooking.renderAppointmentList();
        break;
      case 'payment':
        root.innerHTML = window.paymentCapture.renderPaymentList();
        break;
      case 'chat':
        root.innerHTML = window.chatSupport.renderChatInterface();
        window.chatSupport.initializeChat();
        break;
      default:
        root.innerHTML = this.renderWelcomePage();
    }
  }

  // Render welcome page
  renderWelcomePage() {
    const stats = window.clinicData.getStatistics();
    
    return `
      <div class="welcome-dashboard">
        <div class="welcome-header">
          <h1>🏥 Welcome to MedCare Clinic</h1>
          <p>Your comprehensive healthcare management system</p>
        </div>

        <div class="stats-overview">
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
          <div class="stat-card">
            <h3>${stats.completedAppointments}</h3>
            <p>Completed Appointments</p>
          </div>
        </div>

        <div class="quick-actions-grid">
          <div class="action-card" onclick="app.loadPage('home')">
            <div class="action-icon">👥</div>
            <h3>Patient Management</h3>
            <p>Manage patient profiles, view details, and track patient history</p>
          </div>
          
          <div class="action-card" onclick="app.loadPage('book')">
            <div class="action-icon">📅</div>
            <h3>Appointment Booking</h3>
            <p>Schedule appointments, manage bookings, and view calendar</p>
          </div>
          
          <div class="action-card" onclick="app.loadPage('payment')">
            <div class="action-icon">💳</div>
            <h3>Payment Management</h3>
            <p>Process payments, generate receipts, and track financials</p>
          </div>
          
          <div class="action-card" onclick="app.loadPage('chat')">
            <div class="action-icon">💬</div>
            <h3>Chat Support</h3>
            <p>Get instant help and support for any questions</p>
          </div>
        </div>

        <div class="recent-activity">
          <h3>📊 Recent Activity</h3>
          <div class="activity-list">
            ${this.renderRecentActivity()}
          </div>
        </div>
      </div>
    `;
  }

  // Render recent activity
  renderRecentActivity() {
    const recentAppointments = window.clinicData.appointments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    const recentPayments = window.clinicData.payments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (recentAppointments.length === 0 && recentPayments.length === 0) {
      return '<p>No recent activity. Start by adding patients or booking appointments!</p>';
    }

    let activityHtml = '';
    
    // Recent appointments
    if (recentAppointments.length > 0) {
      activityHtml += '<h4>Recent Appointments</h4>';
      recentAppointments.forEach(appointment => {
        const patient = window.clinicData.getPatient(appointment.patient_id);
        const doctor = window.clinicData.doctors.find(d => d.id == appointment.doctor_id);
        activityHtml += `
          <div class="activity-item">
            <span class="activity-icon">📅</span>
            <div class="activity-content">
              <strong>${patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}</strong> 
              has an appointment with <strong>${doctor ? doctor.name : 'Unknown Doctor'}</strong>
              <small>${new Date(appointment.date).toLocaleDateString()}</small>
            </div>
          </div>
        `;
      });
    }

    // Recent payments
    if (recentPayments.length > 0) {
      activityHtml += '<h4>Recent Payments</h4>';
      recentPayments.forEach(payment => {
        const patient = window.clinicData.getPatient(payment.patient_id);
        activityHtml += `
          <div class="activity-item">
            <span class="activity-icon">💳</span>
            <div class="activity-content">
              <strong>$${payment.amount.toFixed(2)}</strong> payment from 
              <strong>${patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}</strong>
              <small>${new Date(payment.date).toLocaleDateString()}</small>
            </div>
          </div>
        `;
      });
    }

    return activityHtml;
  }

  // Utility functions
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Data export functionality
  exportData() {
    const data = {
      patients: window.clinicData.patients,
      appointments: window.clinicData.appointments,
      payments: window.clinicData.payments,
      chatMessages: window.clinicData.chatMessages,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinic-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Data import functionality
  importData(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.patients) window.clinicData.patients = data.patients;
          if (data.appointments) window.clinicData.appointments = data.appointments;
          if (data.payments) window.clinicData.payments = data.payments;
          if (data.chatMessages) window.clinicData.chatMessages = data.chatMessages;
          
          window.clinicData.saveToLocalStorage();
          this.loadPage(this.currentPage);
          this.showNotification('Data imported successfully!', 'success');
        } catch (error) {
          this.showNotification('Error importing data. Please check the file format.', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  // Reset all data
  resetData() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      window.clinicData.patients = [];
      window.clinicData.appointments = [];
      window.clinicData.payments = [];
      window.clinicData.chatMessages = [];
      window.clinicData.saveToLocalStorage();
      this.loadPage('home');
      this.showNotification('All data has been reset.', 'warning');
    }
  }
}

// Create global app instance
window.app = new AppController();

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.app.initialize();
});
