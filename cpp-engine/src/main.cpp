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
    config.collectStatistics = true;
    config.generateDecisionMetadata = true;

    // Initialize allocator coordinator
    Allocator allocator(config);

    // Perform allocation
    AllocationReport report = allocator.allocate(students, rooms);

    // Write report JSON (handles success and error schemas)
    json::writeOutputJson(report, config, outputPath);

    if (!report.success)
    {
        std::cerr << "Validation Error (Code " << validationErrorCode(report.error) << "): "
                  << validationErrorToString(report.error) << std::endl;
        return validationErrorCode(report.error);
    }

    // Success: Print statistics to stdout
    std::cout << "\n=================================================" << std::endl;
    std::cout << "        Exam Seating Allocation Completed        " << std::endl;
    std::cout << "=================================================" << std::endl;
    std::cout << "  Status                 : SUCCESS" << std::endl;
    std::cout << "  Engine Version         : " << ENGINE_VERSION << std::endl;
    std::cout << "  Total Students         : " << report.stats.totalStudents << std::endl;
    std::cout << "  Total Rooms            : " << report.stats.totalRooms << std::endl;
    std::cout << "  Total Capacity         : " << report.stats.totalCapacity << std::endl;
    std::cout << "  Used Capacity          : " << report.stats.occupiedSeats << std::endl;
    std::cout << "  Empty Seats            : " << report.stats.emptySeats << std::endl;
    std::cout << "  Occupancy %            : " << report.stats.occupancyPercentage << " %" << std::endl;
    std::cout << "  Orthogonal Conflicts   : " << report.stats.orthogonalConflicts << std::endl;
    std::cout << "  Diagonal Conflicts     : " << report.stats.diagonalConflicts << std::endl;
    std::cout << "  Total Conflicts        : " << report.stats.totalConflicts << std::endl;
    std::cout << "  Average Conflict Score : " << report.stats.averageConflictScore << std::endl;
    std::cout << "  Execution Time (ms)    : " << report.stats.executionTimeMs << " ms" << std::endl;
    std::cout << "=================================================" << std::endl;

    return 0;
}
