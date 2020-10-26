require('dotenv').config();
const Discord = require('discord.js');
const logger = require('pino')({ prettyPrint: true });

const {
  MSG_CONNECTED, MSG_DISCONNECTED, MSG_INVALID_COMMAND,
} = require('./src/util/messages');
const { commandRegex } = require('./src/util/regex');
const { validMessage } = require('./src/util/validators');
const commands = require('./src/commands');

const bot = new Discord.Client();
const queue = new Map();

bot.login(process.env.DISCORD_BOT_TOKEN);

bot.on('ready', () => logger.info(MSG_CONNECTED));

bot.on('message', async (message) => {
  if (!validMessage(message)) return;

  const match = message.content.match(commandRegex);
  const command = match[1];
  const params = {
    queue,
    message,
    input: (match[2]) ? match[2].trim() : '',
  };

  try {
    await commands[command](params);
  } catch (e) {
    message.channel.send(MSG_INVALID_COMMAND(command));
    logger.error(e);
  }
});

bot.on('disconnected', () => logger.fatal(MSG_DISCONNECTED));
