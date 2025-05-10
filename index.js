import express from "express";
import scrapper from "./ScrapperLogic/scrapper.js";

const app = express();

app.get("/test", (req, res) => res.status(200).send("Testing.."));

app.get("/scrap/:symbol", async (req, res) => {
  const data = await scrapper(req.params.symbol);
  res.status(200).send(req.params.symbol + " Price: " + data);
});

app.listen("3000", () => console.log("App is running"));
