const {join, delimiter} = require("path");
process.env.PATH = [join(__dirname, "..", "node_modules", ".bin"), ...process.env.PATH.split(delimiter)].join(delimiter);
