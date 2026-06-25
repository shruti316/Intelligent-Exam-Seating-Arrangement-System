#pragma once

#include <string>
#include <vector>

// ─── Versioning ────────────────────────────────────────────────────────────

constexpr char ENGINE_VERSION[] = "1.0.0";

// ─── Traversal Strategy Enum ───────────────────────────────────────────────

enum class TraversalStrategy
{
    RowMajor,
    Snake,
    Spiral,
    Checkerboard,
    CenterOut
};

// ─── Engine Configuration ──────────────────────────────────────────────────

struct EngineConfig
{
    TraversalStrategy traversal = TraversalStrategy::Snake;
    int               orthogonalPenalty = 10;
    int               diagonalPenalty = 3;
    bool              deterministic = true;
    bool              collectStatistics = true;
    bool              generateDecisionMetadata = true;
    bool              enforceAdjacency = true; // Kept for compatibility/functionality
};

// ─── Decision Metadata ─────────────────────────────────────────────────────

struct SeatDecision
{
    int               score = 0;
    int               orthogonalPenalty = 0;
    int               diagonalPenalty = 0;
    TraversalStrategy strategy = TraversalStrategy::Snake;
};

// ─── Room Utilization & Distribution ───────────────────────────────────────

struct SectionCount
{
    std::string section;
    int         count = 0;
};

struct RoomUtilization
{
    int                       classroomId = 0;
    std::string               roomNo;
    int                       occupiedSeats = 0;
    int                       totalCapacity = 0;
    double                    utilizationPercentage = 0.0;
    std::vector<SectionCount> sectionDistribution;
};

// ─── Seating Statistics ────────────────────────────────────────────────────

struct AllocationStats
{
    int                          totalStudents = 0;
    int                          totalRooms = 0;
    int                          totalCapacity = 0;
    int                          occupiedSeats = 0;
    int                          emptySeats = 0;
    double                       occupancyPercentage = 0.0;
    int                          orthogonalConflicts = 0;
    int                          diagonalConflicts = 0;
    int                          totalConflicts = 0;
    double                       averageConflictScore = 0.0;
    double                       executionTimeMs = 0.0;
    std::vector<RoomUtilization> rooms;
};

// ─── Core Domain Models ────────────────────────────────────────────────────

struct Student
{
    int         studentId;
    std::string rollNo;
    std::string department;
    std::string section;
};

struct Room
{
    int         classroomId;
    std::string roomNo;
    int         rows;
    int         cols;

    int capacity() const { return rows * cols; }
};

struct SeatCoordinate
{
    int row;   // 1-indexed
    int col;   // 1-indexed
};

struct SeatAssignment
{
    int          studentId;
    std::string  rollNo;
    std::string  section;
    int          classroomId;
    int          row;
    int          col;
    std::string  seatLabel;   // e.g. "R2C3"
    SeatDecision decision;
};

struct RoomAllocation
{
    Room                 room;
    std::vector<Student> students;
};

// ─── Validation Error ──────────────────────────────────────────────────────

enum class ValidationError
{
    OK = 0,
    EMPTY_STUDENTS = 100,
    EMPTY_ROOMS = 101,
    DUPLICATE_STUDENT_ID = 102,
    DUPLICATE_ROLL_NUMBER = 103,
    EMPTY_STUDENT_SECTION = 104,
    INVALID_ROOM_DIMENSIONS = 105,
    DUPLICATE_CLASSROOM_ID = 106,
    INSUFFICIENT_CAPACITY = 107
};

struct AllocationResult
{
    std::vector<SeatAssignment> assignments;
};

struct AllocationReport
{
    bool             success = false;
    ValidationError  error = ValidationError::OK;
    AllocationResult result;
    AllocationStats  stats;
};

std::string validationErrorToString(ValidationError err);
int validationErrorCode(ValidationError err);
