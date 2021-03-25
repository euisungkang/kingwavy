const Discord = require('discord.js');
const Meta = require('html-metadata-parser');
const market = require('./market')
const leaderboard = require('./leaderboard')
const cron = require('node-cron');
const Pornsearch = require('pornsearch');
const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);
//client.login('')

client.on('ready', async () => {
    console.log("help pls")

    // Update markets
    let mkt_channel = await client.channels.fetch(process.env.MARKET_CHANNEL)
    marketUpdate(mkt_channel)

    // Update leaderboards
    let ldb_channel = await client.channels.fetch(process.env.LEADERBOARD_CHANNEL)
    leaderboardUpdate(ldb_channel);

});

cron.schedule('00 5 * * *', () => {
    console.log('Running cron');
    postVideo();
})

cron.schedule('00 * * * *', async () => {
    let ldb_channel = await client.channels.fetch(process.env.LEADERBOARD_CHANNEL)
    leaderboardUpdate(ldb_channel)
})

let ldbID = '824439874022539305'

async function leaderboardUpdate(channel) {
    console.log("updating ldb");
    let ldbEmbed = await leaderboard.getEmbed(client);

    let exists = true;
    try {
        await channel.messages.fetch(ldbID)
    } catch (error) {
        console.error(error)
        exists = false;
    } finally {
        if (!exists) {
            let msg = await channel.send(ldbEmbed)
            ldbID = msg.id
        } else {
            let msg = await channel.messages.fetch(ldbID)
            msg.edit(ldbEmbed);
        }
    }
}

async function marketUpdate(channel) {
    let embed = await market.updateMarket(channel);
}

// client.on('message', message => {
//     if (message.channel.id = process.env.INPUT_CHANNEL) {

//         //console.log(message.channel.id + "      " + message)
//         //let output_channel = client.channels.get(process.env.GENERAL_CHANNEL);

//         if (message.content == '$porn') {
//             postVideo();
//         }
//     }
// });

//Call function to post video on given channelID
async function postVideo () {
    let Searcher = new Pornsearch('');

    Searcher.videos().
    then(videos => {
        let total_videos = videos.length - 1
        let video_number = Math.round(Math.random() * (total_videos - 1) + 1)
        let video = videos[video_number]

        Meta.parser(video.url, async (err, result) => {
            //Get output channel and data of video
            let output_channel = await client.channels.fetch(process.env.OUTPUT_CHANNEL);
            let metadata = await result.og

            console.log(metadata)


            let thumbnail = metadata.image


            //Sending description and image
            output_channel.send('\n**' + metadata.title + '**\n```JSON\n"' + metadata.description + '"\n```\n**Video URL:** ' + video.url, {files: [thumbnail]});
        })
    });
}

