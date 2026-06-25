#pragma once

#include "models.h"
#include <vector>
#include <string>

namespace Traversal
{
    // Generates coordinates for traversal order based on selected strategy
    std::vector<SeatCoordinate> generateTraversal(TraversalStrategy strategy, int rows, int cols);

    // Conversions
    std::string strategyToString(TraversalStrategy strategy);
    TraversalStrategy stringToStrategy(const std::string& str);
}
