const {
    MessageEmbed
  } = require(`discord.js`);
  const config = require(`../../botconfig/config.json`);
  const ee = require(`../../botconfig/embed.json`);
  module.exports = {
    name: `setdj`,
    aliases: [`adddjrole`],
    category: `Settings`,
    description: `Let's you define a DJ role/s`,
    usage: `@role`,
    memberpermissions: [`ADMINISTRATOR`],
    run: async (client, message, args) => {
      try {
        //get the role of the mention
        let role = message.guild.roles.cache.get(`${args[0]}`) || message.mentions.roles.first();
        //if no pinged role return error
        if (!role)
          return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setDescription(`:x: Please mention the role!`)
            .setTitle(ee.titletext)
          );
        //try to find the role in the guild just incase he pings a role of a different server
        try {
          message.guild.roles.cache.get(role.id);
        } catch {
          return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setDescription(`:x: Role not found!`)
            .setTitle(ee.titletext)
          );
        }
        //if ther role is already in the Database, return error
        if (client.settings.get(message.guild.id, `djroles`).includes(role.id))
          return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setDescription(`:x: Already a DJ role!`)
            .setTitle(ee.titletext)
          );
        //push it into the database
        client.settings.push(message.guild.id, role.id, `djroles`);
        //these lines creates a string with all djroles
        let leftb = ``;
        if (client.settings.get(message.guild.id, `djroles`).join(``) === ``) leftb = `no Dj Roles, aka All Users are Djs`
        else
          for (let i = 0; i < client.settings.get(message.guild.id, `djroles`).length; i++) {
            leftb += `<@&` + client.settings.get(message.guild.id, `djroles`)[i] + `> | `
          }
  
        return message.channel.send(new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setDescription(`Added the DJ role list \`${role.name}\`\nAll DJ Roles:\n> ${leftb.substr(0, leftb.length - 3)}`)
        );
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