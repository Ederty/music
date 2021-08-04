const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
module.exports = {
  name: `volume`,
  category: `Song`,
  aliases: [`vol`],
  description: `Changes the Volume`,
  usage: `<0-150>`,
  parameters: {"type":"music", "activeplayer": true, "previoussong": false},
  run: async (client, message, args, cmduser, text, prefix) => {
    try{
        const embed = new MessageEmbed()
      .setTitle(`Something went wrong!`)
      .setColor('#FFFFFF')
      .setFooter(client.user.username)
      .setTimestamp();
      const { channel } = message.member.voice;
      if (!channel)  return message.channel.send(embed.setDescription(`:x: You're not in a voice channel!`));
      if(message.member.voice.selfDeaf) return message.channel.send(embed.setDescription(`:x: You cannot run this command while deafened!`));
      const botchannel = message.guild.me.voice.channel;
      const player = client.manager.players.get(message.guild.id);
      if(!player || !botchannel) return message.channel.send(embed.setDescription(`:x: Nothing playing in this server!`));
      if (!player.queue || !player.queue.current) return message.channel.send(embed.setDescription(`:x: Nothing playing in this server!`));
      if(player && channel.id !== player.voiceChannel)
        return message.channel.send(embed.setDescription(`:x: You need to be in the same voice channel as **${client.user.username}** to use this command`));
      if (isNaN(args[0]))
        return message.channel.send(new MessageEmbed()
          .setFooter(ee.footertext, ee.footericon)
          .setColor(ee.wrongcolor)
          .setTitle(`You may set the volume \`1\` - \`150\``)
        );
      player.setVolume(Number(args[0]));
      return message.channel.send(new MessageEmbed()
        .setTitle(`Success | Volume set to: \`${player.volume} %\``)
        .setColor(ee.color)
        .setFooter(ee.footertext, ee.footericon)
      );
    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`An error occurred`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
  }
};