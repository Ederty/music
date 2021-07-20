const Discord = require("discord.js")
const {
MessageEmbed
} = require("discord.js")
const config = require("../../botconfig/config.json")
const ee = require("../../botconfig/embed.json")
const {
format,
delay,
isrequestchannel,
edit_request_message_queue_info,
arrayMove
} = require("../../handlers/functions")
const { getData, getPreview, getTracks } = require('spotify-url-info')
module.exports = async (client, message, args, type, channel, guild) => {
  let method = type.includes(":") ? type.split(":") : Array(type)
  if (!message.guild && !guild) return;

  

  if (method[0] === "play")
    play(client, message, args, type);
  else if (method[0] === "search")
    search(client, message, args, type);
  else if (method[0] === "playtop")
    playtop(client, message, args, type);
  else if (method[0] === "playskip")
    playskip(client, message, args, type);
  else
    return message.channel.send(new MessageEmbed()
      .setColor(ee.wrongcolor)
      .setFooter(ee.footertext, ee.footericon)
      .setTitle("❌ No valid search Term")
    );
}

async function search(client, message, args, type) {
const search = args.join(" ");
  let res;
  
  res = await client.manager.search({
    query: search,
    source: type.split(":")[1]
  }, message.author);
  
  if (res.loadType === "LOAD_FAILED") throw res.exception;

  var max = 10;
  var collected;
  if (res.tracks.length < max) max = res.tracks.length;
  track = res.tracks[0]

  var results = "";
  if(message.guild.me.permissionsIn(message.channel).has("EMBED_LINKS")){
    results = res.tracks.slice(0, max).map((track, index) => `\`${++index}.\` [${String(track.title).split("[").join("\[").split("]").join("\]")}](${track.uri}) **[${format(track.duration).split(" | ")[0]}]**`).join('\n\n');
    results += "\n\n\n**Type a number to make a choice. Type \`cancel\` to exit**";
    results = new Discord.MessageEmbed()
    .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic: true}))
    .setColor(ee.color)
    .setDescription(results)
  }else {
    results = res.tracks.slice(0, max).map((track, index) => `\`${++index}.\` \`${String(track.title).split("[").join("\[").split("]").join("\]")}\` **[${format(track.duration).split(" | ")[0]}]**`).join('\n\n');
    results += "\n\n\n**Type a number to make a choice. Type \`cancel\` to exit**";
  }
  
  let searchmsg = await message.channel.send(results)

  waitforanswer()
  function waitforanswer(){
    message.channel.awaitMessages(m => m.author.id == message.author.id, {
      max: 1,
      time: 30000,
      errors: ['time']
    }).then(collected => {
      searchmsg.delete().catch(e=>console.log("could not delete msg"))
  
      const first = collected.first().content;
      if (first.toLowerCase() === 'cancel') {
        message.channel.send("✅")
        if (player && player.queue && !player.queue.current) player.destroy().catch(e=>console.log("e"));
        return;
      }
      const index = Number(first) - 1;
      if (index < 0 || index > max - 1) return waitforanswer();
  
        track = res.tracks[index];
        if (!res.tracks[0])
          return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
            .setDescription(`Please retry!`)
          );
        
        let player = client.manager.create({
          guild: message.guild.id,
          voiceChannel: message.member.voice.channel.id,
          textChannel: message.channel.id,
          selfDeafen: false,
        });
        if (player.state !== "CONNECTED") {
          
          player.connect();
          player.set("message", message);
          player.set("playerauthor", message.author.id);
          player.queue.add(track);
          player.play();
        } else {
        
        player.queue.add(track);
        var time = 0;
        
        let playembed = new Discord.MessageEmbed()
          .setAuthor(`Added to queue`, message.author.displayAvatarURL({dynamic: true}))
          .setURL(track.uri)
          .setTitle("**" + track.title + "**").setColor(ee.color)
          .setThumbnail(`https:/img.youtube.com/vi/${track.identifier}/mqdefault.jpg`)
          .addField("Channel", track.author, true)
          .addField("Song Duration: ", track.isStream ? "LIVE STREAM" : format(track.duration).split(" | ")[0], true)
          
          if(player.queue.size > 0) player.queue.map((track) => time += track.duration)
          time += player.queue.current.duration - player.position;
          time -= track.duration;
          playembed.addField("Estimated time until playing", format(time).split(" | ")[0], true)
          
          playembed.addField("Position in queue", `${player.queue.length}`, true)
        
        if(message.guild.me.permissionsIn(message.channel).has("EMBED_LINKS"))
          return message.channel.send(playembed);
        else
          return message.channel.send(`Added: \`${track.title}\` - to the Queue\n**Channel:** ${track.author}\n**Song Duration:** ${track.isStream ? "LIVE STREAM" : format(track.duration).split(" | ")[0]}\n**Estimated time until playing:** ${time}\n**Position in queue:** ${player.queue.length}\n${track.uri}`);
        }
      }).catch(e=>{
        searchmsg.edit({content: "**:x: Timeout!**", embed: null}) 
      })
  }
}

async function play(client, message, args, type) {
  const search = args.join(" ");
    let res;
        res = await client.manager.search({
          query: search,
          source: type.split(":")[1]
        }, message.author);
      
      if (res.loadType === "LOAD_FAILED") throw res.exception;
      else if (res.loadType === "PLAYLIST_LOADED") {
        playlist_()
      } else {
        song_()
      }
    
    function song_() {
      
      if (!res.tracks[0]){
        return message.channel.send(`**:x: Found nothing for: \`${search}\`**`);
      }
      
      if(res.tracks[0].duration > 3 * 60 * 60 * 1000){
        return message.channel.send(`**:x: Cannot play a song that's longer than 3 hours**`)
      }
      
      let player;
      player = client.manager.create({
        guild: message.guild.id,
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
        selfDeafen: false,
      });
      
      if (player.state !== "CONNECTED") {
        
        player.connect()
        
        player.queue.add(res.tracks[0]);
        
        player.play();
      }
      
      else {
          
          player.queue.add(res.tracks[0]);
          var time = 0;
          
          let playembed = new Discord.MessageEmbed()
            .setAuthor(`Added to queue`, message.author.displayAvatarURL({dynamic: true}))
            .setURL(res.tracks[0].uri)
            .setTitle("**" + res.tracks[0].title + "**").setColor(ee.color)
            .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
            .addField("Channel", res.tracks[0].author, true)
            .addField("Song Duration: ", res.tracks[0].isStream ? "LIVE STREAM" : format(res.tracks[0].duration).split(" | ")[0], true)
            
            if(player.queue.size > 0) player.queue.map((track) => time += track.duration)
            time += player.queue.current.duration - player.position;
            time -= res.tracks[0].duration;
            playembed.addField("Estimated time until playing", format(time).split(" | ")[0], true)
            
            playembed.addField("Position in queue", `${player.queue.length}`, true)
          
          if(message.guild.me.permissionsIn(message.channel).has("EMBED_LINKS"))
            return message.channel.send(playembed);
          else
            return message.channel.send(`Added: \`${res.tracks[0].title}\` - to the Queue\n**Channel:** ${res.tracks[0].author}\n**Song Duration:** ${res.tracks[0].isStream ? "LIVE STREAM" : format(res.tracks[0].duration).split(" | ")[0]}\n**Estimated time until playing:** ${time}\n**Position in queue:** ${player.queue.length}\n${res.tracks[0].uri}`);
      }
    }
    
    function playlist_() {
      if (!res.tracks[0]){
        return message.channel.send(`**:x: Found nothing for: \`${search}\`**`);
      }
      for(const track of res.tracks)
        if(track.duration > 3 * 60 * 60 * 1000){
          return message.channel.send(`**:x: Cannot play a song that's longer than 3 hours --> playlist skipped!**`)
        }
      let player;
      player = client.manager.create({
        guild: message.guild.id,
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
        selfDeafen: false,
      });
      
      if (player.state !== "CONNECTED") {
        player.connect();
        player.queue.add(res.tracks);
        player.play();
      }else{
        player.queue.add(res.tracks);
      }
      if(message.content.includes('youtu')) {
        var time = 0;
            let playlistembed1 = new Discord.MessageEmbed()

          .setAuthor(`Playlist added to Queue`, message.author.displayAvatarURL({dynamic:true}))
          .setColor('FFFFFF')
          .setTitle("**"+res.playlist.name+"**")
          .setURL(args[0])
          .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
            
            if(player.queue.size > 0) player.queue.map((track) => time += track.duration)
            time += player.queue.current.duration - player.position;
            for(const track of res.tracks)
              time -= track.duration;
    
            playlistembed1.addField("Estimated time until playing", time > 10 ? format(time).split(" | ")[0] : "NOW")
            .addField("Position in queue", `${player.queue.length - res.tracks.length + 1 === 0 ? "NOW" : player.queue.length - res.tracks.length + 1}`, true)
            .addField("Enqueued", `\`${res.tracks.length}\``, true)
          
          if(message.guild.me.permissionsIn(message.channel).has("EMBED_LINKS"))
          message.channel.send(playlistembed1)
      } else if(message.content.includes('spotify')) {
        getPreview(args[0]).then((data) => {
          var time = 0;
          let playlistembed2 = new Discord.MessageEmbed()

        .setAuthor(`Playlist added to Queue`, message.author.displayAvatarURL({dynamic:true}))
        .setColor('FFFFFF')
        .setTitle("**"+res.playlist.name+"**")
        .setURL(args[0])
        .setThumbnail(data.image)
          
          if(player.queue.size > 0) player.queue.map((track) => time += track.duration)
          time += player.queue.current.duration - player.position;
          for(const track of res.tracks)
            time -= track.duration;
  
          playlistembed2.addField("Estimated time until playing", time > 10 ? format(time).split(" | ")[0] : "NOW")
          .addField("Position in queue", `${player.queue.length - res.tracks.length + 1 === 0 ? "NOW" : player.queue.length - res.tracks.length + 1}`, true)
          .addField("Enqueued", `\`${res.tracks.length}\``, true)
          
          if(message.guild.me.permissionsIn(message.channel).has("EMBED_LINKS"))
          message.channel.send(playlistembed2)
        })
      }
    }
}

async function playskip(client, message, args, type) {
  const search = args.join(" ");
  let res;
      res = await client.manager.search({
        query: search,
        source: type.split(":")[1]
      }, message.author);
    
    if (res.loadType === "LOAD_FAILED") throw res.exception;
    else if (res.loadType === "PLAYLIST_LOADED") {
      playlist_()
    } else {
      song_()
    }
  function song_() {
    
    if (!res.tracks[0]){
      return message.channel.send(`**:x: Found nothing for: \`${search}\`**`);
    }
    
    if(res.tracks[0].duration > 3 * 60 * 60 * 1000){
      return message.channel.send(`**:x: Cannot play a song that's longer than 3 hours**`)
    }
    
    let player;
    player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: false,
    });
    
    if (player.state !== "CONNECTED") {
      
      player.connect()
      
      player.queue.add(res.tracks[0]);
      
      player.play();
    }
    
    else {
     
      let oldQueue =[]
      for(const track of player.queue)
        oldQueue.push(track);
      
      player.queue.clear();
      
      player.queue.add(res.tracks[0]);
      
      for (const track of oldQueue)
        player.queue.add(track);
      
      player.stop();
    }
  }
  
  function playlist_() {
    if (!res.tracks[0]){
      return message.channel.send(`**:x: Found nothing for: \`${search}\`**`);
    }
    for(const track of res.tracks)
      if(track.duration > 3 * 60 * 60 * 1000){
        return message.channel.send(`**:x: Cannot play a song that's longer than 3 hours --> playlist skipped!**`)
      }
    let player;
    player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: false,
    });
    
    if (player.state !== "CONNECTED") {
      player.connect();
      player.queue.add(res.tracks);
      player.play();
    }else{
      
      let oldQueue =[]
      for(const track of player.queue)
        oldQueue.push(track);
      
      player.queue.clear();
      
      player.queue.add(res.tracks);
      
      for (const track of oldQueue)
        player.queue.add(track);
      
      player.stop();
    }
    var time = 0;
      let playlistembed = new Discord.MessageEmbed()

        .setAuthor(`Playlist added to Queue`, message.author.displayAvatarURL({dynamic:true}))
        .setColor(ee.color)
        .setTitle("**"+res.playlist.name+"**")
        .setURL(args[1])
        .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
          
          if(player.queue.size > 0) player.queue.map((track) => time += track.duration)
          time += player.queue.current.duration - player.position;
          for(const track of res.tracks)
            time -= track.duration;
  
          playlistembed.addField("Estimated time until playing", time > 10 ? format(time).split(" | ")[0] : "NOW")
          .addField("Position in queue", `${player.queue.length - res.tracks.length + 1 === 0 ? "NOW" : player.queue.length - res.tracks.length + 1}`, true)
          .addField("Enqueued", `\`${res.tracks.length}\``, true)
        
        if(message.guild.me.permissionsIn(message.channel).has("EMBED_LINKS"))
          message.channel.send(playlistembed);
        else
          message.channel.send(`Added: \`${res.tracks[0].title}\` - to the Queue\n**Channel:** ${res.tracks[0].author}\n**Song Duration:** ${res.tracks[0].isStream ? "LIVE STREAM" : format(res.tracks[0].duration).split(" | ")[0]}\n**Estimated time until playing:** ${time}\n**Position in queue:** ${player.queue.length}\n${res.tracks[0].uri}`);
  }
}

async function playtop(client, message, args, type) {
  const search = args.join(" ");
  let res;
      res = await client.manager.search({
        query: search,
        source: type.split(":")[1]
      }, message.author);
    
    if (res.loadType === "LOAD_FAILED") throw res.exception;
    else if (res.loadType === "PLAYLIST_LOADED") {
      playlist_()
    } else {
      song_()
    }
  function song_() {
    
    if (!res.tracks[0]){
      return message.channel.send(`**:x: Found nothing for: \`${search}\`**`);
    }
    
    if(res.tracks[0].duration > 3 * 60 * 60 * 1000){
      return message.channel.send(`**:x: Cannot play a song that's longer than 3 hours**`)
    }
    
    let player;
    player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: false,
    });
    
    if (player.state !== "CONNECTED") {
      
      player.connect()
      
      player.queue.add(res.tracks[0]);
      
      player.play();
    }
    
    else {
     
      let oldQueue =[]
      for(const track of player.queue)
        oldQueue.push(track);
      
      player.queue.clear();
      
      player.queue.add(res.tracks[0]);
      
      for (const track of oldQueue)
        player.queue.add(track);
      let playembed = new Discord.MessageEmbed()
      .setAuthor(`Added to queue`, message.author.displayAvatarURL({dynamic: true}))
      .setURL(res.tracks[0].uri)
      .setTitle("**" + res.tracks[0].title + "**").setColor(ee.color)
      .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
      .addField("Channel", res.tracks[0].author, true)
      .addField("Song Duration: ", res.tracks[0].isStream ? "LIVE STREAM" : format(res.tracks[0].duration).split(" | ")[0], true)
      
      if(player.queue.size > 0) player.queue.map((track) => time += track.duration)
      time += player.queue.current.duration - player.position;
      time -= res.tracks[0].duration;
      playembed.addField("Estimated time until playing", format(time).split(" | ")[0], true)
      
      playembed.addField("Position in queue", `${player.queue.length}`, true)
    
    if(message.guild.me.permissionsIn(message.channel).has("EMBED_LINKS"))
      return message.channel.send(playembed);
    else
      return message.channel.send(`Added: \`${res.tracks[0].title}\` - to the Queue\n**Channel:** ${res.tracks[0].author}\n**Song Duration:** ${res.tracks[0].isStream ? "LIVE STREAM" : format(res.tracks[0].duration).split(" | ")[0]}\n**Estimated time until playing:** ${time}\n**Position in queue:** ${player.queue.length}\n${res.tracks[0].uri}`);
  }
  }
  
  function playlist_() {
    if (!res.tracks[0]){
      return message.channel.send(`**:x: Found nothing for: \`${search}\`**`);
    }
    for(const track of res.tracks)
      if(track.duration > 3 * 60 * 60 * 1000){
        return message.channel.send(`**:x: Cannot play a song that's longer than 3 hours --> playlist skipped!**`)
      }
    let player;
    player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: false,
    });
    
    if (player.state !== "CONNECTED") {
      player.connect();
      player.queue.add(res.tracks);
      player.play();
    }else{
      
      let oldQueue =[]
      for(const track of player.queue)
        oldQueue.push(track);
      
      player.queue.clear();
      
      player.queue.add(res.tracks);
      
      for (const track of oldQueue)
        player.queue.add(track);
    }
    var time = 0;
      let playlistembed = new Discord.MessageEmbed()

        .setAuthor(`Playlist added to Queue`, message.author.displayAvatarURL({dynamic:true}))
        .setColor(ee.color)
        .setTitle("**"+res.playlist.name+"**")
        .setURL(args[1])
        .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
          
          if(player.queue.size > 0) player.queue.map((track) => time += track.duration)
          time += player.queue.current.duration - player.position;
          for(const track of res.tracks)
            time -= track.duration;
  
          playlistembed.addField("Estimated time until playing", time > 10 ? format(time).split(" | ")[0] : "NOW")
          .addField("Position in queue", `${player.queue.length - res.tracks.length + 1 === 0 ? "NOW" : player.queue.length - res.tracks.length + 1}`, true)
          .addField("Enqueued", `\`${res.tracks.length}\``, true)
        
        if(message.guild.me.permissionsIn(message.channel).has("EMBED_LINKS"))
          message.channel.send(playlistembed);
        else
          message.channel.send(`Added: \`${res.tracks[0].title}\` - to the Queue\n**Channel:** ${res.tracks[0].author}\n**Song Duration:** ${res.tracks[0].isStream ? "LIVE STREAM" : format(res.tracks[0].duration).split(" | ")[0]}\n**Estimated time until playing:** ${time}\n**Position in queue:** ${player.queue.length}\n${res.tracks[0].uri}`);
  }
}