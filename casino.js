const Discord = require('discord.js');
const database = require('./firebaseSDK');

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
    if (emoji == '🌓') {
        let playerArray = await multiplayerRegister(client, channel, user);
        if (playerArray[0] != null) {
            await playBlackAndWhite(channel, user, playerArray[0], playerArray[1])
        }
    }

    awaitCasinoReaction(client, message, channel, filter)
}

async function playBlackAndWhite(channel, player1, player2, starting_bet) {
    let round = 1;
    let alternate = false
    let pot = starting_bet * 2
    let lowest_wallet = [];
    let all_in = false;

    let wallet1 = await database.getCurrency(player1.id)
    let wallet2 = await database.getCurrency(player2.id)

 
    const embed = await new Discord.MessageEmbed()
    .setTitle("Black and White")
    .setDescription("Choose Black or White, and raise for Gray. \nMake your selection by reacting to the emojis.\n\n**Player 2 has to click ✅ to start the game**")
    .setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: player1.username + "  " + wallet1 + " <:HentaiCoin:814968693981184030>    vs  " + player2.username + "  " + wallet2 + " <:HentaiCoin:814968693981184030>", value: '\u200B'},
        { name: "Black:  <:Black:825059935662243882>", value: '\u200B', inline: true },
        { name: "White:  <:White:825059935951126548>", value: '\u200B', inline: true },
        { name: "Pot:  " + pot, value: '\u200B', inline: true }
    )

    let lowest = { player: "", emoji: "", wallet: 0}
    let highest = { player: "", emoji: "", wallet: 0}

    let raise;
    let game = await channel.send(embed);
    game.react('✅')
    game.react('❌')
        

    let filterConfirm = (reaction, user) => ((reaction.emoji.name == '✅' && user.id == player2.id) ||
                                            (reaction.emoji.name == '❌' && (user.id == player1.id || user.id == player2.id)))

    let collectedConfirm = await game.awaitReactions(filterConfirm, { max: 1, time: 30000, errors: ['time']}).catch(err => {
        console.log("Player didnt show up")
        return null
    })
    if (collectedConfirm == null) {
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(7000);

        game.delete()
        return;
    }
    let emojiConfirm = collectedConfirm.first().emoji.name


    if (emojiConfirm == '❌') {
        let embed2 = await new Discord.MessageEmbed()
        .setTitle("Black and White")
        .setDescription("Choose Black or White, and raise for Gray. \nMake your selection by reacting to the emojis.\n")
        .setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: "GAME EXITING", value: '\u200B'}
        )
        game.edit(embed2)
        game.reactions.cache.find(r => r.emoji.name == '✅').remove()
        game.reactions.cache.find(r => r.emoji.name == '❌').remove()
        
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(7000);

        game.delete()
        return;
    }
    game.reactions.cache.find(r => r.emoji.name == '✅').remove()
    game.reactions.cache.find(r => r.emoji.name == '❌').remove()

    if (wallet1 > wallet2) {
        embed.addField(player2.username + " has less coins.\nMake your black or white selection first.", '\u200B')
        lowest.player = player2;
        lowest.wallet = wallet2
        highest.wallet = wallet1
        lowest_wallet[0] = player2
        lowest_wallet[1] = wallet2
        highest.player = player1;
    } else {
        embed.addField(player1.username + " has less coins.\nMake your black or white selection first.", "\u200B")
        lowest.player = player1
        lowest.wallet = wallet1
        highest.wallet = wallet2
        lowest_wallet[0] = player1
        lowest_wallet[1] = wallet1
        highest.player = player2
    }

    game.react('<:Black:825059935662243882>')
    game.react('<:White:825059935951126548>')

    do {
        //Check if someone starts with an all in
        if (lowest_wallet[1] < pot / 2) {
            pot = lowest_wallet[1] * 2
            all_in = true;

            embed.addField(lowest_wallet[0].username + " HAS ALL INNED", "The pot total is now **" + pot + "** <:HentaiCoin:814968693981184030>")
        }

        raise = false;
        game.edit(embed)
        
        let filter = (reaction, user) => ((reaction.emoji.id == '825059935662243882' || reaction.emoji.id == '825059935951126548')
                                     && user.id == lowest.player.id) || (reaction.emoji.name == '❌' && (user.id == player1.id || user.id == player2.id))

        
        let collected = await game.awaitReactions(filter, { max: 1, time: 30000, errors: ['time']}).catch(err => {
            console.log("Player didnt show up")
            return null
        })
        if (collected == null) break;


        let emoji = collected.first().emoji.name

        //Remove the reaction
        game.reactions.cache.find(r => r.emoji.name == emoji).users.remove(lowest.player.id)

        // Setting lowest and highest player by wallet
        lowest.emoji = emoji
        if (emoji == 'Black')   highest.emoji = "White"
        else                    highest.emoji = "Black"


        embed.addField('\u200B', "**" + lowest.player.username + "** has chosen **" + lowest.emoji + "**\n**" + highest.player.username + "** has chosen **" + highest.emoji + "** by default")

        embed.addFields(
            { name: "\u200B", value: "⌛ Generating a random color"},
            { name: '\u200B', value: '\u200B'}
        )

        game.edit(embed)

        // 1 = Black, 2 = White, 3 = Gray
        let color;
        if (all_in || round == 3) color = await weightedRandom({1: 0.5, 2: 0.5, 3: 0})
        else if (round == 1)      color = await weightedRandom({1: 0.33, 2: 0.33, 3: 0.33})
        else if (round == 2)      color = await weightedRandom({1: 0.45, 2: 0.45, 3: 0.10})

        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(5000);

        if (color == 1) {
            embed.addField("\u200B", "The dealer has chosen Black!")

            if (lowest.emoji == "Black")
                winnerMessage(embed, lowest, highest, pot)
            else
                winnerMessage(embed, highest, lowest, pot)

            game.edit(embed)
            break;

        } else if (color == 2) {
            embed.addField("\u200B", "The dealer has chosen White!")

            if (lowest.emoji == "White")
                winnerMessage(embed, lowest, highest, pot)
            else
                winnerMessage(embed, highest, lowest, pot)

            game.edit(embed)
            break;

        } else {
            pot = pot * 2
            embed.addFields(
                { name: "\The dealer has chosen Gray!", value: "The pot has been doubled"},
                { name: 'Pot:  ' + pot, value: '\u200B'}
            )
            game.edit(embed)
            alternate = !alternate
            raise = true;
            let buffer = lowest
            lowest = highest;
            highest = buffer;
        }

        embed.addField(lowest.player.username + " make your selection", '\u200B')
        round++;

    } while (raise)

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(7000);

    game.delete()
}

async function winnerMessage(embed, winner, loser, pot) {
    embed.addFields(
        { name: "Congratulations! " + winner.player.username + " has won the game", value: "\u200B"},
        { name: winner.player.username + " has " + (winner.wallet + (pot/2)) + " <:HentaiCoin:814968693981184030>", value: '\u200B' },
        { name: loser.player.username + " has " + (loser.wallet - (pot/2)) + " <:HentaiCoin:814968693981184030>", value: '\u200B' },
    )
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
        let errMSG = await channel.send("Please enter a valid player1 :unamused:")
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(3000);
        
        channel.messages.fetch(collected.first().id).then(m => m.delete())
        multiplayer.delete()
        errMSG.delete()

        toreturn[0] = null
        return toreturn;
    }

    let player2 = await client.users.fetch(player2ID[0]).catch(async err => {
        let errMSG = await channel.send("Please enter a valid player1 :unamused:")
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

    sendConfirmation(player2, player1)
    
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

async function sendConfirmation(user, source) {
    let embed = await new Discord.MessageEmbed()
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Casino Confirmation")
    .setAuthor(source.username)
    .setDescription(source.username + " has started a **Black and White** game! \n\nCheck the 【 𝓦 𝓪 𝓿 𝔂 】 casino to play. \nThe game will automatically quit in 30 seconds unless you click ✅.")
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
        { name: "Black and White: 🌓", value: '```yaml\nOnline, no Penalty\n```' },
        { name: "Blackjack: ♦", value: '```diff\n-Offline\n```'},
        { name: "Poker: 🃏", value: '```diff\n-Offline\n```'}
    )

    return embed
}

function weightedRandom(prob) {
    let i, sum=0, r=Math.random();
    for (i in prob) {
      sum += prob[i];
      if (r <= sum) return i;
    }
}

module.exports = {
    updateCasino : updateCasino,
    awaitCasinoReaction : awaitCasinoReaction
}