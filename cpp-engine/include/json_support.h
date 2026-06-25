#pragma once

#include "models.h"
#include <string>
#include <vector>

namespace json
{
    // Escapes a string for insertion into a JSON value
    std::string escapeString(const std::string& s);

    // Serializes a SeatAssignment structure, conditionally including SeatDecision metadata
    std::string seatAssignmentToJson(const SeatAssignment& sa, bool includeDecision);

    // Serializes the full AllocationReport to JSON matching success/error formats
    std::string allocationReportToJson(const AllocationReport& report, const EngineConfig& config);

    // Writes the JSON response to the output file path
    void writeOutputJson(
        const AllocationReport& report,
        const EngineConfig&     config,
        const std::string&      path = "output.json");

    // Parses input JSON file for students and rooms
    void readInputJson(
        const std::string&    path,
        std::vector<Student>& students,
        std::vector<Room>&    rooms);
}
