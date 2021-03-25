const Discord = require('discord.js');
const Meta = require('html-metadata-parser');
const leaderboard = require('./leaderboard')
const cron = require('node-cron');
const Pornsearch = require('pornsearch');
const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);
//client.login('')

let msg;
let ldb_channel;

client.on('ready', async () => {
    console.log("help pls")

    ldb_channel = await client.channels.fetch(process.env.LEADERBOARD_CHANNEL)

    let ldbEmbed = await leaderboard.getEmbed(client);
    msg = await ldb_channel.send(ldbEmbed)
});

cron.schedule('00 5 * * *', () => {
    console.log('Running cron');
    postVideo();
})

cron.schedule('* * * * *', async () => {
    console.log("updating")

    let ldbEmbed = await leaderboard.getEmbed(client);
    msg.edit(ldbEmbed)
})

// client.on('message', message => {
//     if (message.channel.id = process.env.INPUT_CHANNEL) {

//         //console.log(message.channel.id + "      " + message)
//         //let output_channel = client.channels.get(process.env.GENERAL_CHANNEL);

//         if (message.content == '$porn') {
//             postVideo();
//         }
//     }
// });

// //Call function to post video on given channelID
// async function postVideo () {
//     let Searcher = new Pornsearch('');

//     Searcher.videos().
//     then(videos => {
//         let total_videos = videos.length - 1
//         let video_number = Math.round(Math.random() * (total_videos - 1) + 1)
//         let video = videos[video_number]

//         Meta.parser(video.url, async (err, result) => {
//             //Get output channel and data of video
//             let output_channel = await client.channels.fetch(process.env.OUTPUT_CHANNEL);
//             let metadata = await result.og

//             console.log(metadata)


//             let thumbnail = metadata.image


//             //Sending description and image
//             output_channel.send('\n**' + metadata.title + '**\n```JSON\n"' + metadata.description + '"\n```\n**Video URL:** ' + video.url, {files: [thumbnail]});
//         })
//     });
// }

