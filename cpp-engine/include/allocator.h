#pragma once

#include "models.h"

class Allocator
{
public:
    AllocationResult allocate(
        const std::vector<Student>& students,
        const std::vector<Room>& rooms
    );
};