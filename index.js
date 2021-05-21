/*
    discordbot-battlemetrics
    index.js
    Tripayou © 2021
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
            // Server Online
            if (res.body.data.attributes.status === 'online') {
                // Player count has changed since last call
                if (lastPlayerCount !== res.body.data.attributes.players) {
                    member.setNickname(`Ingame: ${res.body.data.attributes.players} / ${res.body.data.attributes.maxPlayers}`)
                    .catch((error) => {
                        console.log('ERROR : failed to set nickname');
                        console.error(error);
                    });

                    lastPlayerCount = res.body.data.attributes.players;
                }
            }
            // Server Offline
            else {
                member.setNickname('Server offline')
                .catch((error) => {
                    console.log('ERROR : failed to set nickname');
                    console.error(error);
                });

                if (lastPlayerCount !== null) lastPlayerCount = null;
            }

            // Update bot activity (server name) if necessary
            // setActivity available only for client, not for guild member
            if (thisBot.user.presence.activities[0].name !== config.serverName) {
                thisBot.user.setActivity(config.serverName).catch((error) => {
                    console.log('ERROR : failed to set activity');
                    console.error(error);
                });
            }
        }
        // API call failed
        else {
            console.log(`ERROR : battlemetrics API returned code ${res.status}`);

            // Reset bot name to default and display 'no data' message on 1st fail
            if (thisBot.user.presence.activities[0].name !== 'no data') {
                member.setNickname('').catch((error) => {
                    console.log('ERROR : failed to set nickname');
                    console.error(error);
                });

                thisBot.user.setActivity('no data').catch((error) => {
                    console.log('ERROR : failed to set activity');
                    console.error(error);
                });
            }
        }
    });

    return;
}


// Main script
thisBot.on('ready', () => {
    console.log('connected');

    // Define bot as a member to be able to change its name
    botAsMember = thisBot.guilds.cache.find(guild => guild.id === config.guildID).member(thisBot.user);
    
    // Set activity on startup
    thisBot.user.setActivity('Connection ...').catch((error) => {
        console.log('ERROR : failed to set activity');
        console.error(error);
    });

    changeMemberStatus(botAsMember);

    setInterval(() => {
        changeMemberStatus(botAsMember);
    }, config.refreshInterval * 1000);
})
.login(config.token);
