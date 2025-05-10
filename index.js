import express from "express";
import scrapper from "./ScrapperLogic/scrapper.js";

const app = express();

app.get("/test", (req, res) => res.status(200).send("Testing.."));

app.get("/scrap/:symbol", (req, res) => scrapper(req.params.symbol));

app.listen("3000", () => console.log("App is running"));
