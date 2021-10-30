const Discord = require("discord.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_WEBHOOKS"],
});
const randomstring = require("randomstring");

var admin = require("firebase-admin");
var serviceAccount = require("./firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const DB = admin.firestore();
const prefix = ".";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  if (msg.author === client.user) {
    return;
  }
  try {
    if (msg.content.toLowerCase().startsWith(prefix + "todo")) {
      //add to the To Do List
      var original = msg.content;
      var result = original.substr(original.indexOf(" ") + 1);
      await DB.collection(msg.author.id)
        .doc(result)
        .set({
          To_Do_List: result,
          User: msg.author.username,
        })
        .then(() => {
          msg.reply("List Added");
        })
        .catch((error) => {
          msg.reply("Error");
        });
    }
    if (msg.content.toLowerCase().startsWith(prefix + "list")) {
      var stack = [];
      await DB.collection(msg.author.id)
        .get()
        .then((list) => {
          var str = "To Do List: " + "\n";
          var count = 1;
          list.forEach((doc) => {
            stack.push(doc.id);
          });
          while (stack.length > 0) {
            str += count + ") " + stack.pop() + "\n";
            count += 1;
          }
          msg.reply(str);
        });
    }
    if (msg.content.toLowerCase().startsWith(prefix + "remove")) {
      var original = msg.content;
      var result = original.substr(original.indexOf(" ") + 1);
      const docRef = DB.collection(msg.author.id).doc(result);
      await docRef.get().then((doc) => {
        if (doc.exists) {
          docRef
            .delete()
            .then(() => {
              msg.reply("Deleted");
            })
            .catch((error) => {
              msg.reply("Error");
            });
        }
      });
    }
  } catch (err) {
    msg.reply(err);
  }
});

const token = "OTAwOTU1NDQ5NDU5ODg0MTA0.YXI2Jg.pE-oWP3HrtP_Ir0RRj0X0va0B-U";
client.login(token);
