const seatingService = require("../services/seatingService");
const viewSeatingService = require("../services/viewSeatingService");

// GET /api/seating/input/:examId
const getSeatingInput = async (req, res) => {

    try {

        const examId = req.params.examId;
        const data = await seatingService.generateSeating(examId);

        res.json(data);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// POST /api/seating/generate
const generateSeating = async (req, res) => {

    try {

        const { examId } = req.body;

        if (!examId) {
            return res.status(400).json({
                success: false,
                message: "examId is required."
            });
        }

        const data = await seatingService.generateSeating(examId);

        res.status(200).json({
            success: true,
            message: "Input JSON generated successfully.",
            data
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// GET /api/seating/:examId
const getSeatingByExam = async (req, res) => {

    try {

        const examId = req.params.examId;

        const seating = await viewSeatingService.getSeatingByExam(examId);

        res.status(200).json({
            success: true,
            data: seating
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    getSeatingInput,
    generateSeating,
    getSeatingByExam
};