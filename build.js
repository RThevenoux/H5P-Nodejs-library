const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

fs.emptyDirSync(path.join(__dirname, 'build'));

childProcess.execSync("npx tsc -p ./tsconfig.build.json", { 'stdio': 'inherit' });
childProcess.execSync("npx tsc -p ./tsconfig.client.json", { 'stdio': 'inherit' });

fs.copySync(path.join(__dirname, 'src/schemas'), path.join(__dirname, 'build/src/schemas'));
fs.copySync(path.join(__dirname, 'assets'), path.join(__dirname, 'build'));