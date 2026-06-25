#pragma once

#include "models.h"
#include <vector>

// Computes the final allocation statistics after seat assignment has finished
AllocationStats calculateStats(
    const std::vector<Student>& students,
    const std::vector<Room>& rooms,
    const AllocationResult& result,
    double executionTimeMs);
