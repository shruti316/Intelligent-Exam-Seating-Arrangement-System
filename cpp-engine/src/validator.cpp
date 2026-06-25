#include "../include/validator.h"
#include <unordered_set>
#include <string>

namespace Validator
{
    ValidationError validateInput(
        const std::vector<Student>& students,
        const std::vector<Room>&    rooms)
    {
        if (students.empty())
        {
            return ValidationError::EMPTY_STUDENTS;
        }

        if (rooms.empty())
        {
            return ValidationError::EMPTY_ROOMS;
        }

        std::unordered_set<int> studentIds;
        std::unordered_set<std::string> rollNumbers;

        for (const auto& student : students)
        {
            if (student.section.empty())
            {
                return ValidationError::EMPTY_STUDENT_SECTION;
            }

            if (!studentIds.insert(student.studentId).second)
            {
                return ValidationError::DUPLICATE_STUDENT_ID;
            }

            if (!rollNumbers.insert(student.rollNo).second)
            {
                return ValidationError::DUPLICATE_ROLL_NUMBER;
            }
        }

        int totalCapacity = 0;
        std::unordered_set<int> classroomIds;

        for (const auto& room : rooms)
        {
            if (room.rows <= 0 || room.cols <= 0)
            {
                return ValidationError::INVALID_ROOM_DIMENSIONS;
            }

            if (!classroomIds.insert(room.classroomId).second)
            {
                return ValidationError::DUPLICATE_CLASSROOM_ID;
            }

            totalCapacity += room.capacity();
        }

        if (totalCapacity < static_cast<int>(students.size()))
        {
            return ValidationError::INSUFFICIENT_CAPACITY;
        }

        return ValidationError::OK;
    }
}

std::string validationErrorToString(ValidationError err)
{
    switch (err)
    {
        case ValidationError::OK:
            return "OK";
        case ValidationError::EMPTY_STUDENTS:
            return "Empty students";
        case ValidationError::EMPTY_ROOMS:
            return "Empty rooms";
        case ValidationError::DUPLICATE_STUDENT_ID:
            return "Duplicate Student ID";
        case ValidationError::DUPLICATE_ROLL_NUMBER:
            return "Duplicate Roll Number";
        case ValidationError::EMPTY_STUDENT_SECTION:
            return "Empty Section Name";
        case ValidationError::INVALID_ROOM_DIMENSIONS:
            return "Invalid Room Dimensions";
        case ValidationError::DUPLICATE_CLASSROOM_ID:
            return "Duplicate Classroom ID";
        case ValidationError::INSUFFICIENT_CAPACITY:
            return "Capacity Overflow";
        default:
            return "Unknown error";
    }
}

int validationErrorCode(ValidationError err)
{
    return static_cast<int>(err);
}
