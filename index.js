import express from "express";
import scrapper from "./ScrapperLogic/scrapper.js";
import { Client, Events, GatewayIntentBits, IntentsBitField } from "discord.js";
import "dotenv/config";

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
    console.log(msgArray[1]);
    const data = await scrapper(msgArray[1]);
    console.log(data);
    msg.reply(msgArray[1] + " Price: " + data);
  }
});

app.listen("3000", () => console.log("App is running"));
