#pragma once

#include "models.h"
#include <vector>

namespace Validator
{
    // Validates inputs in O(N) time and returns a ValidationError. Never throws exceptions.
    ValidationError validateInput(
        const std::vector<Student>& students,
        const std::vector<Room>&    rooms);
}
