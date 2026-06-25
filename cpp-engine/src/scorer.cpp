#include "../include/scorer.h"

bool SeatScorer::isSeatValid(const SeatingGrid& grid, int row, int col, const Student& student) const
{
    return calculateOrthogonalPenalty(grid, row, col, student) == 0;
}

SeatDecision SeatScorer::calculateSeatDecision(const SeatingGrid& grid, int row, int col, const Student& student) const
{
    SeatDecision decision;
    decision.orthogonalPenalty = calculateOrthogonalPenalty(grid, row, col, student);
    decision.diagonalPenalty = calculateDiagonalPenalty(grid, row, col, student);
    decision.totalScore = decision.orthogonalPenalty + decision.diagonalPenalty;
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
