const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const {
  createBar,
  format
} = require(`../../handlers/functions`);
module.exports = {
  name: `grab`,
  category: `Song`,
  aliases: [`save`, `yoink`],
  description: `Saves the current playing song to your Direct Messages`,
  usage: `grab`,
  run: async (client, message, args, cmduser, text, prefix) => {
    const embed = new MessageEmbed()
      .setTitle(`Something went wrong!`)
      .setColor('#FFFFFF')
      .setFooter(client.user.username)
      .setTimestamp();
      //get the voice channel of the member
      const { channel } = message.member.voice;
      //if he is not connected to a vc return error
      if (!channel)  return message.channel.send(embed.setDescription(`:x: You're not in a voice channel!`));
      //send error if member is Deafed
      if(message.member.voice.selfDeaf) return message.channel.send(embed.setDescription(`:x: You cannot run this command while deafened!`));
      //get voice channel of the bot
      const botchannel = message.guild.me.voice.channel;
      //get the music player
      const player = client.manager.players.get(message.guild.id);
      //if no player or no botchannel return error
      if(!player || !botchannel) return message.channel.send(embed.setDescription(`:x: Nothing playing in this server!`));
      //if queue size too small return error
      if (!player.queue || !player.queue.current) return message.channel.send(embed.setDescription(`:x: Nothing playing in this server!`));
      //if user is not in the right channel as bot, then return error
      if(player && channel.id !== player.voiceChannel)
      return message.channel.send(embed.setDescription(`:x: You need to be in the same voice channel as **${client.user.username}** to use this command`));
    //Send Information Message
    let date = `${new Date().getFullYear()}-${String(new Date().getMonth()).length ==1 ? "0" + new Date().getMonth() : new Date().getMonth()}-${String(new Date().getDate()).length ==1 ? "0" + new Date().getDate() : new Date().getDate()}`;
    message.author.send(new MessageEmbed()
      .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
      .setColor("#FFFFFF")
      .setTitle("Song saved :musical_note:")
      .setDescription(`[${player.queue.current.title.split("[").join("\[").split("]").join("\]")}](${player.queue.current.uri})\n\n\`Length:\` ${format(player.queue.current.duration).split(" | ")[0]}\n\n\`Requested by:\` ${player.queue.current.requester.username} (${player.queue.current.requester.tag})`)
      .setFooter(client.user.username)
      .setTimestamp()
    ).catch(e=>{
      return message.channel.send(embed.setDescription(`:x: Your DM's are disabled!`))
    })    

    message.react("📭").catch(e=>console.log("Could not react"))
  }
};