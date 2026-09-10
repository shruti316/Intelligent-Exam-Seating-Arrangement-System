const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

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

        if (!fs.existsSync(exePath)) {
            return reject(new Error(`Allocator executable not found at: ${exePath}`));
        }

        const allocatorProcess = spawn(exePath, [inputPath, outputPath, strategy]);

        let stdoutData = "";
        let stderrData = "";

        allocatorProcess.stdout.on("data", (data) => {
            stdoutData += data.toString();
        });

        allocatorProcess.stderr.on("data", (data) => {
            stderrData += data.toString();
        });

        allocatorProcess.on("close", (code) => {
            if (code === 0) {
                if (!fs.existsSync(outputPath)) {
                    return reject(new Error("Allocator completed with code 0 but output JSON file was not created."));
                }
                resolve({
                    success: true,
                    outputPath,
                    stdout: stdoutData
                });
            } else {
                const details = stderrData.trim() || stdoutData.trim() || `Exit code ${code}`;
                reject(new Error(`Allocator execution failed with exit code ${code}. Details: ${details}`));
            }
        });

        allocatorProcess.on("error", (err) => {
            reject(new Error(`Failed to start allocator process: ${err.message}`));
        });
    });
};

module.exports = {
    runAllocator
};