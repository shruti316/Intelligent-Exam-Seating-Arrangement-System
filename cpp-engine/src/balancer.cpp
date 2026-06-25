#include "../include/balancer.h"
#include <algorithm>

namespace Balancer
{
    std::unordered_map<std::string, std::queue<Student>>
    groupStudentsBySection(const std::vector<Student>& students)
    {
        std::unordered_map<std::string, std::queue<Student>> sectionGroups;
        for (const auto& student : students)
        {
            sectionGroups[student.section].push(student);
        }
        return sectionGroups;
    }

    std::vector<Student> buildBalancedOrder(
        std::unordered_map<std::string, std::queue<Student>>& sectionGroups)
    {
        int totalStudents = 0;
        int maxFreq = 0;

        for (const auto& pair : sectionGroups)
        {
            int size = static_cast<int>(pair.second.size());
            totalStudents += size;
            if (size > maxFreq)
            {
                maxFreq = size;
            }
        }

        if (totalStudents == 0)
        {
            return {};
        }

        // Target cooldown spacing
        int targetCooldown = maxFreq > 0 ? (totalStudents / maxFreq) : 1;
        if (targetCooldown < 2)
        {
            targetCooldown = 2; // Avoid adjacent same-section whenever possible
        }

        std::priority_queue<SectionInfo> pq;
        for (const auto& pair : sectionGroups)
        {
            if (!pair.second.empty())
            {
                pq.push({static_cast<int>(pair.second.size()), pair.first});
            }
        }

        std::vector<Student> orderedStudents;
        orderedStudents.reserve(totalStudents);

        std::queue<CooldownItem> cooldownQueue;

        for (int step = 0; step < totalStudents; ++step)
        {
            // 1. Release expired cooldown items
            while (!cooldownQueue.empty() && cooldownQueue.front().releaseStep <= step)
            {
                CooldownItem item = cooldownQueue.front();
                cooldownQueue.pop();
                if (item.info.remaining > 0)
                {
                    pq.push(item.info);
                }
            }

            // 2. If pq is empty, pull all remaining elements from cooldown to guarantee scheduling
            if (pq.empty())
            {
                while (!cooldownQueue.empty())
                {
                    CooldownItem item = cooldownQueue.front();
                    cooldownQueue.pop();
                    if (item.info.remaining > 0)
                    {
                        pq.push(item.info);
                    }
                }
            }

            // Safety check: if no sections remaining, stop
            if (pq.empty())
            {
                break;
            }

            // 3. Extract top section
            SectionInfo current = pq.top();
            pq.pop();

            // 4. Place student
            if (!sectionGroups[current.section].empty())
            {
                Student student = sectionGroups[current.section].front();
                sectionGroups[current.section].pop();
                orderedStudents.push_back(student);
            }

            // 5. Place on cooldown if students remain
            current.remaining--;
            if (current.remaining > 0)
            {
                cooldownQueue.push({current, step + targetCooldown});
            }
        }

        return orderedStudents;
    }
}
