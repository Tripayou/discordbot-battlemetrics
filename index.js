/*
    discordbot-battlemetrics
    index.js
*/


// Constants
const Discord = require('discord.js');
const thisBot = new Discord.Client();
const unirest = require('unirest');
const config = require('./config.json');


// Global variables
let lastPlayerCount = null;


// Functions
// Calls battlemetrics api and modify bot name and status depending on response
function changeMemberStatus(member) {
    unirest.get(`https://api.battlemetrics.com/servers/${config.serverID}`).end(res => {
        // Response OK
        if (res.status === 200) {
            console.log(`Response Status = ${res.status}`);
        }
        // API call failed
        else {
            console.log(`ERROR : Response Status = ${res.status}`);
        }
    });
}


// Main script
thisBot.on('ready', () => {
    console.log('connected');

    // Define bot as a member to be able to change its name and status
    botAsMember = thisBot.guilds.cache.find(guild => guild.id === config.guildID).member(thisBot.user);
    
    // Clean activity on startup
    thisBot.user.setActivity('Connexion ...').catch((error) => {
        console.log('ERROR : failed to set activity');
        console.error(error);
    });

    changeMemberStatus(botAsMember);

    setInterval(() => {
        changeMemberStatus(botAsMember);
    }, config.refreshInterval * 1000);
})
.login(config.token);
