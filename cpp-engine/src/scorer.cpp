#include "../include/scorer.h"
#include <cmath>
#include <cstdlib>

bool SeatScorer::isSeatValid(const SeatingGrid& grid, int row, int col, const Student& student) const
{
    return calculateOrthogonalPenalty(grid, row, col, student) == 0;
}

SeatDecision SeatScorer::calculateSeatDecision(const SeatingGrid& grid, int row, int col, const Student& student) const
{
    SeatDecision decision;
    decision.orthogonalPenalty = calculateOrthogonalPenalty(grid, row, col, student);
    decision.diagonalPenalty = calculateDiagonalPenalty(grid, row, col, student);
    
    const int dist2 = calculateDistance2Penalty(grid, row, col, student);
    const int rowPen = calculateRowSectionPenalty(grid, row, col, student);
    const int colPen = calculateColSectionPenalty(grid, row, col, student);
    
    decision.score = decision.orthogonalPenalty + decision.diagonalPenalty + dist2 + rowPen + colPen;
    decision.strategy = config.traversal;
    return decision;
}

int SeatScorer::calculateOrthogonalPenalty(const SeatingGrid& grid, int row, int col, const Student& student) const
{
    int conflictCount = 0;
    static constexpr int dr[] = {-1, 1, 0, 0};
    static constexpr int dc[] = {0, 0, -1, 1};

    for (int i = 0; i < 4; ++i)
    {
        int nr = row + dr[i];
        int nc = col + dc[i];

        if (nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols)
        {
            if (grid.seats[nr][nc] != nullptr && grid.seats[nr][nc]->section == student.section)
            {
                conflictCount++;
            }
        }
    }
    return conflictCount * config.orthogonalPenalty;
}

int SeatScorer::calculateDiagonalPenalty(const SeatingGrid& grid, int row, int col, const Student& student) const
{
    int conflictCount = 0;
    static constexpr int dr[] = {-1, -1, 1, 1};
    static constexpr int dc[] = {-1, 1, -1, 1};

    for (int i = 0; i < 4; ++i)
    {
        int nr = row + dr[i];
        int nc = col + dc[i];

        if (nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols)
        {
            if (grid.seats[nr][nc] != nullptr && grid.seats[nr][nc]->section == student.section)
            {
                conflictCount++;
            }
        }
    }
    return conflictCount * config.diagonalPenalty;
}

int SeatScorer::calculateDistance2Penalty(const SeatingGrid& grid, int row, int col, const Student& student) const
{
    int penalty = 0;
    // Scan 5x5 subgrid centered at (row, col)
    for (int dr = -2; dr <= 2; ++dr)
    {
        for (int dc = -2; dc <= 2; ++dc)
        {
            if (dr == 0 && dc == 0)
            {
                continue;
            }

            const int dist = std::abs(dr) + std::abs(dc);
            if (dist <= 2)
            {
                const int nr = row + dr;
                const int nc = col + dc;
                if (nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols)
                {
                    if (grid.seats[nr][nc] != nullptr && grid.seats[nr][nc]->section == student.section)
                    {
                        penalty += 1; // +1 if same section within distance 2
                    }
                }
            }
        }
    }
    return penalty;
}

int SeatScorer::calculateRowSectionPenalty(const SeatingGrid& grid, int row, int col, const Student& student) const
{
    int count = 0;
    for (int c = 0; c < grid.cols; ++c)
    {
        if (grid.seats[row][c] != nullptr && grid.seats[row][c]->section == student.section)
        {
            count++;
        }
    }
    // +1 if row contains many same sections (defined as >= 2 same-section students)
    return count >= 2 ? 1 : 0;
}

int SeatScorer::calculateColSectionPenalty(const SeatingGrid& grid, int row, int col, const Student& student) const
{
    int count = 0;
    for (int r = 0; r < grid.rows; ++r)
    {
        if (grid.seats[r][col] != nullptr && grid.seats[r][col]->section == student.section)
        {
            count++;
        }
    }
    // +2 if column contains many same sections (defined as >= 2 same-section students)
    return count >= 2 ? 2 : 0;
}
