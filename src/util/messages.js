module.exports = {
  MSG_NON_VALID_URL: 'That does not seem to be a valid URL pogChamp. Searching anyway...',
  MSG_CONNECTED: 'Song Boy has connected!',
  MSG_RECONNECTED: 'Song Boy has reconnected. Phew!',
  MSG_DISCONNECTED: 'Song Boy has been disconnected. This is probably not a good thing.',
  MSG_INVALID_COMMAND: (command) => `:skull: That is not a valid command: \`!${command}\` :skull:`,
  MSG_INVALID_CHANNEL: 'Try using one of the acceptable Song Boy channels!',
  MSG_INVALID_VOICE_CHANNEL: ':speak_no_evil: You need to be in a Song Boy voice channel to hear music.',
  MSG_ADDED_TO_QUEUE: (song) => `"${song}" added to the queue.`,
  MSG_QUEUE_EMPTY: 'Queue is empty. Song Boy is out of music :frowning:',
  MSG_FINISHED_PLAYING: (song) => `Finished playing "${song}"`,
  MSG_YOUTUBE_ERROR: ':skull_crossbones: Something went wrong with YouTube.',
  MSG_YOUTUBE_NOT_FOUND: 'Nothing could be found for that search query.',
  MSG_PLAYING: (song) => `Song Boy is playing "${song}"`,
  MSG_STOP: ':skull_crossbones: RIP in pieces Song Boy...',
  MSG_QUEUE_CURRENT: (songs) => `Current queue: \n${songs}`,
  MSG_SKIP_FAIL: 'No songs to skip. Queue is empty!',
  MSG_SKIP: (song) => `Song Boy is skipping ${song}.`,
  TTS_RANDOM: (song) => `Here's a random tune, ${song.title}, originally requested by ${song.requester}. `,
  TTS_RECONNECT: 'Holy shit, I just reconnected and boy are my arms tired.',
  TTS_LEADS: (song, name) => [
    `This one goes out to ${name}. Here's ${song}`,
    `${name} has requested ${song}, so let's take that one for a spin.`,
    `Can we get some poggers in the chat for ${song}`,
    `Another request coming in from ${name}`,
    `Here's another Song Boy classic... ${song}`,
    `Here's the summer jam of 2022, none other than ${song}`,
    'Oooh this one is spicy',
    'Sup Buh-Buh-Buh-Buh-Boyz, Song Boy here with another banger',
    `Song Boy Radio, one-oh-four-point-quin-sixty-nine on your FM dial. Here's ${song}`,
    `Shout out to big ${name}. Let's go!`,
    'I had my first kiss to this one.',
    `Everybody get ready to swing your floppy dick to this jam: ${song}`,
    `Another cordwainer anthem coming right up, here's ${song}`,
    `Here's another treasure straight from your Horadric cube, none other than ${song}`,
    `${name} must be wainin' because that's the only time I'd expect to hear ${song}`,
    `${name} that's the perfect soundtrack for dropping a big tier three sub to pink Q.T. here's ${song}`,
    `${name}? Nut. ${song}`,
    `Here's DMX with Ruff Ryders... just kidding: this one is called ${song}`,
    `Here's a double you straight outta Ragnaros, nada menos que la cancion de exito ${song}`,
    `${name} lost their virginity to this hit. Here's ${song}`,
    'Woo, this pick is spicier than a used Drake condom',
    `Thanks, ${name}, now everyone will hate you`,
    `This little ditty goes out to Pumpkin Spice Bryce. Here is ${song}`,
    `Get out your motion lotion for this jam. This is ${song}`,
    `Here comes another piece of arthouse hipster bullshit from ${name}`,
    'Welp. At least it isn\'t nickleback',
    'Anyway, here\'s Wonderwall...',
    `Here's ${song}. Enjoy your music, Boomer.`,
    'Meredith, I’m worried that the baby thinks people can’t change...',
    `Sup y'all, it's me, it's ya boy ${name}.`
  ],
};
