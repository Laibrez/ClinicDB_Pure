// Payment Capture Management - Handles all payment-related functionality
class PaymentCaptureManager {
  constructor() {
    this.currentView = 'list'; // 'list', 'capture', 'details'
    this.selectedPatientId = null;
    this.selectedAppointmentId = null;
  }

  // Render payment list view
  renderPaymentList() {
    const payments = window.clinicData.payments;
    const stats = window.clinicData.getStatistics();
    
    return `
      <div class="payment-dashboard">
        <div class="dashboard-header">
          <h2>💳 Payment Management</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>$${stats.totalRevenue.toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
            <div class="stat-card">
              <h3>${payments.length}</h3>
              <p>Total Payments</p>
            </div>
            <div class="stat-card">
              <h3>$${stats.averageAppointmentValue.toFixed(2)}</h3>
              <p>Average Payment</p>
            </div>
          </div>
        </div>

        <div class="actions-section">
          <button onclick="paymentCapture.showPaymentForm()" class="btn-success">
            ➕ Capture Payment
          </button>
          <button onclick="paymentCapture.showPaymentReport()" class="btn-secondary">
            📊 Payment Report
          </button>
        </div>

        <div class="payments-list">
          ${this.renderPaymentsTable(payments)}
        </div>
      </div>
    `;
  }

  // Render payments table
  renderPaymentsTable(payments) {
    if (payments.length === 0) {
      return `
        <div class="empty-state">
          <h3>No payments found</h3>
          <p>Capture your first payment to get started</p>
          <button onclick="paymentCapture.showPaymentForm()" class="btn-primary">
            Capture Payment
          </button>
        </div>
      `;
    }

    // Sort payments by date (newest first)
    const sortedPayments = payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    return `
      <table class="payments-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${sortedPayments.map(payment => this.renderPaymentRow(payment)).join('')}
        </tbody>
      </table>
    `;
  }

  // Render individual payment row
  renderPaymentRow(payment) {
    const patient = window.clinicData.getPatient(payment.patient_id);
    const paymentDate = new Date(payment.date);

    return `
      <tr class="payment-row" data-payment-id="${payment.id}">
        <td>
          <div class="patient-info">
            <strong>${patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}</strong>
            <small>ID: ${payment.patient_id}</small>
          </div>
        </td>
        <td>
          <div class="amount-info">
            <strong class="amount">$${payment.amount.toFixed(2)}</strong>
          </div>
        </td>
        <td>
          <div class="method-info">
            <span class="payment-method">${payment.method}</span>
          </div>
        </td>
        <td>
          <div class="date-info">
            <strong>${paymentDate.toLocaleDateString()}</strong>
            <small>${paymentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
          </div>
        </td>
        <td>
          <span class="status-badge ${payment.status.toLowerCase()}">${payment.status}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button onclick="paymentCapture.viewPaymentDetails(${payment.id})" class="btn-small">
              👁️ View
            </button>
            <button onclick="paymentCapture.generateReceipt(${payment.id})" class="btn-small btn-secondary">
              🧾 Receipt
            </button>
            <button onclick="paymentCapture.refundPayment(${payment.id})" class="btn-small btn-danger">
              💸 Refund
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Render payment capture form
  renderPaymentForm(patientId = null, appointmentId = null) {
    const patients = window.clinicData.patients;
    const appointments = appointmentId ? [window.clinicData.appointments.find(a => a.id == appointmentId)] : window.clinicData.appointments;
    
    return `
      <div class="form-container">
        <h2>💳 Capture Payment</h2>
        <form onsubmit="paymentCapture.handleCapturePayment(event)">
          <div class="form-grid">
            <div class="form-group">
              <label for="paymentPatientSelect">Patient *</label>
              <select id="paymentPatientSelect" required ${patientId ? 'disabled' : ''} onchange="paymentCapture.updatePatientAppointments()">
                <option value="">Choose a patient...</option>
                ${patients.map(patient => `
                  <option value="${patient.patient_id}" ${patientId == patient.patient_id ? 'selected' : ''}>
                    ${patient.first_name} ${patient.last_name} - ${patient.city}
                  </option>
                `).join('')}
              </select>
              ${patientId ? `<input type="hidden" id="paymentPatientSelectHidden" value="${patientId}">` : ''}
            </div>

            <div class="form-group">
              <label for="paymentAppointmentSelect">Appointment (Optional)</label>
              <select id="paymentAppointmentSelect" onchange="paymentCapture.updatePaymentAmount()">
                <option value="">No specific appointment</option>
                ${appointments.filter(a => a && (patientId ? a.patient_id == patientId : true)).map(appointment => `
                  <option value="${appointment.id}" ${appointmentId == appointment.id ? 'selected' : ''}>
                    ${new Date(appointment.date).toLocaleDateString()} - ${appointment.appointmentType || 'Consultation'}
                  </option>
                `).join('')}
              </select>
              ${appointmentId ? `<input type="hidden" id="paymentAppointmentSelectHidden" value="${appointmentId}">` : ''}
            </div>

            <div class="form-group">
              <label for="paymentAmount">Amount *</label>
              <input type="number" id="paymentAmount" step="0.01" min="0" required placeholder="0.00">
            </div>

            <div class="form-group">
              <label for="paymentMethod">Payment Method *</label>
              <select id="paymentMethod" required>
                <option value="">Choose payment method...</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Insurance">Insurance</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
            </div>

            <div class="form-group">
              <label for="paymentStatus">Status</label>
              <select id="paymentStatus">
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="paymentNotes">Notes</label>
            <textarea id="paymentNotes" rows="3" placeholder="Any additional notes about this payment..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" onclick="paymentCapture.showPaymentList()" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-success">
              Capture Payment
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // Render payment details
  renderPaymentDetails(paymentId) {
    const payment = window.clinicData.payments.find(p => p.id == paymentId);
    if (!payment) return this.renderPaymentList();

    const patient = window.clinicData.getPatient(payment.patient_id);
    const appointment = payment.appointment_id ? window.clinicData.appointments.find(a => a.id == payment.appointment_id) : null;
    const paymentDate = new Date(payment.date);

    return `
      <div class="payment-details">
        <div class="details-header">
          <button onclick="paymentCapture.showPaymentList()" class="btn-secondary">
            ← Back to Payments
          </button>
          <h2>💳 Payment Details</h2>
          <div class="payment-actions">
            <button onclick="paymentCapture.generateReceipt(${paymentId})" class="btn-secondary">
              🧾 Generate Receipt
            </button>
            <button onclick="paymentCapture.refundPayment(${paymentId})" class="btn-danger">
              💸 Refund
            </button>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-card">
            <h3>💰 Payment Information</h3>
            <div class="info-grid">
              <div><strong>Payment ID:</strong> ${payment.id}</div>
              <div><strong>Amount:</strong> <span class="amount-large">$${payment.amount.toFixed(2)}</span></div>
              <div><strong>Method:</strong> ${payment.method}</div>
              <div><strong>Status:</strong> <span class="status-badge ${payment.status.toLowerCase()}">${payment.status}</span></div>
              <div><strong>Date:</strong> ${paymentDate.toLocaleDateString()}</div>
              <div><strong>Time:</strong> ${paymentDate.toLocaleTimeString()}</div>
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

          ${appointment ? `
            <div class="details-card">
              <h3>📅 Related Appointment</h3>
              <div class="info-grid">
                <div><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div><strong>Type:</strong> ${appointment.appointmentType || 'Consultation'}</div>
                <div><strong>Status:</strong> <span class="status-badge ${appointment.status.toLowerCase()}">${appointment.status}</span></div>
              </div>
            </div>
          ` : ''}
        </div>

        ${payment.notes ? `
          <div class="notes-section">
            <h3>📝 Notes</h3>
            <div class="notes-content">
              ${payment.notes}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Event handlers
  handleCapturePayment(event) {
    event.preventDefault();
    
    const patientId = document.getElementById('paymentPatientSelectHidden')?.value || document.getElementById('paymentPatientSelect').value;
    const appointmentId = document.getElementById('paymentAppointmentSelectHidden')?.value || document.getElementById('paymentAppointmentSelect').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;
    const status = document.getElementById('paymentStatus').value;
    const notes = document.getElementById('paymentNotes').value;

    if (!patientId || !amount || !method) {
      alert('Please fill in all required fields');
      return;
    }

    const paymentData = {
      patient_id: parseInt(patientId),
      appointment_id: appointmentId ? parseInt(appointmentId) : null,
      amount: amount,
      method: method,
      status: status,
      notes: notes
    };

    window.clinicData.addPayment(paymentData);
    this.showPaymentList();
  }

  // Utility methods
  updatePatientAppointments() {
    const patientId = document.getElementById('paymentPatientSelect').value;
    const appointmentSelect = document.getElementById('paymentAppointmentSelect');
    
    if (patientId) {
      const patientAppointments = window.clinicData.getAppointmentsByPatient(patientId);
      appointmentSelect.innerHTML = '<option value="">No specific appointment</option>';
      patientAppointments.forEach(appointment => {
        const option = document.createElement('option');
        option.value = appointment.id;
        option.textContent = `${new Date(appointment.date).toLocaleDateString()} - ${appointment.appointmentType || 'Consultation'}`;
        appointmentSelect.appendChild(option);
      });
    } else {
      appointmentSelect.innerHTML = '<option value="">No specific appointment</option>';
    }
  }

  updatePaymentAmount() {
    const appointmentId = document.getElementById('paymentAppointmentSelect').value;
    const amountInput = document.getElementById('paymentAmount');
    
    if (appointmentId) {
      const appointment = window.clinicData.appointments.find(a => a.id == appointmentId);
      if (appointment) {
        const doctor = window.clinicData.doctors.find(d => d.id == appointment.doctor_id);
        if (doctor) {
          const price = window.clinicData.calculatePriceEstimate(doctor.specialty, appointment.appointmentType);
          amountInput.value = price.toFixed(2);
        }
      }
    }
  }

  // Navigation methods
  showPaymentList() {
    this.currentView = 'list';
    const root = document.getElementById('root');
    root.innerHTML = this.renderPaymentList();
  }

  showPaymentForm(patientId = null, appointmentId = null) {
    this.currentView = 'capture';
    this.selectedPatientId = patientId;
    this.selectedAppointmentId = appointmentId;
    const root = document.getElementById('root');
    root.innerHTML = this.renderPaymentForm(patientId, appointmentId);
  }

  viewPaymentDetails(paymentId) {
    this.currentView = 'details';
    const root = document.getElementById('root');
    root.innerHTML = this.renderPaymentDetails(paymentId);
  }

  generateReceipt(paymentId) {
    const payment = window.clinicData.payments.find(p => p.id == paymentId);
    if (payment) {
      const receipt = this.createReceipt(payment);
      const newWindow = window.open('', '_blank');
      newWindow.document.write(receipt);
      newWindow.document.close();
      newWindow.print();
    }
  }

  createReceipt(payment) {
    const patient = window.clinicData.getPatient(payment.patient_id);
    const paymentDate = new Date(payment.date);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
          .info { margin: 10px 0; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>MedCare Clinic</h1>
            <p>Payment Receipt</p>
          </div>
          
          <div class="info">
            <strong>Receipt #:</strong> ${payment.id}
          </div>
          <div class="info">
            <strong>Date:</strong> ${paymentDate.toLocaleDateString()}
          </div>
          <div class="info">
            <strong>Time:</strong> ${paymentDate.toLocaleTimeString()}
          </div>
          <div class="info">
            <strong>Patient:</strong> ${patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}
          </div>
          <div class="info">
            <strong>Method:</strong> ${payment.method}
          </div>
          <div class="info">
            <strong>Status:</strong> ${payment.status}
          </div>
          
          <div class="amount">
            Amount: $${payment.amount.toFixed(2)}
          </div>
          
          ${payment.notes ? `
            <div class="info">
              <strong>Notes:</strong> ${payment.notes}
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Thank you for choosing MedCare Clinic!</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  refundPayment(paymentId) {
    if (confirm('Are you sure you want to refund this payment?')) {
      const payment = window.clinicData.payments.find(p => p.id == paymentId);
      if (payment) {
        // Create refund payment
        const refundData = {
          patient_id: payment.patient_id,
          appointment_id: payment.appointment_id,
          amount: -payment.amount, // Negative amount for refund
          method: payment.method,
          status: 'Refunded',
          notes: `Refund for payment #${payment.id}`
        };
        
        window.clinicData.addPayment(refundData);
        // Update original payment status
        payment.status = 'Refunded';
        window.clinicData.saveToLocalStorage();
        
        this.showPaymentList();
        alert('Payment refunded successfully');
      }
    }
  }

  showPaymentReport() {
    alert('Payment report functionality will be implemented in the next version');
  }
}

// Create global instance
window.paymentCapture = new PaymentCaptureManager();