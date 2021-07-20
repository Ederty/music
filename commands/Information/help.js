const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
module.exports = {
    name: "help",
    category: "Information",
    aliases: ["hawdad", "halpsadw"],
    cooldown: 4,
    usage: "help",
    description: "Shows you Help for Music Bot",
    run: async (client, message, args, user, text, prefix) => {
      try{
        let embed = new MessageEmbed()
        .setTitle(`${client.user.username} Help`)
        .setDescription(`🚧`)
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        if(message.guild.me.permissionsIn(message.channel).has("EMBED_LINKS")){
          message.reply(embed)
        }
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`❌ ERROR | An error occurred`)
            .setDescription(`\`\`\`${e.stack}\`\`\``)
        );
    }
  }
}