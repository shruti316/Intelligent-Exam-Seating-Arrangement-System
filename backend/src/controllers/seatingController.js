const seatingService = require("../services/seatingService");

const getSeatingInput = async (req, res) => {

    try {

        const examId = req.params.examId;

        const data = await seatingService.generateSeating(examId);

        res.json(data);

    } catch (err) {

        res.status(500).json(err);

    }

};

module.exports = {
    getSeatingInput
};