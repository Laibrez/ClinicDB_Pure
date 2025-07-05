ClinicDB

Our project is a software solution designed for a modern medical clinic that offers general medical consultations, specialized care, and diagnostic services such as ultrasounds. The goal of the system is to streamline the patient experience while ensuring efficient and secure data management for the clinic’s operations.
Core Features:
Patient Profile Management:
Secure storage of personal information (e.g., full name, contact details).
Access to the patient’s full medical history, including previous visits, diagnoses, treatments, and uploaded medical reports or lab results.
Appointment Scheduling:
Patients can select from a variety of services: general consultation, specialist appointments, or diagnostic procedures (e.g., ultrasounds).
Based on the selected service, the system displays available doctors and their available dates and times.
Patients can choose a preferred slot and confirm the appointment directly through the platform.
Price Estimation:
Once a service is selected, the system generates an estimated cost based on the type of consultation or procedure.
Pricing may also vary depending on the specialist or the complexity of the required examination.
Payment and Capture Line Generation:
After confirming the appointment and reviewing the price estimate, the system provides a payment capture line so the patient can complete the transaction through a secure payment method.
Payment details are linked to the patient’s profile and appointment for administrative tracking.
Real-time Assistance:
Patients have the option to contact a real agent via chat or call within the platform in case they need help or further clarification about services, pricing, or scheduling.
Database Design:
The system includes structured tables for:
Patients (ID, name, contact info, medical history link)
Appointments (appointment ID, patient ID, doctor ID, service type, date/time, status)
Doctors (doctor ID, specialty, available times, contact info)
