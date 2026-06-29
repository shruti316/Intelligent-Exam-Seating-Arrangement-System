# Intelligent Exam Seating Arrangement System

# Backend API Documentation

Base URL

```
http://localhost:5000/api
```

---

# 1. Generate Seating Input

## Endpoint

```
POST /seating/generate
```

## Description

Generates `input.json` for the C++ seating allocation engine.

## Request Body

```json
{
    "examId": 1
}
```

## Success Response

```json
{
    "success": true,
    "message": "Input JSON generated successfully.",
    "data": {
        "examId": 1,
        "students": [],
        "rooms": []
    }
}
```

---

# 2. Get Seating Input

## Endpoint

```
GET /seating/input/:examId
```

## Description

Returns the JSON data that is sent to the C++ allocation engine.

Example

```
GET /seating/input/1
```

---

# 3. Get Seating Plan

## Endpoint

```
GET /seating/:examId
```

## Description

Returns the generated seating plan for the selected exam.

Example

```
GET /seating/1
```

Response

```json
{
    "success": true,
    "data": []
}
```

---

# Validation

The backend validates:

- Valid Exam ID
- Student registrations exist
- Classrooms exist
- Classroom capacity is sufficient

---

# Database

Tables used:

- departments
- students
- classrooms
- exams
- exam_registrations
- seating_plans
- seat_assignments

---

# Current Workflow

```
Database
    ↓
Generate input.json
    ↓
C++ Allocation Engine
    ↓
output.json
    ↓
Store Seating Plan
    ↓
Frontend
```

---

# Status

✅ Backend Completed

⏳ Waiting for C++ Engine Integration
