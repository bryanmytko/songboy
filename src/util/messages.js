module.exports = {
  MSG_NON_VALID_URL: 'That does not seem to be a valid URL pogChamp. Searching anyway...',
  MSG_CONNECTED: 'Song Boy has connected!',
  MSG_DISCONNECTED: 'Song Boy has been disconnected. This is probably not a good thing.',
  MSG_INVALID_COMMAND: (command) => `:skull: That is not a valid command: \`!${command}\` :skull:`,
  MSG_INVALID_CHANNEL: 'Try using one of the acceptable Song Boy channels!',
  MSG_INVALID_VOICE_CHANNEL: ':speak_no_evil: You need to be in a Song Boy voice channel to hear music.',
  MSG_ADDED_TO_QUEUE: (song) => `"${song}" added to the queue.`,
  MSG_QUEUE_EMPTY: 'Queue is empty. Song Boy is out of music :frowning:',
  MSG_FINISHED_PLAYING: (song) => `Finished playing "${song}"`,
  MSG_YOUTUBE_ERROR: 'Something went wrong with YouTube and/or ytdl.',
  MSG_PLAYING: (song) => `Song Boy is playing "${song}"`,
  MSG_STOP: ':skull_crossbones: RIP in pieces Song Boy...',
  MSG_QUEUE_CURRENT: (songs) => `Current queue: \n${songs}`,
  MSG_SKIP_FAIL: 'No songs to skip. Queue is empty!',
  MSG_SKIP: (song) => `Song Boy is skipping ${song}.`,
  TTS_LEADS: (song, name) => [
    `This one goes out to ${name}. Here's ${song}`,
    `${name} has requested ${song}, so here it is.`,
    `Can we get some poggers in the chat for ${song}`,
    `Another request coming in from ${name}`,
    `Here's another Song Boy classic... ${song}`,
    `Here's the summer jam of 2020, none other than ${song}`,
    'Oooh this one is spicy',
    'Sup Buh-Buh-Buh-Buh-Boyz, Song Boy here with another banger',
    `Song Boy Radio, one-oh-four-point-nine on your FM dial. Here's ${song}`,
    `Shout out to big ${name}. Let's go!`,
    'I had my first kiss to this one.',
    `Everybody get ready to swing your floppy dick to this jam: ${song}`,
  ],
};
