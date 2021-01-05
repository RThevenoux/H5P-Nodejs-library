// Call this script with the version of the H5P core as the first argument 
// (= version tag of h5p-php-library) and the H5P editor as the second argument
// (= version tag of h5p-editor-php-library).
// Example: scripts/download-core.js 1.24.0 1.24.1

const axios = require('axios').default;
const yauzl = require('yauzl');
const fs = require('fs-extra');
const path = require('path');


// Read arguments
let core_version = process.argv[2];
if (!core_version) {
  console.log("You must add the H5P core version as the first argument to this script.");
  process.exit(1);
}
let editor_version = (process.argv[3] ? process.argv[3] : core_version);


let base = path.resolve(__dirname, "../h5p");
let libFolder = path.join(base, 'libraries');
fs.ensureDirSync(libFolder);

// Download Core
console.log(`Downloading H5P core v${core_version}...`);
let coreUrl = `https://github.com/h5p/h5p-php-library/archive/${core_version}.zip`;
let coreFolder = path.join(base, 'core');
list(coreUrl, coreFolder)
  .then(() => console.log(" H5P core downloaded"));

// Download Editor
console.log(`Downloading H5P editor v${editor_version}...`);
let editorUrl = `https://github.com/h5p/h5p-editor-php-library/archive/${editor_version}.zip`;
let editorFolder = path.join(base, 'editor');
list(editorUrl, editorFolder)
  .then(() => console.log(" H5P editor downloaded"));

async function list(url, destFolder) {
  let zipfile = await downloadAndOpenZip(url);

  fs.emptyDirSync(destFolder);

  return new Promise((resolve, reject) => {
    zipfile.on("entry", async (entry) => {
      treateEntry(entry, zipfile, destFolder)
        .then(() => zipfile.readEntry())
        .catch(err => reject(err));
    });
    zipfile.once("error", reject);
    zipfile.once("end", resolve);

    zipfile.readEntry();
  });
}

async function treateEntry(entry, zipfile, destFolder) {
  // Ignore folder and capture fileName without first folder
  let fileRegex = /^[^\/]+\/(.*[^\/])$/;
  let match = entry.fileName.match(fileRegex);
  if (match) {
    let buffer = await openEntryAsBuffer(zipfile, entry);
    let filePath = path.join(destFolder, match[1]);
    fs.outputFileSync(filePath, buffer);
  }
}

async function downloadAndOpenZip(url) {
  let response = await axios.get(url, { responseType: 'arraybuffer' });

  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(response.data, { lazyEntries: true }, (err, zipfile) => {
      if (err)
        reject(err);
      else
        resolve(zipfile);
    });
  });
}

function openEntryAsBuffer(zipFile, entry) {
  return new Promise((resolve, reject) => {
    zipFile.openReadStream(entry, (err, stream) => {
      if (err) return reject(err);
      const chunks = [];

      stream.on('data', chunk => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));

    });
  });
}