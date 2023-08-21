#!/usr/bin/env node
if (! require("fs").existsSync(require("path").join("node_modules", "jake"))) {
    const { execSync } = require("child_process");
    execSync("npm install", { stdio: "inherit" });
}
const { run } = require("jake");
run.apply(global.jake, (process.argv.length > 2)?
    [`${process.argv[2]}[${process.argv.slice(3).join(",")}]`]:
    []
);
