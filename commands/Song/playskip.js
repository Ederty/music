const {
  MessageEmbed
} = require(`discord.js`);
const playermanager = require(`../../handlers/lavalink/playermanager`);
module.exports = {
  name: `playskip`,
  category: `Song`,
  aliases: [`ps`, `pskip`, `playnow`, `pn`],
  description: `Skips the current song and plays the song you requested.`,
  usage: `playskip <link/query>`,
  run: async (client, message, args, cmduser, text, prefix) => {
    const embed = new MessageEmbed()
    .setTitle(`Something went wrong!`)
    .setColor('#FFFFFF')
    .setFooter(client.user.username)
    .setTimestamp();
    const { channel } = message.member.voice;
    if (!channel)  return message.channel.send(embed.setDescription(`:x: You're not in a voice channel!`));
    //send error if member is Deafed
    if(message.member.voice.selfDeaf) return message.channel.send(embed.setDescription(`:x: You cannot run this command while deafened!`));
    const botchannel = message.guild.me.voice.channel;
    //if no args added return error message if allowed to send an embed
    if (!args[0]) {
      let string = `${prefix}play <link/query>`
      if(message.guild.me.hasPermission("EMBED_LINKS")){
        message.channel.send(embed.setDescription(`:x: Invalid usage!\n\`${string}\``))
      }
      return;
    }
    ///get the player
    const player = client.manager.players.get(message.guild.id);
    //if user is not in the right channel as bot, then return error
    if(player && channel.id !== player.voiceChannel)
      return message.channel.send(embed.setDescription(`:x: You need to be in the same voice channel as **${client.user.username}** to use this command`));
    //if bot connected bot not with the lavalink player then try to delete the player
    if (player && botchannel && channel.id !== botchannel.id) {
      player.destroy();
    }
    //IF YOUTUBE SEND INFO WITH YOUTUBE
    if (message.content.includes("youtu")) {
      //play the song from our playermanager
      playermanager(client, message, args, `play:youtube`);
      //IF SPOTIFY SEARCH SEND INFO WITH SPOTIFY
    } else if (message.content.includes("spotify")) {
      //play the song from our playermanager
      playermanager(client, message, args, `play:youtube`);
      //IF SOUNDCLOUD SEARCH SEND INFO WITH SOUNDCLOUD
    } else if (message.content.includes("soundcloud")) {
      //play the song from our playermanager
      playermanager(client, message, args, `play:soundcloud`);
      //ELSE SEND RYTHM INFO
    } else if (message.content.includes("http")) {
      //play the song from our playermanager
      playermanager(client, message, args, `play:youtube`);
    } else {
      //play the song from our playermanager
      playermanager(client, message, args, `play:youtube`);
    }
  }
};