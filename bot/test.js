const Discord = require("discord.js");
require("dotenv").config();
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});
const token = process.env.BOT_TOKEN;
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const DB = admin.firestore();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//have to clean this up later
client.on("messageCreate", async (message) => {
  if (message.author === client.user) {
    return;
  }
  try {
    //creating a new goal
    if (message.content.startsWith("!createGoal")) {
      const [command, ...args] = message.content.split(" ");
      await DB.collection("Goals")
        .doc(args.join(" "))
        .set({
          GoalDescription: " ",
          ExpectedGoalCompleteDate: " ",
          GoalAuthor: message.author.username,
          GoalCreated: new Date(
            admin.firestore.Timestamp.now().seconds * 1000
          ).toLocaleDateString(), //admin.firestore.Timestamp.fromDate(new Date())
        })
        .then(() => {
          console.log("Document written");
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
      message.channel.send(
        "```Goal has been created. Type '!ls' to view a list of goals.```"
      );
    }
    //listing all goals
    if (message.content == "!ls") {
      await DB.collection("Goals")
        .get()
        .then((goals) => {
          var str = "```Current List of Goals:" + "\n\n";
          var numbering = 1;
          goals.forEach((doc) => {
            str += numbering + ")" + doc.id + "\n\n";
            numbering += 1;
          });
          str += "```";
          message.channel.send(str);
        })
        .then(() => {
          console.log("Document written");
        })
        .catch((error) => {
          console.error("Error writing doc: ", error);
        });
    }
    // viewing a specific goal's information
    if (message.content.startsWith("!viewGoal")) {
      const [command, ...args] = message.content.split(" ");
      const docRef = DB.collection("Goals").doc(args.join(" "));
      await docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            message.channel.send(objToStringCodeBlock(doc.data()));
          } else {
            message.channel.send(
              "No document with that name found in the database."
            );
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    }
    // deleting a goal
    if (message.content.startsWith("!rmGoal")) {
      const [command, ...args] = message.content.split(" ");
      const docRef = DB.collection("Goals").doc(args.join(" "));
      await docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            docRef
              .delete()
              .then(() => {
                //sending a channel message in green color along with a code block
                message.channel.send(
                  "```yaml\nGoal has been successfully deleted! ```"
                );
              })
              .catch((error) => {
                console.error("Error removing document: ", error);
              });
          } else {
            //sending message in code block format in red color
            message.channel.send(
              "```diff\n-ERROR! Goal cannot be found in the database```"
            );
          }
        })
        .catch((error) => {
          console.error("Error finding document: ", error);
        });
    }
  } catch (err) {
    console.log(err);
  }
});

//This little function converts an obect in JSON format to a string
//Decided to make it a code block in discord so add the `s
function objToStringCodeBlock(object) {
  var str = "```";
  for (var k in object) {
    if (object.hasOwnProperty(k)) {
      str += k + ": " + object[k] + "\n";
    }
  }
  return str + "```";
}
client.login(token);
client.on("message", (msg) => {
  if (msg.content.toLowerCase().startsWith(prefix + "clearchat")) {
    async function clear() {
      msg.delete();
      const fetched = await msg.channel.messages.fetch({ limit: 99 });
      msg.channel.bulkDelete(fetched);
    }
    clear();
  }

  if (msg.content === ".") {
    msg.reply("not a valid command");
  }
  if (msg.content.toLowerCase().startsWith(prefix + "get")) {
    const words = msg.content.split(" ");
    if (words.length < 4) {
      msg.reply("try command . get owner repo");
    } else {
      getPullRequests(words[2], words[3]);
    }
  }
  if (msg.content.toLowerCase().startsWith(prefix + "todo")) {
    var original = msg.content;
    var result = original.substr(original.indexOf(" ") + 1);
    let ticket = msg.author.username;
    DB.collection(msg.author.username)
      .doc(msg.author.username + " To Do")
      .set({
        To_Do_List: result,
        User: msg.author.username,
        User_ID: msg.author.id,
        Ticket_Number: ticket,
      });
  }
  if (msg.content.toLowerCase().startsWith(prefix + "list")) {
    DB.collection("Momochi")
      .where("User_ID", "==", "203340809519628288")
      .get()
      .then(function (querySnapshot) {
        if (querySnapshot.size > 0) {
          // Contents of first document
          console.log(querySnapshot.docs[0].data());
        } else {
          msg.reply("No such document!");
        }
      })
      .catch(function (error) {
        msg.reply("Error getting document: ", error);
      });
  }
  if (msg.content.toLowerCase().startsWith(prefix + "ooga")) {
    msg.reply(doc.data());
  }
});
