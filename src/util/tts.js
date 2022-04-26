const textToSpeech = require('@google-cloud/text-to-speech');
const { Readable } = require('stream');

const { TTS_LEADS, TTS_RECONNECT } = require('./messages');
const { VOICES } = require('./constants');

const client = new textToSpeech.TextToSpeechClient();
const voicesPref = [26, 28, 39, 42, 43, 27, 34, 35];
const defaultVoices = VOICES[voicesPref[Math.floor(Math.random() * voicesPref.length)]];
const audioConfig = { audioEncoding: 'MP3', speakingRate: 1.0 };

const ttsLead = async (song, name = '') => {
  const leads = TTS_LEADS(song, name);
  const text = leads[Math.floor(Math.random() * leads.length)];

  const request = {
    input: { text },
    voice: defaultVoices,
    audioConfig,
  };

  return synthesizedSpeechStream(request);
};

const ttsReconnectLead = async () => {
  const request = {
    input: { text: TTS_RECONNECT },
    voice: defaultVoices,
    audioConfig,
  };

  return synthesizedSpeechStream(request)
}

const synthesizedSpeechStream = async request => {
  const [response] = await client.synthesizeSpeech(request);
  const stream = new Readable();
  stream.push(response.audioContent);
  stream.push(null);

  return stream;
}

module.exports = {
  ttsLead,
  ttsReconnectLead
};
