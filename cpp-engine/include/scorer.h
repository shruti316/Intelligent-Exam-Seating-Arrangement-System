#pragma once

#include "models.h"
#include <vector>
#include <string>

struct SeatingGrid
{
    int rows;
    int cols;
    std::vector<std::vector<const Student*>> seats; // nullptr if empty
};

class SeatScorer
{
private:
    EngineConfig config;

public:
    SeatScorer(const EngineConfig& cfg) : config(cfg) {}

    // Checks if placing student at (row, col) has no orthogonal same-section conflicts
    bool isSeatValid(const SeatingGrid& grid, int row, int col, const Student& student) const;

    // Calculates penalties and builds a SeatDecision object
    SeatDecision calculateSeatDecision(const SeatingGrid& grid, int row, int col, const Student& student) const;

    // Individual penalty components for clear extensibility
    int calculateOrthogonalPenalty(const SeatingGrid& grid, int row, int col, const Student& student) const;
    int calculateDiagonalPenalty(const SeatingGrid& grid, int row, int col, const Student& student) const;
    int calculateDistance2Penalty(const SeatingGrid& grid, int row, int col, const Student& student) const;
    int calculateRowSectionPenalty(const SeatingGrid& grid, int row, int col, const Student& student) const;
    int calculateColSectionPenalty(const SeatingGrid& grid, int row, int col, const Student& student) const;
};
