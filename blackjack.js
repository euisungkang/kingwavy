const { EmbedBuilder } = require('discord.js');
const database = require('./firebaseSDK')

let validEmojis = ['♦', '♥', '<:White:825059935951126548>', '<:Black:825059935662243882>', '🃏'] 

async function playBlackjack(channel, players) {
    //channel.send("", {files: ['./deck/2C.png']})

    let wallets = [];
    for(let i = 0; i < players.length; i++) {
        wallets.push(await database.getCurrency(players[i].id))
    }
    console.log(wallets);

    let embed = new EmbedBuilder()
    .setTitle("Blackjack")
    .setDescription("All players select the emoji corresponding to their starting bets.\nIf some players don't select within 30 seconds, the game will continue without them.\n\n__**Players:**__")
    .setThumbnail('https://i.ibb.co/N1f9Qwg/casino.png')

    for(let i = 0; i < players.length; i++) {
        await embed.addField(players[i].username + ":  " + wallets[i] + " <:HentaiCoin:814968693981184030>", '\u200B', true)
    }

    // embed.addFields(
    //     { name: "5: ♦", value: '\u200B' },
    //     { name: "10:  ♥", value: '\u200B'},
    //     { name: "20:  <:White:825059935951126548>", value: '\u200B'},
    //     { name: "30:  <:Black:825059935662243882>", value: '\u200B'},
    //     { name: "ALL IN (<30):  🃏", value: '\u200B'},
    // )

    let game = await channel.send({ embeds: [embed] });
    // for (let i = 0; i < validEmojis.length; i++)
    //     game.react(validEmojis[i])

    // let filterConfirm = (reaction, user) => ((reaction.emoji.name == '✅' && user.id == player2.id) ||
    // (reaction.emoji.name == '❌' && (user.id == player1.id || user.id == player2.id)))

    //let filterConfirm = (reaction, user) => (reaction.emoji.name == '♦' || reaction.emoji.name == '♥' || reaction.emoji.name == '<:White:825059935951126548>' || reaction.emoji.name == '<:Black:825059935662243882>' || reaction.emoji.name == '🃏')



    //console.log(players.length)
    
    // let haveToChoose = players.slice();

    // while (haveToChoose.length > 0) {
    //     console.log(haveToChoose.length)
    //     let filterConfirm = (reaction, user) => (validEmoji(reaction.emoji.name) && validPlayer(user, haveToChoose)) &&  user.id != game.author.id

    //     let collectedConfirm = await game.awaitReactions(filterConfirm, { max: 1, time: 30000, errors: ['time']}).catch(err => {
    //         console.log("Player didnt show up")
    //         return null
    //     })
    //     if (collectedConfirm == null) {
    //         const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    //         await wait(7000);

    //         game.delete()
    //         return;
    //     }
        
    //     console.log(collectedConfirm.users)
    // }

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(7000);
    game.delete()
}

async function validPlayer(user, players) {
    let valid = players.includes(user)
    return valid
}

async function validEmoji(emoji) {
    return validEmojis.includes(emoji)
}

async function massConfirm(players) {

}

module.exports = {
    playBlackjack : playBlackjack
}