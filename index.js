import express from "express";
import scrapper from "./ScrapperLogic/scrapper.js";
import { Client, Events, GatewayIntentBits, IntentsBitField } from "discord.js";
import "dotenv/config";
import scrapperService from "./ScrapperLogic/NepseScrapper.js";
import sharehubScrapperService from "./ScrapperLogic/ShareHubScrapper.js";
import fs from "fs";
import { websiteScreensShot } from "./ScrapperLogic/WebsiteScreenShot.js";

const app = express();

app.get("/test", (req, res) => res.status(200).send("Testing.."));

app.get("/scrap/:symbol", async (req, res) => {
  const data = await scrapper(req.params.symbol);
  res.status(200).send(req.params.symbol + " Price: " + data);
});

//Discord Bot
// Create a new client instance
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token

client.login(process.env.DS_BOT_TOKEN);

client.on("messageCreate", async (msg) => {
  const msgArray = msg.content.split(" ");

  if (msgArray[0] == "priceInf") {
    const data = await scrapper(msgArray[1]);
    console.log(data);
    msg.reply(msgArray[1] + " Price: " + data);
  }

  if (msgArray[0] == "ss") {
    try {
      const filePath = await websiteScreensShot(msgArray[1]);
      await msg.reply({
        content: `Screenshot of ${msgArray[1]}`,
        files: [filePath],
      });

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error taking screenshot:", error.message);
      msg.reply("Failed to take a screenshot.");
    }
  }

  if (msgArray == "nepsestat") {
    try {
      const filePath = await scrapperService.screenShotNepseStat();
      await msg.reply({
        content: `Screenshot of Nepse Status`,
        files: [filePath],
      });

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error taking screenshot:", error.message);
      msg.reply("Failed to take a screenshot.");
    }
  }

  if (msgArray == "nepsetg") {
    try {
      const filePath = await scrapperService.topGainer();
      await msg.reply({
        content: `Screenshot of Nepse Status`,
        files: [filePath],
      });

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error taking screenshot:", error.message);
      msg.reply("Failed to take a screenshot.");
    }
  }

  if (msgArray == "nepsetl") {
    try {
      const filePath = await scrapperService.topLoser();
      await msg.reply({
        content: `Screenshot of Nepse Status`,
        files: [filePath],
      });

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error taking screenshot:", error.message);
      msg.reply("Failed to take a screenshot.");
    }
  }

  if (msgArray[0] == "sharehInf") {
    try {
      const filePath = await sharehubScrapperService.stockDetails(msgArray[1]);
      await msg.reply({
        content: `Screenshot of Nepse Status`,
        files: [filePath],
      });

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error taking screenshot:", error.message);
      msg.reply("Failed to take a screenshot.");
    }
  }
});

app.listen("3000", () => console.log("App is running"));
