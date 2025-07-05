// Chat Support Management - Handles all chat-related functionality
class ChatSupportManager {
  constructor() {
    this.currentView = 'chat';
    this.isTyping = false;
    this.autoResponses = {
      'appointment': 'To book an appointment, please go to the "Book Appointment" section and select your preferred doctor and time.',
      'payment': 'For payment inquiries, please visit the "Payment Capture" section. You can also generate receipts for previous payments.',
      'hours': 'Our clinic is open Monday through Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 2:00 PM.',
      'emergency': 'If this is a medical emergency, please call 911 immediately. For urgent care, call our emergency line at 555-EMERGENCY.',
      'contact': 'You can reach us at 555-CLINIC or email us at support@medcare.com. Our address is 123 Healthcare Ave, Medical District.',
      'insurance': 'We accept most major insurance plans. Please contact our billing department at 555-BILLING for specific coverage questions.',
      'prescription': 'For prescription refills, please contact your doctor directly or use our patient portal.',
      'covid': 'We follow all CDC guidelines for COVID-19 safety. Masks are required, and we offer telehealth appointments when appropriate.'
    };
  }

  // Render chat interface
  renderChatInterface() {
    const chatHistory = window.clinicData.getChatHistory();
    
    return `
      <div class="chat-dashboard">
        <div class="chat-header">
          <h2>💬 Chat Support</h2>
          <div class="chat-status">
            <span class="status-indicator online"></span>
            <span>Online Support</span>
          </div>
        </div>

        <div class="chat-container">
          <div class="chat-sidebar">
            <div class="quick-actions">
              <h3>Quick Actions</h3>
              <button onclick="chatSupport.sendQuickMessage('appointment')" class="quick-action-btn">
                📅 Book Appointment
              </button>
              <button onclick="chatSupport.sendQuickMessage('payment')" class="quick-action-btn">
                💳 Payment Help
              </button>
              <button onclick="chatSupport.sendQuickMessage('hours')" class="quick-action-btn">
                🕒 Office Hours
              </button>
              <button onclick="chatSupport.sendQuickMessage('contact')" class="quick-action-btn">
                📞 Contact Info
              </button>
              <button onclick="chatSupport.sendQuickMessage('emergency')" class="quick-action-btn emergency">
                🚨 Emergency
              </button>
            </div>

            <div class="chat-info">
              <h3>Chat Information</h3>
              <div class="info-item">
                <strong>Agent:</strong> Dr. Support Bot
              </div>
              <div class="info-item">
                <strong>Response Time:</strong> < 1 minute
              </div>
              <div class="info-item">
                <strong>Available:</strong> 24/7
              </div>
            </div>
          </div>

          <div class="chat-main">
            <div class="chat-messages" id="chat-messages">
              ${this.renderChatMessages(chatHistory)}
            </div>

            <div class="chat-input-container">
              <div class="chat-input-wrapper">
                <input type="text" id="chat-message-input" 
                       placeholder="Type your message here..." 
                       onkeypress="chatSupport.handleKeyPress(event)">
                <button onclick="chatSupport.sendMessage()" class="send-btn">
                  ➤
                </button>
              </div>
              <div class="typing-indicator" id="typing-indicator" style="display: none;">
                <span>Dr. Support Bot is typing</span>
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-footer">
          <div class="chat-tips">
            <h4>💡 Tips for better assistance:</h4>
            <ul>
              <li>Be specific about your question or concern</li>
              <li>Include relevant details like appointment dates or payment amounts</li>
              <li>For urgent medical issues, call our emergency line</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Render chat messages
  renderChatMessages(messages) {
    if (messages.length === 0) {
      return `
        <div class="message system">
          <div class="message-content">
            <h3>👋 Welcome to MedCare Clinic Support!</h3>
            <p>I'm here to help you with any questions about appointments, payments, or general inquiries.</p>
            <p>You can also use the quick action buttons on the left for common questions.</p>
          </div>
        </div>
      `;
    }

    return messages.map(message => this.renderMessage(message)).join('');
  }

  // Render individual message
  renderMessage(message) {
    const messageClass = message.type || 'bot';
    const timestamp = new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    return `
      <div class="message ${messageClass}">
        <div class="message-header">
          <span class="message-sender">${message.sender || 'Dr. Support Bot'}</span>
          <span class="message-time">${timestamp}</span>
        </div>
        <div class="message-content">
          ${message.content}
        </div>
      </div>
    `;
  }

  // Event handlers
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage() {
    const input = document.getElementById('chat-message-input');
    const message = input.value.trim();
    
    if (message) {
      // Add user message
      this.addMessage({
        type: 'user',
        sender: 'You',
        content: message
      });
      
      input.value = '';
      
      // Show typing indicator
      this.showTypingIndicator();
      
      // Simulate bot response
      setTimeout(() => {
        this.hideTypingIndicator();
        this.generateBotResponse(message);
      }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
    }
  }

  sendQuickMessage(type) {
    const questions = {
      'appointment': 'How do I book an appointment?',
      'payment': 'I have a question about payments.',
      'hours': 'What are your office hours?',
      'contact': 'How can I contact the clinic?',
      'emergency': 'I need emergency assistance.',
      'insurance': 'Do you accept my insurance?',
      'prescription': 'I need a prescription refill.',
      'covid': 'What are your COVID-19 protocols?'
    };

    const question = questions[type];
    if (question) {
      this.addMessage({
        type: 'user',
        sender: 'You',
        content: question
      });

      this.showTypingIndicator();
      
      setTimeout(() => {
        this.hideTypingIndicator();
        this.generateBotResponse(question);
      }, 1000);
    }
  }

  // Bot response generation
  generateBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    let response = '';

    // Check for auto-responses
    for (const [key, autoResponse] of Object.entries(this.autoResponses)) {
      if (message.includes(key)) {
        response = autoResponse;
        break;
      }
    }

    // If no auto-response found, generate contextual response
    if (!response) {
      response = this.generateContextualResponse(message);
    }

    this.addMessage({
      type: 'bot',
      sender: 'Dr. Support Bot',
      content: response
    });
  }

  generateContextualResponse(message) {
    const responses = [
      "Thank you for your message. I understand your concern. Could you please provide more specific details so I can assist you better?",
      "I appreciate you reaching out. Let me help you with that. Could you clarify what specific information you need?",
      "Thank you for contacting MedCare Clinic support. I'm here to help! Could you please provide more context about your inquiry?",
      "I understand your question. To provide you with the most accurate assistance, could you share a bit more detail?",
      "Thank you for your message. I want to make sure I give you the right information. Could you please elaborate on your question?"
    ];

    // Add some contextual responses based on keywords
    if (message.includes('thank')) {
      return "You're very welcome! Is there anything else I can help you with today?";
    }
    
    if (message.includes('bye') || message.includes('goodbye')) {
      return "Thank you for chatting with us! Have a great day and take care of your health! 👋";
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! How can I assist you today? I'm here to help with any questions about appointments, payments, or general inquiries.";
    }

    // Return random contextual response
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Utility methods
  addMessage(messageData) {
    window.clinicData.addChatMessage(messageData);
    this.updateChatDisplay();
  }

  updateChatDisplay() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      const chatHistory = window.clinicData.getChatHistory();
      chatMessages.innerHTML = this.renderChatMessages(chatHistory);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.style.display = 'flex';
      this.isTyping = true;
    }
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.style.display = 'none';
      this.isTyping = false;
    }
  }

  // Navigation methods
  showChatInterface() {
    this.currentView = 'chat';
    const root = document.getElementById('root');
    root.innerHTML = this.renderChatInterface();
    
    // Focus on input after rendering
    setTimeout(() => {
      const input = document.getElementById('chat-message-input');
      if (input) {
        input.focus();
      }
    }, 100);
  }

  // Chat management
  clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
      window.clinicData.chatMessages = [];
      window.clinicData.saveToLocalStorage();
      this.updateChatDisplay();
    }
  }

  exportChat() {
    const chatHistory = window.clinicData.getChatHistory();
    const chatText = chatHistory.map(message => 
      `[${new Date(message.timestamp).toLocaleString()}] ${message.sender}: ${message.content}`
    ).join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Initialize chat with welcome message if empty
  initializeChat() {
    const chatHistory = window.clinicData.getChatHistory();
    if (chatHistory.length === 0) {
      this.addMessage({
        type: 'system',
        sender: 'System',
        content: 'Chat session started'
      });
    }
  }
}

// Create global instance
window.chatSupport = new ChatSupportManager();