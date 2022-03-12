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
const { initialLsCache } = require('pino/lib/levels');

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

Playlist.findOneAndUpdate({ title: 'default' }, { title: 'default' }).then((playlist) => {
  bot.login(process.env.DISCORD_BOT_TOKEN);
  bot.on('ready', async () => {
    if(!playlist) {
      return Playlist({ title: 'default', songs: [] }).save();
    }

    if(playlist.songs.length) {
      logger.info(MSG_RECONNECTED);
      commands.reconnect({
        playlist,
        queue,
        message: {
          channel: playlist.message.channel,
          guild: {
            id: playlist.message.guild.id,
          },
          member: {
            voice: {
              channel: playlist.message.member.voice,
            }
          }
        }
      });
    } else {
      logger.info(MSG_CONNECTED);
    }
  });

  bot.on('message', async (message) => {
    if (!validMessage(message)) return;

    const match = message.content.match(commandRegex);
    const command = match[1];
    const params = {
      playlist: playlist || [],
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
});
