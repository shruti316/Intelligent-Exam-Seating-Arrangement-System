const { spawn } = require("child_process");
const path = require("path");

const runAllocator = () => {

    return new Promise((resolve, reject) => {

        const exePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "cpp-engine",
            "allocator.exe"
        );

        const process = spawn(exePath);

        process.on("close", (code) => {

            if (code === 0) {
                resolve("Allocator executed successfully.");
            } else {
                reject(new Error(`Allocator exited with code ${code}`));
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