# SongBoy

Discord bot to play music.

> __Warning__ This project is no longer in development

> Version 2: [Songboy](https://github.com/bryanmytko/songboy2)

## Environment

Create a `.env` or add to your environment:

```
DISCORD_BOT_TOKEN=xxxx                      
GOOGLE_API_KEY=xxxx
```

Follow next steps for obtaining these values.


## Discord

Create a new Discord application [https://discord.com/developers/applications](https://discord.com/developers/applications)

- Make note of your `client_id`.
- Turn the application into a bot and add your `token` to `DISCORD_BOT_TOKEN` in your env.
- Set permissions your bot needs and make note of the `permissions` integer.

You can now invite your bot to your server (assuming you have permission) with this link, filling in your `client_id` and `permissions` integer.

*https://discord.com/oauth2/authorize?client_id=xxxxx&scope=bot&permissions=xxxxx*

## YouTube

Get an API Key to use the YouTube API by following through Step 1 in this guide:

[https://developers.google.com/youtube/v3/quickstart/js](https://developers.google.com/youtube/v3/quickstart/js).

Add that value to `GOOGLE_API_KEY` in your env.

## Deploy and Run

Host the bot somewhere (Heroku, Digital Ocean) and start it with:

`yarn start`

Or locally with:

`yarn start:dev`
