# Discord Bot Battlemetrics

## Description

Provides server "real-time" presence information in its status.</br>
Provides server informations from battlemetrics website.

## Usage

Use command `!srvinfo` to display server informations.

## Installation

Visit https://discordapp.com/developers/applications/ and create a bot to obtain its token.</br>
- Make sure node.js is installed.</br>
- Clone repository and go to root folder:</br>
`git clone https://github.com/Tripayou/discordbot-battlemetrics.git`</br>
`cd discordbot-battlemetrics`</br>
- Install dependencies:</br>
`npm install`
- Edit configuration to your needs like described below.

Run app localy or use a process manager like [PM2](https://pm2.keymetrics.io/).

## Configuration

Edit `exampleconfig.json` by the following and save it as `config.json`.</br>
If you use [PM2](https://pm2.keymetrics.io/) (recommanded) to manage bots you will also need to edit index.js and modify line 11 :</br>
modify `const config = require('./config.json')` to `const config = require('/absolute/path/to/config.json')`.

- token</br>
Your bot token, provided by Discord.

- serverID</br>
Your server id provided by battlemetrics, visible in your server url, e.g. https://www.battlemetrics.com/servers/csgo/12345678 : "12345678" is your id.

- serverName</br>
Your server name used to set bot activity status.

- guildID</br>
Your guild/discord server id, use Discord developer mode to find it.

- prefix</br>
Prefix for `srvinfo` command.

- refreshInterval</br>
In seconds, interval to update server presence informations.
