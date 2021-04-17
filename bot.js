const Discord = require('discord.js');
const Meta = require('html-metadata-parser');
const market = require('./market')
const casino = require('./casino')
const leaderboard = require('./leaderboard')
const cron = require('node-cron');
const Pornsearch = require('pornsearch');
const client = new Discord.Client();
const database = require('./firebaseSDK')

//client.login('');
client.login(process.env.BOT_TOKEN)

client.on('ready', async () => {
    console.log("help pls")

    // Update markets
    //let mkt_channel = await client.channels.fetch(process.env.MARKET_CHANNEL)
    let mkt_channel = await client.channels.fetch('820051777650556990')
    marketUpdate(mkt_channel)

    //Update casinos
    //let csn_channel = await client.channels.fetch(process.env.MARKET_CHANNEL)
    let csn_channel = await client.channels.fetch('824869877306621982')
    let csn_channel2 = await client.channels.fetch('825492808013316176')
    casinoUpdate(csn_channel, csn_channel2)

    // Update leaderboards
    //let ldb_channel = await client.channels.fetch(process.env.LEADERBOARD_CHANNEL)
    let ldb_channel = await client.channels.fetch('824376092257157120')
    leaderboardUpdate(ldb_channel);

});

cron.schedule('00 5 * * *', () => {
    console.log('Running cron');
    postVideo();
})

cron.schedule('00 * * * *', async () => {
    //let ldb_channel = await client.channels.fetch(process.env.LEADERBOARD_CHANNEL)
    let ldb_channel = await client.channels.fetch('824376092257157120')
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
    let msg = await market.updateMarket(channel);

    msg.react('<:HentaiCoin:814968693981184030>')
    const filter = (reaction, user) => reaction.emoji.id == '814968693981184030' && user.id != msg.author.id
    market.awaitMarketReaction(msg, channel, filter)
}

let csnID = '825564278584639528'
let csnID2 = '825564283588837386'

async function casinoUpdate(channel, channel2) {
    let msg = await casino.updateCasino(channel, csnID);
    let msg2 = await casino.updateCasino(channel2, csnID2)
    msg.react('🌓')
    msg.react('✊')
    msg.react('♦')
    msg.react('🃏')
  
    msg2.react('🌓')
    msg2.react('✊')
    msg2.react('♦')
    msg2.react('🃏')


    // const filter = (reaction, user) => (reaction.emoji.name == '🌓' || reaction.emoji.name == '♦') && user.id != msg.author.id
    const filter = (reaction, user) => (reaction.emoji.name == '🌓' || reaction.emoji.name == '✊') && user.id != msg.author.id
    const filter2 = (reaction, user) => (reaction.emoji.name == '🌓' || reaction.emoji.name == '✊') && user.id != msg2.author.id
    casino.awaitCasinoReaction(client, msg, channel, filter)
    casino.awaitCasinoReaction(client, msg2, channel2, filter2)
}

client.on('message', message => {
    if (message.channel.id = '794722902003941417') {

        //console.log(message.channel.id + "      " + message)
        //let output_channel = client.channels.get(process.env.GENERAL_CHANNEL);

        if (message.content == '$porn') {
            postVideo();
        }
    }
});

//Call function to post video on given channelID
async function postVideo () {
    let Searcher = new Pornsearch('hentai');

    Searcher.videos().
    then(videos => {
        let total_videos = videos.length - 1
        let video_number = Math.round(Math.random() * (total_videos - 1) + 1)
        let video = videos[video_number]

        Meta.parser(video.url, async (err, result) => {

            let output_channel = await client.channels.fetch('813223964997451788');
            let metadata = await result.og

            console.log(metadata)

            let thumbnail = metadata.image

            //Sending description and image
            output_channel.send('\n**' + metadata.title + '**\n```JSON\n"' + metadata.description + '"\n```\n**Video URL:** ' + video.url, {files: [thumbnail]});
        })
    });
}