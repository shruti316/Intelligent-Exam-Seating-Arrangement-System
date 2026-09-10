DROP DATABASE IF EXISTS exam_seating_db;
CREATE DATABASE exam_seating_db;
USE exam_seating_db;

-- ==========================
-- Departments
-- ==========================

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    department_code VARCHAR(20) UNIQUE NOT NULL,
    home_zone VARCHAR(50)
);

-- ==========================
-- Students
-- ==========================

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    department_id INT,
    section VARCHAR(20),
    semester INT,

    FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);

-- ==========================
-- Classrooms
-- ==========================

CREATE TABLE classrooms (
    classroom_id INT AUTO_INCREMENT PRIMARY KEY,
    room_no VARCHAR(20) UNIQUE NOT NULL,
    rows_count INT NOT NULL,
    cols_count INT NOT NULL,
    capacity INT NOT NULL
);

-- ==========================
-- Exams
-- ==========================

CREATE TABLE exams (
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    semester INT,
    exam_date DATE,
    start_time TIME,
    end_time TIME,
    status VARCHAR(20) DEFAULT 'Scheduled'
);

-- ==========================
-- Exam Registrations
-- ==========================

CREATE TABLE exam_registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,

    FOREIGN KEY (exam_id)
        REFERENCES exams(exam_id),

    FOREIGN KEY (student_id)
        REFERENCES students(student_id),

    UNIQUE (exam_id, student_id)
);

-- ==========================
-- Seating Plans
-- ==========================

CREATE TABLE seating_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    algorithm_version VARCHAR(50) DEFAULT 'v1.0-cpp',
    total_students INT DEFAULT 0,
    occupied_seats INT DEFAULT 0,
    empty_seats INT DEFAULT 0,
    conflict_count INT DEFAULT 0,
    execution_time_ms DOUBLE DEFAULT 0.0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (exam_id)
        REFERENCES exams(exam_id) ON DELETE CASCADE
);

-- ==========================
-- Seat Assignments
-- ==========================

CREATE TABLE seat_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    student_id INT NOT NULL,
    classroom_id INT NOT NULL,
    row_no INT NOT NULL,
    col_no INT NOT NULL,
    seat_label VARCHAR(20),

    FOREIGN KEY (plan_id)
        REFERENCES seating_plans(plan_id),

    FOREIGN KEY (student_id)
        REFERENCES students(student_id),

    FOREIGN KEY (classroom_id)
        REFERENCES classrooms(classroom_id),

    UNIQUE (plan_id, student_id),

    UNIQUE (plan_id, classroom_id, row_no, col_no)
);

SHOW TABLES;