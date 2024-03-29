const { MessageEmbed } = require(`discord.js`);
const playermanager = require(`../../handlers/lavalink/playermanager`);
module.exports = {
    name: `search`,
    category: `Song`,
    aliases: [`find`],
    description: `Searches from Youtube for a song via your query and returns the top 10 results.`,
    usage: `<link/query>`,
    run: async (client, message, args, cmduser, text, prefix) => {
      const embed = new MessageEmbed()
      .setTitle(`Something went wrong!`)
      .setColor('#FFFFFF')
      .setFooter(client.user.username)
      .setTimestamp();
      const { channel } = message.member.voice;
      if (!channel)  return message.channel.send(embed.setDescription(`:x: You're not in a voice channel!`));
      if(message.member.voice.selfDeaf) return message.channel.send(embed.setDescription(`:x: You cannot run this command while deafened!`));
      const botchannel = message.guild.me.voice.channel;
      if (!args[0]) {
        let string = `${prefix}play <link/query>`
        let embed = new MessageEmbed()
        .setTitle("**:x: Invalid usage**")
        .setDescription(string)
        .setColor("#ff0000")
        if(message.guild.me.hasPermission("EMBED_LINKS")){
          message.channel.send(embed)
        }else{
          message.channel.send("**:x: Invalid usage**\n"+string)
        }
        return;
      }
     const player = client.manager.players.get(message.guild.id);
     if(!player || !botchannel) return message.channel.send(embed.setDescription(`:x: Nothing playing in this server!`));
     if (!player.queue || !player.queue.current) return message.channel.send(embed.setDescription(`:x: Nothing playing in this server!`));
     if(player && channel.id !== player.voiceChannel)
       return message.channel.send(embed.setDescription(`:x: You need to be in the same voice channel as **${client.user.username}** to use this command`));
      if(player && botchannel && channel.id !== botchannel.id){
        player.destroy();
      }
      playermanager(client, message, args, `search:youtube`);
  }
};