import { v4 as uuidv4 } from "uuid";
import YoutubeMp3Downloader from "youtube-mp3-downloader";
import pathToFfmpeg from "ffmpeg-static";
import https from "https";
import readline from "readline";
import makeArchive from "./archive";
import { MessageAttachment, Message } from "discord.js";
import { cleanup, createDirIfNotExist, prepareOutDir } from "./file-management";

export default async (message: Message) => {
  const attachment = message.attachments.first();

  if (attachment === undefined) {
    message.reply("Missing attachment");
    return;
  }

  const uuid = uuidv4();
  const mp3path = `./out/${uuid}`;
  const zipPath = `./archives/${uuid}.zip`;

  await prepareOutDir(uuid);
  await createDirIfNotExist("archives");

  const YD = new YoutubeMp3Downloader({
    ffmpegPath: pathToFfmpeg, // FFmpeg binary location
    outputPath: mp3path, // Output file location (default: the home directory)
    youtubeVideoQuality: "highestaudio", // Desired video quality (default: highestaudio)
    queueParallelism: 30, // Download parallelism (default: 1)
    progressTimeout: 2000, // Interval in ms for the progress reports (default: 1000)
    allowWebm: false, // Enable download from WebM sources (default: false)
  });

  YD.on("progress", (progress) => {
    console.log(JSON.stringify(progress));
  });

  YD.on("error", (err) => {
    console.error(err);
  });

  let lines = 0;
  let finishedDownloads = 0;

  https.get(attachment.url, (response) => {
    const lineReader = readline.createInterface({
      input: response,
    });

    lineReader.on("line", (line: string) => {
      if (line === "") return;

      const youtubeId = new URL(line).searchParams.get("v");
      if (youtubeId !== null) {
        lines++;
        YD.download(youtubeId);
      }
    });

    YD.on("finished", async () => {
      finishedDownloads++;

      if (finishedDownloads === lines) {
        console.log("Finished all");
        await makeArchive(mp3path, zipPath);
        message.reply(`${process.env.APP_URL}/archives/${uuid}.zip`);
        await cleanup(uuid);
      }
    });
  });
};
