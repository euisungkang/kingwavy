const Discord = require('discord.js');
const Meta = require('html-metadata-parser');
const market = require('./market')
const casino = require('./casino')
const leaderboard = require('./leaderboard')
const cron = require('node-cron');
const client = new Discord.Client();
const database = require('./firebaseSDK')

client.login(process.env.BOT_TOKEN_KW)

client.on('ready', async () => {
    console.log("help pls oh god im in heroku")

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

    //votingSystem()
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

//https://help.minecraft.net/hc/en-us/articles/360046470431-Minecraft-Types-of-Biomes
async function votingSystem() {
    let vc = await client.channels.fetch('917676729487749140')
    let m = await vc.messages.fetch('917677585209630750')
    let e = await new Discord.MessageEmbed()
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】 Minecraft Server v2: Starting Biome")
    .setDescription("Due to sufficient demand, we will be restarting the 【 𝓦 𝓪 𝓿 𝔂 】 Minecraft server. "
                +   "This vote will decide which biome the spawning point will be set at. \n\n"
                +   "The link below lists all the available biomes.\n"
                +   "> https://help.minecraft.net/hc/en-us/articles/360046470431-Minecraft-Types-of-Biomes\n\n"
                +   "**You can vote for as many biomes as you want**")
    .setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: 'Plains     🌿', value: '\u200B'},
        { name: 'Forest     🌳', value: '\u200B'},
        { name: 'Jungle     🐵', value: '\u200B'},
        { name: 'Mountain     ⛰️', value: '\u200B'},
        { name: 'Desert     ☀️', value: '\u200B'},
        { name: 'Taiga     🐯', value: '\u200B'},
        { name: 'Snowy Tundra     ❄️', value: '\u200B'},
        { name: 'Swamp     💩', value: '\u200B'},
        { name: 'Savannah     🦙', value: '\u200B'},
        { name: 'Badlands     🍂', value: '\u200B'},
        { name: 'Ocean     🌊', value: '\u200B'},
        { name: 'Nether     🔥', value: '\u200B'},
    )

    m.react('🌿')
    m.react('🌳')
    m.react('🐵')
    m.react('⛰️')
    m.react('☀️')
    m.react('🐯')
    m.react('❄️')
    m.react('💩')
    m.react('🦙')
    m.react('🍂')
    m.react('🌊')
    m.react('🔥')
    m.edit(e)
}

let ldbIDCurr = '966719668117209129'
let ldbIDBoost = '966719660525502524'

async function leaderboardUpdate(channel) {
    console.log("updating ldb");

    let ldbEmbed2 = await leaderboard.getEmbedBoost(client)
    let exists = true
    try {
        await channel.messages.fetch(ldbIDBoost)
    } catch (error) {
        console.error(error)
        exists = false;
    } finally {
        if (!exists) {
            let msg = await channel.send(ldbEmbed2)
            ldbIDBoost = msg.id
        } else {
            let msg = await channel.messages.fetch(ldbIDBoost)
            msg.edit(ldbEmbed2);
        }
    }

    let ldbEmbed = await leaderboard.getEmbedCurr(client);
    exists = true;
    try {
        await channel.messages.fetch(ldbIDCurr)
    } catch (error) {
        console.error(error)
        exists = false;
    } finally {
        if (!exists) {
            let msg = await channel.send(ldbEmbed)
            ldbIDCurr = msg.id
        } else {
            let msg = await channel.messages.fetch(ldbIDCurr)
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
// async function postVideo () {
//     //const results = await HAPI.search('', {blacklist: ["scat", "loli", "bestiality", "pregnant", "shota",  "tentacle", "ugly bastard"]});
//     const results = await HAPI.search('query')

//     const arraySize = results.videos.length;
//     const randomVideoIndex = Math.floor(Math.random() * (arraySize - 1))
//     console.log(results.videos[0])
//     const randomVideo = await HAPI.get_video(results.videos[0])
    
//     let name = randomVideo.video.hentai_video.name
//     let thumbnail = randomVideo.video.hentai_video.poster_url;
//     let description = randomVideo.video.hentai_video.description

//     let rawTags = randomVideo.tags;
//     let tags = new Array();
//     //console.log((rawTags)[0])
//     for (let i = 0; i < rawTags.length; i++) {
//         tags[i] = " " + (rawTags)[i].text
//     }

//     let output_channel = await client.channels.fetch('813223964997451788');

//     //Sending description and image
//     output_channel.send('\n**' + name + '**\n```JSON\n"' + description + "\n\nTags: " + tags + '"\n```\n**Video URL:** ' + randomVideo.video_url, {files: [thumbnail]});
// }