const Discord = require("discord.js");
const client = new Discord.Client({
intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_WEBHOOKS"],
});
const randomstring = require("randomstring");

const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: `` });
require("dotenv").config();

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
    if (msg.content.toLowerCase().startsWith(prefix + "commands")) {
      //list of commands
        msg.reply(".todo: Add to your personal To Do List! \n" +
            ".list: View your personal To Do List! \n" +
            ".remove: Remove one of your To Do List Duties! \n" +
            ".creategoal: Create your own Personal Goal! \n" +
            ".ls: View your List of Goals! \n" +
            ".viewgoal: View a Specific Goal and Learn more about it! \n" +
            ".rmgoal: Remove a Goal! \n" +
            ".github: Learn about this GitHub Command! \n" +
            ".github pullrq owner repo: Pull Requests from your sepcifed Owner and Repo! \n" +
            ".github issues owner repo: Issues from your specific Owner and Repo! \n")
    }
    if (msg.content.toLowerCase().startsWith(prefix + "todo")) {
      //add to the To Do List
    var original = msg.content;
    var result = original.substr(original.indexOf(" ") + 1);
    await DB.collection(msg.author.username + " To Do")
        .doc(result)
        .set({
        "To Do List": result,
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
    await DB.collection(msg.author.username + " To Do")
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
    const docRef = DB.collection(msg.author.username + " To Do").doc(result);
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
    if(msg.content.toLowerCase().startsWith(prefix + "creategoal")){
    var original = msg.content;
    var result = original.substr(original.indexOf(" ") + 1);
    await DB.collection(msg.author.username + " Goals").doc(result).set({
        "Goal Description": " ",
        "Expected Goal Complete Date": " ",
        "Goal Author": msg.author.username,
        "Goal Created": new Date(admin.firestore.Timestamp.now().seconds*1000).toLocaleDateString()//admin.firestore.Timestamp.fromDate(new Date())
    })
    .then(() => {
        console.log("Document written")
    })
    .catch((error) => {
        console.error("Error writing document: ", error)
    })
    msg.channel.send("```Goal has been created. Type '.ls' to view a list of goals.```");
    }
    if(msg.content.toLowerCase().startsWith(prefix + "ls")){
    await DB.collection(msg.author.username + " Goals").get().then((goals) => {
        var str = '```Current List of Goals:' + "\n\n";
        var numbering = 1;
        goals.forEach((doc) => {
        str += numbering + ")" + doc.id + "\n\n";
        numbering += 1;
        });
        str += "```"
        msg.channel.send(str);
    })
    .then(() => {
        console.log("Document written")
    })
    .catch((error) => {
        console.error("Error writing doc: ", error)
    })
    }
    if(msg.content.toLowerCase().startsWith(prefix + "viewgoal")){
    var original = msg.content;
    var result = original.substr(original.indexOf(" ") + 1);
    const docRef = DB.collection(msg.author.username + " Goals").doc(result);
    await docRef.get().then((doc) => {
        if(doc.exists){
        msg.channel.send(objToStringCodeBlock(doc.data()));
        }
        else{
        msg.channel.send("No document with that name found in the database.")
        }
    })
    .catch((error) => {
        console.log("Error getting document:", error);
    });
    }
    if(msg.content.toLowerCase().startsWith(prefix + "rmgoal")){
    var original = msg.content;
    var result = original.substr(original.indexOf(" ") + 1);
    const docRef = DB.collection(msg.author.username + " Goals").doc(result);
    await docRef.get().then((doc) => {
        if(doc.exists){
        docRef.delete().then(() => {
            //sending a channel message in green color along with a code block
            msg.channel.send("```yaml\nGoal has been successfully deleted! ```")
        })
        .catch((error) => {
            console.error("Error removing document: ", error);
        })
        }
        else{
          //sending message in code block format in red color
        msg.channel.send("```diff\n-ERROR! Goal cannot be found in the database```")
        }
    })
    .catch((error) => {
        console.error("Error finding document: ", error);
    })
    }

    if(msg.content.toLowerCase().startsWith(prefix + "github")){
    const words = msg.content.split(" ")
    if(words.length < 4){
        msg.reply(".github <pullrq or issues> owner repo")
    }else{
        if(words[1] == 'pullrq'){
        msg.reply("Retrieving Issues, give me a moment...")
            const result = getPullRequests(words[2],words[3])
            result.then(term =>{
            console.log(`${term}`)
            msg.reply(term)
            })
        }else if(words[1] == 'issues'){
        msg.reply("Retrieving Issues, give me a moment...")
            const result = getIssues(words[2],words[3])
            result.then(term =>{
            console.log(`${term}`)
            msg.reply(term)
            })
        }else{
            msg.reply("try command" ```. get <pullrq or issues> owner repo```)

        }
        
        
    }
        }
        
    if (msg.content.toLowerCase().startsWith(prefix + "request")) {
      //add to the Help Request List shared by everyone
    var original = msg.content;
    var result = original.substr(original.indexOf(" ") + 1);
    await DB.collection("Support Ticket")
        .doc(result)
        .set({
        "Help Requested": result,
        User: msg.author.username,
        })
        .then(() => {
        msg.reply("Support Request Item Added");
        })
        .catch((error) => {
        msg.reply("Error");
        });
    }

    if (msg.content.toLowerCase().startsWith(prefix + "reqlist")) {
    var stack = [];
    await DB.collection("Support Ticket")
        .get()
        .then((list) => {
        var str = "Support Request List: " + "\n";
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

if(msg.content.toLowerCase().startsWith(prefix + "reqinfo")){
    var original = msg.content;
    var result = original.substr(original.indexOf(" ") + 1);
    const docRef = DB.collection("Support Ticket").doc(result);
    await docRef.get().then((doc) => {
        if(doc.exists){
        msg.channel.send(objToStringCodeBlock(doc.data()));
        }
        else{
        msg.channel.send("No Support Ticket Found.")
        }
    })
    .catch((error) => {
        console.log("Error getting document:", error);
    });
}
    if (msg.content.toLowerCase().startsWith(prefix + "deletereq")) {
    var original = msg.content;
    var result = original.substr(original.indexOf(" ") + 1);
    const docRef = DB.collection("Support Ticket").doc(result);
    await docRef.get().then((doc) => {
        if (doc.exists) {
        docRef
            .delete()
            .then(() => {
            msg.reply("Deleted the Help Request!");
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

async function getPullRequests(owner,repo){
try{
    
    const result = await octokit.request('GET /repos/{owner}/{repo}/pulls',
        {
            owner: owner,
            repo: repo
        })




    if(result.status === 200){
        //head,repo, name
    const name = result.data[0]["head"]["repo"]["name"]
      //console.log(`${name}`)
            //repo , description
    const description = result.data[0]["head"]["repo"]["description"]
      //console.log(`${description}`)
    const repo = []
    repo.push(name,description)
    for(let i = 0; i < result.data.length; i ++){
        ////html_url
        const url = result.data[i]["html_url"]
        //console.log(`${url}`)
        //number
        const num_pullRequest = result.data[i]["number"]
        const pr_num = ("\n\nPull request #"+ num_pullRequest)
        //console.log(`${num_pullRequest}`)
        //title
        const title_pullRequest = result.data[i]["title"]
        //console.log(`${title_pullRequest}`)
        //user, login
        const posted_by = result.data[i]["user"]["login"]
        //console.log(`${posted_by}`)
        //"body"
        const description_pullRequest = result.data[i]["body"]
        //console.log(`${description_pullRequest}`)

        //console.log(`${JSON.stringify(result.data,null,4)}`)
        //console.log(`${result.status} is type: ${typeof result.status}`)
        
        repo.push(pr_num, url, title_pullRequest, posted_by,description_pullRequest)
    }
    
      //console.log(`${pullrequestList}`)
    return repo.join("\n")
    
    }else{
    throw Error
    }
}catch(err){
    console.log(`${err} `)
    return 'An error occurred invalid Github User or Repository'
}

}


async function getIssues(owner,repo){
try{
    
    const result = await octokit.request('GET /repos/{owner}/{repo}/issues',
    {
        owner: owner,
        repo: repo
    })
        //console.log(`${JSON.stringify(result.data,null,4)}`)
        if(result.status === 200){
        //Display repository name
    const name = "Repository name: " + repo
      //console.log(`${name}`)
            //Repository owner
    const description = "Repository owner: " + owner
      //console.log(`${description}`)
    const repos = []
    repos.push(name,description)
    for(let i = 0; i < result.data.length; i ++){
        try{
        let pullRequestChecker = result.data[i]["pull_request"]
        console.log(`${pullRequestChecker.length}`)


        }catch{
            
        
          ////html_url
        const url = result.data[i]["html_url"]
        
          //number
        const num_Issue = result.data[i]["number"]
        const Issue_num = ("\n\nIssue #"+ num_Issue)
        
          //title
        const title_Issue = result.data[i]["title"]
        
          //user, login
        const posted_by = result.data[i]["user"]["login"]
        
          //"body"
        const description_Issue = result.data[i]["body"]
        

          //console.log(`${JSON.stringify(result.data,null,4)}`) for full JSON file view
        
        repos.push(Issue_num, url, title_Issue, posted_by,description_Issue)
        }
    }
    
      //console.log(`${pullrequestList}`)
    return repos.join("\n")
    
    }else{
    throw Error
    }
}catch(err){
    console.log(`${err} `)
    return 'An error occurred invalid Github User or Repository'
}

}


//This little function converts an obect in JSON format to a string
//Decided to make it a code block in discord so add the `s
function objToStringCodeBlock(object){
var str = '```';
for(var k in object){
    if(object.hasOwnProperty(k)){
    str += k+": " + object[k] + '\n'
    }
}
return str + "```";
}
const token = "";
client.login(token);
