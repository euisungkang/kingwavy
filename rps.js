const Discord = require('discord.js')
const database = require('./firebaseSDK')

async function playRPS(channel, player1, players) {
    let draw = false;
    let player2 = player1
    let lowest_wallet = [];
    let pot = players[0]
    let multiplayer = false;
    
    if (players[1] != null) {
        multiplayer = true;
        player2 = players[1]
        pot = pot * 2
    }

    let wallet1 = await database.getCurrency(player1.id)
    let wallet2 = await database.getCurrency(player2.id)

    let embed = await new Discord.MessageEmbed()
    .setTitle("Rock Paper Scissors")
    .setDescription("Choose Rock Paper, or Scissors. \nMake your selection by reacting to the emojis.\n\n**Pot: **" + pot)
    .setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')

    if (multiplayer)            embed.setDescription("Choose Rock Paper, or Scissors. \nMake your selection by reacting to the emojis.\n\n**Player 2 has to click ✅ to start the game**\n\n**Pot: **" + pot)

    let game = await channel.send(embed);

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
    }

    embed.addField('\u200B', '\u200B')
    if (multiplayer) embed.addField(player1.username + "  " + wallet1 + " <:HentaiCoin:814968693981184030>    vs  " + player2.username + "  " + wallet2 + " <:HentaiCoin:814968693981184030>", '\u200B')
    else             embed.addField(player1.username + "  " + wallet1 + " <:HentaiCoin:814968693981184030>    vs  ALPHA CHAD DEALER  ∞ <:HentaiCoin:814968693981184030>", '\u200B')

    if (!multiplayer) {
        embed.addFields(
            { name: "Rock:  ✊", value: '\u200B', inline: true },
            { name: "Paper:  ✋", value: '\u200B', inline: true },
            { name: "Scissors:  ✌", value: '\u200B', inline: true }
        )
    }
    embed.addField("Pot:  " + pot, '\u200B',true)
        

    if (wallet1 > wallet2) {
        lowest_wallet[0] = player2
        lowest_wallet[1] = wallet2
    } else {
        lowest_wallet[0] = player1
        lowest_wallet[1] = wallet1
    }

    if (!multiplayer) {
        game.react('✊')
        game.react('✋')
        game.react('✌')
    }

    do {
        //Check if someone starts with an all in
        if (lowest_wallet[1] <= pot / 2) {
            pot = lowest_wallet[1] * 2
            all_in = true;

            embed.addField(lowest_wallet[0].username + " HAS ALL INNED", "The pot total is now **" + pot + "** <:HentaiCoin:814968693981184030>")
        }

        draw = false;
        game.edit(embed)
    
        let filter = (reaction, user) => ((reaction.emoji.name == '✊' || reaction.emoji.name == '✋' || reaction.emoji.name == '✌') &&
                                         ((user.id == player1.id) || (user.id == player2.id)))

        let emoji1; let emoji2; let collected; let collected2
        if (multiplayer) {
            let p1 = await player1.send(await getEmbed(pot));        p1.react('✊'); p1.react('✋');p1.react('✌')
            let p2 = await player2.send(await getEmbed(pot));        p2.react('✊'); p2.react('✋');p2.react('✌')
            
            collected = p1.awaitReactions(filter, { max: 1, time: 20000, errors: ['time']}).catch(err => {
                console.log("Player1 didnt show up")
                return null
            });

            collected2 = p2.awaitReactions(filter, { max: 1, time: 20000, errors: ['time']}).catch(err => {
                console.log("Player2 didnt show up")
                return null
            });

            let promiseArray = await Promise.all([collected, collected2]).then((values) => {
                return values;
            })

            if (promiseArray[0] == null || promiseArray[1] == null) break;


            emoji1 = promiseArray[0].first().emoji.name
            emoji2 = promiseArray[1].first().emoji.name

            embed.addFields(
                {name:'\u200B', value:"**" + player1.username + "** has chosen **" + emoji1 + "**\n**" + player2.username + "** has chosen **" + emoji2 + "**"},
                {name: '\u200B', value:'\u200B'}
            )

            p1.delete()
            p2.delete()

        } else {
            collected = await game.awaitReactions(filter, { max: 1, time: 30000, errors: ['time']}).catch(err => {
                console.log("Player didnt show up")
                return null
            })
            if (collected == null) break;
            emoji1 = collected.first().emoji.name
            game.reactions.cache.find(r => r.emoji.name == emoji1).users.remove(player1.id)

            embed.addField("⌛ Generating a random hand", '\u200B')

            game.edit(embed)

            let dealerHand = await Math.floor(Math.random() * 3) + 1
            if (dealerHand==1) emoji2 = '✊'
            else if (dealerHand==2) emoji2 = '✋'
            else emoji2='✌'
        }

        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(4000);


    //   '✊''✋''✌'
        if (emoji1 == emoji2) {
            draw = true;
            if (multiplayer){
                pot = pot * 2;
                embed.addField("Both players chose " + emoji1 + ". Pot is doubled <:PogO:804089420020973568>\n**Pot: **" + pot, '\u200B')
            } else {
                pot = await Math.round(pot * 1.5);
                embed.addField("Both players chose " + emoji1 + ". Pot is increased 50% <:PogO:804089420020973568>\n**Pot: **" + pot, '\u200B')
               
            }
           
        // player2 wins
        } else if ((emoji1 == '✊' && emoji2 == '✋') ||
                   (emoji1 == '✋' && emoji2 == '✌') ||
                   (emoji1 == '✌' && emoji2 == '✊')) {
            if (multiplayer) winnerMessage(game, player2.username, player1.username, emoji2, emoji1, wallet2, wallet1,  pot/2, multiplayer)
            else             winnerMessage(game, "ALPHA CHAD DEALER", player1.username, emoji2, emoji1, null, wallet1, pot, multiplayer)

        }
        // player1 wins
        else if ((emoji1 == '✋' && emoji2 == '✊') ||
                   (emoji1 == '✌' && emoji2 == '✋') ||
                   (emoji1 == '✊' && emoji2 == '✌'))
            if (multiplayer) winnerMessage(game, player1.username, player2.username, emoji1, emoji2, wallet1, wallet2,  pot/2, multiplayer)
            else             winnerMessage(game, player1.username, "ALPHA CHAD DEALER", emoji1, emoji2, wallet1, null, pot/2, multiplayer)

    } while(draw)

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(7000);

    game.delete()
}

async function winnerMessage(message, winner, loser, emojiW, emojiL, w, l, pot, multiplayer) {

    let embed = await new Discord.MessageEmbed()
    .setTitle("Rock Paper Scissors")
    .setDescription("Choose Rock Paper, or Scissors. \nMake your selection by reacting to the emojis.\n\n**Pot: **" + pot)
    .setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')
    .addField( "\u200B", "**" + winner + "** has chosen " + emojiW + "  **" + loser + "** has chosen " + emojiL)

    if (multiplayer) {
        embed.addFields(
            { name: winner + " is the winner! You earn " + pot + " <:HentaiCoin:814968693981184030>", value: '\u200B'},
            { name: "\u200B", value: winner + "  " + (w + pot) + " <:HentaiCoin:814968693981184030>      " + loser + "  " + (l - pot) + " <:HentaiCoin:814968693981184030>"}    
        )
    } else if (w == null) {
        embed.addFields(
            { name: winner + " is the winner!", value: '\u200B'},
            { name: "\u200B",  value: loser + "  " + (l - pot) + " <:HentaiCoin:814968693981184030>"}    
        )
    } else if (l == null) {
        embed.addFields(
            { name: winner + " is the winner! You earn " + pot + " <:HentaiCoin:814968693981184030>", value: '\u200B'},
            { name: "\u200B",  value: winner + "  " + (w + pot) + " <:HentaiCoin:814968693981184030>"}    
        )
    }

    message.edit(embed);   
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