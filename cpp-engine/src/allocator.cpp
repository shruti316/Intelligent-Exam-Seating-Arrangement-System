#include "../include/allocator.h"

#include <iostream>
#include <unordered_map>
#include <queue>

struct SectionInfo
{
    int remaining;
    std::string section;

    bool operator<(const SectionInfo& other) const
    {
        return remaining < other.remaining;
    }
};

AllocationResult Allocator::allocate(
    const std::vector<Student>& students,
    const std::vector<Room>& rooms)
{
    AllocationResult result;

    std::unordered_map<
        std::string,
        std::queue<Student>
    > sectionGroups;

    for (const auto& student : students)
    {
        sectionGroups[student.section].push(student);
    }

    std::priority_queue<SectionInfo> pq;

    for (const auto& group : sectionGroups)
    {
        pq.push({
            static_cast<int>(group.second.size()),
            group.first
        });
    }

    std::vector<Student> orderedStudents;

    while (!pq.empty())
    {
        SectionInfo current = pq.top();
        pq.pop();

        Student student =
            sectionGroups[current.section].front();

        sectionGroups[current.section].pop();

        orderedStudents.push_back(student);

        current.remaining--;

        if (current.remaining > 0)
        {
            pq.push(current);
        }
    }

    std::cout << "\n=== Seating Order ===\n";

    for (const auto& student : orderedStudents)
    {
        std::cout
            << student.rollNo
            << " ("
            << student.section
            << ")"
            << std::endl;
    }

    if (rooms.empty())
    {
        return result;
    }

    const Room& room = rooms[0];

    int currentRow = 1;
    int currentCol = 1;

    for (const auto& student : orderedStudents)
    {
        result.assignments.push_back({
            student.studentId,
            student.rollNo,
            student.section,
            room.classroomId,
            currentRow,
            currentCol,
            "R" + std::to_string(currentRow)
                + "C" + std::to_string(currentCol)
        });

        currentCol++;

        if (currentCol > room.cols)
        {
            currentCol = 1;
            currentRow++;
        }
    }

    return result;
}