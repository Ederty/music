const config = require("../../botconfig/config.json"); 
const ee = require("../../botconfig/embed.json"); 
const Discord = require("discord.js");
const { escapeRegex, databasing} = require("../../handlers/functions");
const playermanager = require("../../handlers/lavalink/playermanager");
const { Player } = require("erela.js");

module.exports = async (client, message) => {
    
    if (!message.guild) return;
    
    if (message.author.bot) return;
    
    if (message.channel.partial) await message.channel.fetch();
    
    if (message.partial) await message.fetch();
    
    let prefix = config.prefix
    
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    
    if (!prefixRegex.test(message.content)) return;
    
    const [, matchedPrefix] = message.content.match(prefixRegex);
    
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    
    const cmd = args.shift().toLowerCase();
    
     if (cmd.length === 0){
      if(matchedPrefix.includes(client.user.id))
        return message.channel.send(new Discord.MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext,ee.footericon)
          .setDescription(`My Prefix is \`${prefix}\``)
        );
      return;
      }
    
    let command = client.commands.get(cmd);
    
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    
    if (command){
        if (!client.cooldowns.has(command.name)) { 
            client.cooldowns.set(command.name, new Discord.Collection());
        }
        const now = Date.now(); 
        const timestamps = client.cooldowns.get(command.name); 
        const cooldownAmount = (command.cooldown || 1.5) * 1000; 
        if (timestamps.has(message.author.id)) { 
          const expirationTime = timestamps.get(message.author.id) + cooldownAmount; 
          if (now < expirationTime) { 
            const timeLeft = (expirationTime - now) / 1000; 
            return message.channel.send(`**❌ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${prefix}${command.name}\`**`); 
          }
        }
        timestamps.set(message.author.id, now); 
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount); 
      try{
        
        if(command.memberpermissions && !message.member.hasPermission(command.memberpermissions)) {
          return message.channel.send(`**:x: You are not allowed to execute this Command**\nYou need these Permissions:\n>>> \`${command.memberpermissions.join("`, ``")}\``.substr(0, 2048));
        }
        databasing(client, message.guild.id)
        
        command.run(client, message, args, message.member, args.join(" "), prefix);
      }catch (e) {
        console.log(String(e.stack).red)
        return message.channel.send(new Discord.MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle("❌ Something went wrong while, running the: `" + command.name + "` command")
          .setDescription(`\`\`\`${e.message}\`\`\``)
        ).then(msg=>msg.delete({timeout: 5000}).catch(e=>console.log("Couldn't Delete --> Ignore".gray)));
      }
    }
    else return;
}
