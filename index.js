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
};

bot.on('message', async message => {
  const serverQueue = queue.get(message.guild.id);
  const textChannel = message.channel;

  if(!message.content.startsWith(PREFIX)) return;

  const commandRegex = new RegExp(`${PREFIX}([\\w\\-]+)(.+)`, 'mi');
  const command = message.content.match(commandRegex)[1];
  const params = message.content.match(commandRegex)[2].trim();

  switch(command) {
    case COMMANDS.play:
      queueSong(message, params, serverQueue);
      break;
    case COMMANDS.stop:
      stopSong(serverQueue);
      break;
    case COMMANDS.skip:
      skipSong(params, serverQueue);
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

  const searchResults = await ytsr(params);
  const song = {
    url: searchResults.items[0].link,
    title: searchResults.items[0].title,
  }

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
    return message.channel.send(`${song.title} added to the queue poggers in the chat`);
  }
}

const playSong = async function(guild, song) {
  const serverQueue = queue.get(guild.id);
  const foundSong = ytdl(song.url, { filter: 'audioonly' })
  const dispatcher = serverQueue
    .connection
    .play(foundSong)
    .on('finish', () => {
      console.log(`Finished playing ${song.title}`);
      serverQueue.songs.shift();
      playSong(guild, serverQueue.songs[0]);
    });

  dispatcher.setVolume(DEFAULT_VOLUME);
  serverQueue.textChannel.send(`SongBot playing "${song.title}"`);
}

const stopSong = async function(serverQueue) {
  serverQueue.textChannel.send(`RIP in pieces SongBot...`);
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

const skipSong = async function(serverQueue) {
  serverQueue.textChannel.send(`SongBot is skipping ${song.title}.`);
  serverQueue.connection.dispatcher.end();
}

bot.login(process.env.DISCORD_BOT_TOKEN);
