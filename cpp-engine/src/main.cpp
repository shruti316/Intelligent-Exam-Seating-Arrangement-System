#include "../include/models.h"
#include "../include/allocator.h"
#include "../include/json_support.h"
#include "../include/traversal.h"

#include <iostream>
#include <string>
#include <vector>

int main(int argc, char* argv[])
{
    // Parse arguments: allocator.exe [input.json] [output.json] [traversal_strategy]
    std::string inputPath = "input.json";
    std::string outputPath = "output.json";
    std::string strategy = "Snake";

    if (argc > 1)
    {
        inputPath = argv[1];
    }
    if (argc > 2)
    {
        outputPath = argv[2];
    }
    if (argc > 3)
    {
        strategy = argv[3];
    }

    std::vector<Student> students;
    std::vector<Room> rooms;

    // Load inputs
    json::readInputJson(inputPath, students, rooms);

    // Initialize configuration
    EngineConfig config;
    config.traversal = Traversal::stringToStrategy(strategy);
    config.orthogonalPenalty = 10;
    config.diagonalPenalty = 3;
    config.enforceAdjacency = true;
    config.deterministic = true;
    config.generateStatistics = true;
    config.includeDecisionMetadata = true;

    // Initialize allocator coordinator
    Allocator allocator(config);

    // Perform allocation
    AllocationResult result = allocator.allocate(students, rooms);

    // Write result JSON (handles success and error schemas)
    json::writeOutputJson(result, config, outputPath);

    if (result.validationError != ValidationError::OK)
    {
        std::cerr << "Validation Error (Code " << validationErrorCode(result.validationError) << "): "
                  << validationErrorToString(result.validationError) << std::endl;
        return validationErrorCode(result.validationError);
    }

    // Success: Print statistics to stdout
    std::cout << "\n=================================================" << std::endl;
    std::cout << "        Exam Seating Allocation Completed        " << std::endl;
    std::cout << "=================================================" << std::endl;
    std::cout << "  Status                 : SUCCESS" << std::endl;
    std::cout << "  Total Students         : " << result.stats.totalStudents << std::endl;
    std::cout << "  Total Rooms            : " << result.stats.totalRooms << std::endl;
    std::cout << "  Total Capacity         : " << result.stats.totalCapacity << std::endl;
    std::cout << "  Used Capacity          : " << result.stats.occupiedSeats << std::endl;
    std::cout << "  Empty Seats            : " << result.stats.emptySeats << std::endl;
    std::cout << "  Occupancy %            : " << result.stats.occupancyPercentage << " %" << std::endl;
    std::cout << "  Orthogonal Conflicts   : " << result.stats.orthogonalConflicts << std::endl;
    std::cout << "  Diagonal Conflicts     : " << result.stats.diagonalConflicts << std::endl;
    std::cout << "  Total Conflicts        : " << result.stats.totalConflicts << std::endl;
    std::cout << "  Average Conflict Score : " << result.stats.averageConflictScore << std::endl;
    std::cout << "  Execution Time (ms)    : " << result.stats.executionTimeMs << " ms" << std::endl;
    std::cout << "=================================================" << std::endl;

    return 0;
}
