#include "../include/distributor.h"

namespace Distributor
{
    std::vector<RoomAllocation> distributeStudentsToRooms(
        const std::vector<Student>& orderedStudents,
        const std::vector<Room>&    rooms)
    {
        std::vector<RoomAllocation> allocations;
        allocations.reserve(rooms.size());

        std::size_t studentIndex = 0;

        for (const auto& room : rooms)
        {
            RoomAllocation allocation;
            allocation.room = room;

            const int roomCapacity = room.capacity();

            for (int i = 0;
                 i < roomCapacity && studentIndex < orderedStudents.size();
                 ++i)
            {
                allocation.students.push_back(orderedStudents[studentIndex++]);
            }

            allocations.push_back(std::move(allocation));
        }

        return allocations;
    }
}
