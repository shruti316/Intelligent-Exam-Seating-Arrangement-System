#include "../include/statistics.h"
#include <unordered_map>
#include <vector>
#include <string>

AllocationStats calculateStats(
    const std::vector<Student>& students,
    const std::vector<Room>& rooms,
    const AllocationResult& result,
    double executionTimeMs)
{
    AllocationStats stats;
    stats.totalStudents = static_cast<int>(students.size());
    stats.totalRooms = static_cast<int>(rooms.size());
    stats.executionTimeMs = executionTimeMs;

    // Calculate total capacity
    for (const auto& room : rooms)
    {
        stats.totalCapacity += room.capacity();
    }

    stats.occupiedSeats = static_cast<int>(result.assignments.size());
    stats.emptySeats = stats.totalCapacity - stats.occupiedSeats;
    
    if (stats.totalCapacity > 0)
    {
        stats.occupancyPercentage = (static_cast<double>(stats.occupiedSeats) / stats.totalCapacity) * 100.0;
    }
    else
    {
        stats.occupancyPercentage = 0.0;
    }

    // Group assignments by classroomId to count conflicts per room
    std::unordered_map<int, std::vector<SeatAssignment>> roomAssignments;
    double totalScoreSum = 0.0;

    for (const auto& assign : result.assignments)
    {
        roomAssignments[assign.classroomId].push_back(assign);
        totalScoreSum += assign.decision.totalScore;
    }

    if (stats.occupiedSeats > 0)
    {
        stats.averageConflictScore = totalScoreSum / stats.occupiedSeats;
    }
    else
    {
        stats.averageConflictScore = 0.0;
    }

    int orthogonalConflicts = 0;
    int diagonalConflicts = 0;

    for (const auto& room : rooms)
    {
        if (roomAssignments.count(room.classroomId) == 0)
        {
            continue;
        }

        // Reconstruct the seating grid
        std::vector<std::vector<std::string>> grid(
            room.rows,
            std::vector<std::string>(room.cols, "")
        );

        for (const auto& assign : roomAssignments.at(room.classroomId))
        {
            int r = assign.row - 1;
            int c = assign.col - 1;
            if (r >= 0 && r < room.rows && c >= 0 && c < room.cols)
            {
                grid[r][c] = assign.section;
            }
        }

        // Count conflicts (each pair counted once)
        for (int r = 0; r < room.rows; ++r)
        {
            for (int c = 0; c < room.cols; ++c)
            {
                if (grid[r][c].empty())
                {
                    continue;
                }

                const std::string& currentSection = grid[r][c];

                // Orthogonal conflicts (Right and Down only to avoid double counting)
                if (c + 1 < room.cols && grid[r][c + 1] == currentSection)
                {
                    orthogonalConflicts++;
                }
                if (r + 1 < room.rows && grid[r + 1][c] == currentSection)
                {
                    orthogonalConflicts++;
                }

                // Diagonal conflicts (Down-Right and Down-Left only)
                if (r + 1 < room.rows && c + 1 < room.cols && grid[r + 1][c + 1] == currentSection)
                {
                    diagonalConflicts++;
                }
                if (r + 1 < room.rows && c - 1 >= 0 && grid[r + 1][c - 1] == currentSection)
                {
                    diagonalConflicts++;
                }
            }
        }
    }

    stats.orthogonalConflicts = orthogonalConflicts;
    stats.diagonalConflicts = diagonalConflicts;
    stats.totalConflicts = orthogonalConflicts + diagonalConflicts;

    return stats;
}
