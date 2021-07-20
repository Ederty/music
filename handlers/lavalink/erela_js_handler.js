const {
    Manager
} = require("erela.js");
const Spotify = require("erela.js-spotify");
const Deezer = require("erela.js-deezer");
const config = require("../../botconfig/config.json");
const { MessageEmbed } = require("discord.js");
const clientID = config.spotify.clientID;
const clientSecret = config.spotify.clientSecret;
const {format} = require('../../handlers/functions');
const ee = require("../../botconfig/embed.json")
module.exports = (client) => {
    if (!clientID || !clientSecret) {
        client.manager = new Manager({
            nodes: config.clientsettings.nodes,
            plugins: [
                new Deezer()
            ],
            send(id, payload) {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            },
        });
    } else {
        client.manager = new Manager({
            nodes: config.clientsettings.nodes,
            plugins: [
                new Spotify({
                    clientID, 
                    clientSecret
                }),
                new Deezer()
            ],
            send(id, payload) {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            },
        });
    }

    require("./erela_js_node_log")(client)

    client.manager
        .on("playerCreate", async (player) => {
            player.setVolume(50);
            client.channels.cache.get(player.textChannel).send(new MessageEmbed()
            .setDescription(`:thumbsup: **Joined \`${client.channels.cache.get(player.voiceChannel).name}\` and bound to:** <#${client.channels.cache.get(player.textChannel).id}>`)
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)).then(msg => {
                setTimeout(() => msg.delete(), 5000);
              }).catch(e => console.log("this prevents a crash"))
        })
        .on("playerMove", async (player, oldChannel, newChannel) => {
            if (!newChannel) {
               
                player.destroy();
                client.channels.cache.get(player.textChannel).messages.fetch(player.get("playermessage")).then(msg => {
                    msg.delete({
                        timeout: 500
                    }).catch(e => console.log("Couldn't delete message this is a catch to prevent a crash".grey));
                });
                player.destroy();
            } else {
                player.voiceChannel = newChannel;
                if (player.paused) return;
                setTimeout(() => {
                    player.pause(true);
                    setTimeout(() => player.pause(false), client.ws.ping * 2);
                }, client.ws.ping * 2);
            }
        })
        .on("trackStart", async (player, track) => {
            player.set("votes", "0");
            for (const userid of client.guilds.cache.get(player.guild).members.cache.map(member => member.user.id))
                player.set(`vote-${userid}`, false);
            player.set("previoustrack", track);
            if (client.settings.get(player.guild, `pruning`))
                client.channels.cache.get(player.textChannel).send(new MessageEmbed()
                .setTitle(`Track started playing`)
                .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
                .setDescription(`[${track.title}](${track.uri}) (${track.author}) - ${format(track.duration).split(" | ")[0]}`)
                .setColor('FFFFFF')
                .setFooter(client.user.username)
                .setTimestamp()).then(msg => {
                    try {
                        if (player.get(`playingsongmsg`) && msg.id !== player.get(`playingsongmsg`).id)
                            player.get(`playingsongmsg`).delete().catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                    } catch {
                       
                    }
                    player.set(`playingsongmsg`, msg)
                })
        })
        .on("trackStuck", async (player, track, payload) => {
            player.stop();
            client.channels.cache
                .get(player.textChannel)
                .send(embed.setDescription(`:x: **\`${track.title}\`** got Stuck\n:thumbsup: Skipping it!`));
        })
        .on("trackError", async (player, track, payload) => {
            player.stop();
            client.channels.cache
                .get(player.textChannel)
                .send(embed.setDescription(`:x: **\`${track.title}\`** Errorred\n:thumbsup: Skipping it!`));
        })
        .on("queueEnd", async (player) => {

        });
    client.once("ready", () => client.manager.init(client.user.id));
    client.on("raw", (d) => client.manager.updateVoiceState(d));
    client.on("channelDelete", channel => {

        if (channel.type === "voice") {
            if (channel.members.has(client.user.id)) {
                var player = client.manager.players.get(channel.guild.id);
                if (!player) return;
                if (channel.id === player.voiceChannel) player.destroy();
            }
        }
    })
    client.on("guildRemove", guild => {

        var player = client.manager.players.get(guild.id);
        if (!player) return;
        if (guild.id == player.guild) player.destroy();

    })
};