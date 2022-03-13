const fs = require("fs");
const path = require("path");
const glob = require("glob");
const mp3Duration = require("mp3-duration");
const audioconcat = require("audioconcat");

const sizeLimit = 18.5;
const durationLimit = 420;

if (!fs.existsSync("./input")) {
  fs.mkdirSync("./input");
  throw new Error("No input folder found");
}

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

function getTrackDuration(track) {
  return new Promise(function (resolve, reject) {
    mp3Duration(track)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => reject(err));
  });
}

async function main() {
  const files = glob.sync("./input/*.mp3");
  if (files.length === 0) {
    throw new Error("No mp3 files found");
  }

  const tracks = [];
  const tracksName = `tracks-${Date.now()}`;
  let track = {
    duration: 0,
    size: 0,
    name: `track-${tracks.length + 1}`,
    data: {},
    tracks: [],
  };

  for (const element of files) {
    console.log(element);
    const fileSize = fs.statSync(element).size / 1024 / 1024;
    const duration = await getTrackDuration(element);

    if (
      duration + track.duration > durationLimit &&
      fileSize + track.size > sizeLimit
    ) {
      tracks.push(track);
      track = {
        duration: 0,
        size: 0,
        name: `track-${tracks.length + 1}`,
        data: {},
        tracks: [],
      };
    }

    track.tracks.push(element);
    track.data[path.parse(element).name] = {
      start: track.duration,
      end: track.duration + duration,
    };
    track.duration += duration;
    track.size += fileSize;
  }

  tracks.push(track);
  fs.mkdirSync(`./output/${tracksName}`);
  fs.writeFileSync(
    `./output/${tracksName}/tracks.json`,
    JSON.stringify(tracks, null, "\t"),
    "utf-8"
  );

  for (let [index, val] of tracks.entries()) {
    audioconcat(val.tracks)
      .concat(`./output/${tracksName}/track-${index + 1}.mp3`)
      .on("start", function (command) {
        console.log(`ffmpeg process: ${command}`);
      })
      .on("error", function (err, stdout, stderr) {
        console.error(`ffmpeg process error: ${err}`);
      })
      .on("end", function (out) {
        console.log(`ffmpeg process OK: ${out}`);
      });
  }
}

main();
