const Discord = require("discord.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_WEBHOOKS"],
});
const randomstring = require("randomstring");
const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: `` });

const prefix = "*gb ";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
const firebaseConfig = {
  apiKey: "AIzaSyCDjJ23MQcD82JFlQRhL-9GYt6rdAphoRQ",
  authDomain: "accord-mk1.firebaseapp.com",
  projectId: "accord-mk1",
  storageBucket: "accord-mk1.appspot.com",
  messagingSenderId: "883559553312",
  appId: "1:883559553312:web:3b08417c44e9c2d39e1f45",
  measurementId: "G-K7LRFEBXG0",
};

client.on("message", (msg) => {
  if (msg.content === prefix + "ping") {
    msg.reply("pang");
  }
});

client.on("message", (msg) => {
  if (msg.content.toLowerCase().startsWith(prefix + "clearchat")) {
    async function clear() {
      msg.delete();
      const fetched = await msg.channel.messages.fetch({ limit: 99 });
      msg.channel.bulkDelete(fetched);
    }
    clear();
  }

  if (msg.content === "*gb") {
    msg.reply("not a valid command");
  }
  if (msg.content.toLowerCase().startsWith(prefix + "get")) {
    const words = msg.content.split(" ");
    if (words.length < 4) {
      msg.reply("try command *gb get owner repo");
    } else {
      getPullRequests(words[2], words[3]);
    }
  }
  if (msg.content.toLowerCase().startsWith(prefix + "todo")) {
    const ooga = "ooga"
    toDo(ooga);
  }
  if (msg.content.toLowerCase().startsWith(prefix + "issues")) {
  }
});
async function toDo(ooga)
{
    let ticket = randomstring.generate(7);
    await DB.collection("toDo").add({
      ticketMessage: message.content,
      User: message.author.username,
      User_ID: message.author.id,
      Ticket_Number: ticketMessage,
    });
    msg.reply("works");
}
async function getPullRequests(owner, repo) {
  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner: owner,
      repo: repo,
    });
    if (result.status === 200) {
      //repo, name
      //repo , description
      ////html_url
      //number
      //title

      //user, login
      //"body"
      console.log(`${result.status} is type: ${typeof result.status}`);
      console.log(`${result.data[0]["user"]["login"]}`);
      console.log(`${result.data[0]["head"]["repo"]["description"]}`);
    } else {
      console.log(`Error code: ${result.status}`);
    }
  } catch (err) {
    console.log(`${err}`);
  }
}

const token = "OTAwOTU1NDQ5NDU5ODg0MTA0.YXI2Jg.FtilXUUfVwksBNu8K47BuU1YtA0";
client.login(token);
