const {desc, task, run} = require("jake");

desc("Display the tasks with descriptions if you run `jake` with no task specified");
task("default", function () {
    const { run } = require("jake");
    run.apply(global.jake, ["--tasks"]);
});
