#include "../include/json_support.h"
#include "../include/traversal.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <cctype>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <algorithm>
#include <unordered_map>

namespace
{
    // Replaces std::gmtime_r/gmtime_s with a cross-platform helper
    std::string getISO8601Timestamp()
    {
        auto now = std::chrono::system_clock::now();
        std::time_t now_c = std::chrono::system_clock::to_time_t(now);
        std::tm* t = std::gmtime(&now_c);
        std::stringstream ss;
        if (t)
        {
            ss << std::put_time(t, "%Y-%m-%dT%H:%M:%SZ");
        }
        return ss.str();
    }

    // Parses raw object strings inside a designated JSON array key
    std::vector<std::string> extractObjects(const std::string& jsonStr, const std::string& arrayKey)
    {
        std::vector<std::string> objects;
        size_t keyPos = jsonStr.find("\"" + arrayKey + "\"");
        if (keyPos == std::string::npos)
        {
            return objects;
        }

        size_t arrayStart = jsonStr.find("[", keyPos);
        if (arrayStart == std::string::npos)
        {
            return objects;
        }

        size_t pos = arrayStart + 1;
        int braceCount = 0;
        size_t objStart = std::string::npos;
        bool inString = false;

        while (pos < jsonStr.size())
        {
            char c = jsonStr[pos];
            if (c == '"' && jsonStr[pos - 1] != '\\')
            {
                inString = !inString;
            }

            if (!inString)
            {
                if (c == '{')
                {
                    if (braceCount == 0)
                    {
                        objStart = pos;
                    }
                    braceCount++;
                }
                else if (c == '}')
                {
                    braceCount--;
                    if (braceCount == 0 && objStart != std::string::npos)
                    {
                        objects.push_back(jsonStr.substr(objStart, pos - objStart + 1));
                        objStart = std::string::npos;
                    }
                }
                else if (c == ']' && braceCount == 0)
                {
                    break;
                }
            }
            pos++;
        }
        return objects;
    }

    std::string extractStringField(const std::string& objStr, const std::string& key)
    {
        size_t keyPos = objStr.find("\"" + key + "\"");
        if (keyPos == std::string::npos)
        {
            return "";
        }

        size_t colonPos = objStr.find(":", keyPos);
        if (colonPos == std::string::npos)
        {
            return "";
        }

        size_t quoteStart = objStr.find("\"", colonPos);
        if (quoteStart == std::string::npos)
        {
            return "";
        }

        size_t quoteEnd = objStr.find("\"", quoteStart + 1);
        while (quoteEnd != std::string::npos && objStr[quoteEnd - 1] == '\\')
        {
            quoteEnd = objStr.find("\"", quoteEnd + 1);
        }

        if (quoteEnd == std::string::npos)
        {
            return "";
        }

        std::string val = objStr.substr(quoteStart + 1, quoteEnd - quoteStart - 1);
        
        std::string unescaped;
        unescaped.reserve(val.size());
        for (size_t i = 0; i < val.size(); ++i)
        {
            if (val[i] == '\\' && i + 1 < val.size())
            {
                char next = val[i + 1];
                if (next == 'n') unescaped += '\n';
                else if (next == 't') unescaped += '\t';
                else if (next == 'r') unescaped += '\r';
                else if (next == 'b') unescaped += '\b';
                else if (next == 'f') unescaped += '\f';
                else unescaped += next;
                i++;
            }
            else
            {
                unescaped += val[i];
            }
        }
        return unescaped;
    }

    int extractIntField(const std::string& objStr, const std::string& key)
    {
        size_t keyPos = objStr.find("\"" + key + "\"");
        if (keyPos == std::string::npos)
        {
            return 0;
        }

        size_t colonPos = objStr.find(":", keyPos);
        if (colonPos == std::string::npos)
        {
            return 0;
        }

        size_t numStart = colonPos + 1;
        while (numStart < objStr.size() && (std::isspace(objStr[numStart]) || objStr[numStart] == ':'))
        {
            numStart++;
        }

        size_t numEnd = numStart;
        while (numEnd < objStr.size() && (std::isdigit(objStr[numEnd]) || objStr[numEnd] == '-' || objStr[numEnd] == '+'))
        {
            numEnd++;
        }

        if (numStart == numEnd)
        {
            return 0;
        }

        try
        {
            return std::stoi(objStr.substr(numStart, numEnd - numStart));
        }
        catch (...)
        {
            return 0;
        }
    }
}

namespace json
{
    std::string escapeString(const std::string& s)
    {
        std::string res;
        res.reserve(s.size());
        for (char c : s)
        {
            if (c == '"') res += "\\\"";
            else if (c == '\\') res += "\\\\";
            else if (c == '/') res += "\\/";
            else if (c == '\b') res += "\\b";
            else if (c == '\f') res += "\\f";
            else if (c == '\n') res += "\\n";
            else if (c == '\r') res += "\\r";
            else if (c == '\t') res += "\\t";
            else res += c;
        }
        return res;
    }

    std::string seatAssignmentToJson(const SeatAssignment& sa, bool includeDecision)
    {
        std::string jsonStr = "{";
        jsonStr += "\"studentId\":" + std::to_string(sa.studentId) + ",";
        jsonStr += "\"rollNo\":\"" + escapeString(sa.rollNo) + "\",";
        jsonStr += "\"section\":\"" + escapeString(sa.section) + "\",";
        jsonStr += "\"classroomId\":" + std::to_string(sa.classroomId) + ",";
        jsonStr += "\"row\":" + std::to_string(sa.row) + ",";
        jsonStr += "\"col\":" + std::to_string(sa.col) + ",";
        jsonStr += "\"seatLabel\":\"" + escapeString(sa.seatLabel) + "\"";
        
        if (includeDecision)
        {
            jsonStr += ",\"decision\":{";
            jsonStr += "\"totalScore\":" + std::to_string(sa.decision.totalScore) + ",";
            jsonStr += "\"orthogonalPenalty\":" + std::to_string(sa.decision.orthogonalPenalty) + ",";
            jsonStr += "\"diagonalPenalty\":" + std::to_string(sa.decision.diagonalPenalty);
            jsonStr += "}";
        }

        jsonStr += "}";
        return jsonStr;
    }

    std::string allocationResultToJson(const AllocationResult& result, const EngineConfig& config)
    {
        if (result.validationError != ValidationError::OK)
        {
            std::string errStr = validationErrorToString(result.validationError);
            int code = validationErrorCode(result.validationError);

            std::string jsonStr = "{";
            jsonStr += "\"status\":\"error\",";
            jsonStr += "\"error\":\"" + escapeString(errStr) + "\",";
            jsonStr += "\"code\":" + std::to_string(code);
            jsonStr += "}";
            return jsonStr;
        }

        std::string jsonStr = "{";
        jsonStr += "\"status\":\"success\",";
        jsonStr += "\"algorithm\":\"Cooldown + Score Based\",";
        jsonStr += "\"traversal\":\"" + Traversal::strategyToString(config.traversal) + "\",";
        jsonStr += "\"generatedAt\":\"" + getISO8601Timestamp() + "\",";

        // Summary
        const auto& stats = result.stats;
        jsonStr += "\"summary\":{";
        jsonStr += "\"totalStudents\":" + std::to_string(stats.totalStudents) + ",";
        jsonStr += "\"totalRooms\":" + std::to_string(stats.totalRooms) + ",";
        jsonStr += "\"totalCapacity\":" + std::to_string(stats.totalCapacity) + ",";
        jsonStr += "\"occupiedSeats\":" + std::to_string(stats.occupiedSeats) + ",";
        jsonStr += "\"emptySeats\":" + std::to_string(stats.emptySeats) + ",";
        jsonStr += "\"occupancyPercentage\":" + std::to_string(stats.occupancyPercentage) + ",";
        jsonStr += "\"orthogonalConflicts\":" + std::to_string(stats.orthogonalConflicts) + ",";
        jsonStr += "\"diagonalConflicts\":" + std::to_string(stats.diagonalConflicts) + ",";
        jsonStr += "\"totalConflicts\":" + std::to_string(stats.totalConflicts) + ",";
        jsonStr += "\"averageConflictScore\":" + std::to_string(stats.averageConflictScore) + ",";
        jsonStr += "\"executionTimeMs\":" + std::to_string(stats.executionTimeMs);
        jsonStr += "},";

        // Assignments
        jsonStr += "\"assignments\":[";
        for (std::size_t i = 0; i < result.assignments.size(); ++i)
        {
            jsonStr += seatAssignmentToJson(result.assignments[i], config.includeDecisionMetadata);
            if (i + 1 < result.assignments.size())
            {
                jsonStr += ",";
            }
        }
        jsonStr += "]";

        jsonStr += "}";
        return jsonStr;
    }

    void writeOutputJson(const AllocationResult& result, const EngineConfig& config, const std::string& path)
    {
        std::ofstream file(path);
        if (!file.is_open())
        {
            std::cerr << "Error: Could not open output file: " << path << std::endl;
            return;
        }
        file << allocationResultToJson(result, config);
        file.close();
    }

    void readInputJson(
        const std::string&    path,
        std::vector<Student>& students,
        std::vector<Room>&    rooms)
    {
        std::ifstream file(path);
        if (!file.is_open())
        {
            std::cerr << "Error: Could not open input file: " << path << std::endl;
            return;
        }

        std::stringstream ss;
        ss << file.rdbuf();
        file.close();

        std::string json = ss.str();

        // Parse students
        std::vector<std::string> studentObjects = extractObjects(json, "students");
        students.reserve(studentObjects.size());
        for (const auto& objStr : studentObjects)
        {
            Student s;
            s.studentId = extractIntField(objStr, "studentId");
            s.rollNo = extractStringField(objStr, "rollNo");
            s.department = extractStringField(objStr, "department");
            s.section = extractStringField(objStr, "section");
            students.push_back(s);
        }

        // Parse rooms
        std::vector<std::string> roomObjects = extractObjects(json, "rooms");
        rooms.reserve(roomObjects.size());
        for (const auto& objStr : roomObjects)
        {
            Room r;
            r.classroomId = extractIntField(objStr, "classroomId");
            r.roomNo = extractStringField(objStr, "roomNo");
            r.rows = extractIntField(objStr, "rows");
            r.cols = extractIntField(objStr, "cols");
            rooms.push_back(r);
        }
    }
}
