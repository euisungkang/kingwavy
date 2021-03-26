const Discord = require('discord.js');
const { getProducts } = require('./firebaseSDK');
const database = require('./firebaseSDK');

let mktID = '824832401996906538'
let products;

async function updateMarket(channel) {
    console.log("updating market");
    //channel.send({files: ['https://i.ibb.co/FXbw7wp/Wavy-store.jpg']})
    //channel.send("Welcome to the 【 𝓦 𝓪 𝓿 𝔂 】 market.\n\nIn the market, you will be able to spend your :HentaiCoin: to buy any of the server perks you want, whenever you want.\n\n**Click the <:HentaiCoin:814968693981184030> reaction, and we'll attend you.**\n\n__**Market Status: **__")
    //channel.send("__**Market Status: **__\n```diff\n- Currently Offline. Under Maintenance, there will be more products added soon.\n```")

    let embed = await getEmbed();

    let exists = true;
    try {
        await channel.messages.fetch(mktID)
    } catch (error) {
        console.error(error)
        exists = false;
    } finally {
        if (!exists) {
            let msg = await channel.send(embed)
            msg.react('<:HentaiCoin:814968693981184030>')
            mktID = msg.id
            return msg;
        } else {
            let msg = await channel.messages.fetch(mktID)
            msg.react('<:HentaiCoin:814968693981184030>')
            msg.edit(embed);
            return msg
        }
    }
}

async function awaitMarketReaction(message, channel, filter) {
    console.log("awaiting market reaction")
    let user;

    await message.awaitReactions(filter, { max: 1 })
    .then(async collected => {
        user = collected.first().users.cache.last()
        await message.reactions.cache.find(r => r.emoji.id == '814968693981184030').users.remove(user)
    })
    .catch(err => console.log(err))

    await productPurchase(user, channel).catch(err => console.log(err))

    awaitMarketReaction(message, channel, filter);
}   

async function productPurchase(user, channel) {
    let message = await channel.send("<@" + user.id + "> Which product would you like to purchase? Your balance is: "
                    +  await database.getCurrency(user.id) + " <:HentaiCoin:814968693981184030>")
    
    let filter = (m) => m.author.id == user.id;

    //What product does the user want to buy?
    let collected = await channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
            
    let response = await confirmProduct(channel, collected, user)

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(5000);

    channel.messages.fetch(collected.first().id).then(m => m.delete())
    response.delete()
    message.delete()
}

async function confirmProduct(channel, message, user) {
    let wallet = await database.getCurrency(user.id)
    
    // If input is not a valid number
    if (isNaN(message.first().content)) {
        return await channel.send("Please enter a valid number <:PepeKindaCringe:815507957935898654>")
    }

    let productID = message.first().content - 1

    // If input is not in bounds
    if (productID < 0 || productID > products.length - 1) {
        return await channel.send("The product ID you entered is not available in the market.")
    }

    let product = products[productID]
    let toReturn;
    console.log(user.id + "      " + products[productID].name + "     " + await database.getCurrency(user.id))

    // Confirmation message and await reaction response
    let confirmation = await channel.send("The product you entered is **" + product.name + "**.\n"
                        + "That would be a total of " + product.price + '<:HentaiCoin:814968693981184030>\n'
                        + "Proceed with the transaction? React with ✅ or ❌")
    confirmation.react('✅')
    confirmation.react('❌')

    const filter = (reaction, user) => (reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id != confirmation.author.id
    let reaction = await confirmation.awaitReactions(filter, { max: 1 })

    let emoji = reaction.first().emoji.name

    if (emoji == '❌') {
        toReturn = await channel.send("Got it, your order won't be processed")
    } else if (product.price > wallet) {
        toReturn = await channel.send("It seems you don't have enough money to purchase the product")
    } else {
        let remaining = wallet - product.price
        toReturn = await channel.send("Your order has been processed. **" + product.name + "** has been purchased.\n"
                                + "Your remaining balance is: " + remaining + " <:HentaiCoin:814968693981184030>")
    }

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(3000);
    confirmation.delete()

    return toReturn
}

async function getEmbed() {
    products = await getProducts();

    const embed = await new Discord.MessageEmbed()
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】  Market')
    .setThumbnail('https://i.ibb.co/FXbw7wp/Wavy-store.jpg')
    .setDescription("To purchase a product, first click on the <:HentaiCoin:814968693981184030>, and we will attend you.\n\n" +
                    "Make sure you know the product ID before you purchase.")
    .addField('\u200B', '\u200B' )

    for (var i = 0; i < products.length; i++) {
        embed.addField((i + 1) + ": " + products[i].name, products[i].description + "\n**Price: " + products[i].price + "**")
        if (i != products.length - 1) {
            embed.addField("Product ID: " + (i + 1), "\u200B" )
        } else {
            embed.addField("Product ID: " + (i + 1), "\u200B")
        }
    }

    return embed;
}

module.exports = {
    updateMarket : updateMarket,
    awaitMarketReaction : awaitMarketReaction
}