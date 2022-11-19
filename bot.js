const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const market = require('./market')
const casino = require('./casino')
const leaderboard = require('./leaderboard')
const cron = require('node-cron');
const database = require('./firebaseSDK');
const vote = require('./voting')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ],
});

client.login(process.env.BOT_TOKEN_KW)

client.on('ready', async () => {
    console.log("help pls oh god")

    //console.log(await database.getAllSubscriptions('237018129664966656'))

    client.user.setActivity("$guide", { type: ActivityType.Listening })

    // Wavy Guild
    const wavy = await client.guilds.resolve('687839393444397105')

    // Update markets
    //let mkt_channel = await client.channels.fetch(process.env.MARKET_CHANNEL)
    let mkt_channel = await client.channels.fetch('820051777650556990')
    let mkt_logs = await client.channels.fetch('1038822879787229214')
    marketUpdate(mkt_channel, mkt_logs, wavy)

    //Update casinos
    //let csn_channel = await client.channels.fetch(process.env.MARKET_CHANNEL)
    let csn_channel = await client.channels.fetch('824869877306621982')
    let csn_channel2 = await client.channels.fetch('825492808013316176')
    casinoUpdate(csn_channel, csn_channel2)

    // Update leaderboards
    //let ldb_channel = await client.channels.fetch(process.env.LEADERBOARD_CHANNEL)
    let ldb_channel = await client.channels.fetch('824376092257157120')
    leaderboardUpdate(ldb_channel);

    vote.votingSystemPP(client)
});

let prefix = '$'

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.trim().split(/ +/g);
    const cmd = args[0].slice(prefix.length).toLowerCase();
  
    if (cmd == 'guide') {
        guideCommand(message)
    } else if (cmd == 'edit') {
        editCommand(message)
    } else if (cmd == 'test') {
        test()
    }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if(newMember.nickname && oldMember.nickname !== newMember.nickname) {

        let restricted = await database.getRestrictedNicknames();
        if (restricted.hasOwnProperty(newMember.id) && oldMember.nickname == restricted[oldMember.id][1])
            return
        else if (restricted.hasOwnProperty(newMember.id)) {
            console.log(oldMember.nickname + " (" + oldMember.id + ") has changed their nickname to " + newMember.nickname)
            newMember.setNickname(restricted[newMember.id][0])
        }
    }
});

async function test() {
    console.log("Checking Restrictions")

    let nicknames = await database.getRestrictedNicknames();
    let servername = await database.getRestrictedServerName();
    let servericon = await database.getRestrictedServerIcon();

    console.log("Database Call Complete")

    let now = new Date()
    for (const [key, value] of Object.entries(nicknames)) {
        if (value.date.toDate() < now.setDate(now.getDate())) {
            console.log("Changing Nickname")
            const wavy = await client.guilds.resolve('687839393444397105')
            let target = await wavy.members.fetch(value.id, { force: true }).catch(err => console.log(err))

            await market.sendUnrestrictMessage(nicknames[key], target);

            delete nicknames[key]

            await database.updateRestrictedNicknames(nicknames)
        }
    }

    console.log("Inspecting Server Name")
    if (Object.keys(servername).length != 0 && ((Object.values(servername)[0]).date).toDate() < now.setDate(now.getDate())) {
        const wavy = await client.guilds.resolve('687839393444397105')
        wavy.setName((Object.values(servername)[0]).oldName)

        console.log("Server name has been changed back to " + (Object.values(servername)[0]).oldName)

        delete servername[Object.keys(servername)[0]]

        await database.updateRestrictedServerName(servername)
    }

    console.log("Inspecting Server Icon")
    if (Object.keys(servericon).length != 0 && ((Object.values(servericon)[0]).date).toDate() < now.setDate(now.getDate())) {
        const wavy = await client.guilds.resolve('687839393444397105')
        wavy.setIcon((Object.values(servericon)[0]).oldIcon)

        console.log("Server icon has been changed back")

        delete servericon[Object.keys(servericon)[0]]
        await database.updateRestrictedServerIcon(servericon)
    }
}

// Start of every day, see if anyone's restrictions are released
cron.schedule('1 0 * * *', async () => {
    test()
})

// cron.schedule('00 5 * * *', () => {
//     console.log('Running cron');
//     postVideo();
// })

cron.schedule('00 1 1 * *', async () => {
    //let ldb_channel = await client.channels.fetch(process.env.LEADERBOARD_CHANNEL)
    let ldb_channel = await client.channels.fetch('824376092257157120')
    leaderboardUpdate(ldb_channel)
})

async function guideCommand(msg) {
    let replyChannel = await client.channels.fetch(msg.channel.id)

    let embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Guide")
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
    .addFields(
        { name: "Currency System", value: "<#824106380222005288>: Learn About the 𝓦 𝓪 𝓿 𝔂 currency system\n\n"},
        //{ name: '\u200B', value: '\u200B' },
        { name: "Announcements", value: "<#813132145966186567>: Stay updated on new features and raffles"},
        { name: "Raffles/Giveaways", value: "<#962308831944265768>: Spend coins for a chance at irl rewards"},
        { name: "Market", value: "<#820051777650556990>: Spend coins to buy server perks and features"},
        { name: "Casino", value: "<#825143682139029555>: Learn casino games to earn coins against others"}
    )
    .setFooter({
        text: 'Type ./$help <CommandName>./ for bot commands',
        iconURL: 'https://cdn.discordapp.com/app-icons/812904867462643713/c3713856eae103c4cad96111e26bce21.png?size=512'
    });

    return await replyChannel.send({ embeds: [embed] })
}

async function editCommand(msg) {
    console.log(msg.author.id)

    let replyChannel = await client.channels.fetch(msg.channel.id)
    replyChannel.send({ content: "Check your DMs <@" + msg.author.id + ">\n" + 
                                "Your editable <#820051777650556990> features were sent by me" })

    let embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】 $edit command')
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')


    let subscriptions = await database.getAllSubscriptions(msg.author.id)
    console.log(subscriptions)
    if (subscriptions.size == 0) {
        embed.addFields(
            { name: "Seems like you don't have any editable features from the market\nPurchase something and try again" , value: "\u200B" }
        )
    } else {
        embed.addFields({ name: "Your editable market features", value: "\u200B" })

        subscriptions.forEach((key, value) => {

        })
    }

    msg.author.send({ embeds: [embed] })
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
            let msg = await channel.send({ embeds: [ldbEmbed2] })
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
            let msg = await channel.send({ embeds: [ldbEmbed] })
            ldbIDCurr = msg.id
        } else {
            let msg = await channel.messages.fetch(ldbIDCurr)
            msg.edit(ldbEmbed);
        }
    }
}

async function marketUpdate(channel, logs, guild) {
    let msg = await market.updateMarket(channel);

    msg.react('<:HentaiCoin:814968693981184030>')
    const filter = (reaction, user) => reaction.emoji.id == '814968693981184030' && user.id != msg.author.id

    market.awaitMarketReaction(msg, channel, logs, guild, filter)
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