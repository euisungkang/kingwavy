const Discord = require('discord.js')
const database = require('./firebaseSDK')

async function playRPS(client, channel, player1, players, multiplayer) {
    let log = await client.channels.fetch('825839129996296232').catch(err => {console.log(err)})
    let draw = false;
    let lowest_wallet = [];
    let all_in = false;

    let finalMessages = []

    
    let player2 = players[1]
    let stb = players[0]
    let pot = players[0]
    if (multiplayer)        pot = pot * 2
    else                    pot = Math.round(pot * 1.5)

    let wallet1 = await database.getCurrency(player1.id)
    let wallet2 = await database.getCurrency(player2.id)

    let embed = await getEmbed(pot, multiplayer)
    if (multiplayer)            embed.setDescription("Choose Rock Paper, or Scissors. \nMake your selection by reacting to the emojis.\n\n**Player 2 has to click ✅ to start the game**\n\n**Pot: **" + pot)
    else                        embed.setDescription("Choose Rock Paper, or Scissors. \nMake your selection by reacting to the emojis.")

    let game = await channel.send(embed);
    finalMessages.push(game)

    // Player 2 confirms
    if (multiplayer) {

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
            embed.addFields(
                { name: '\u200B', value: '\u200B' },
                { name: "GAME EXITING", value: '\u200B'}
            )
            game.edit(embed)
            game.reactions.cache.find(r => r.emoji.name == '✅').remove()
            game.reactions.cache.find(r => r.emoji.name == '❌').remove()
            
            const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
            await wait(7000);

            game.delete()
            return;
        }
        game.reactions.cache.find(r => r.emoji.name == '✅').remove()
        game.reactions.cache.find(r => r.emoji.name == '❌').remove()
    } else {
        game.react('✊')
        game.react('✋')
        game.react('✌')
    }

    embed.addFields(
        { name:player1.username + "  " + wallet1 + " <:HentaiCoin:814968693981184030>    vs  " + player2.username + "  " + wallet2 + " <:HentaiCoin:814968693981184030>", value: '\u200B'},
        { name: "Pot:  " + pot, value: '\u200B' }
    )

    if (wallet1 > wallet2) {
        lowest_wallet[0] = player2
        lowest_wallet[1] = wallet2
    } else {
        lowest_wallet[0] = player1
        lowest_wallet[1] = wallet1
    }

    let p1; let p2; let filter; let returnArray;
    do {
        //Check for all in
        if (lowest_wallet[1] <= pot / 2) {
            pot = lowest_wallet[1] * 2
            all_in = true;

            embed.addField(lowest_wallet[0].username + " HAS ALL INNED", "The pot total is now **" + pot + "** <:HentaiCoin:814968693981184030>\n\n**The pot total won't be increased any further**")
        }

        draw = false;
        game.edit(embed)
    
        if (multiplayer)
            filter = (reaction, user) => ((reaction.emoji.name == '✊' || reaction.emoji.name == '✋' || reaction.emoji.name == '✌') &&
                                             ((user.id == player1.id) || (user.id == player2.id)))
        else
            filter = (reaction, user) => ((reaction.emoji.name == '✊' || reaction.emoji.name == '✋' || reaction.emoji.name == '✌') &&
                                             (user.id == player1.id))

        let emoji1; let emoji2; let collected; let collected2
        if (multiplayer) {
            p1 = await player1.send(embed);        p1.react('✊'); p1.react('✋');p1.react('✌')
            p2 = await player2.send(embed);        p2.react('✊'); p2.react('✋');p2.react('✌')
            finalMessages.push()
            finalMessages.push()
            
            collected = p1.awaitReactions(filter, { max: 1, time: 30000, errors: ['time']}).catch(err => {
                console.log("Player1 didnt show up")
                return null
            });
            collected2 = p2.awaitReactions(filter, { max: 1, time: 30000, errors: ['time']}).catch(err => {
                console.log("Player2 didnt show up")
                return null
            });

            let promiseArray = await Promise.all([collected, collected2]).then((values) => { return values })

            if (promiseArray[0] == null || promiseArray[1] == null) break;

            emoji1 = await promiseArray[0].first().emoji.name
            emoji2 = await promiseArray[1].first().emoji.name
            finalMessages.pop()
            finalMessages.pop()
            p1.delete()
            p2.delete()
        } else {
            collected = await game.awaitReactions(filter, { max: 1, time: 30000, errors: ['time']}).catch(err => {
                console.log("Player 1 didnt show up")
                return null
            });      if (collected == null) break;

            emoji1 = collected.first().emoji.name
            game.reactions.cache.find(r => r.emoji.name == emoji1).users.remove(player1.id)

            embed.addField("⌛ Generating a random hand", '\u200B')

            game.edit(embed)

            let dealerHand = await Math.floor(Math.random() * 3) + 1
            if (dealerHand==1)      emoji2 = '✊'
            else if (dealerHand==2) emoji2 = '✋'
            else                    emoji2='✌'
        }
        embed.addFields(
            {name:'\u200B', value:"**" + player1.username + "** has chosen **" + emoji1 + "**\n**" + player2.username + "** has chosen **" + emoji2 + "**"},
        )
        // console.log(emoji1)
        // console.log(emoji2)

        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(4000);


    //   '✊''✋''✌'
        if (emoji1 == emoji2) {
            draw = true;
            if (all_in) {
                embed.addField("Draw. Pot won't be increased due to an all in by" + lowest[0].username + "\n\n**Pot: **" + pot, '\u200B')
            } else if (multiplayer) {
                pot = pot * 2;
                embed.addField("Draw. Pot is doubled <:PogO:804089420020973568>\n\n**Pot: **" + pot, '\u200B')
            } else {
                pot = await Math.round(pot * 1.5);
                embed.addField("Draw. Pot is increased 50% <:PogO:804089420020973568>\n\n**Pot: **" + pot, '\u200B')
            }
        }
        // player1 wins
        else if ((emoji1 == '✋' && emoji2 == '✊') ||
                (emoji1 == '✌' && emoji2 == '✋') ||
                (emoji1 == '✊' && emoji2 == '✌')) {
            //embed.addField( "\u200B", "**" + player1.username + "** has chosen " + emoji1 + "  \n**" + player2.username + "** has chosen " + emoji2)
            if (multiplayer) winnerMessage(game, log, embed, player1, player2, pot / 2, multiplayer)
            else             winnerMessage(game, log, embed, player1, player2, pot - stb, multiplayer)
        }
        // player2 wins
        else if ((emoji1 == '✊' && emoji2 == '✋') ||
                (emoji1 == '✋' && emoji2 == '✌') ||
                (emoji1 == '✌' && emoji2 == '✊')) {
            //embed.addField( "\u200B", "**" + player2.username + "** has chosen " + emoji2 + "  \n**" + player1.username + "** has chosen " + emoji1)
            if (multiplayer) winnerMessage(game, log, embed, player2, player1, pot / 2, multiplayer)
            else             winnerMessage(game, log, embed, player2, player1, stb, multiplayer)
        }
    } while(draw)

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(7000);

    game.delete()
}

async function winnerMessage(msg, log, embed, winner, loser, pot, multiplayer) {
    let w = await database.getCurrency(winner.id)
    let l = await database.getCurrency(loser.id)

    embed.addFields(
        { name: winner.username + " is the winner!   " + winner.username + " earns " + pot + " <:HentaiCoin:814968693981184030>", value: '\u200B'},
        { name: "\u200B", value: winner.username + "  " + (w + pot) + " <:HentaiCoin:814968693981184030>       " + loser.username + "  " + (l - pot) + " <:HentaiCoin:814968693981184030>"})

    msg.edit(embed)
    
    if (multiplayer) {
        p1 = await winner.send(embed); 
        p2 = await loser.send(embed); 
    
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(5000);

        p1.delete()
        p2.delete()
    }
    log.send(winner.username + "  " + (w + pot) + "      " + loser.username + "  " + (l - pot) + "\nPot: " + pot)
    // Penalty
    database.addCurrency(winner, pot)
    database.removeCurrency(loser, pot)
}

async function getEmbed(pot) {
    let embed = await new Discord.MessageEmbed()
    .setTitle("Rock Paper Scissors")
    .setDescription("Choose Rock Paper, or Scissors. \nMake your selection by reacting to the emojis.\n\n**Pot: **" + pot)
    .setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')
    .addFields(//✊✋✌
        { name: "Rock:  ✊", value: '\u200B', inline: true },
        { name: "Paper:  ✋", value: '\u200B', inline: true },
        { name: "Scissors:  ✌", value: '\u200B', inline: true },
    )

    return embed
}

module.exports = {
    playRPS : playRPS
}