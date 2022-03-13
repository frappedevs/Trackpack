const fs = require("fs");
const path = require("path");
const glob = require("glob");
const ffmpeg = require('fluent-ffmpeg');

const sizeLimit = 18.5;
const durationLimit = 420;

if (!fs.existsSync("./input")) {
  fs.mkdirSync("./input");
  throw new Error("No input folder found");
}

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

if (!fs.existsSync("./converted")) {
  fs.mkdirSync("./converted");
}

function getTrackDuration(track) {
  return new Promise(function (resolve, reject) {
    ffmpeg.ffprobe(track, function(err, info) {
      if (err) reject(err);
      resolve(info.format.duration);
    })
  });
}

function convert2Ogg(track) {
  return new Promise(function (resolve, reject) {
      ffmpeg(track)
        .audioCodec('libvorbis')
        .format('ogg')
        .save(`./converted/${path.parse(track).name}.ogg`)
        .on('error', function(err) {
          reject(err);
        })
        .on('end', function() {
          resolve(`./converted/${path.parse(track).name}.ogg`);
        })
  })
}

async function main() {
  const files = glob.sync("./input/*");
  if (files.length === 0) {
    throw new Error("No files found");
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

  for (var element of files) {
    console.log(`Processing ${element}`);

    element = await convert2Ogg(element);
    const fileSize = fs.statSync(element).size / 1024 / 1024;
    const duration = await getTrackDuration(element);

    if (
      duration + track.duration > durationLimit ||
      fileSize + track.size > sizeLimit
    ) {
      console.log(`Creating a new track...`)
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
    console.log(`Processing track ${index + 1}`);
    const command = ffmpeg();
    for (const track of val.tracks) {
      command.input(track)
    }
    
    command.mergeToFile(`./output/${tracksName}/track-${index + 1}.ogg`, `./output/${tracksName}/.temp.track-${index + 1}.ogg`)
    command.on('end', function() {
      for (const track of val.tracks) {
        fs.rmSync(track);
      }
    })
  }

  console.log(`Complete process at ./output/${tracksName}`);
}

main();
