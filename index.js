﻿const Discord = require("discord.js");
const colors = require("colors");
const fs = require("fs");

const client = new Discord.Client({
  messageCacheLifetime: 60,
  fetchAllMembers: false,
  messageCacheMaxSize: 10,
  restTimeOffset: 0,
  restWsBridgetimeout: 100,
  disableEveryone: true,
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
require('discord-buttons')(client);
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.categories = fs.readdirSync("./commands/");
client.cooldowns = new Discord.Collection();

["command", "events"].forEach((handler) => {
  try {
    require(`./handlers/${handler}`)(client);
  } catch (e) {
    console.log(e);
  }
});
["erela_js_handler", "erela_js_node_log"].forEach((handler) => {
  try {
    require(`./handlers/lavalink/${handler}`)(client);
  } catch (e) {
    console.log(e);
  }
});

client.login(require('./botconfig/config.json').token);

const Enmap = require("enmap");
client.settings = new Enmap({
  name: "settings",
  dataDir: "./database/settings",
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at: " + promise);
  console.log("Reason: " + reason);
});
process.on("uncaughtException", (err, origin) => {
  console.log("Caught exception: " + err);
  console.log("Origin: " + origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(err);
  console.log("Origin: " + origin);
});
process.on("beforeExit", (code) => {
  console.log("Process beforeExit event with code: ", code);
});
process.on("exit", (code) => {
  console.log("Process exit event with code: ", code);
});
process.on("multipleResolves", (type, promise, reason) => {
  console.log(type, promise, reason);
});