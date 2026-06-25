#pragma once

#include "models.h"
#include <vector>

class Allocator
{
private:
    EngineConfig config;

public:
    // Configures the allocator using an EngineConfig object
    Allocator(const EngineConfig& cfg) : config(cfg) {}

    // Main allocation execution entry point
    AllocationResult allocate(
        const std::vector<Student>& students,
        const std::vector<Room>&    rooms);
};
