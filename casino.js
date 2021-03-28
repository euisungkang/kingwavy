const Discord = require('discord.js');
const BAW = require('./blackandwhite')
const BJ = require('./blackjack')

async function updateCasino(channel, csnID) {
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
    let emoji = collected.first().emoji.name
    message.reactions.cache.find(r => r.emoji.name == emoji).users.remove(user)

    //Play Game
    if (emoji == '🌓') {
        let playerArray = await multiplayerRegister(client, channel, user);
        if (playerArray[0] != null) {
            await BAW.playBlackAndWhite(client, channel, user, playerArray[0], playerArray[1])
        }
    }
    // else if (emoji == '♦') {
    //     let playerArray = await multiplayerBlackjackRegister(client, channel, user, null);
    //     //console.log(playerArray)
        
    //     BJ.playBlackjack(channel, playerArray);
    // }

    awaitCasinoReaction(client, message, channel, filter)
}

async function multiplayerRegister(client, channel, player1) {
    let toreturn = []

    let multiplayer = await channel.send("<@" + player1.id + "> Choose player 2\nPlease mention their name (@𝒬𝓊𝑒𝑒𝓃 𝓌𝒶𝓋𝓎)")

    let filter = (m) => m.author.id == player1.id;

    // If player1 doesn't respond to player1 prompt
    let collected = await channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time']}).catch(async err => {
        multiplayer.delete()
        return null;
    })
    if (collected == null) {
        toreturn[0] = null
        return toreturn
    }

    let player2ID = (collected.first().content).match(/(\d+)/)

    if (player2ID == null) {
        let errMSG = await channel.send("Please enter a valid player :unamused:")
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(3000);
        
        channel.messages.fetch(collected.first().id).then(m => m.delete())
        multiplayer.delete()
        errMSG.delete()

        toreturn[0] = null
        return toreturn;
    }

    let player2 = await client.users.fetch(player2ID[0]).catch(async err => {
        let errMSG = await channel.send("Please enter a valid player :unamused:")
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(3000);

        channel.messages.fetch(collected.first().id).then(m => m.delete())
        multiplayer.delete()
        errMSG.delete()
        
        return null;
    })
    if (player2 == null) {
        toreturn[0] = null
        return toreturn
    }

    sendConfirmation(player2, player1, "Black and White")
    
    let starting_bet = await channel.send("<@" + player1.id + "> Now choose a starting bet\nPlease enter a number (max 30)")

    let filter2 = (m) => m.author.id == player1.id;
    let collected2 = await channel.awaitMessages(filter2, { max: 1, time: 30000, errors: ['time']}).catch(async err => {
        channel.messages.fetch(collected.first().id).then(m => m.delete())
        multiplayer.delete()
        starting_bet.delete()
        
        return null
    })
    if (collected2 == null) {
        toreturn[0] = null
        return toreturn
    }

    let stb = collected2.first().content;

    if (isNaN(stb) || stb < 1 || stb > 30) {
        let errMSG = await channel.send("Please enter a valid number <:PikaO:804086658000748584>")
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(3000);

        channel.messages.fetch(collected.first().id).then(m => m.delete())
        channel.messages.fetch(collected2.first().id).then(m => m.delete())
        multiplayer.delete()
        starting_bet.delete()
        errMSG.delete()

        toreturn[0] = null
        return toreturn;
    }



    channel.messages.fetch(collected.first().id).then(m => m.delete())
    channel.messages.fetch(collected2.first().id).then(m => m.delete())
    multiplayer.delete()
    starting_bet.delete()

    toreturn.push(player2)
    toreturn.push(stb)

    return toreturn;
}

async function multiplayerBlackjackRegister(client, channel, player1) {
    let toreturn = []
    toreturn[0] = player1

    let multiplayer = await channel.send("<@" + player1.id + "> Choose up to 4 additional players, minimum of 1 additional player.\nPlease mention their names (@𝒬𝓊𝑒𝑒𝓃 𝓌𝒶𝓋𝓎 @𝒦𝒾𝓃𝑔 𝓌𝒶𝓋𝓎 @𝔹𝕒𝕖𝕘𝕚 @102)")

    let filter = (m) => m.author.id == player1.id;

    // If player1 doesn't respond to player1 prompt
    let collected = await channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time']}).catch(async err => {
        console.log(err)
        multiplayer.delete()
        return null;
    })
    if (collected == null) {
        toreturn[0] = null
        return toreturn
    }

    let playerArray = (collected.first().content).split(" ");

    //Check if users are valid ID numbers
    for (var i = 0; i < playerArray.length; i++) {
        playerArray[i] = await (playerArray[i]).match(/(\d+)/)[0]

        if (playerArray[i] == null) {
            let errMSG = await channel.send("Player " + (i + 2) + "'s name is invalid <:PepeYikes:804088050460262470>")
            const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
            await wait(3000);
            
            channel.messages.fetch(collected.first().id).then(m => m.delete())
            multiplayer.delete()
            errMSG.delete()
    
            toreturn[0] = null
            return toreturn;
        }
    }

    //Check if users exist in server
    for (var i = 0; i < playerArray.length; i++) {
        playerArray[i] = await client.users.fetch(playerArray[i]).catch(async err => {
            let errMSG = await channel.send("Player " + (i + 2) + " is invalid <:PepeYikes:804088050460262470>")
            const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
            await wait(3000);
    
            channel.messages.fetch(collected.first().id).then(m => m.delete())
            multiplayer.delete()
            errMSG.delete()
            
            return null;
        })
        if (playerArray[i] == null) {
            toreturn[0] = null
            return toreturn
        }
    }

    let msgArray = []

    for (var i = 0; i < playerArray.length; i++) {
        let starting_bet = await channel.send("<@" + playerArray[i].id + "> choose a starting bet\nPlease enter a number (max 30)")
        msgArray.push(starting_bet)

        let filter2 = (m) => m.author.id == playerArray[i].id;
        let collected2 = await channel.awaitMessages(filter2, { max: 1, time: 15000, errors: ['time']}).catch(async err => {
            channel.messages.fetch(collected.first().id).then(m => m.delete())
            multiplayer.delete()
            channel.bulkDelete(msgArray)
        })
        console.log(collected2)
        msgArray.push(collected2)

        toreturn[i + 1] = playerArray[i]
        //await sendConfirmation(playerArray[i], toreturn[0], "Blackjack")
    }

    // let stb = collected2.first().content;

    // if (isNaN(stb) || stb < 1 || stb > 30) {
    //     let errMSG = await channel.send("Please enter a valid number <:PikaO:804086658000748584>")
    //     const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    //     await wait(3000);

    //     channel.messages.fetch(collected.first().id).then(m => m.delete())
    //     channel.messages.fetch(collected2.first().id).then(m => m.delete())
    //     multiplayer.delete()
    //     starting_bet.delete()
    //     errMSG.delete()

    //     toreturn[0] = null
    //     return toreturn;
    // }

    channel.messages.fetch(collected.first().id).then(m => m.delete())
    multiplayer.delete()

    return toreturn;
}

async function sendConfirmation(user, source, game) {
    let embed = await new Discord.MessageEmbed()
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Casino Confirmation")
    .setAuthor(source.username)
    .setDescription(source.username + " has started a **" + game + "** game! \n\nCheck the 【 𝓦 𝓪 𝓿 𝔂 】 casino to play. \nThe game will automatically quit in 30 seconds unless you click ✅.")
    .setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')

    user.send(embed);
}

async function getEmbed() {
    const embed = await new Discord.MessageEmbed()
	.setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Casino")
	.setDescription("Welcome to the casino.\n"
                  + "You'll lose your life savings, or earn enough to retire for life\n"
                  + "Click the emoji of the game you'd like to play")
	.setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')
	.addFields(
        { name: "Black and White: 🌓", value: '```yaml\nOnline, with penalty\n```' },
        { name: "Blackjack: ♦", value: '```diff\n-Offline\n```'},
        { name: "Poker: 🃏", value: '```diff\n-Offline\n```'}
    )

    return embed
}

module.exports = {
    updateCasino : updateCasino,
    awaitCasinoReaction : awaitCasinoReaction
}