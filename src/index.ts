import express from "express";
import path from "path";
import { Client } from "discord.js";
import handleDownload from "./downloader";
import hsp from "heroku-self-ping";

if (process.env.NODE_ENV === "production") {
  // Keep heroku app alive by pinging it
  hsp(process.env.APP_URL);
}

/*
Express web server
 */
const app = express();
const port = process.env.PORT || 3000;

app.use("/", express.static(path.join(__dirname, "..", "public")));
app.use("/archives", express.static(path.join(__dirname, "..", "archives")));

app.listen(port, () => {
  console.log(`Example app listening at port: ${port}`);
});

/*
Discord bot
 */

const client = new Client();
const prefix = "!";

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = (args.shift() as string).toLowerCase();

  if (command === "dl") {
    await handleDownload(message);
  }
});

client.login(process.env.BOT_TOKEN).catch(() => {
  console.log("Unable to login to discord");
});
