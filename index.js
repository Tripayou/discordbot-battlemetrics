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

// Enable/disable logs
const verbose = false;

// In seconds, interval between API calls
// If set to 1, API returns code 429 (rate limit error)
const refreshInterval = 2;

// Error message, displayed when bot is in error status
const errorMsg = 'no data';

// Max API fails before displaying error message
// Sometimes API returns code 5XX
// Set error status only if consecutives fails
const maxApiFails = 3;


/************************
*    Global variables
************************/

// Used to compare player count between 2 calls
let lastPlayerCount = null;

// API fails count
let iFails = 0;

// Store data for info message
let data = null;

// Color for embed message
let color = null;


/*****************
*    Functions
*****************/

// Calls battlemetrics API and modify bot name and status depending on response
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
                        if (verbose) {
                            console.log('ERROR : failed to set nickname');
                            console.error(error);
                        }
                    });

                    lastPlayerCount = res.body.data.attributes.players;
                }
            }
            // Server Offline
            else {
                member.setNickname('Server offline')
                .catch((error) => {
                    if (verbose) {
                        console.log('ERROR : failed to set nickname');
                        console.error(error);
                    }
                });

                if (lastPlayerCount !== null) lastPlayerCount = null;
            }

            // Update bot activity (server name) on 1st success
            // setActivity available only for client, not for guild member
            if (thisBot.user.presence.activities[0].name !== config.serverName) {
                thisBot.user.setActivity(config.serverName)
                .catch((error) => {
                    if (verbose) {
                        console.log('ERROR : failed to set activity');
                        console.error(error);
                    }
                });
            }

            // Reset fails count
            if (iFails > 0) iFails = 0;

            // Store data
            // Create data object
            if (data === null) {
                data = {name: res.body.data.attributes.name,
                    ip: res.body.data.attributes.ip,
                    port: res.body.data.attributes.port,
                    players: res.body.data.attributes.players,
                    maxPlayers: res.body.data.attributes.maxPlayers,
                    rank: res.body.data.attributes.rank,
                    status: res.body.data.attributes.status};
                
                if (res.body.data.attributes.details.hasOwnProperty('map')) data.map = res.body.data.attributes.details.map;
            }
            // Update data
            else {
                Object.keys(data).forEach(key => {
                    if (key === 'map') data[key] = res.body.data.attributes.details.map;
                    else if (data[key] !== res.body.data.attributes[key]) data[key] = res.body.data.attributes[key];
                });
            }
        }
        // API call failed
        else {
            if (verbose) console.log(`ERROR : battlemetrics API returned code ${res.status}`);

            if (iFails < maxApiFails) iFails++;

            // Set bot to error status
            if (iFails === maxApiFails) {
                // Reset bot name to default and display error message
                if (thisBot.user.presence.activities[0].name !== errorMsg) {
                    member.setNickname('')
                    .catch((error) => {
                        if (verbose) {
                            console.log('ERROR : failed to set nickname');
                            console.error(error);
                        }
                    });

                    thisBot.user.setActivity(errorMsg)
                    .catch((error) => {
                        if (verbose) {
                            console.log('ERROR : failed to set activity');
                            console.error(error);
                        }
                    });
                }

                data = null;
            }
        }
    });

    return;
}


/*******************
*    Main script
*******************/


thisBot.on('ready', () => {
    if (verbose) console.log('connected');

    // Define bot as a member to be able to change its name
    let botAsMember = thisBot.guilds.cache.find(guild => guild.id === config.guildID).member(thisBot.user);
    
    // Set activity on startup and reset name
    botAsMember.setNickname('')
    .catch((error) => {
        if (verbose) {
            console.log('ERROR : failed to set nickname');
            console.error(error);
        }
    });

    thisBot.user.setActivity('Connection ...')
    .catch((error) => {
        if (verbose) {
            console.log('ERROR : failed to set activity');
            console.error(error);
        }
    });

    // Update bot status in right panel
    changeMemberStatus(botAsMember);
     
    setInterval(() => {
        changeMemberStatus(botAsMember);
    }, refreshInterval * 1000);
})


.on('message', message => {
    // Filter messages
    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;

    
    if (message.content === config.prefix + config.command) {
        // Set color for embed message
        // error = red
        if (data === null) color = 16711680;
        else {
            // online = green
            if (data.status === 'online') color = 43520;
            // offline = yellow
            else color = 16768768;
        }

        // Base message
        const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setFooter('discordbot-battlemetrics © 2021', thisBot.user.avatarURL())
        .setTitle(config.serverName);

        if (data !== null) {
            // Add data to base message
            embed.addFields({
                name: 'Server name',
                value: data.name
            },
            {
                name: 'Address',
                value: `${data.ip}:${data.port}`
            },
            {
                name: 'Players',
                value: `${data.players}/${data.maxPlayers}`
            });

            if (data.hasOwnProperty('map') && data.status === 'online') embed.addField('Current map', `${data.map}`);
            
            embed.addFields({
                name: 'Battlemetrics rank',
                value: data.rank
            },
            {
                name: 'Status',
                value: data.status
            });

        }
        else embed.addField('Error !', 'no data to display');

        message.channel.send(embed)
        .then(() => {
            return;
        })
        .catch((error) => {
            if (verbose) {
                console.log('ERROR : failed to send message');
                console.error(error);
            }

            return;
        });
    }
})


.login(config.token);
