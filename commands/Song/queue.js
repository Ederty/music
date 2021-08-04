const { MessageEmbed } = require(`discord.js`);
const playermanager = require(`../../handlers/lavalink/playermanager`);
const {
    format,
    delay,
    swap_pages,
    swap_pages2
  } = require(`../../handlers/functions`);
const ee = require('../../botconfig/embed.json')
module.exports = {
    name: `queue`,
    category: `Song`,
    aliases: [`q`, `qu`, `que`, `queu`, `list`],
    description: `Shows the Queue`,
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
      //get voice channel of the bot
      const botchannel = message.guild.me.voice.channel;
      //get the music player
      const player = client.manager.players.get(message.guild.id);
      if (!player || !botchannel) 
      return message.channel.send(new MessageEmbed()
                .setTitle(`Queue for ${message.guild.name}`)
                .setColor("ffffff")
                .addField(`__Now Playing:__`, `Nothing, let's get this party started! :tada:`))
                .setFooter(`Page 1/1 | Loop: ${player.trackRepeat ? `✅` : `❌`} | Queue Loop: ${player.queueRepeat ? `✅` : `❌`}`, ee.footertext, ee.footericon);
    //if queue size too small return error
    if (!player.queue || !player.queue.current) 
    return message.channel.send(new MessageEmbed()
    .setTitle(`Queue for ${message.guild.name}`)
    .setColor("ffffff")
    .addField(`__Now Playing:__`, `Nothing, let's get this party started! :tada:`))
    .setFooter(`Page 1/1 | Loop: ${player.trackRepeat ? `✅` : `❌`} | Queue Loop: ${player.queueRepeat ? `✅` : `❌`}`, ee.footertext, ee.footericon);
      //if user is not in the right channel as bot, then return error
      if(player && channel.id !== player.voiceChannel)
        return message.channel.send(`**:x: You need to be in the same voice channel as Ube to use this command**`);
      //if bot connected bot not with the lavalink player then try to delete the player
      if(player && botchannel && channel.id !== botchannel.id){
        player.destroy();
      }
        try{
            //get the right tracks of the current tracks
            const tracks = player.queue;
            //if there are no other tracks, information
            if (!tracks.length)
              return message.channel.send(new MessageEmbed()
                .setTitle(`Queue for ${message.guild.name}`)
                .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
                .setFooter(`Loop: ${player.trackRepeat ? `✅` : `❌`} | Queue Loop: ${player.queueRepeat ? `✅` : `❌`}`, message.member.user.avatarURL({
                    dynamic: true,
                }))
                .setColor("ffffff")
                .addField(`__Now Playing:__\n`,`[${player.queue.current.title.substr(0, 60)}](${player.queue.current.uri}) | \`${player.queue.current.isStream ? `LIVE STREAM` : format(player.queue.current.duration).split(` | `)[0]} Requested by: ${player.queue.current.requester.tag}\`\n`))
            //if not too big send queue in channel
            const queuelist = tracks.map((track, i) => `\`${++i}.\` ${track.title.substr(0, 60)} | \`${track.isStream ? `LIVE STREAM` : format(track.duration).split(` | `)[0]} requested by: ${track.requester.tag}\`\n`).join(`\n`)
            if (tracks.length < 15)
            return message.channel.send(new MessageEmbed()
            .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
            .setAuthor(`Queue for ${message.guild.name}  -  [ ${player.queue.length} Tracks ]`, message.guild.iconURL({
              dynamic: true
            }))
            .setFooter(`Loop: ${player.trackRepeat ? `✅` : `❌`} | Queue Loop: ${player.queueRepeat ? `✅` : `❌`}`, message.member.user.avatarURL({
              dynamic: true,
            }))
            .setColor('FFFFFF')
            .setDescription(`**__Current Track:__**\n${player.queue.current.title.substr(0, 60)} | \`${player.queue.current.isStream ? `LIVE STREAM` : format(player.queue.current.duration).split(` | `)[0]} requested by: ${player.queue.current.requester.tag}\`\n\n**__Up Next:__**\n${queuelist}`)
            )
          //get an array of quelist where 15 tracks is one index in the array
          let quelist = [];
            for (let i = 0; i < tracks.length; i += 10) {
              let songs = tracks.slice(i, i + 10);
              quelist.push(songs.map((track, index) => `\`${i + ++index}.\` ${track.title.substr(0, 60)} | \`${track.isStream ? `LIVE STREAM` : format(track.duration).split(` | `)[0]} Requested by: ${track.requester.tag}\`\n`).join(`\n`))
            }
            let limit = quelist.length <= 10 ? quelist.length : 10
            let embeds = []
            for (let i = 0; i < limit; i++) {
                let desc = String(quelist[i]).substr(0, 2048)
                let pageNumber = 0
              await embeds.push(new MessageEmbed()
              .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
                .setTitle(`Queue for ${message.guild.name}`)
                .setFooter(`Loop: ${player.trackRepeat ? `✅` : `❌`} | Queue Loop: ${player.queueRepeat ? `✅` : `❌`}`, message.member.user.avatarURL({
                    dynamic: true,
                }))
                .setColor("ffffff")
                .setDescription(`**__Current Track:__**\n ${player.queue.current.title.substr(0, 60)} | \`${player.queue.current.isStream ? `LIVE STREAM` : format(player.queue.current.duration).split(` | `)[0]} requested by: ${player.queue.current.requester.tag}\`\n\n**__Up Next:__**\n${desc}\n**${tracks.length} songs in queue | ${format(tracks.duration).split(" | ")[0]} total length**`))
            }
            //return susccess message
            return swap_pages2(client, message, embeds)
        } catch (e) {
          console.log(String(e.stack).bgRed)
          return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`ERROR | An error occurred`)
            .setDescription(`\`\`\`${e.message}\`\`\``)
          );
        }
      }
    };