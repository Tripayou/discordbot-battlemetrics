/*
*   discordbot-battlemetrics
*   index.js
*   Tripayou © 2021
*/


/*****************
*    Constants
*****************/

const Discord = require('discord.js');
const unirest = require('unirest');
const config = require('./config.json');

const thisBot = new Discord.Client();

// In seconds, interval between API calls
// If set to 1, API returns code 429 (rate limit error)
const refreshInterval = 2;

// Error message, displayed when bot is in error status
const errorMsg = 'no data';


/************************
*    Global variables
************************/

let lastPlayerCount = null;


/*****************
*    Functions
*****************/

// Calls battlemetrics api and modify bot name and status depending on response
function changeMemberStatus(member) {
    unirest.get(`https://api.battlemetrics.com/servers/${config.serverID}`)
    .end(res => {
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

            // Update bot activity (server name) on 1st success
            // setActivity available only for client, not for guild member
            if (thisBot.user.presence.activities[0].name !== config.serverName) {
                thisBot.user.setActivity(config.serverName)
                .catch((error) => {
                    console.log('ERROR : failed to set activity');
                    console.error(error);
                });
            }
        }
        // API call failed
        else {
            console.log(`ERROR : battlemetrics API returned code ${res.status}`);

            // Set bot to error status
            // Reset bot name to default and display error message
            if (thisBot.user.presence.activities[0].name !== errorMsg) {
                member.setNickname('')
                .catch((error) => {
                    console.log('ERROR : failed to set nickname');
                    console.error(error);
                });

                thisBot.user.setActivity(errorMsg)
                .catch((error) => {
                    console.log('ERROR : failed to set activity');
                    console.error(error);
                });
            }
        }
    });

    return;
}


/*******************
*    Main script
*******************/


thisBot.on('ready', () => {
    console.log('connected');

    // Define bot as a member to be able to change its name
    let botAsMember = thisBot.guilds.cache.find(guild => guild.id === config.guildID).member(thisBot.user);
    
    // Set activity on startup and reset name
    botAsMember.setNickname('')
    .catch((error) => {
        console.log('ERROR : failed to set nickname');
        console.error(error);
    });

    thisBot.user.setActivity('Connection ...')
    .catch((error) => {
        console.log('ERROR : failed to set activity');
        console.error(error);
    });
 
    changeMemberStatus(botAsMember);
     
    setInterval(() => {
        changeMemberStatus(botAsMember);
    }, refreshInterval * 1000);
})
.login(config.token);
