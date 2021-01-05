const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

let coreVersion = "1.24.0";
let editorVersion = "1.24.1";

let coreFolder = path.resolve(__dirname, "../h5p/core");
let editorFolder = path.resolve(__dirname, "../h5p/editor");

// If the editor and core files are missing, we download them from GitHub.
if (!fs.existsSync(coreFolder || !fs.existsSync(editorFolder))) {
  let scriptPath = path.resolve(__dirname, "download-core.js");
  childProcess.execSync(`node ${scriptPath} ${coreVersion} ${editorVersion}`, { 'stdio': 'inherit' });
} else {
  console.log("Not downloading H5P Core and Editor files as they are already present!");
}

// We only download the content examples if the script is not executed in a 
// CI environment. In a CI environment the scripts must be downloaded later to
// be able to squeeze in the cache restore before downloading them.
if (process.env.CI != "true") {
  childProcess.execSync("npm run download:content", { 'stdio': 'inherit' });
} else {
  console.log("Not downloading content file as this is run in a CI environment. Execute npm run download:content to download the examples.");
}
