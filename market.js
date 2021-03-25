const Discord = require('discord.js');
const { getProducts } = require('./firebaseSDK');
const database = require('./firebaseSDK');

let mktID = '824539247464677427'

async function updateMarket(channel) {
    console.log("updating market");
    //channel.send({files: ['https://i.ibb.co/FXbw7wp/Wavy-store.jpg']})
    //channel.send("Welcome to the 【 𝓦 𝓪 𝓿 𝔂 】 market.\n\nIn the market, you will be able to spend your :HentaiCoin: to buy any of the server perks you want, whenever you want.\n\n**Click the <:HentaiCoin:814968693981184030> reaction, and we'll attend you.**\n\n__**Market Status: **__")
    //channel.send("```diff\n- Currently Offline. Under Maintenance, there will be more products added soon.\n```")

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
        } else {
            let msg = await channel.messages.fetch(mktID)
            msg.react('<:HentaiCoin:814968693981184030>')
            msg.edit(embed);
        }
    }
}

async function getEmbed() {
    let products = await getProducts();

    const embed = await new Discord.MessageEmbed()
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】  Market')
    .setThumbnail('https://i.ibb.co/FXbw7wp/Wavy-store.jpg')
    .setDescription("To purchase a product, first click on the <:HentaiCoin:814968693981184030>, and we will attend you.\n\n" +
                    "Make sure you know the product ID before you purchase.")
    .addField('\u200B', '\u200B' )

    for (var i = 0; i < products.length; i++) {
        embed.addField(products[i].name, products[i].description + "\n**Price: " + products[i].price + "**")
        if (i != products.length - 1) {
            embed.addField("Product ID: " + (i + 1), "\u200B" )
        } else {
            embed.addField("Product ID: " + (i + 1), "|")
        }
    }

    return embed;
}

module.exports = {
    updateMarket : updateMarket
}