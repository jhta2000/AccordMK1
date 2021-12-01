const Discord = require("discord.js")
//const Commando = require('discord.js-commando')
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_WEBHOOKS"]})

const {Octokit} = require("@octokit/core")
const octokit = new Octokit({auth: ``})
require("dotenv").config()

const prefix = "!get "



client.on("ready", () =>{
  console.log(`Logged in as ${client.user.tag}!`)
})



client.on("message", msg =>{
  if (msg.content === (prefix + "ping")){
    msg.reply("pang")
    msg.reply("pong")
  }

})

client.on("message", msg => {
    if (msg.content.toLowerCase().startsWith(prefix + "clearchat")) {
         async function clear() {
             msg.delete()
             const fetched = await msg.channel.messages.fetch({limit: 99})
             msg.channel.bulkDelete(fetched)
            
         }
         clear()

    }

    if (msg.content === ("!gb")){
      msg.reply("not a valid command")
    }

    
    if(msg.content.toLowerCase().startsWith(prefix + "github")){
      const words = msg.content.split(" ")
      if(words.length < 5){
        msg.reply("!gb get <pullrq or issues> owner repo")
      }else{
        if(words[2] == 'pullrq'){
          msg.reply("Retrieving Issues, give me a moment...")
            const result = getPullRequests(words[3],words[4])
            result.then(term =>{
              console.log(`${term}`)
              msg.reply(term)
            })
         }else if(words[2] == 'issues'){
           msg.reply("Retrieving Issues, give me a moment...")
            const result = getIssues(words[3],words[4])
            result.then(term =>{
              console.log(`${term}`)
              msg.reply(term)
            })
         }else{
            msg.reply("try command" ```!gb get <pullrq or issues> owner repo```)

        }
        
        
      }
      
      
      
    }

})

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
          const Issue_num = ("\n\nIssue #"+ num_pullRequest)
          
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



client.login(process.env.TOKEN)

