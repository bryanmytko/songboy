require('dotenv').config();

const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const YouTube = require('simple-youtube-api');
const Entities = require('html-entities').XmlEntities;

const bot = new Discord.Client();
const youtube = new YouTube(process.env.GOOGLE_API_KEY);
const entities = new Entities();
const queue = new Map();

const YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v=';
const TMP_IMGS = [
  'https://media.tenor.com/images/7a28ad56a59500f38305a493cac0fee3/tenor.gif',
  'https://media1.tenor.com/images/596fec2152d6b02caf11facee5fcdffd/tenor.gif',
  'https://media1.tenor.com/images/98b5cf790161475a447bbd201085c597/tenor.gif',
  'https://media1.tenor.com/images/23733b37163bb20182c32e223192071d/tenor.gif',
  'https://media1.tenor.com/images/8c3b8de87353e2bf5b49fd7e25df0f0d/tenor.gif',
];
const PREFIX = '!';
const DEFAULT_VOLUME = 0.1;
const ACCEPTED_CHANNELS = ['bryans-bot-factory', 'songboy', 'song-boy', 'music'];
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
  if(!ACCEPTED_CHANNELS.includes(textChannel.name)) {
    return message.channel
      .send('Try using one of the acceptable Song Boy channels!', {
        files: [TMP_IMGS[Math.floor(Math.random() * TMP_IMGS.length)]],
      });
  }

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
      message.channel.send('That is not a valid command.');
      break;
  }
});

bot.on('disconnected', () => {
  console.log('>> Song boy has been disconnected. This is probably not a good thing.');
});

const queueSong = async function(message, params, serverQueue) {
  const textChannel = message.channel;
  const voiceChannel = message.member.voice.channel;
  const cleanParams = sanitizeParams(params, textChannel);

  if(!voiceChannel) return textChannel.send('You need to be in a Song Boy voice channel to hear music.');

  const results = await youtube.searchVideos(cleanParams, 1);

  const song = {
    url: `${YOUTUBE_WATCH_URL}${results[0].id}`,
    title: entities.decode(results[0].title),
    img: results[0].thumbnails.high.url,
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
    return message.channel.send(`"${song.title}" added to the queue.`);
  }
}

const playSong = async function(guild, song) {
  const serverQueue = queue.get(guild.id);

  if(!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return serverQueue.textChannel.send('Queue is empty. SongBoy is out of music :(');
  }

  try {
    const foundSong = await ytdl(song.url, { filter: 'audioonly' })

    const dispatcher = serverQueue
      .connection
      .play(foundSong)
      .on('finish', () => {
        console.log(`Finished playing "${song.title}"`);
        serverQueue.songs.shift();
        playSong(guild, serverQueue.songs[0]);
      })
      .on('error', err => {
        console.log(`Error, probably related to ytdl!: ${err}`)
        serverQueue.songs.shift();
        playSong(guild, serverQueue.songs[0]);
      });

    dispatcher.setVolume(DEFAULT_VOLUME);
    serverQueue.textChannel.send(`SongBot playing "${song.title}"`);
    serverQueue.textChannel.send('', {
      files: [song.img],
    });
  } catch(e) {
    console.log('API ERROR ytdl!', e);
    playSong(guild, song); // Try again?
  }
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

const sanitizeParams = function(params, textChannel) {
  try {
    const input = new URL(params);
    try {
      return input.searchParams.get('v');
    } catch {
      textChannel.send('That does not seem to be a valid URL pogChamp. Searching anyway...');
      return params;
    }
  } catch {
    return params;
  }
}

bot.login(process.env.DISCORD_BOT_TOKEN);
