require('dotenv').config();
const { Client } = require('discord.js');
const mongoose = require('mongoose');
const logger = require('pino')({ prettyPrint: true });

const {
  MSG_CONNECTED, MSG_RECONNECTED, MSG_DISCONNECTED, MSG_INVALID_COMMAND,
} = require('./src/util/messages');
const { commandRegex } = require('./src/util/regex');
const { validMessage } = require('./src/util/validators');
const commands = require('./src/commands');
const Playlist = require('./src/models/playlist');

const MONGOOSE_URL = process.env.MONGO_URL;
const bot = new Client();
const queue = new Map();

mongoose.connect(`${MONGOOSE_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
});

const db = mongoose.connection;
db.once('open', () => logger.info('Database connected.'));

bot.login(process.env.DISCORD_BOT_TOKEN);

bot.on('ready', async () => {
  const playlist = await Playlist.findOneAndUpdate({ title: 'default' }, { title: 'default' });
  if(!playlist) return Playlist({ title: 'default', songs: [] }).save();

  if(playlist.songs && playlist.songs.length) {
    logger.info(MSG_RECONNECTED);
  //  return commands.reconnect(reconnectParams(playlist, bot));
  }

  logger.info(MSG_CONNECTED);
});

bot.on('message', async (message) => {
  if (!validMessage(message)) return;

  const match = message.content.match(commandRegex);
  const command = match[1];
  const params = {
    queue,
    message,
    input: (match[2]) ? match[2].trim() : '',
  };

  commands[command] ?
    await commands[command](params) :
    message.channel.send(MSG_INVALID_COMMAND(command));
});

bot.on('disconnected', () => logger.fatal(MSG_DISCONNECTED));

const reconnectParams = (playlist, bot) => {
  const channel = bot.channels.cache.get(playlist.message.channel);
  const voiceChannel = bot.channels.cache.get(playlist.message.member.voice.channel);

  return {
    playlist,
    queue,
    message: {
      channel,
      guild: {
        id: playlist.message.guild.id,
      },
      member: {
        voice: {
          channel: voiceChannel,
        }
      }
    }
  }
}
