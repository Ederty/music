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
  name: `seek`,
  category: `Song`,
  aliases: [``],
  description: `Seeks to a certain point in the current track.`,
  usage: `<time>`,
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

    const player = client.manager.players.get(message.guild.id);

    if(!player || !botchannel) return message.channel.send(embed.setDescription(`:x: Nothing playing in this server!`));

    if (!player.queue || !player.queue.current) return message.channel.send(embed.setDescription(`:x: Nothing playing in this server!`));

    if(player && channel.id !== player.voiceChannel)
      return message.channel.send(embed.setDescription(`:x: You need to be in the same voice channel as **${client.user.username}** to use this command`));

      if (!args[0]) {
        let string = `${prefix}seek <Time in seconds>`
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

      if (Number(args[0]) < 0 || Number(args[0]) >= player.queue.current.duration / 1000)
        return message.channel.send(`**:x: Time cannot be longer than the song**`);

      player.seek(Number(args[0]));
      new MessageEmbed()
      .setDescription(`Forwarded position to \`${format(player.position)}\``)
      .setColor('#FFFFFF')
      .setFooter(client.user.username)
      .setTimestamp()

      return message.channel.send(new MessageEmbed()
      .setDescription(`Forwarded position to \`${format(player.position)}\``)
      .setColor('#FFFFFF')
      .setFooter(client.user.username)
      .setTimestamp());
  }
};