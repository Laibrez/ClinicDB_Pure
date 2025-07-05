// Clinic Data Management - Handles all clinic data and state
class ClinicDataManager {
  constructor() {
    this.patients = [];
    this.doctors = [
      { id: 1, name: 'Dr. Sarah Smith', specialty: 'Cardiology', availability: ['Monday', 'Wednesday', 'Friday'] },
      { id: 2, name: 'Dr. Michael Johnson', specialty: 'Pediatrics', availability: ['Tuesday', 'Thursday', 'Saturday'] },
      { id: 3, name: 'Dr. Emily Williams', specialty: 'Orthopedics', availability: ['Monday', 'Tuesday', 'Friday'] },
      { id: 4, name: 'Dr. David Brown', specialty: 'Neurology', availability: ['Wednesday', 'Thursday', 'Saturday'] },
      { id: 5, name: 'Dr. Lisa Garcia', specialty: 'Dermatology', availability: ['Monday', 'Wednesday', 'Saturday'] }
    ];
    this.appointments = [];
    this.payments = [];
    this.selectedPatient = null;
    this.priceEstimate = 0;
    this.chatMessages = [];
    
    // Load initial data
    this.loadInitialData();
  }

  // Load initial sample data
  loadInitialData() {
    // Sample patients
    this.patients = [
      { patient_id: 1, first_name: 'John', last_name: 'Doe', city: 'New York', phone: '555-0101', email: 'john.doe@email.com', date_of_birth: '1985-03-15' },
      { patient_id: 2, first_name: 'Jane', last_name: 'Smith', city: 'Los Angeles', phone: '555-0102', email: 'jane.smith@email.com', date_of_birth: '1990-07-22' },
      { patient_id: 3, first_name: 'Mike', last_name: 'Johnson', city: 'Chicago', phone: '555-0103', email: 'mike.johnson@email.com', date_of_birth: '1988-11-08' }
    ];

    // Sample appointments
    this.appointments = [
      { id: 1, patient_id: 1, doctor_id: 1, date: '2024-01-15T10:00', status: 'Scheduled', notes: 'Regular checkup' },
      { id: 2, patient_id: 2, doctor_id: 3, date: '2024-01-16T14:30', status: 'Completed', notes: 'Follow-up appointment' }
    ];

    // Sample payments
    this.payments = [
      { id: 1, patient_id: 1, amount: 150.00, status: 'Completed', date: '2024-01-15T09:30', method: 'Credit Card' },
      { id: 2, patient_id: 2, amount: 200.00, status: 'Completed', date: '2024-01-16T14:00', method: 'Insurance' }
    ];
  }

  // Patient management
  addPatient(patientData) {
    const newPatient = {
      patient_id: Date.now(),
      ...patientData,
      created_at: new Date().toISOString()
    };
    this.patients.push(newPatient);
    this.saveToLocalStorage();
    return newPatient;
  }

  getPatient(patientId) {
    return this.patients.find(p => p.patient_id == patientId);
  }

  updatePatient(patientId, updates) {
    const index = this.patients.findIndex(p => p.patient_id == patientId);
    if (index !== -1) {
      this.patients[index] = { ...this.patients[index], ...updates };
      this.saveToLocalStorage();
      return this.patients[index];
    }
    return null;
  }

  deletePatient(patientId) {
    this.patients = this.patients.filter(p => p.patient_id != patientId);
    this.saveToLocalStorage();
  }

  // Appointment management
  addAppointment(appointmentData) {
    const newAppointment = {
      id: Date.now(),
      ...appointmentData,
      created_at: new Date().toISOString()
    };
    this.appointments.push(newAppointment);
    this.saveToLocalStorage();
    return newAppointment;
  }

  getAppointmentsByPatient(patientId) {
    return this.appointments.filter(a => a.patient_id == patientId);
  }

  updateAppointment(appointmentId, updates) {
    const index = this.appointments.findIndex(a => a.id == appointmentId);
    if (index !== -1) {
      this.appointments[index] = { ...this.appointments[index], ...updates };
      this.saveToLocalStorage();
      return this.appointments[index];
    }
    return null;
  }

  cancelAppointment(appointmentId) {
    return this.updateAppointment(appointmentId, { status: 'Cancelled' });
  }

  // Payment management
  addPayment(paymentData) {
    const newPayment = {
      id: Date.now(),
      ...paymentData,
      date: new Date().toISOString()
    };
    this.payments.push(newPayment);
    this.saveToLocalStorage();
    return newPayment;
  }

  getPaymentsByPatient(patientId) {
    return this.payments.filter(p => p.patient_id == patientId);
  }

  // Doctor management
  getDoctorsBySpecialty(specialty) {
    return this.doctors.filter(d => d.specialty.toLowerCase() === specialty.toLowerCase());
  }

  getAvailableDoctors(date) {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    return this.doctors.filter(d => d.availability.includes(dayOfWeek));
  }

  // Chat management
  addChatMessage(message) {
    const newMessage = {
      id: Date.now(),
      ...message,
      timestamp: new Date().toISOString()
    };
    this.chatMessages.push(newMessage);
    this.saveToLocalStorage();
    return newMessage;
  }

  getChatHistory() {
    return this.chatMessages.slice(-50); // Last 50 messages
  }

  // Price estimation
  calculatePriceEstimate(specialty, appointmentType = 'consultation') {
    const basePrices = {
      'Cardiology': 200,
      'Pediatrics': 150,
      'Orthopedics': 180,
      'Neurology': 250,
      'Dermatology': 120
    };
    
    const typeMultipliers = {
      'consultation': 1,
      'follow-up': 0.8,
      'emergency': 1.5,
      'surgery': 3
    };
    
    const basePrice = basePrices[specialty] || 150;
    const multiplier = typeMultipliers[appointmentType] || 1;
    
    return basePrice * multiplier;
  }

  // Local storage management
  saveToLocalStorage() {
    try {
      localStorage.setItem('clinicData', JSON.stringify({
        patients: this.patients,
        appointments: this.appointments,
        payments: this.payments,
        chatMessages: this.chatMessages
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('clinicData');
      if (data) {
        const parsed = JSON.parse(data);
        this.patients = parsed.patients || this.patients;
        this.appointments = parsed.appointments || this.appointments;
        this.payments = parsed.payments || this.payments;
        this.chatMessages = parsed.chatMessages || this.chatMessages;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  // Search functionality
  searchPatients(query) {
    const searchTerm = query.toLowerCase();
    return this.patients.filter(patient => 
      patient.first_name.toLowerCase().includes(searchTerm) ||
      patient.last_name.toLowerCase().includes(searchTerm) ||
      patient.city.toLowerCase().includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm)
    );
  }

  // Statistics
  getStatistics() {
    return {
      totalPatients: this.patients.length,
      totalAppointments: this.appointments.length,
      completedAppointments: this.appointments.filter(a => a.status === 'Completed').length,
      totalRevenue: this.payments.reduce((sum, p) => sum + p.amount, 0),
      averageAppointmentValue: this.payments.length > 0 ? 
        this.payments.reduce((sum, p) => sum + p.amount, 0) / this.payments.length : 0
    };
  }
}

// Create global instance
window.clinicData = new ClinicDataManager();
