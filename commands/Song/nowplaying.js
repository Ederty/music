const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const {
  createBar,
  format
} = require(`../../handlers/functions`);
const {MessageButton, MessageActionRow} = require('discord-buttons');
module.exports = {
  name: `nowplaying`,
  category: `Song`,
  aliases: [`np`,],
  description: `Shows what song Rythm is currently playing.`,
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
    const nembed = new MessageEmbed()
    .setAuthor("Now Playing ♪", client.user.displayAvatarURL())
    .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
    .setColor("ffffff")
    .setDescription(`[${player.queue.current.title.split("[").join("\[").split("]").join("\]")}](${player.queue.current.uri})\n\n\`${createBar(player)}\`\n\n\`${format(player.position).split(" | ")[0]} / ${format(player.queue.current.duration).split(" | ")[0]}\`\n\n\`Requested by:\` ${player.queue.current.requester.username} (${player.queue.current.requester.tag})`)

    message.channel.send(nembed).catch(e=>{
      return message.channel.send("**:x: Your Dm's are disabled**")
    })    
  }
};