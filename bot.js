// --------------------
// Discord requirements
// --------------------

const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

// --------------------
// Documentation
// --------------------

const main_arg = require('./main_arg.json');
const dgm_arg = require('./dgm_arg.json');

// --------------------
// Backup of current list and archives
// --------------------

const current_list = require('./current.json')
const ok_list = new Object()
// --------------------
// Discord Client Handling
// --------------------

client.on('ready', () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

client.on('message', (receivedMsg) => {
  if (receivedMsg.author.bot) return; // No response if sent by bot

  if (receivedMsg.content.indexOf(config.prefix) === 0) { // Process if starts with configured prefix
    processCmd(receivedMsg)
  }

//  if (receivedMsg.mentions.members.size === 2 && )
//    return message.reply("Please mention a user to kick");
});


// --------------------
// Functions
// --------------------

function processCmd(receivedMsg){
  let fullCmd = receivedMsg.content.substr(1) // Removes "!"
  let splitCmd = fullCmd.split(" ") // Split using spaces
  let primaryCmd = splitCmd[0] // First word determines action
  let args = splitCmd.slice(1) // All others are arguments for the primary command

  console.log("Command Received " + primaryCmd)
  console.log("Arguments : " + args)

  if (primaryCmd === "help" || primaryCmd === "h") {
    helpCmd(args, receivedMsg)
  } else if (primaryCmd == "dgm") {
    groceriesHandlingCmd(args, receivedMsg)
  } else {
    receivedMsg.channel.send("I didn't understand. Try `!help`")
  }
}

function helpCmd(args, receivedMsg) {
  if (args.length > 0) {
    if (args[0] === "help" || args[0] === "h") {
      helpCmd(args.slice(1), receivedMsg)
    } else {
      var handled_command_array = []
      for (var index=0; index < main_arg['command'].length; index++) {
        handled_command_array.push(main_arg['command'][index]['name'])
        Array.prototype.push.apply(handled_command_array, main_arg['command'][index]['shortcut']);      
      }
      if (handled_command_array.includes(args[0])) {
        if (args[0] === "dgm") {
          receivedMsg.channel.send("I can help you with that, here is how " + args[0] + " works :")
          for (var index=0; index < dgm_arg['command'].length; index++) {
            receivedMsg.channel.send("" + (dgm_arg['command'][index]['name']) + " : " + (dgm_arg['command'][index]['desc']))
          }
        }
      } else {
        receivedMsg.channel.send("I do not provide help for this function, seems I don't know how to use it either")
      }
    }
  } else {
    receivedMsg.channel.send("Here is the list of commands I can handle")
    for (var index=0; index < main_arg['command'].length; index++) {
      receivedMsg.channel.send("" + (main_arg['command'][index]['name']) + " : " + (main_arg['command'][index]['desc']))
    }
  }
}

function groceriesHandlingCmd(args, receivedMsg) {
  if (args.length > 0) {
    switch (args[0]) {
      case "list":
      case "ls":
        if (args.length > 1) {
          if (args[1] === "ok" || args[1] === "Ok" || args[1] === "OK") receivedMsg.channel.send(JSON.stringify(ok_list))
        } else {
          receivedMsg.channel.send(JSON.stringify(current_list))
        }
        break;
      case "add":
      case "a":
        if (args.length > 1) {
          if (isNaN(current_list[args[1]])) current_list[args[1]]=0;
          quantity = (args.length > 2 && !(isNaN(parseInt(args[2])))) ? parseInt(args[2]) : 1
          current_list[args[1]] += quantity 
          receivedMsg.channel.send("Added " + quantity + " of " + args[1] + " to the grocery list")
        } else {
          receivedMsg.channel.send("Nothing to add to the grocery list")
        }
        break;
      case "ok":
        if (args.length > 1) {
          if (isNaN(current_list[args[1]])) current_list[args[1]]=0;
          quantity = (args.length > 2 && !(isNaN(parseInt(args[2])))) ? parseInt(args[2]) : current_list[args[1]]
          current_list[args[1]] -= quantity;
          if (current_list[args[1]]<= 0) delete current_list[args[1]];
          if (isNaN(ok_list[args[1]])) ok_list[args[1]]=0;
          ok_list[args[1]] += quantity            
          receivedMsg.channel.send("Moved " + quantity + " of " + args[1] + " from the grocery list to the OK List")
        } else {
          receivedMsg.channel.send("Nothing to move to the OK list")
        }        
        break;
      case "nok":
        if (args.length < 2 && isNaN(ok_list[args[1]])) {
          receivedMsg.channel.send("Nothing to remove from the OK list")
        } else {
          quantity = (args.length > 2 && !(isNaN(parseInt(args[2])))) ? parseInt(args[2]) : ok_list[args[1]]
          ok_list[args[1]] -= quantity;
          if (ok_list[args[1]]<= 0) delete ok_list[args[1]];
          current_list[args[1]] += quantity
          receivedMsg.channel.send("Moved " + quantity + " of " + args[1] + " from the OK list to the grocery List")
        } 
        break;
      case "all_ok":
//        for (var index=0, index< current_list["command"].length, index++) {
//          handleGroceriesCmd(["ok",(Object.keys(current_list["command"][index])[0])], receivedMsg)
//        }
        break;
      case "delete":
      case "del":
      case "d":
      case "rm":
        if (args.length > 1) {
          quantity = (args.length > 2 && !(isNaN(parseInt(args[2])))) ? parseInt(args[2]) : current_list[args[1]]
          current_list[args[1]] -= quantity
          receivedMsg.channel.send("Removed " + quantity + " of " + args[1] + " from the grocery list")
          if (current_list[args[1]] <= 0) delete current_list[args[1]]
        } else {
          receivedMsg.channel.send("Nothing to add to the grocery list")
        }
        break;
      case "pay":
        // Do something
        break;
      case "flush":
        // Do something
        break;
      default:
        receivedMsg.channel.send("I do not understand this command, if it is right, contact the bot programmer for debug");
    }
  } else {
    receivedMsg.channel.send("Don't you know how to handle the grocery list ?")
    helpCmd(["dgm"], receivedMsg)
  }
}

// --------------------
// Discord Client Login
// --------------------

client.login(config.auth_token);
