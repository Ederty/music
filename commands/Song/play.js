const { MessageEmbed } = require(`discord.js`);
const playermanager = require(`../../handlers/lavalink/playermanager`);
module.exports = {
    name: `play`,
    category: `Song`,
    aliases: [`p`],
    description: `Plays a song from youtube`,
    usage: `play <link/query>`,
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
        if(message.guild.me.hasPermission("EMBED_LINKS")){
          message.channel.send(embed.setDescription(`:x: Invalid usage!\n\`${string}\``))
        }
        return;
      }
      const player = client.manager.players.get(message.guild.id);
      if(player && channel.id !== player.voiceChannel)
        return message.channel.send(embed.setDescription(`:x: You need to be in the same voice channel as **${client.user.username}** to use this command`));
      if(player && botchannel && channel.id !== botchannel.id){
        player.destroy();
      }
      if(message.content.includes("youtu")){
        message.channel.send(`<:youtube:826100274095194132> **Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
          setTimeout(() => msg.delete(), 2000);
        })
        playermanager(client, message, args, `play:youtube`);
      } else if(message.content.includes("spotify")){
        message.channel.send(`<:spotify:818555971873013761>**Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
          setTimeout(() => msg.delete(), 2000);
        })
        playermanager(client, message, args, `play:youtube`);
      } else if(message.content.includes("soundcloud")){
        message.channel.send(`<:soundcloud:818555972079321128> **Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
          setTimeout(() => msg.delete(), 2000);
        })
        playermanager(client, message, args, `play:soundcloud`);
    } else if(message.content.includes("http")){
      message.channel.send(`<:rythm:826519647347539990> **Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
        setTimeout(() => msg.delete(), 2000);
      })
      playermanager(client, message, args, `play:youtube`);
    } else {
      message.channel.send(`<:youtube:826100274095194132> **Searching** :mag_right: \`${args.join(" ")}\``).then(msg => {
        setTimeout(() => msg.delete(), 2000);
      })
      playermanager(client, message, args, `play:youtube`);
    }
  }
};