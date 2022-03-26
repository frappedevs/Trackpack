![Trackpack](https://user-images.githubusercontent.com/40730127/160251837-562cfc10-0926-460c-a059-719f1c5c29ec.png)

# Trackpack
Pack your tracks into one (or multiple) tracks!

## Why?

This simple JavaScript is created in response of the recent change of how audio assets are uploaded in Roblox. Given that all current audios more than 6 seconds will be private and all new audio assets will be published as private asset by default. Game developers have to reupload all their audios within the threshold, otherwise will witness gamebreaking changes.

However, Roblox has also set a limit on how many audio assets can you upload per day, somes get 10, somes get 100, somes get 2000. For those who have smaller limits, reuploading all the audios within the threshold can be impossible as it is lesser than a month.

This is why Trackpack exists! To solve the issue above by combining all the audio assets into one single audio, as long as it fits in the audio asset limit (7 minutes and 19.5MB).

## Usage

Download this source code & install all required dependencies with your favourite package manager (pnpm, Yarn or npm). Then, run `node index.js` once. Put all your downloaded audio assets into the `input` folder, run the same command again. It will generate a new folder inside `output` folder, there will be the packed tracks along with the track data so you can refer to when you are playing it in the game.

The track JSON file contains the packed track name, what is contained, as well as each track's timestamp position.

## License

MIT
