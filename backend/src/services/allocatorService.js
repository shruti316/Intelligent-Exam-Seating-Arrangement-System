const { spawn } = require("child_process");
const path = require("path");

const runAllocator = (inputPath, outputPath, strategy = "Snake") => {

    return new Promise((resolve, reject) => {

        const enginePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "cpp-engine"
        );

        const exePath = path.join(
            enginePath,
            "allocator.exe"
        );

        const process = spawn(exePath, [inputPath, outputPath, strategy]);

        let stderrData = "";

        process.stderr.on("data", (data) => {
            stderrData += data.toString();
        });

        const outputPath = path.join(
            enginePath,
            "test",
            "output.json"
        );

        const allocator = spawn(exePath, [
            inputPath,
            outputPath
        ]);

        allocator.on("close", (code) => {

            if (code === 0) {

                resolve({
                    success: true,
                    outputPath
                });

            } else {
                reject(new Error(`Allocator exited with code ${code}. Details: ${stderrData.trim() || 'No stderr details available.'}`));
            }

        });

        allocator.on("error", (err) => {
            reject(err);
        });

    });

};

module.exports = {
    runAllocator
};