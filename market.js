const { EmbedBuilder } = require('discord.js');
const { getProducts } = require('./firebaseSDK');
const database = require('./firebaseSDK');

let mktID = '824832401996906538'

async function updateMarket(channel) {
    console.log("updating market");
    //channel.send({ content: {files: ['https://i.ibb.co/FXbw7wp/Wavy-store.jpg']})
    //channel.send({ content: "Welcome to the 【 𝓦 𝓪 𝓿 𝔂 】 market.\n\nIn the market, you will be able to spend your :HentaiCoin: to buy any of the server perks you want, whenever you want.\n\n**Click the <:HentaiCoin:814968693981184030> reaction, and we'll attend you.**\n\n__**Market Status: **__")
    //channel.send({ content: "__**Market Status: **__\n```diff\n- Currently Offline. Under Maintenance, there will be more products added soon.\n```")

    let embed = await getEmbed();

    let exists = true;
    try {
        await channel.messages.fetch(mktID)
    } catch (error) {
        console.error(error)
        exists = false;
    } finally {
        if (!exists) {
            let msg = await channel.send({ embeds: [embed] })
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

async function awaitMarketReaction(message, channel, logs, members, filter) {
    console.log("awaiting market reaction")
    let user;

    await message.awaitReactions({ filter, max: 1 })
    .then(async collected => {
        user = collected.first().users.cache.last()
        await message.reactions.cache.find(r => r.emoji.id == '814968693981184030').users.remove(user)
    })
    .catch(err => console.log(err))

    await productPurchase(user, channel, logs, members).catch(err => console.log(err))

    await deleteAll(channel)

    awaitMarketReaction(message, channel, members, filter);
}   

async function productPurchase(user, channel, logs, members) {
    let products = await getProducts();

    let message = await channel.send({ content: "<@" + user.id + "> Enter the ID of the product you want to purchase. Your **cumulative** balance is: "
                    +  await database.getCum(user.id) + " <:HentaiCoin:814968693981184030>" })

    let filter = (m) => m.author.id == user.id;

    //What product does the user want to buy?
    let collected = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
    .catch(err => {
        return null;
    })
    if (collected == null) {
        return
    }
            
    await confirmProduct(channel, logs, collected, members, user, products)

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(5000);
}

async function confirmProduct(channel, logs, message, members, user, products) {
    let wallet = await database.getCum(user.id)
    
    // Edge Cases for Product ID
    if (isNaN(message.first().content)) {
        return await channel.send({ content: "Please enter a valid number <:PepeKindaCringe:815507957935898654>" })
    } else if (Number(message.first().content) % 1.0 != 0.0) {
        return await channel.send({ content: "Why the decimals? Want me to decimate your wallet bish?" })
    } else if (Number(message.first().content) < 0) {
        return await channel.send({ content: "idk chief, something doesn't seem right here eh?" })
    }

    let productID = Number(message.first().content)

    // After Input Verification, Check if ID is valid
    if (productID <= 0 || productID > products.length) {
        return await channel.send({ content: "The product ID you entered is not valid in the market.\nDouble check the product's ID, and try again" })
    }

    let product = products[productID - 1]

    // Edge Cases for Currency Calculation
    if (wallet < Number(product.price)) {
        return await channel.send({ content: "You have: " + wallet + " <:HentaiCoin:814968693981184030>\n**" +
                                  product.name + "** costs: " + product.price + " <:HentaiCoin:814968693981184030>\n" +
                                  "Something doesn't add up now does it <:shek:968122117453393930>" })
    }

    // Confirmation message and await reaction response
    let confirmation = await channel.send({ content: "The product you entered is **" + product.name + "**.\n"
                        + "That would be a total of " + product.price + ' <:HentaiCoin:814968693981184030>\n'
                        + "Proceed with the transaction? React with ✅ or ❌" })
    confirmation.react('✅')
    confirmation.react('❌')
    
    const filter = (reaction, user) => (reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id == message.first().author.id
    let reaction = await confirmation.awaitReactions({filter, max: 1 })

    let emoji = reaction.first().emoji.name

    if (emoji == '❌') {
        await channel.send({ content: "Got it, your order won't be processed" })
    } else if (product.price > wallet) {
        await channel.send({ content: "It seems you don't have enough money to purchase the product" })
    } else {
        let remaining = wallet - product.price

        if (await processProduct(user, channel, members, productID) == false)
            return

        console.log(user.id + "      " + user.username + " purchased " + product.name +
        "     Before: " + wallet + " After: " + remaining)

        //database.removeCum(user, product.price)

        await channel.send({ content: "Your order was successful.\n**" + product.name + "** has been purchased.\n"
                                + "Your remaining **cumulative** balance is: " + remaining + " <:HentaiCoin:814968693981184030>" })
    
        await logs.send({ content: "```" + new Date().toUTCString() +
                        "\nProduct: " + product.description +
                        "\nID: " + user.id +
                        "\nName: " + user.username +
                        "\nPrice: " + product.price +
                        "\nCurrency Before: " + wallet +
                        "\nRemaining: " + remaining +
                        "```"
        })
    }

    return
}

async function processProduct(user, channel, members, productID) {

    // productID == 5 is setting someone's nickname for 1 month
    if (productID == 5) {
        let restricted = await database.getRestrictedNicknames();

        // Collect the user whose nickname is to be changed
        await channel.send({ content: "@ the person you want to apply the nickname change (i.e. <@812904867462643713>)\nThey will not be able to change their nickname for a month" })

        let filter = (m) => m.author.id == user.id;

        let collected = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
        .catch(err => {
            console.log(err)
            return null;
        })
        if (collected == null) {
            return false
        }

        let polished = (collected.first().content).match(/(\d+)/)

        if (restricted.hasOwnProperty(polished[0])) {
            await channel.send({ content: "Seems like " + collected.first().content + " is already a target.\n" +
                                "Either pick someone else, or try again after " + collected.first().content + "'s restriction is lifted"})
            return false
        }

        let target = await members.fetch(polished[0], { force: true })

        // Collect the username to be changed to
        await channel.send({ content: "What do you want " + collected.first().content +
                            "'s nickname to be changed to (i.e. Cum Guzzler)?"})

        let collected2 = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
        .catch(err => {
            console.log(err)
            return null
        })
        if (collected == null) {
            return false
        }

        // Add restricted name to current restricted names
        let updateRestricted = {}
        updateRestricted[polished[0]] = collected2.first().content

        updateRestricted = Object.assign(restricted, updateRestricted)

        console.log(updateRestricted)

        database.updateRestrictedNicknames(updateRestricted)

        target.setNickname(collected2.first().content)

        return true
    }
}

async function deleteAll(channel) {
    let filtered;
    do {
        let fetched = await channel.messages.fetch({ limit: 100 })
        filtered = fetched.filter(msg => msg.id != '824832401996906538')
        //console.log(filtered)
        channel.bulkDelete(filtered)
    } while(filtered.size >= 2)
}

async function getEmbed() {
    let products = await getProducts();

    const embed = new EmbedBuilder()
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】  Market')
    .setThumbnail('https://i.ibb.co/FXbw7wp/Wavy-store.jpg')
    .setDescription("To purchase a product, click on the <:HentaiCoin:814968693981184030>, and I will attend you.\n\n" +
                    "Make sure you know the product ID before you purchase.")
    .addFields(
        { name: '\u200B', value: '\u200B' }
    )

    for (var i = 0; i < products.length; i++) {
        embed.addFields(
            { name: (i + 1) + ": " + products[i].name, value: products[i].description + "\n**Price: " + products[i].price + "** <:HentaiCoin:814968693981184030>" }
        )
        if (i != products.length - 1) {
            embed.addFields(
                { name: "Product ID: " + (i + 1), value: "\u200B" }
            )
        } else {
            embed.addFields(
                { name: "Product ID: " + (i + 1), value: "\u200B" }
            )
        }
    }

    return embed;
}

module.exports = {
    updateMarket : updateMarket,
    awaitMarketReaction : awaitMarketReaction
}