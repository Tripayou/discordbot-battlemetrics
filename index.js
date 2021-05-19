/*
    battlemetrics-discordbot
    index.js
*/

const Discord = require('discord.js');
const unirest = require('unirest');
const config = require('./config.json');

const thisBot = new Discord.Client();

// Main script
thisBot.on('ready', () => {
    console.log('connected');
})

.login(config.token);
