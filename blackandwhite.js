const { EmbedBuilder } = require('discord.js')
const database = require('./firebaseSDK')

async function playBlackAndWhite(channel, player1, player2, starting_bet) {
    let round = 1;
    let alternate = false
    let pot = starting_bet * 2
    let lowest_wallet = [];
    let all_in = false;

    let wallet1 = await database.getCurrency(player1.id)
    let wallet2 = await database.getCurrency(player2.id)

    if (wallet1 == 0 || wallet2 == 0) return;
 
    let embed = new EmbedBuilder()
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
    let game = await channel.send({ embeds: [embed] });
    await game.react('✅')
    await game.react('❌')
        

    let filterConfirm = (reaction, user) => ((reaction.emoji.name == '✅' && user.id == player2.id) ||
                                            (reaction.emoji.name == '❌' && (user.id == player1.id || user.id == player2.id)))

    let collectedConfirm = await game.awaitReactions({ filterConfirm, max: 1, time: 30000, errors: ['time'] })
    .catch(err => {
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
        let embed2 = new EmbedBuilder()
        .setTitle("Black and White")
        .setDescription("Choose Black or White, and raise for Gray. \nMake your selection by reacting to the emojis.\n")
        .setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: "GAME EXITING", value: '\u200B'}
        )
        game.edit({ embeds: [embed2] })
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
        embed.addFields({ name: player2.username + " has less coins.\nMake your black or white selection first.", value: '\u200B' })
        lowest.player = player2;
        lowest.wallet = wallet2
        highest.wallet = wallet1
        lowest_wallet[0] = player2
        lowest_wallet[1] = wallet2
        highest.player = player1;
    } else {
        embed.addFields({ name: player1.username + " has less coins.\nMake your black or white selection first.", value: "\u200B" })
        lowest.player = player1
        lowest.wallet = wallet1
        highest.wallet = wallet2
        lowest_wallet[0] = player1
        lowest_wallet[1] = wallet1
        highest.player = player2
    }

    await game.react('<:Black:825059935662243882>')
    await game.react('<:White:825059935951126548>')

    do {
        if (await bugCheck(wallet1, wallet2, player1, player2))        break;
        //Check if someone starts with an all in
        if (lowest_wallet[1] <= pot / 2) {
            pot = lowest_wallet[1] * 2
            all_in = true;

            embed.addFields({ name: lowest_wallet[0].username + " HAS ALL INNED", value: "The pot total is now **" + pot + "** <:HentaiCoin:814968693981184030>" })
        }

        raise = false;
        game.edit({ embeds: [embed] })

        let filter = (reaction, user) => ((reaction.emoji.id == '825059935662243882' || reaction.emoji.id == '825059935951126548')
                                     && user.id == lowest.player.id) || (reaction.emoji.name == '❌' && (user.id == player1.id || user.id == player2.id))

        
        let collected = await game.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] })
        .catch(err => {
            console.log("Player didnt show up")
            return null
        })
        if (collected == null) break;

        if (await bugCheck(wallet1, wallet2, player1, player2))        break;   

        let emoji = collected.first().emoji.name

        //Remove the reaction
        game.reactions.cache.find(r => r.emoji.name == emoji).users.remove(lowest.player.id)

        // Setting lowest and highest player by wallet
        lowest.emoji = emoji
        if (emoji == 'Black')   highest.emoji = "White"
        else                    highest.emoji = "Black"

        //embed.addFields('\u200B', "**" + lowest.player.username + "** has chosen **" + lowest.emoji + "**\n**" + highest.player.username + "** has chosen **" + highest.emoji + "** by default")

        embed.addFields(
            { name: '\u200B', value: "**" + lowest.player.username + "** has chosen **" + lowest.emoji + "**\n**" + highest.player.username + "** has chosen **" + highest.emoji + "** by default"},
            { name: "\u200B", value: "⌛ Generating a random color"},
            { name: '\u200B', value: '\u200B'}
        )

        game.edit({ embeds: [embed] })

        // 1 = Black, 2 = White, 3 = Gray
        let color;
        if (all_in || round == 3) color = await weightedRandom({1: 0.5, 2: 0.5, 3: 0})
        else if (round == 1)      color = await weightedRandom({1: 0.33, 2: 0.33, 3: 0.34})
        else if (round == 2)      color = await weightedRandom({1: 0.45, 2: 0.45, 3: 0.10})

        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(5000);

        if (color == 1) {
            embed.addFields({ name: "\u200B", value: "The dealer has chosen Black!" })

            if (lowest.emoji == "Black")
                winnerMessage(embed, lowest, highest, pot)
            else
                winnerMessage(embed, highest, lowest, pot)

            game.edit({ embeds: [embed] })
            break;

        } else if (color == 2) {
            embed.addFields({ name: "\u200B", value: "The dealer has chosen White!" })

            if (lowest.emoji == "White")
                winnerMessage(embed, lowest, highest, pot)
            else
                winnerMessage(embed, highest, lowest, pot)

            game.edit({ embeds: [embed] })
            break;

        } else {
            pot = pot * 2
            embed.addFields(
                { name: "\The dealer has chosen Gray!", value: "The pot has been doubled"},
                { name: 'Pot:  ' + pot, value: '\u200B'}
            )
            game.edit({ embeds: [embed] })
            alternate = !alternate
            raise = true;
            let buffer = lowest
            lowest = highest;
            highest = buffer;
        }

        embed.addFields({ name: lowest.player.username + " make your selection", value: '\u200B' })
        round++;

    } while (raise)

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(7000);

    game.delete()
}

async function bugCheck(wallet1, wallet2, player1, player2) {
    console.log(player1.username + "  " + player2.username + "   bug   " + wallet1 + "          " + wallet2)
    let bugCheck1 = await database.getCurrency(player1.id)
    let bugCheck2 = await database.getCurrency(player2.id)

    return (bugCheck1 != wallet1 || bugCheck2 != wallet2)
}

async function winnerMessage(embed, winner, loser, pot) {
    embed.addFields(
        { name: "Congratulations! " + winner.player.username + " has won the game", value: "\u200B"},
        { name: winner.player.username + " has " + (winner.wallet + (pot/2)) + " <:HentaiCoin:814968693981184030>", value: '\u200B' },
        { name: loser.player.username + " has " + (loser.wallet - (pot/2)) + " <:HentaiCoin:814968693981184030>", value: '\u200B' },
    )
    await database.addCurrency(winner.player, (pot / 2))
    await database.removeCurrency(loser.player, (pot /2))
}

function weightedRandom(prob) {
    let i, sum=0, r=Math.random();
    for (i in prob) {
      sum += prob[i];
      if (r <= sum) return i;
    }
}

module.exports = {
    playBlackAndWhite : playBlackAndWhite
}