const db = require("../config/db");

const getDashboardStats = async (req, res) => {

    try {

        // Run queries in parallel using promises
        const getCount = (query) => {
            return new Promise((resolve, reject) => {
                db.query(query, (err, result) => {
                    if (err) return reject(err);
                    resolve(result[0]);
                });
            });
        };

        const [
            studentsCount, 
            examsCount, 
            classroomsCount, 
            seatingPlansCount,
            seatsSum,
            lastPlan
        ] = await Promise.all([
            getCount("SELECT COUNT(*) AS count FROM students"),
            getCount("SELECT COUNT(*) AS count FROM exams"),
            getCount("SELECT COUNT(*) AS count FROM classrooms"),
            getCount("SELECT COUNT(*) AS count FROM seating_plans"),
            getCount("SELECT COALESCE(SUM(capacity), 0) AS count FROM classrooms"),
            new Promise((resolve) => {
                db.query("SELECT * FROM seating_plans ORDER BY generated_at DESC LIMIT 1", (err, result) => {
                    if (err || result.length === 0) resolve(null);
                    else resolve(result[0]);
                });
            })
        ]);

        const totalStudents = studentsCount.count;
        const totalClassrooms = classroomsCount.count;
        const totalExams = examsCount.count;
        const totalSeatingPlans = seatingPlansCount.count;
        const totalSeats = seatsSum.count;

        const occupancyPercentage = totalSeats > 0 ? Math.round((totalStudents / totalSeats) * 100) : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                totalClassrooms,
                totalExams,
                totalSeatingPlans,
                totalSeats,
                occupancyPercentage,
                latestPlan: lastPlan ? {
                    planId: lastPlan.plan_id,
                    examId: lastPlan.exam_id,
                    generatedAt: lastPlan.generated_at,
                    totalStudents: lastPlan.total_students,
                    occupiedSeats: lastPlan.occupied_seats,
                    emptySeats: lastPlan.empty_seats,
                    conflictCount: lastPlan.conflict_count,
                    executionTimeMs: lastPlan.execution_time_ms
                } : null
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getDashboardStats
};
