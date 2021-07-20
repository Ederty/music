//here the event starts
const config = require("../../botconfig/config.json")
module.exports = client => {
  try{
    console.log(`${client.user.tag} is ready!`)
  }catch{ /* */ }

  try{
    client.user.setActivity(client.user.username, { type: "PLAYING" });
  }catch (e) {
      console.log(String(e.stack).red);
  }

  setInterval(()=>{
    try{
      client.user.setActivity(client.user.username, { type: "PLAYING" });
    }catch (e) {
        console.log(String(e.stack).red);
    }
  }, 10*60*1000)
}