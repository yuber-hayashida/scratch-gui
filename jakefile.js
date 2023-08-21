const { desc, task, namespace } = require("jake");

const getLatestModifiedTime = (dir) => {
    const fs = require('fs');
    const path = require('path');

    let latestTime = 0;
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const innerTime = getLatestModifiedTime(filePath);
            if (innerTime > latestTime) {
                latestTime = innerTime;
            }
        } else {
            if (stats.mtimeMs > latestTime) {
                latestTime = stats.mtimeMs
            }
        }
    });

    return latestTime;
};

const hasNewerFile = (dirsToCheck, buildDir) => {
    const latestBuildTime = getLatestModifiedTime(buildDir);
    // console.log(latestBuildTime, latestBuildFile)
    //console.log(getLatestModifiedTime("src"))
    return dirsToCheck.some((dir) => getLatestModifiedTime(dir) > latestBuildTime);
}

namespace("build", () => {
    desc("Build for development")
    task("development", async () => {
        const shell = require("shelljs");
        if (hasNewerFile(["./src"], "build")) {
            shell.exec("npm run build");
        }
    });

    desc("Build for production")
    task("production", async () => {
        const shell = require("shelljs");
        shell.exec("npm run build");
    });
});
