#include "../include/traversal.h"
#include <algorithm>
#include <cmath>

namespace Traversal
{
    std::vector<SeatCoordinate> generateTraversal(TraversalStrategy strategy, int rows, int cols)
    {
        std::vector<SeatCoordinate> path;
        path.reserve(rows * cols);

        switch (strategy)
        {
            case TraversalStrategy::RowMajor:
            {
                for (int r = 1; r <= rows; ++r)
                {
                    for (int c = 1; c <= cols; ++c)
                    {
                        path.push_back({r, c});
                    }
                }
                break;
            }
            case TraversalStrategy::Snake:
            {
                for (int r = 1; r <= rows; ++r)
                {
                    if (r % 2 != 0)
                    {
                        for (int c = 1; c <= cols; ++c)
                        {
                            path.push_back({r, c});
                        }
                    }
                    else
                    {
                        for (int c = cols; c >= 1; --c)
                        {
                            path.push_back({r, c});
                        }
                    }
                }
                break;
            }
            case TraversalStrategy::Spiral:
            {
                int top = 1, bottom = rows;
                int left = 1, right = cols;
                while (top <= bottom && left <= right)
                {
                    for (int c = left; c <= right; ++c) 
                    {
                        path.push_back({top, c});
                    }
                    top++;
                    for (int r = top; r <= bottom; ++r) 
                    {
                        path.push_back({r, right});
                    }
                    right--;
                    if (top <= bottom)
                    {
                        for (int c = right; c >= left; --c) 
                        {
                            path.push_back({bottom, c});
                        }
                        bottom--;
                    }
                    if (left <= right)
                    {
                        for (int r = bottom; r >= top; --r) 
                        {
                            path.push_back({r, left});
                        }
                        left++;
                    }
                }
                break;
            }
            case TraversalStrategy::Checkerboard:
            {
                // Pass 1: Even cell parity
                for (int r = 1; r <= rows; ++r)
                {
                    for (int c = 1; c <= cols; ++c)
                    {
                        if ((r + c) % 2 == 0) 
                        {
                            path.push_back({r, c});
                        }
                    }
                }
                // Pass 2: Odd cell parity
                for (int r = 1; r <= rows; ++r)
                {
                    for (int c = 1; c <= cols; ++c)
                    {
                        if ((r + c) % 2 != 0) 
                        {
                            path.push_back({r, c});
                        }
                    }
                }
                break;
            }
            case TraversalStrategy::CenterOut:
            {
                for (int r = 1; r <= rows; ++r)
                {
                    for (int c = 1; c <= cols; ++c)
                    {
                        path.push_back({r, c});
                    }
                }
                const double centerR = (rows + 1) / 2.0;
                const double centerC = (cols + 1) / 2.0;
                std::sort(path.begin(), path.end(), [centerR, centerC](const SeatCoordinate& a, const SeatCoordinate& b) {
                    double distA = std::pow(a.row - centerR, 2) + std::pow(a.col - centerC, 2);
                    double distB = std::pow(b.row - centerR, 2) + std::pow(b.col - centerC, 2);
                    if (std::abs(distA - distB) > 1e-9)
                    {
                        return distA < distB;
                    }
                    if (a.row != b.row)
                    {
                        return a.row < b.row;
                    }
                    return a.col < b.col;
                });
                break;
            }
        }
        return path;
    }

    std::string strategyToString(TraversalStrategy strategy)
    {
        switch (strategy)
        {
            case TraversalStrategy::RowMajor: return "RowMajor";
            case TraversalStrategy::Snake: return "Snake";
            case TraversalStrategy::Spiral: return "Spiral";
            case TraversalStrategy::Checkerboard: return "Checkerboard";
            case TraversalStrategy::CenterOut: return "CenterOut";
            default: return "Snake";
        }
    }

    TraversalStrategy stringToStrategy(const std::string& str)
    {
        if (str == "RowMajor") return TraversalStrategy::RowMajor;
        if (str == "Snake") return TraversalStrategy::Snake;
        if (str == "Spiral") return TraversalStrategy::Spiral;
        if (str == "Checkerboard") return TraversalStrategy::Checkerboard;
        if (str == "CenterOut") return TraversalStrategy::CenterOut;
        return TraversalStrategy::Snake;
    }
}
