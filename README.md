# Delivery Management System

A web-based delivery booking and tracking system developed for **Nopeiden Kuljetusten Ritarit AY**. This is the company's first digital delivery management application, built as part of a bachelor's thesis at Oulu University of Applied Sciences (Oamk).

## About the Project

This system allows users to book deliveries through an AI-powered chatbot instead of filling traditional forms. The system includes separate dashboards for users, drivers, and administrators, with full multilingual support across four languages.

## Features

**Public**
- Animated landing page with company branding
- About, Services, and Contact pages
- Public delivery tracking without login

**User Side**
- Register and login
- Book a delivery via AI chatbot conversation
- Real-time delivery tracking
- View full delivery history
- Add driver instructions to active deliveries
- Submit complaints with image upload and AI-powered review
- File damage claims with evidence photos (admin approve/decline)
- Loyalty points program
- Price estimation tool
- Saved addresses
- Bulk order management
- Invoice viewing and download

**Driver Side**
- View assigned deliveries
- Update delivery status (picked up, in transit, delivered)
- Driver performance dashboard

**Admin Side**
- View and manage all deliveries and users
- Assign drivers to deliveries
- Handle complaints with AI analysis
- Process damage claims with refund approval
- Analytics dashboard (monthly deliveries, revenue, status distribution)
- Manage driver accounts

## Tech Stack

- **Frontend:** React.js, React Router v6, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js, REST API
- **Database:** PostgreSQL
- **AI:** Claude API (delivery chatbot + complaint/damage AI analysis)
- **Authentication:** JWT
- **Multilingual:** react-i18next (English, Finnish, Russian, Swedish)
- **PWA:** Progressive Web App support with install prompt

## Project Status

🚧 Currently in development

## Author

Akindu Kalpana — Bachelor's Thesis, Oamk 2025
