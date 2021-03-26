const Discord = require('discord.js')

let csnID = '824874877261316106'

async function updateCasino(channel) {
    console.log("updating casino")

    let embed = await getEmbed();

    let exists = true;
    try {
        await channel.messages.fetch(csnID)
    } catch (error) {
        console.error(error)
        exists = false;
    } finally {
        if (!exists) {
            let msg = await channel.send(embed)
            csnID = msg.id
            return msg;
        } else {
            let msg = await channel.messages.fetch(csnID)
            msg.edit(embed);
            return msg
        }
    }
}

async function awaitCasinoReaction(client, message, channel, filter) {
    console.log("awaiting casino reaction")

    let collected = await message.awaitReactions(filter, { max: 1 })
    let user = collected.first().users.cache.last()
    message.reactions.cache.find(r => r.emoji.name == '🌓').users.remove(user)

    //Play Game
    let emoji = collected.first().emoji.name
    console.log(emoji)
    if (emoji == '🌓') {
        await playBlackAndWhite(client, channel, user)
    }

    awaitCasinoReaction(client, message, channel, filter)
}

async function playBlackAndWhite(client, channel, user) {
    let multiplayer = await channel.send("Choose player 2\nPlease mention their name to continue (@𝒬𝓊𝑒𝑒𝓃 𝓌𝒶𝓋𝓎#6197)")

    let filter = (m) => m.author.id == user.id;
    let collected = await channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time']})
    let player2ID = (collected.first().content).match(/(\d+)/)[0];
    console.log(player2ID)

    let player2 = await client.users.fetch(player2ID)
    //player2.send("Confirm")

    channel.messages.fetch(collected.first().id).then(m => m.delete())
    multiplayer.delete()

    console.log(user.username)

    const embed = await new Discord.MessageEmbed()
    .setTitle("Black and White")
    .setDescription("Choose Black or White, and raise for Gray. \nMake your selection by reacting to the emojis.")
    .setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: user.username + "  vs  " + player2.username, value: '\u200B'}
    )

    let game = await channel.send(embed)

    // 1 = Black, 2 = White, 3 = Gray
    let color = await Math.floor(Math.random() * 3) + 1
    console.log(color)

    if (color == 1) {
        
    } else if (color == 2) {

    } else {

    }
}

async function getEmbed() {
    const embed = await new Discord.MessageEmbed()
	.setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Casino")
	.setDescription("Welcome to the casino.\n"
                  + "You'll lose your life savings, or earn enough to retire for life\n"
                  + "Click the emoji of the game you'd like to play")
	.setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')
	.addFields(
        { name: "Black and White: 🌓", value: '```diff\n-Offline\n```' },
        { name: "Blackjack: ♦", value: '```diff\n-Offline\n```'},
        { name: "Poker: 🃏", value: '```diff\n-Offline\n```'}
    )

    return embed
}

module.exports = {
    updateCasino : updateCasino,
    awaitCasinoReaction : awaitCasinoReaction
}