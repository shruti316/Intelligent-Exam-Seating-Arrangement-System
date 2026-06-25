#pragma once

#include "models.h"
#include <vector>

namespace Distributor
{
    // Distributes students to rooms sequentially
    std::vector<RoomAllocation> distributeStudentsToRooms(
        const std::vector<Student>& orderedStudents,
        const std::vector<Room>&    rooms);
}
