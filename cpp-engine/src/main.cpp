#include <iostream>
#include "../include/allocator.h"

int main()
{
    std::vector<Student> students =
    {
        {1, "CS001", "CSE", "A"},
        {2, "CS002", "CSE", "A"},
        {3, "IT001", "IT", "B"},
        {4, "IT002", "IT", "B"}
    };

    std::vector<Room> rooms =
    {
        {1, "LH101", 5, 5}
    };

    Allocator allocator;

    AllocationResult result =
        allocator.allocate(students, rooms);

    for (const auto& seat : result.assignments)
{
    std::cout
        << seat.rollNo
        << " ("
        << seat.section
        << ") -> "
        << seat.seatLabel
        << std::endl;
}

    return 0;
}