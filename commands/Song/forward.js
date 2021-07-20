const {
  MessageEmbed
} = require(`discord.js`)
const config = require(`../../botconfig/config.json`)
const ee = require(`../../botconfig/embed.json`);
const {
  createBar,
  format
} = require(`../../handlers/functions`);
module.exports = {
  name: `forward`,
  category: `Song`,
  aliases: [`fwd`, `seek`],
  description: `Forwards by a certain amount of time in the current track.`,
  usage: `forward <time>`,
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
      //if invalid usage
      if (!args[0]) {
        let string = `${prefix}forward <Time in seconds/minutes>`
        let embed1 = new MessageEmbed()
        .setTitle("Something went wrong!")
        .setDescription(`:x: Invalid usage!\n\`${string}\``)
        .setColor("#ffffff")
        .setFooter(client.user.username)
        .setTimestamp();
        if(message.guild.me.hasPermission("EMBED_LINKS")){
          message.channel.send(embed1)
        }
        return;
      }
      //get the seektime variable of the user input
      let seektime = Number(player.position) + Number(args[0]) * 1000;
      //if the userinput is smaller then 0, then set the seektime to just the player.position
      if (Number(args[0]) <= 0) seektime = Number(player.position);
      //if the seektime is too big, then set it 1 sec earlier
      if (Number(seektime) >= player.queue.current.duration)
        return message.channel.send(embed.setDescription(`:x: Time cannot be longer than the song!`));
      //seek to the new Seek position
      player.seek(Number(seektime));
      //Send Success Message
      return message.channel.send(new MessageEmbed()
      .setDescription(`**:musical_note: Set position to \`${format(player.position)}\` :fast_forward:**`)
      .setColor(`#FFFFFF`)
      .setFooter(client.user.username)
      .setTimestamp());
  }
};