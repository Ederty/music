const {
    MessageEmbed
  } = require(`discord.js`);
  const config = require(`../../botconfig/config.json`);
  const ee = require(`../../botconfig/embed.json`);
  module.exports = {
    name: `djs`,
    aliases: [],
    category: `Settings`,
    description: `Lists all DJ roles`,
    memberpermissions: [`ADMINISTRATOR`],
    run: async (client, message, args) => {
        let leftb = ``;
        if (client.settings.get(message.guild.id, `djroles`).join(``) === ``) leftb = `no Dj Roles, aka All Users are Djs`
        else
          for (let i = 0; i < client.settings.get(message.guild.id, `djroles`).length; i++) {
            leftb += `<@&` + client.settings.get(message.guild.id, `djroles`)[i] + `> \n `
          }
  
        return message.channel.send(new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setDescription(`All DJ Roles:\n ${leftb === '' ? `**No DJ Role/s!**` : `${leftb.substr(0, leftb.length - 2)}`}`)
        );
    }
}