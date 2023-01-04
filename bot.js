const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const market = require('./market')
const casino = require('./casino')
const leaderboard = require('./leaderboard')
const royalty = require('./royalty')
const royaltyCMD = require('./commands/royalty')
const cron = require('node-cron');
const database = require('./firebaseSDK');
const vote = require('./voting')
const edit = require('./commands/edit')
const guide = require('./commands/guide')
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

    client.user.setActivity("$guide", { type: ActivityType.Listening })

    // Wavy Guild
    const wavy = await client.guilds.resolve('687839393444397105')

    let all = await database.getAllWallets()

    let allUsers = [...all.values()]

    await allUsers.forEach(async user => {
        let member = await wavy.members.fetch("" + user.userID, {force: true}).catch(err => {
            console.log(err)
            console.log(user.name + "    " + user.userID)
            return false
        })
        //await database.walletStatus(user.userID)
    })

    // BUG: STRANGE BUG WITH USERS WHO ARE OR ARE NOT IN THE SERVER (FETCH)

    // Update markets
    //let mkt_channel = await client.channels.fetch(process.env.MARKET_CHANNEL)
    let mkt_channel = await client.channels.fetch('820051777650556990')
    let mkt_logs = await client.channels.fetch('1054648843851010068')
    marketUpdate(mkt_channel, mkt_logs, wavy)

    //Update casinos
    //let csn_channel = await client.channels.fetch(process.env.MARKET_CHANNEL)
    let csn_channel = await client.channels.fetch('824869877306621982')
    let csn_channel2 = await client.channels.fetch('825492808013316176')
    casinoUpdate(csn_channel, csn_channel2)

    // Update leaderboards
    //let ldb_channel = await client.channels.fetch(process.env.LEADERBOARD_CHANNEL)
    let ldb_channel = await client.channels.fetch('824376092257157120')
    leaderboard.updateLeaderboards(wavy, ldb_channel)

    currRoyalty = []
    await wavy.roles.cache.get('813024016776167485').members.map(m => {
        if (m.user.id != '813021543998554122' && m.user.id != '812904867462643713')
            currRoyalty.push(m.user.id)
    })
    royalty.updateRoyalty(wavy.members, wavy.roles, currRoyalty)

    vote.votingSystemPP(client)
});

let prefix = '$'

client.on('guildMemberAdd', member => {
    console.log('User ' + member.user.username + ' has joined the server!');
    let role = member.guild.roles.cache.find(role => role.id == "812926342249185320")
    member.roles.add(role);
});

client.on('guildMemberRemove', async member => {
    console.log("User: " + member.user.username + ' has left the server!')

    let status = await database.walletStatus(member.user.id)
    if (status === true)
        return
        //STUB: SEND RECEIPT 
})

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.trim().split(/ +/g);
    const cmd = args[0].slice(prefix.length).toLowerCase();
  
    if (cmd == 'guide') {
        guide.guideCommand(message.channel)
    } else if (cmd == 'edit') {
        edit.editCommand(client, message)
    } else if (cmd == 'royalty') {
        royaltyCMD.royaltyCommand(client, message.channel)
    } else if (cmd == 'test') {
        checkExpirations()
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

async function checkExpirations() {
    console.log("Checking Restrictions")

    let nicknames = await database.getRestrictedNicknames();
    let servername = await database.getRestrictedServerName();
    let servericon = await database.getRestrictedServerIcon();

    const wavy = await client.guilds.resolve('687839393444397105')

    console.log("Database Call Complete")

    let now = new Date()
    let changed = nicknames
    for (const [key, value] of Object.entries(nicknames)) {
        for (let i = value.length - 1; i >= 0; i--) {
            let nn = value[i]
            if (nn.date.toDate() < now.setDate(now.getDate())) {
                console.log("Changing Nickname: " + nn.newNickname + " to " + nn.oldNickname)

                let target = await wavy.members.fetch(nn.id, { force: true }).catch(err => console.log(err))

                target.setNickname(nicknames[key][i].oldNickname)

                await market.sendUnrestrictMessage(nn, target);

                nicknames[key].splice(i, 1)

                if (nicknames[key].length < 1)
                    delete nicknames[key]
            }
        }
    }
    if (changed != nicknames)
        await database.updateRestrictedNicknames(nicknames)

    console.log("Inspecting Server Name")
    if (Object.keys(servername).length != 0 && ((Object.values(servername)[0]).date).toDate() < now.setDate(now.getDate())) {

        wavy.setName((Object.values(servername)[0]).oldName)

        console.log("Server name has been changed back to " + (Object.values(servername)[0]).oldName)

        delete servername[Object.keys(servername)[0]]

        await database.updateRestrictedServerName(servername)
    }

    console.log("Inspecting Server Icon")
    if (Object.keys(servericon).length != 0 && ((Object.values(servericon)[0]).date).toDate() < now.setDate(now.getDate())) {

        wavy.setIcon((Object.values(servericon)[0]).oldIcon)

        console.log("Server icon has been changed back")

        delete servericon[Object.keys(servericon)[0]]
        await database.updateRestrictedServerIcon(servericon)
    }
}

// Start of every day, see if anyone's restrictions are released
cron.schedule('1 0 * * *', async () => {
    checkExpirations()
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

async function editCommand(msg) {
    const wavy = await client.guilds.resolve('687839393444397105')

    let replyChannel = await client.channels.fetch(msg.channel.id)
    replyChannel.send({ content: "Check your DMs <@" + msg.author.id + ">\n" + 
                                "Your editable <#820051777650556990> features were sent by me" })

    let embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】 $edit command')
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
    .addFields({ name: "Loading...", value: "\u200B" })

    let initialMSG = await msg.author.send({ embeds: [embed] })

    embed.spliceFields(0, 1)

    let subscriptions = await database.getAllSubscriptions(msg.author.id)
    let rolePurchased
    //console.log(subscriptions)
    if (subscriptions.size == 0) {
        embed.addFields(
            { name: "Seems like you don't have any editable features from the market\nPurchase something and try again" , value: "\u200B" }
        )
    } else {
        embed.addFields(
            { name: "Your editable market features", value: "\u200B" },
            { name: "React with the corresponding emoji to edit one of your features", value: "\u200B" }
        )
        await subscriptions.forEach((value, key) => {
            if (key >= 1 && key <= 3) {
                rolePurchased = key
                embed.addFields({ name: "Editable Role: 👑",
                                  value: "Tier: **" + value.tier + "**\nName: **" + value.name + "**\nColor: " + value.color })
                initialMSG.react("👑")
            } else if (key == 4) {
                embed.addFields({ name: '\u200B', value: "**Editable Badges: ** <:wavyheart:893239268309344266>" })
                value.forEach(badge => {
                    embed.addFields({ name: badge.name, value: "Color: " + badge.color, inline: true})
                })
                initialMSG.react("<:wavyheart:893239268309344266>")
            } else if (key == 5) {
                embed.addFields({ name: '\u200B', value: "**Editable Nicknames: ** <:groovy:1044251839715102790>" })
                value.forEach(nn => {
                    embed.addFields({ name: nn.newNickname, value: "Old Name: " + nn.oldNickname + "\nExpiration: " + nn.date.toDate().toLocaleDateString() + "\nUsername: " + nn.username, inline: true })
                })
                initialMSG.react("<:groovy:1044251839715102790>")
            } else if (key == 6) {
                embed.addFields({ name: '\u200B', value: "**Server icon is editable!** <:aesthetic:1044251723251855441>" })
                initialMSG.react("<:aesthetic:1044251723251855441>")
            } else if (key == 7) {
                embed.addFields({ name: "\u200B\nServer Name: " + value[msg.author.id].newName + " 💎", value: "Expiration: " + value[msg.author.id].date.toDate().toLocaleDateString()})
                initialMSG.react("💎")
            }
        })
    }

    initialMSG.edit({ embeds: [embed] })

    let filter = (reaction, user) => (reaction.emoji.name == '👑' ||
                                        reaction.emoji.name == 'wavyheart' ||
                                        reaction.emoji.name == 'groovy' ||
                                        reaction.emoji.name == 'aesthetic' ||
                                        reaction.emoji.name == '💎') &&
                                        user.id != '813021543998554122'
    
    let reaction = await initialMSG.awaitReactions({ filter, max: 1, time: 30000 })
    .catch(err => console.log(err))

    let reactionName = reaction.first().emoji.name

    let embed2 = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】 $edit command')
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
    
    if (reactionName == '👑') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit a **custom role**" })

        let role = subscriptions.get(rolePurchased)
        let roleOBJ = await wavy.roles.fetch(role.id).catch(err => console.log(err))

        embed2.addFields(
            { name: "Your editable role:",
              value: "Tier: **" + role.tier + "**\nName: **" + role.name + "**\nColor: " + role.color },
            { name: "\u200B", value: "Do you wish to edit the **name** (<:shek:968122117453393930>) or the **color** (<:srsly:1002091997970042920>)?" }
        )

        let featureMSG = await msg.author.send({ embeds: [embed2] })
        featureMSG.react("<:shek:968122117453393930>")
        featureMSG.react("<:srsly:1002091997970042920>")

        filter = (reaction, user) => (reaction.emoji.name == 'shek' || reaction.emoji.name == 'srsly') &&
                                      user.id != '813021543998554122'

        reaction = await featureMSG.awaitReactions({ filter, max: 1, time: 30000 })
        .catch(err => console.log(err))

        reactionName = reaction.first().emoji.name
        filter = (m) => m.author.id == msg.author.id

        let optionMSG

        if (reactionName == 'shek') {
            optionMSG = await msg.author.send({ content: "Current role name is: " + role.name + "\nWhat do you want to change the name to?"})
            
            let newName = await market.awaitResponse(optionMSG.channel, filter, 30000, true)
            if (newName == false) {
                await msg.author.send({ content: "Request timed out. Try sending a new request in market next time "})
                return false
            }

            role.name = newName

            roleOBJ.edit({ name: role.name }).then(res => console.log("Edited role name to " + res.name))

            await database.updateRoles(msg.author.id, role, role.tier)

            await msg.author.send({ content: "Successfully edited the name of your custom role (tier " + role.tier + ") to " + role.name})



        } else if (reactionName == 'srsly') {
            optionMSG = await msg.author.send({ content: "Current role hexcode color: " + role.color + "\nWhat do you want to change the color to? Enter a valid hexcode." +
                                                            "\n\n*Use this online color picker to get your desired hex code:* <https://htmlcolorcodes.com/color-picker/>" })
        
            let newColor = await market.awaitResponse(optionMSG.channel, filter, 90000, false)
            newColor = await market.validHexColor(optionMSG.channel, newColor)
            if (newColor == false) {
                await msg.author.send({ content: "Request timed out. Try sending a new request in market next time "})
                return false
            }

            role.color = newColor

            roleOBJ.edit({ color: newColor }).then(res => console.log("Edited role color to " + res.color))

            await database.updateRoles(msg.author.id, role, role.tier)

            await msg.author.send({ content: "Successfully edited the color of your custom role (tier " + role.tier + ") to " + role.color})
        }

    } else if (reactionName == 'wavyheart') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit a **custom badge**" })
    } else if (reactionName == 'groovy') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit a **restricted nickname**" })
    } else if (reactionName == 'aesthetic') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit the **server icon**" })
    } else if (reactionName == '💎') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit the **server name**" })
    }

    // Resolve Request
    // Update database and appropriate server features
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