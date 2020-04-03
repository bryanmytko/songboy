require('dotenv').config();

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const Discord = require('discord.js');

const bot = new Discord.Client();
const queue = new Map();

const PREFIX = '!';
const DEFAULT_VOLUME = 0.1;
const COMMANDS = {
  play: 'song',
  stop: 'stop',
  skip: 'skip',
  queue: 'queue',
};

bot.on('message', async message => {
  const serverQueue = queue.get(message.guild.id);
  const textChannel = message.channel;

  if(!message.content.startsWith(PREFIX)) return;

  const commandRegex = new RegExp(`^${PREFIX}([^ ]+)\\s*(.*)`, 'i');
  const match = message.content.match(commandRegex);
  const command = match[1];
  const params = (match[2]) ? match[2].trim() : '';

  switch(command) {
    case COMMANDS.play:
      queueSong(message, params, serverQueue);
      break;
    case COMMANDS.stop:
      stopSong(message, serverQueue);
      break;
    case COMMANDS.skip:
      skipSong(serverQueue);
      break;
    case COMMANDS.queue:
      listQueue(serverQueue);
      break;
    default:
      message.channel.send('That is not a valid command. Poggers in the chat.');
      break;
  }
});

const queueSong = async function(message, params, serverQueue) {
  const textChannel = message.channel;
  const voiceChannel = message.member.voice.channel;

  if(!voiceChannel) return message.channel.send('You need to be in a voice channel to hear music, idiot!');

  await ytsr.getFilters(params, async (err, filters) => {
    const filter = filters.get('Type').find(o => o.name === 'Video');
    const options = {
      limit: 5,
      nextpageRef: filter.ref,
    }

    const results = await ytsr(params, options);

    const song = {
      url: results.items[0].link,
      title: results.items[0].title,
    };

    if(!serverQueue) {
      const queueConstruct = {
        textChannel,
        voiceChannel,
        connection: null,
        songs: [],
        volume: DEFAULT_VOLUME,
        playing: true,
      };

      queue.set(message.guild.id, queueConstruct);
      queueConstruct.songs.push(song);

      const connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      playSong(message.guild, queueConstruct.songs[0]);
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`"${song.title}" added to the queue poggers in the chat`);
    }
  });
}

const playSong = async function(guild, song) {
  const serverQueue = queue.get(guild.id);

  if(!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return serverQueue.textChannel.send('Queue is empty. SongBoy is out of music :(');
  }

  const foundSong = ytdl(song.url, { filter: 'audioonly' })

  const dispatcher = serverQueue
    .connection
    .play(foundSong)
    .on('finish', () => {
      console.log(`Finished playing "${song.title}"`);
      serverQueue.songs.shift();
      playSong(guild, serverQueue.songs[0]);
    });

  dispatcher.setVolume(DEFAULT_VOLUME);
  serverQueue.textChannel.send(`SongBot playing "${song.title}"`);
}

const stopSong = async function(message, serverQueue) {
  if(!serverQueue) return;

  serverQueue.textChannel.send(`RIP in pieces SongBot...`);
  serverQueue.songs = [];
  serverQueue.voiceChannel.leave();
  queue.delete(message.guild.id);
}

const skipSong = async function(serverQueue) {
  if(!serverQueue) return;
  if(!serverQueue.songs.length) serverQueue.textChannel.send('No songs to skip. Queue is empty!');

  try {
    serverQueue.textChannel.send(`SongBot is skipping "${serverQueue.songs[0].title}".`);
    serverQueue.connection.dispatcher.end();
  } catch(e) {
    console.log(e);
  }
}

const listQueue = function(serverQueue) {
  try {
    if(!serverQueue.songs.length) {
      serverQueue.textChannel.send('Queue is empty.');
    } else {
      serverQueue.textChannel.send(`Current queue: \n${serverQueue.songs.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}`);;
    }
  } catch(e) {
    console.log(e);
  }
}

bot.login(process.env.DISCORD_BOT_TOKEN);
