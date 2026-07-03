const { spawn } = require("child_process");
const path = require("path");

const runAllocator = (inputPath, outputPath, strategy = "Snake") => {

    return new Promise((resolve, reject) => {

        const exePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "cpp-engine",
            "allocator.exe"
        );

        const process = spawn(exePath, [inputPath, outputPath, strategy]);

        let stderrData = "";

        process.stderr.on("data", (data) => {
            stderrData += data.toString();
        });

        process.on("close", (code) => {

            if (code === 0) {
                resolve("Allocator executed successfully.");
            } else {
                reject(new Error(`Allocator exited with code ${code}. Details: ${stderrData.trim() || 'No stderr details available.'}`));
            }

        });

        process.on("error", (err) => {
            reject(err);
        });

    });

};

module.exports = {
    runAllocator
};