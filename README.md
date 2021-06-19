# Discord Bot Battlemetrics

## Description

Provides "real-time" server presence information in its status.</br>
![image 1](https://user-images.githubusercontent.com/3091426/122642124-1e686100-d109-11eb-9543-b57d412b449c.png "status image")

Provides basic server informations from battlemetrics website.</br>
![image 2](https://user-images.githubusercontent.com/3091426/122642134-26280580-d109-11eb-8d79-f779d8cd7043.png "message image")

## Usage

Use command `!srvinfo` to display server informations.</br>
Prefix and command are configurable.

## Installation

Visit https://discordapp.com/developers/applications/ and create a bot to obtain its token.</br>
- Make sure node.js is installed and npm is up to date.</br>
- Clone repository and go to root folder:</br>
`git clone https://github.com/Tripayou/discordbot-battlemetrics.git`</br>
`cd discordbot-battlemetrics`</br>
- Install dependencies:</br>
`npm install`
- Edit configuration to your needs like described below.

Run app locally or use a process manager like [PM2](https://pm2.keymetrics.io/).

## Configuration

Edit `exampleconfig.json` by the following and save it as `config.json`.</br>
If you use [PM2](https://pm2.keymetrics.io/) (recommanded) to manage bots you will also need to edit index.js and modify line 14 :</br>
modify `require('./config.json')` to `require('/absolute/path/to/discordbot-battlemetrics/config.json')`.

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

- command</br>
Wording of info command.

- instances</br>
Number of bot instances running on the same host.</br>
Used to calculate time interval between 2 API calls, to avoid errors due to battlemetrics API limitations. 

## Multiple instances
![image 3](https://user-images.githubusercontent.com/3091426/122642130-232d1500-d109-11eb-9057-57275061131e.png "multi image")

If you want to monitor several game servers follow these steps:
- Create as many bots as needed.
- Rename root folder of 1st downloaded instance, e.g. "csgo-battlemetrics", and reclone repo. Do this as many times as necessary.
- Each instance needs its unique bot `token`.
- Keep same `prefix` for all instances but modify `command` differently for each instance, e.g. "tf2info".
- Set `instances` according to the number of instances you need. Same value required in each config file. 