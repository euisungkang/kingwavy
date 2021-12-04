const Discord = require('discord.js');
const Meta = require('html-metadata-parser');
const market = require('./market')
const casino = require('./casino')
const leaderboard = require('./leaderboard')
const cron = require('node-cron');
const Pornsearch = require('pornsearch');
const { HentaiHavenAPI } = require('hentaihaven');
const client = new Discord.Client();
const database = require('./firebaseSDK')
const HAPI = new HentaiHavenAPI();


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

    votingSystem()

});

// cron.schedule('00 5 * * *', () => {
//     console.log('Running cron');
//     postVideo();
// })

cron.schedule('00 * * * *', async () => {
    //let ldb_channel = await client.channels.fetch(process.env.LEADERBOARD_CHANNEL)
    let ldb_channel = await client.channels.fetch('824376092257157120')
    leaderboardUpdate(ldb_channel)
})

async function votingSystem() {
    let vc = await client.channels.fetch('888391559442223205')
    let m = await vc.messages.fetch('888397457975808060')
    let e = await new Discord.MessageEmbed()
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Banner Vote")
    .setDescription("React with the emoji corresponding to whichever banner you like. "
                +   "You can vote for multiple banners. The banner with the most votes will be uploaded to 【 𝓦 𝓪 𝓿 𝔂 】. \n\n"
                +   "Emojis correspond to each image from **top to down**\n")
    .setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: '1     🔥', value: '\u200B'},
        { name: '2     ☕', value: '\u200B'},
        { name: '3     🎇', value: '\u200B'},
        { name: '4     🙏', value: '\u200B'},
    )

    m.react('🔥')
    m.react('☕')
    m.react('🎇')
    m.react('🙏')
    m.edit(e)
}

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
    //console.log(message.channel.id + "      " + message)
    //let output_channel = client.channels.get(process.env.GENERAL_CHANNEL);

    // if (message.content == '$porn' && message.author.id == '237018129664966656') {
    //     postVideo();
    // }
});

//Call function to post video on given channelID
async function postVideo () {
    //const results = await HAPI.search('', {blacklist: ["scat", "loli", "bestiality", "pregnant", "shota",  "tentacle", "ugly bastard"]});
    const results = await HAPI.search('query')

    const arraySize = results.videos.length;
    const randomVideoIndex = Math.floor(Math.random() * (arraySize - 1))
    console.log(results.videos[0])
    const randomVideo = await HAPI.get_video(results.videos[0])
    
    let name = randomVideo.video.hentai_video.name
    let thumbnail = randomVideo.video.hentai_video.poster_url;
    let description = randomVideo.video.hentai_video.description

    let rawTags = randomVideo.tags;
    let tags = new Array();
    //console.log((rawTags)[0])
    for (let i = 0; i < rawTags.length; i++) {
        tags[i] = " " + (rawTags)[i].text
    }

    let output_channel = await client.channels.fetch('813223964997451788');

    //Sending description and image
    output_channel.send('\n**' + name + '**\n```JSON\n"' + description + "\n\nTags: " + tags + '"\n```\n**Video URL:** ' + randomVideo.video_url, {files: [thumbnail]});
}