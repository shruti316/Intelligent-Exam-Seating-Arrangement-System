#pragma once

#include <string>
#include <vector>

struct Student
{
    int studentId;

    std::string rollNo;

    std::string department;
    std::string section;
};

struct Room
{
    int classroomId;

    std::string roomNo;

    int rows;
    int cols;

    int capacity() const
    {
        return rows * cols;
    }
};

struct SeatAssignment
{
    int studentId;

    std::string rollNo;

    std::string section;

    int classroomId;

    int row;
    int col;

    std::string seatLabel;
};

struct AllocationResult
{
    std::vector<SeatAssignment> assignments;
};