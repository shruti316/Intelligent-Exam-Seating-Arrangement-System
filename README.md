# Intelligent Exam Seating Arrangement System

An AI-assisted Exam Seating Arrangement System that automatically generates optimized seating plans using a C++ allocation engine, a Node.js backend, MySQL database, and React frontend.

---

# Features

- Student Management
- Classroom Management
- Exam Management
- Automated Seating Generation
- JSON-based C++ Integration
- RESTful APIs
- Seating Plan Retrieval
- Validation & Capacity Checks
- Modular Service Architecture

---

# Tech Stack

## Frontend
- React.js
- Tailwind CSS

## Backend
- Node.js
- Express.js

## Database
- MySQL

## Allocation Engine
- C++

---

# Project Structure

```
project/
│
├── frontend/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── config/
│   │
│   ├── database/
│   │   ├── schema.sql
│   │   └── sample_data.sql
│   │
│   └── API_DOCUMENTATION.md
│
├── cpp-engine/
│   ├── src/
│   ├── include/
│   ├── tests/
│   └── allocator.exe
│
└── README.md
```

---

# Backend Workflow

```
Database
      │
      ▼
Generate input.json
      │
      ▼
C++ Allocation Engine
      │
      ▼
output.json
      │
      ▼
Store Seat Assignments
      │
      ▼
Frontend Display
```

---

# Database Tables

- departments
- students
- classrooms
- exams
- exam_registrations
- seating_plans
- seat_assignments

---

# REST APIs

### Students

- Student Management APIs

### Classrooms

- Classroom Management APIs

### Exams

- Exam Management APIs

### Seating

```
POST /api/seating/generate
GET  /api/seating/input/:examId
GET  /api/seating/:examId
```

---

# Current Progress

## Completed

- Database Design
- Backend APIs
- Validation Layer
- Seating Input Generation
- Service Layer
- Seating Retrieval API
- Sample Dataset

## In Progress

- C++ Engine Integration

## Pending

- Execute allocator.exe
- Read output.json
- Store generated seat assignments
- End-to-End Testing

---

# Team

### Frontend & C++ Allocation Engine
Person A

### Backend & Integration
Person B

---

# Future Enhancements

- PDF Seating Reports
- CSV Export
- Advanced Constraint-Based Allocation
- Analytics Dashboard
- Attendance Integration
* Real-time hall availability
* Advanced optimization algorithms
