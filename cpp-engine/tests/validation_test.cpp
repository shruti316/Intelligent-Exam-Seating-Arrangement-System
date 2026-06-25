#include "../include/models.h"
#include "../include/validator.h"
#include <iostream>
#include <vector>
#include <cassert>

void runValidationTests()
{
    std::cout << "[Validation Tests] Starting..." << std::endl;

    // Test 1: Valid Configuration
    {
        std::vector<Student> students = {
            {1, "CS001", "CSE", "A"},
            {2, "CS002", "CSE", "B"}
        };
        std::vector<Room> rooms = {
            {101, "LH1", 2, 2} // Capacity = 4
        };
        ValidationError result = Validator::validateInput(students, rooms);
        assert(result == ValidationError::OK);
    }

    // Test 2: Empty Students list
    {
        std::vector<Student> students = {};
        std::vector<Room> rooms = {
            {101, "LH1", 2, 2}
        };
        ValidationError result = Validator::validateInput(students, rooms);
        assert(result == ValidationError::EMPTY_STUDENTS);
    }

    // Test 3: Empty Rooms list
    {
        std::vector<Student> students = {
            {1, "CS001", "CSE", "A"}
        };
        std::vector<Room> rooms = {};
        ValidationError result = Validator::validateInput(students, rooms);
        assert(result == ValidationError::EMPTY_ROOMS);
    }

    // Test 4: Duplicate Student ID
    {
        std::vector<Student> students = {
            {1, "CS001", "CSE", "A"},
            {1, "CS002", "CSE", "B"} // Duplicate ID
        };
        std::vector<Room> rooms = {
            {101, "LH1", 2, 2}
        };
        ValidationError result = Validator::validateInput(students, rooms);
        assert(result == ValidationError::DUPLICATE_STUDENT_ID);
    }

    // Test 5: Duplicate Roll Number
    {
        std::vector<Student> students = {
            {1, "CS001", "CSE", "A"},
            {2, "CS001", "CSE", "B"} // Duplicate Roll Number
        };
        std::vector<Room> rooms = {
            {101, "LH1", 2, 2}
        };
        ValidationError result = Validator::validateInput(students, rooms);
        assert(result == ValidationError::DUPLICATE_ROLL_NUMBER);
    }

    // Test 6: Empty Section Name
    {
        std::vector<Student> students = {
            {1, "CS001", "CSE", ""} // Empty section name
        };
        std::vector<Room> rooms = {
            {101, "LH1", 2, 2}
        };
        ValidationError result = Validator::validateInput(students, rooms);
        assert(result == ValidationError::EMPTY_STUDENT_SECTION);
    }

    // Test 7: Invalid Room Dimensions (Rows/Cols <= 0)
    {
        std::vector<Student> students = {
            {1, "CS001", "CSE", "A"}
        };
        std::vector<Room> rooms = {
            {101, "LH1", 0, 2} // Rows = 0
        };
        ValidationError result = Validator::validateInput(students, rooms);
        assert(result == ValidationError::INVALID_ROOM_DIMENSIONS);
    }

    // Test 8: Duplicate Classroom ID
    {
        std::vector<Student> students = {
            {1, "CS001", "CSE", "A"}
        };
        std::vector<Room> rooms = {
            {101, "LH1", 2, 2},
            {101, "LH2", 2, 2} // Duplicate Classroom ID
        };
        ValidationError result = Validator::validateInput(students, rooms);
        assert(result == ValidationError::DUPLICATE_CLASSROOM_ID);
    }

    // Test 9: Capacity Overflow (Insufficient Capacity)
    {
        std::vector<Student> students = {
            {1, "CS001", "CSE", "A"},
            {2, "CS002", "CSE", "B"},
            {3, "CS003", "CSE", "C"}
        };
        std::vector<Room> rooms = {
            {101, "LH1", 1, 2} // Capacity = 2, total students = 3
        };
        ValidationError result = Validator::validateInput(students, rooms);
        assert(result == ValidationError::INSUFFICIENT_CAPACITY);
    }

    std::cout << "[Validation Tests] All 9 tests passed successfully!" << std::endl;
}
