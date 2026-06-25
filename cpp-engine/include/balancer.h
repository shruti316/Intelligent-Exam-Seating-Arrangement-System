#pragma once

#include "models.h"
#include <queue>
#include <string>
#include <unordered_map>
#include <vector>

namespace Balancer
{
    struct SectionInfo
    {
        int remaining;
        std::string section;

        // Ordering is based on remaining count (max-heap) and tie-broken lexicographically
        bool operator<(const SectionInfo& other) const
        {
            if (remaining != other.remaining)
            {
                return remaining < other.remaining;
            }
            return section > other.section; // deterministic lexicographical tie-break
        }
    };

    struct CooldownItem
    {
        SectionInfo info;
        int releaseStep;
    };

    std::unordered_map<std::string, std::queue<Student>>
    groupStudentsBySection(const std::vector<Student>& students);

    std::vector<Student> buildBalancedOrder(
        std::unordered_map<std::string, std::queue<Student>>& sectionGroups);
}
