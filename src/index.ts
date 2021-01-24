import express from "express";
import path from "path";
import { Client } from "discord.js";
import handleDownload from "./downloader";
import hsp from "heroku-self-ping";

if (process.env.NODE_ENV === "production") {
  hsp(process.env.APP_URL);
}

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

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/archives", express.static(path.join(__dirname, "..", "archives")));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
