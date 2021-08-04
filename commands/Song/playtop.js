const {
  MessageEmbed
} = require(`discord.js`);
const playermanager = require(`../../handlers/lavalink/playermanager`);
module.exports = {
  name: `playtop`,
  category: `Song`,
  aliases: [`ptop`, `pt`],
  description: `Adds a song with the given name/url on the top of the queue`,
  usage: `<link/query>`,
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
    if(message.content.includes("youtu")){
      message.channel.send(`<:YouTube1:846367668897316865> **Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
        setTimeout(() => msg.delete(), 2000);
      })
      playermanager(client, message, args, `play:youtube`);
    } else if(message.content.includes("spotify")){
      message.channel.send(`<:SpotifyLogo:846367676934258748> **Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
        setTimeout(() => msg.delete(), 2000);
      })
      playermanager(client, message, args, `play:youtube`);
    } else if(message.content.includes("soundcloud")){
      message.channel.send(`<:4678_SoundCloud:846368477669490689> **Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
        setTimeout(() => msg.delete(), 2000);
      })
      playermanager(client, message, args, `play:soundcloud`);
  } else if(message.content.includes("http")){
    message.channel.send(`<:YouTube1:846367668897316865> **Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
      setTimeout(() => msg.delete(), 2000);
    })
    playermanager(client, message, args, `play:youtube`);
  } else {
    message.channel.send(`<:YouTube1:846367668897316865> **Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
      setTimeout(() => msg.delete(), 2000);
    })
    playermanager(client, message, args, `play:youtube`);
  }
  }
};