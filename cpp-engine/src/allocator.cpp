#include "../include/allocator.h"
#include "../include/validator.h"
#include "../include/balancer.h"
#include "../include/distributor.h"
#include "../include/traversal.h"
#include "../include/scorer.h"
#include "../include/statistics.h"

#include <chrono>
#include <iostream>
#include <limits>

AllocationReport Allocator::allocate(
    const std::vector<Student>& students,
    const std::vector<Room>&    rooms)
{
    auto startTime = std::chrono::high_resolution_clock::now();

    AllocationReport report;
    report.success = false;

    // 1. Validate inputs
    ValidationError err = Validator::validateInput(students, rooms);
    if (err != ValidationError::OK)
    {
        report.success = false;
        report.error = err;
        return report;
    }

    // 2. Group students by section
    auto sectionGroups = Balancer::groupStudentsBySection(students);

    // 3. Create balanced ordering
    auto orderedStudents = Balancer::buildBalancedOrder(sectionGroups);

    // 4. Distribute students into rooms
    auto roomAllocations = Distributor::distributeStudentsToRooms(orderedStudents, rooms);

    SeatScorer scorer(config);
    report.result.assignments.reserve(students.size());

    // 5. Seat allocation per room
    for (const auto& allocation : roomAllocations)
    {
        const auto& room = allocation.room;
        if (allocation.students.empty())
        {
            continue;
        }

        // Initialize Seating Grid
        SeatingGrid grid;
        grid.rows = room.rows;
        grid.cols = room.cols;
        grid.seats.assign(room.rows, std::vector<const Student*>(room.cols, nullptr));

        // Generate Traversal Path
        auto traversal = Traversal::generateTraversal(config.traversal, room.rows, room.cols);

        // Assign each student sequentially
        for (const auto& student : allocation.students)
        {
            SeatCoordinate bestSeat = {-1, -1};
            int minScore = std::numeric_limits<int>::max();
            SeatDecision bestDecision;

            // Iterate over all traversal coordinates to find the best empty seat
            for (const auto& seat : traversal)
            {
                int r = seat.row - 1;
                int c = seat.col - 1;

                if (grid.seats[r][c] != nullptr)
                {
                    continue; // Already occupied
                }

                // Compute conflict score for placing this student here
                SeatDecision dec = scorer.calculateSeatDecision(grid, r, c, student);

                // Calculate effective score incorporating adjacency enforcement
                int effectiveScore = dec.score;
                if (config.enforceAdjacency && dec.orthogonalPenalty > 0)
                {
                    effectiveScore += 100000; // Force validation penalty offset
                }

                // Find minimum. Tie-breaker: earliest in traversal (guaranteed by < check)
                if (effectiveScore < minScore)
                {
                    minScore = effectiveScore;
                    bestSeat = seat;
                    bestDecision = dec;
                }
            }

            if (bestSeat.row != -1)
            {
                int br = bestSeat.row - 1;
                int bc = bestSeat.col - 1;
                grid.seats[br][bc] = &student;

                report.result.assignments.push_back({
                    student.studentId,
                    student.rollNo,
                    student.section,
                    room.classroomId,
                    bestSeat.row,
                    bestSeat.col,
                    "R" + std::to_string(bestSeat.row) + "C" + std::to_string(bestSeat.col),
                    bestDecision
                });
            }
            else
            {
                std::cerr << "Warning: Could not assign student " << student.rollNo
                          << " (Id: " << student.studentId << ") - Room " << room.roomNo
                          << " has no available seats." << std::endl;
            }
        }
    }

    auto endTime = std::chrono::high_resolution_clock::now();
    double elapsedMs = std::chrono::duration<double, std::milli>(endTime - startTime).count();

    // 6. Compute statistics if requested
    if (config.collectStatistics)
    {
        report.stats = calculateStats(students, rooms, report.result, elapsedMs);
    }
    else
    {
        report.stats.totalStudents = static_cast<int>(students.size());
        report.stats.totalRooms = static_cast<int>(rooms.size());
        report.stats.executionTimeMs = elapsedMs;
    }

    report.success = true;
    report.error = ValidationError::OK;

    return report;
}