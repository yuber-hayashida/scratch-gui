const { namespace, desc, task } = require("jake");

const path = require("path");
const getPackageJsonPath = () => path.join(__dirname, "..", "package.json");

const update = async () => {
    const fs = require('fs').promises;
    const contentJson = await fs.readFile(getPackageJsonPath(), "utf8");
    const content = JSON.parse(contentJson);
    const pickBy = require("lodash/pickBy");
    content["scripts"] = pickBy(content["scripts"], (value, key)  => {
        return `jake ${key}` !== value &&
            `node jake ${key}` !== value;
    });
    content["scripts-info"] = content["scripts-info"] ? pickBy(content["scripts-info"], (value, _)  => {
        return (! value.startsWith("jake: "));
    }) : {};
    const tasks = [];
    const descriptions = {};
    for (let p in global.jake.Task) {
        if (p.startsWith("_")) {
            continue
        }
        // if (p.startsWith("scripts:")) {
        //     continue;
        // }
        if (! Object.prototype.hasOwnProperty.call(jake.Task, p)) {
            continue;
        }
        const task = jake.Task[p];
        if (! task.hasOwnProperty("name")) {
            continue;
        }
        descriptions[p] = task["description"];
        tasks.push(p);
    }
    tasks.sort().forEach(task => {
        content["scripts"][task] = `node jake ${task}`;
        content["scripts-info"][task] = `jake: ${descriptions[task]}`;
    });
    await fs.writeFile(getPackageJsonPath(), JSON.stringify(content, null, 2));
}

namespace("scripts", () => {
    desc("Update NPM-scripts in package.json");
    task("update", async () => await update());
});
