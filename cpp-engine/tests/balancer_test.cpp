#include "../include/models.h"
#include "../include/balancer.h"
#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <cassert>

void runBalancerTests()
{
    std::cout << "[Balancer Tests] Starting..." << std::endl;

    // Test 1: Complete scheduling of all students
    {
        std::vector<Student> students = {
            {1, "CS001", "CSE", "A"},
            {2, "CS002", "CSE", "A"},
            {3, "EE015", "EE", "B"},
            {4, "EC042", "ECE", "A"},
            {5, "ME089", "ME", "C"}
        };

        auto groups = Balancer::groupStudentsBySection(students);
        auto ordered = Balancer::buildBalancedOrder(groups);

        // Verify size
        assert(ordered.size() == students.size());

        // Verify every student ID is present
        std::unordered_map<int, bool> found;
        for (const auto& student : ordered)
        {
            found[student.studentId] = true;
        }
        for (const auto& student : students)
        {
            assert(found[student.studentId]);
        }
    }

    // Test 2: Lexicographical sorting when frequencies are equal
    {
        // Sections A, B, and C each have exactly 1 student.
        // Equal frequencies -> should sort lexicographically: A, B, C.
        std::vector<Student> students = {
            {3, "ME089", "ME", "C"},
            {1, "EE015", "EE", "B"},
            {2, "CS001", "CSE", "A"}
        };

        auto groups = Balancer::groupStudentsBySection(students);
        auto ordered = Balancer::buildBalancedOrder(groups);

        assert(ordered.size() == 3);
        assert(ordered[0].section == "A");
        assert(ordered[1].section == "B");
        assert(ordered[2].section == "C");
    }

    // Test 3: Frequency balancing and cooldown distribution
    {
        // Section A has 4 students, Section B has 2 students, Section C has 1 student.
        // Balance distribution should attempt to space out Section A's.
        std::vector<Student> students = {
            {1, "CS01", "CSE", "A"},
            {2, "CS02", "CSE", "A"},
            {3, "CS03", "CSE", "A"},
            {4, "CS04", "CSE", "A"},
            {5, "EE01", "EE", "B"},
            {6, "EE02", "EE", "B"},
            {7, "ME01", "ME", "C"}
        };

        auto groups = Balancer::groupStudentsBySection(students);
        auto ordered = Balancer::buildBalancedOrder(groups);

        assert(ordered.size() == 7);
        // Section A is the highest frequency. It should be popped first because frequency is largest.
        assert(ordered[0].section == "A");
        // Then B (second highest frequency).
        assert(ordered[1].section == "B");
        // Then back to A because B went to cooldown.
        assert(ordered[2].section == "A");
    }

    std::cout << "[Balancer Tests] All balancer tests passed successfully!" << std::endl;
}
