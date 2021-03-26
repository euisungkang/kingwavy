const Discord = require('discord.js');
const Meta = require('html-metadata-parser');
const market = require('./market')
const casino = require('./casino')
const leaderboard = require('./leaderboard')
const cron = require('node-cron');
const Pornsearch = require('pornsearch');
const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);
//client.login('')

client.on('ready', async () => {
    console.log("help pls")

    // Update markets
    //let mkt_channel = await client.channels.fetch(process.env.MARKET_CHANNEL)
    let mkt_channel = await client.channels.fetch('820051777650556990')
    marketUpdate(mkt_channel)

    //Update casinos
    //let csn_channel = await client.channels.fetch(process.env.MARKET_CHANNEL)
    let csn_channel = await client.channels.fetch('824869877306621982')
    casinoUpdate(csn_channel)

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

async function casinoUpdate(channel) {
    let msg = await casino.updateCasino(channel);
    msg.react('🌓')
    msg.react('♦')
    msg.react('🃏')

    //const filter = (reaction, user) => reaction.emoji.name == '🌓' && user.id != msg.author.id
    //casino.awaitCasinoReaction(client, msg, channel, filter)
}

async function votingSystem() {
    let vc = await client.channels.fetch('824740900567646248')
    let m = await vc.messages.fetch('824740965214060574')
    let e = await new Discord.MessageEmbed()
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Channel Names")
    .setDescription("React with the emoji corresponding to whichever name you like. "
                +   "You can vote for multiple names. The names with the most votes will be added to 𝓪𝓻𝓬𝓪𝓭𝓮. \n\n"
                +   "**Wavy members can continue giving suggestions and the list will be updated**\n\n"
                +   "**NOTE** These names are not final, they can be edited to fit the vaporwave theme once voted on")
    .setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: '微 𝕨𝕖𝕚 𝕓𝕚 笔', value: '🔥'},
        { name: 'ꜱʜᴀᴛᴛᴇʀᴇᴅ ᴅɪꜱᴋ', value: '☕'},
        { name: '日本語プレス 1', value: '🎇'},
        { name: 'joystation', value: '🙏'},
        { name: 'deluxe edition', value: '🚬'},
        { name: 'Neon Public', value: '🚀'},
        { name: 'Dialup Dreams', value: '😍'},
        { name: 'Gucci Gang', value: '🚷'},
        { name: 'Obunga Boys', value: '👨🏿'},
        { name: "Lion's Libido", value: '🦁'}
    )

    m.react('🔥')
    m.react('☕')
    m.react('🎇')
    m.react('🙏')
    m.react('🚬')
    m.react('🚀')
    m.react('😍')
    m.react('🚷')
    m.react('👨🏿')
    m.react('🦁')
    m.edit(e)
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

