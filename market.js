const { EmbedBuilder } = require('discord.js');
const { getProducts } = require('./firebaseSDK');
const database = require('./firebaseSDK');
const axios = require('axios')

async function updateMarket(channel) {
    console.log("updating market");
    //channel.send({ content: {files: ['https://i.ibb.co/FXbw7wp/Wavy-store.jpg']})
    //channel.send({ content: "Welcome to the 【 𝓦 𝓪 𝓿 𝔂 】 market.\n\nIn the market, you will be able to spend your :HentaiCoin: to buy any of the server perks you want, whenever you want.\n\n**Click the <:HentaiCoin:814968693981184030> reaction, and we'll attend you.**\n\n__**Market Status: **__")
    //channel.send({ content: "__**Market Status: **__\n```diff\n- Currently Offline. Under Maintenance, there will be more products added soon.\n```")

    let embed = await getEmbed();
    let mktID = await database.getMarketMessage()

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
            database.updateMarketMessage(msg.id)
            return msg;
        } else {
            let msg = await channel.messages.fetch(mktID)
            msg.react('<:HentaiCoin:814968693981184030>')
            msg.edit(embed);
            return msg
        }
    }
}

async function awaitMarketReaction(message, channel, logs, guild, filter) {
    console.log("awaiting market reaction")
    let user;

    await message.awaitReactions({ filter, max: 1 }).catch(err => console.log(err))
    .then(async collected => {
        user = collected.first().users.cache.last()
        await message.reactions.cache.find(r => r.emoji.id == '814968693981184030').users.remove(user)
    })
    .catch(err => console.log(err))

    await productPurchase(user, channel, logs, guild).catch(err => console.log(err))

    await deleteAll(channel)

    awaitMarketReaction(message, channel, logs, guild, filter);
}   

async function productPurchase(user, channel, logs, guild) {
    let products = await getProducts();

    await channel.send({ content: "<@" + user.id + "> Enter the ID of the product you want to purchase. Your **cumulative** balance is: "
                        +  await database.getCum(user.id) + " <:HentaiCoin:814968693981184030>" })

    let filter = (m) => m.author.id == user.id;

    //What product does the user want to buy?
    let productID = await awaitResponse(channel, filter, 30000, false)
    if (productID == false)
        return
            
    await confirmProduct(channel, logs, productID, guild, user, products)

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(5000);
}

async function confirmProduct(channel, logs, message, guild, user, products) {
    let wallet = await database.getCum(user.id)
    
    // Edge Cases for Product ID
    if (isNaN(message)) {
        return await channel.send({ content: "Please enter a valid number <:PepeKindaCringe:815507957935898654>" })
    } else if (Number(message) % 1.0 != 0.0) {
        return await channel.send({ content: "Why the decimals? Want me to decimate your wallet bish?" })
    } else if (Number(message) < 0) {
        return await channel.send({ content: "idk chief, something doesn't seem right here eh?" })
    }

    let productID = Number(message)

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
    
    const filter = (reaction, user) => (reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id != '813021543998554122'
    let reaction = await confirmation.awaitReactions({ filter, max: 1, time: 30000 }).catch(err => console.log(err))

    let emoji = reaction.first().emoji.name

    if (emoji == '❌') {
        await channel.send({ content: "Got it, your order won't be processed" })
    } else if (product.price > wallet) {
        await channel.send({ content: "It seems you don't have enough money to purchase the product" })
    } else {
        let remaining = wallet - product.price

        if (await processProduct(user, channel, guild, productID) == false)
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

async function processProduct(user, channel, guild, productID) {
    let members = guild.members

    if (productID == 1) {
        let target = await members.fetch(user.id, { force: true })

        if (await database.hasCustomRole(user.id)) {
            await channel.send({ content: "You seem to already have purchased a custom role\nUse the $edit command to edit or upgrade your custom role"})
            return false
        } else if (!target.roles.cache.has('687840476744908815')) {
            await channel.send({ content: "You have to be of at least <@&687840476744908815> rank to purchase a **Tier 3 Custom Role**" })
            return false
        }

        return await processRoleRequest(channel, guild, target, productID)

    } else if (productID == 2) {
        let target = await members.fetch(user.id, { force: true })

        if (await database.hasCustomRole(user.id)) {
            await channel.send({ content: "You seem to already have purchased a custom role\nUse the $edit command to edit or upgrade your custom role"})
            return false

        // If user has lower rank than purchased tier            
        } else if (!target.roles.cache.has('812983666136842241')) {
            await channel.send({ content: "You have to be of at least <@&812983666136842241> rank to purchase a **Tier 3 Custom Role**" })
            return false

        // If user has higher rank than the purchased tier
        } else if (target.roles.cache.has('687840476744908815')) {
            await channel.send({ content: "Seems like you are of rank <@&687840476744908815>\n" +
                                          "You are eligible to purchase a Tier 3 Custom Role. Please try again with the appropriate product" })
            return false
        }

        return await processRoleRequest(channel, guild, target, productID)

    } else if (productID == 3) {
        let target = await members.fetch(user.id, { force: true })

        if (await database.hasCustomRole(user.id)) {
            await channel.send({ content: "You seem to already have purchased a custom role\nUse the $edit command to edit or upgrade your custom role"})
            return false

        // If user has lower rank than purchased tier
        } else if (!target.roles.cache.has('812926342249185320')) {
            await channel.send({ content: "You have to be of at least <@&812926342249185320> rank to purchase a **Tier 3 Custom Role**" })
            return false

        // If user has higher rank than purchased tier
        } else if (target.roles.cache.has('812983666136842241')) {
            await channel.send({ content: "Seems like you are of **at least** rank <@&812983666136842241>\n" +
                                          "You are eligible to purchase a Tier 2 Custom Role. Please try again with the appropriate product" })
            return false
        }

        return await processRoleRequest(channel, guild, target, productID)

    } else if (productID == 4) {
        //Badge/Title
        await channel.send({ content: "What do you want your custom badge to be called?\n*Badges are displayed on your profile like a role, but won't affect the way you're displayed in the server*" })

        let filter = (m) => m.author.id == user.id;
        let badgeName = await awaitResponse(channel, filter, 30000, true);
        if (badgeName == false)
            return false
        
        await channel.send({ content: "Your badge will be called: " + badgeName + 
                                      "\n\nNow pick your badge's color!\nYou must insert your color's hex code (i.e. #CEA2D7 **or** CEA2D7)" +
                                      "\n\n*Use this online color picker to get your desired hex code:* <https://htmlcolorcodes.com/color-picker/>"})

        let badgeColor = await awaitResponse(channel, filter, 90000, false);
        if (badgeColor == false)
            return false;

        // Check if badgeColor is a valid hex code
        badgeColor = await validHexColor(channel, badgeColor)
        if (!badgeColor)
            return false

        await channel.send({ content: "Upload any custom icon for your badge.\nAccepted dimensions are **strictly** **64x64** pixels and **256KB** max size\n*Since it's an icon, I suggest you upload a transparent PNG. Your call though*" +
                                      "\n\nYou can use whatever resize/compress/transparent tool, but here's some quick links\nPNG Transparent(izer)?: <https://onlinepngtools.com/create-transparent-png>\nImage Resizer: <https://imageresizer.com/>\nImage Compressor: <https://imagecompressor.com>\nImage Cropper: <https://www.iloveimg.com/crop-image>" })

        filter = (m) => user.id == m.author.id
        let collected = await channel.awaitMessages({ filter, max: 1, time: 90000, errors: ['time'] })
        .catch(err => {
            console.log(err)
            return null;
        })
        if (collected == null)
            return false

        let badgeIcon = collected.first().attachments.values().next().value

        if ((!("contentType" in badgeIcon)) ||
            badgeIcon.contentType != 'image/png' &&
            badgeIcon.contentType != 'image/jpeg') {
            
            await channel.send({ content: "Please enter a valid image type: PNG, JPG. *GIFs are not accepted for badge icons*" })
            return false
        }

        // Conditions for dimension and file size of server icon
        if (badgeIcon.height != 64 && badgeIcon.width != 64) {
            await channel.send({ content: "Badge icon dimensions **must** be **64x64** pixels\n" + 
                                          "The image you uploaded has dimensions of " + badgeIcon.width + "x" + badgeIcon.height +
                                          "\n\nResize your image with Image Resizer: <https://imageresizer.com/>"})
            return false
        } else if (badgeIcon.size >= 256000) {
            await channel.send({ content: "Badge icon size **must** be **less than 256KB**" +
                                          "The image you uploaded is of size " + Math.trunc(badgeIcon.size/1000) + "KB" +
                                          "\n\nResize your image with Image Compressor: <https://imagecompressor.com/>"})
            return false
        }

        let badge = await guild.roles.create({
            name: badgeName,
            color: badgeColor,
            hoist: false,
            permissions: [],
            position: 0,
            mentionable: true,
            icon: badgeIcon.url
        })

        let target = await members.fetch(user.id, { force: true })
        target.roles.add(badge)

        console.log("Badge has been created for " + user.username + " called " + badgeName +
                    "\nBadge Color: " + badgeColor)

        database.updateBadges(user.id, badge, productID)

        return true

    // productID == 5 is setting someone's nickname for 1 week
    } else if (productID == 5) {
        let restricted = await database.getRestrictedNicknames();

        // Collect the user whose nickname is to be changed
        await channel.send({ content: "@ the person you want to apply the nickname change (i.e. <@812904867462643713>)\nThey will not be able to change their nickname for a month" })

        let filter = (m) => m.author.id == user.id;
        let targetName = await awaitResponse(channel, filter, 30000, false)
        if (targetName == false)
            return false;

        let polished = (targetName).match(/(\d+)/)
        if (polished == null) {
            await channel.send({ content: "Please enter a valid user :unamused:" })
            return false
        }

        for (const [key, value] of Object.entries(restricted)) {
            for (let i = 0; i < value.length; i++) {
                if (value[i].id == polished[0]) {
                    await channel.send({ content: "Seems like " + targetName + " is already a target.\n" +
                                        "Either pick someone else, or try again after " + targetName + "'s restriction is lifted"})
                    return false
                }
            }
        }

        let target = await members.fetch(polished[0], { force: true })

        // Collect the username to be changed to
        await channel.send({ content: "What do you want " + targetName +
                            "'s nickname to be changed to (i.e. Cum Guzzler)?"})

        let targetRestrictedName = await awaitResponse(channel, filter, 30000, true)
        if (targetRestrictedName == false)
            return false

        // Add restricted name to current restricted names

        // Get +week date from date purchased. Also set time to beginning of the day
        let date = new Date()
        date.setDate(date.getDate() + 7)
        date.setUTCHours(0,0,0,0)

        newRestricted = {
            id: polished[0],
            newNickname: targetRestrictedName,
            oldNickname: target.nickname,
            username: target.user.username,
            date: date
        }

        target.setNickname(targetRestrictedName)

        await sendRestrictMessage(newRestricted, target)

        if (restricted.hasOwnProperty(user.id)) {
            restricted[user.id].push(newRestricted)
        } else {
            restricted[user.id] = [newRestricted]
        }

        database.updateRestrictedNicknames(restricted)

        return true

    } else if (productID == 6) {
        //Change Server PP

        // If someone already purchased product 6
        let restrictedIcon = await database.getRestrictedServerIcon()
        if (restrictedIcon.hasOwnProperty(user.id)) {
            await channel.send({ content: "Seems like someone already changed the server's icon for a week\n" +
                                          "Try again after " + (restrictedIcon[user.id])[2].toDate().toLocaleDateString() })
            return false
        }

        await channel.send({ content: "Upload the new server icon as an image.\nAccepted dimensions are **strictly** **512x512** pixels and **8MB** max size" +
                                      "\n\nYou can use whatever resize/compress tool, but here's some recs\nImage Resizer: <https://imageresizer.com/>\nImage Compressor: <https://imagecompressor.com/>\nImage Cropper: <https://www.iloveimg.com/crop-image>" })

        let filter = (m) => m.author.id == user.id
        let collected = await channel.awaitMessages({ filter, max: 1, time: 90000, errors: ['time'] })
        .catch(err => {
            console.log(err)
            return null;
        })
        if (collected == null)
            return false

        let serverIcon = collected.first().attachments.values().next().value

        // Conditions for dimension and file size of server icon
        if (serverIcon.height != 512 && serverIcon.width != 512) {
            await channel.send({ content: "The server icon dimensions **must** be **512x512** pixels\n" + 
                                          "The image you uploaded has dimensions of " + serverIcon.width + "x" + serverIcon.height +
                                          "\n\nResize your image with Image Resizer: <https://imageresizer.com/>"})
            return false
        } else if (serverIcon.size >= 8000000) {
            await channel.send({ content: "The server icon size **must** be **less than 8MB**" +
                                          "The image you uploaded is of size " + Math.trunc(serverIcon.size/1000000) + "MB" +
                                          "\n\nResize your image with Image Compressor: <https://imagecompressor.com/>"})
            return false
        }
        
        let updateRestricted = {}

        let date = new Date()
        date.setDate(date.getDate() + 7)
        date.setUTCHours(0,0,0,0)

        // Save current Icon as a base 64 image
        let currentIcon = await guild.iconURL({ dynamic: true })
        let base64Stream = await downloadIcon(currentIcon)
        
        updateRestricted[user.id] = {
            newIcon: serverIcon.url,
            oldIcon: base64Stream,
            date: date
        }

        await database.updateRestrictedServerIcon(updateRestricted)

        await guild.setIcon(serverIcon.url)

        return true

    } else if (productID == 7) {
        // OG: 【 𝓦 𝓪 𝓿 𝔂 】
        //Change Server Name

        let restricted = await database.getRestrictedServerName();

        // If someone else already changed the server name
        if (restricted.hasOwnProperty(user.id)) {
            await channel.send({ content: "Seems like " + user.username + " already changed the server name to " +  restricted[user.id][0] +
                                            "\n\n Try again after: " + (restricted[user.id])[2].toDate().toLocaleDateString()})
            return false
        }

        await channel.send({ content: "What do you want the new server name to be (1 week)?" })

        let filter = (m) => m.author.id == user.id;
        let serverName = await awaitResponse(channel, filter, 30000, true)
        if (serverName == false)
            return false

        let date = new Date()
        date.setDate(date.getDate() + 7)
        date.setUTCHours(0,0,0,0)

        let updateRestricted = {}

        updateRestricted[user.id] = {
            newName: serverName,
            oldName: guild.name,
            date: date
        }

        updateRestricted = Object.assign(restricted, updateRestricted)

        await database.updateRestrictedServerName(updateRestricted)

        guild.setName(serverName)

        console.log("Server name has been changed to " + serverName)

        return true
    }

    return false
}

async function deleteAll(channel) {
    let filtered;
    do {
        let mktID = await database.getMarketMessage()
        let fetched = await channel.messages.fetch({ limit: 100 })
        filtered = fetched.filter(msg => msg.id != mktID)
        //console.log(filtered)
        if (filtered.size > 0)
            channel.bulkDelete(filtered)
    } while(filtered.size >= 2)
}

async function getEmbed() {
    let products = await getProducts();

    const embed = new EmbedBuilder()
    .setColor('#ff6ad5')
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

async function awaitResponse(channel, filter, time, charLimit) {
    let collected = await channel.awaitMessages({ filter, max: 1, time: time, errors: ['time'] })
    .catch(err => {
        console.log(err)
        return null;
    })
    if (collected == null) {
        return false
    } 
    
    if (charLimit && (collected.first().content.length < 1 || collected.first().content.length > 32)) {
        channel.send({ content: "Nicknames must be within 1 - 32 characters long" })
        return false
    }

    return collected.first().content
}

async function sendRestrictMessage(product, member) {
    const embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】  Market')
    .setThumbnail('https://i.ibb.co/FXbw7wp/Wavy-store.jpg')
    .setDescription("Your name has been **restricted** (market product) for 1 week!: " + new Date().toLocaleDateString() + " ~ " + new Date(product.date).toLocaleDateString() +
                    "\n\nYour nickname has been restricted to **" + product.newNickname +
                    "**\nYour name will be changed back to **" + product.oldNickname + "** after a week")

    await member.send({ embeds: [embed] }).catch(err => { console.log(err) })
}

async function sendUnrestrictMessage(product, member) {
    const embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】  Market')
    .setThumbnail('https://i.ibb.co/FXbw7wp/Wavy-store.jpg')
    .setDescription("Your name restriction (market product) has been **lifted** as of: " + new Date().toLocaleDateString() +
                    "\n\nYour nickname has been changed from **" + product.newNickname + "** back to **" + product.oldNickname + "**")

    await member.send({ embeds: [embed] }).catch(err => console.log(err))

    console.log("Succesfully removed name restriction from " + member.user.id)
}

function downloadIcon(url) {
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(
            response => Buffer.from(response.data, 'base64')
        )
}

async function validHexColor(channel, color) {
    if (/^#[0-9A-F]{6}$/i.test(color) || /^[0-9A-F]{6}$/i.test(color)) {
        if (/^[0-9A-F]{6}$/i.test(color))
            color = "#" + color
        return color
    } else {
        await channel.send({ content: "Please enter a valid hex code.\nAllowed formats are 6-digits: #CEA2D7 **or** CEA2D7" })
        return false
    }
}

async function processRoleRequest(channel, guild, target, productID) {
    let user = target.user

    await channel.send({ content: "What do you want your custom role to be called?\nYou can always change this later with the *$edit* command" })
    
    let filter = (m) => m.author.id == user.id
    let roleName = await awaitResponse(channel, filter, 30000, true);
    if (roleName == false)
        return false

    await channel.send({ content: "Your role will be called " + roleName +
                                  "\n\nNow pick your role's color!\nYou must insert your color's hex code (i.e. #CEA2D7 **or** CEA2D7)" +
                                  "\n\n*Use this online color picker to get your desired hex code:* <https://htmlcolorcodes.com/color-picker/>"})

    let roleColor = await awaitResponse(channel, filter, 90000, false)
    if (roleColor == false)
        return false
    
    // Check if roleColor is a valid hex code
    if (/^#[0-9A-F]{6}$/i.test(roleColor) || /^[0-9A-F]{6}$/i.test(roleColor)) {
        if (/^[0-9A-F]{6}$/i.test(roleColor))
            roleColor = "#" + roleColor
    } else {
        await channel.send({ content: "Please enter a valid hex code.\nAllowed formats are 6-digits: #CEA2D7 **or** CEA2D7" })
        return false;
    }

    // Configure pos based on tier of product
    let pos
    let tier
    if (productID == 1) {
        //Wavy Role
        let wavyRole = await guild.roles.fetch('687840476744908815')
        pos = wavyRole.rawPosition + 0.5
        tier = 3
    } else if (productID == 2) {
        //Groovy Role
        let groovyRole = await guild.roles.fetch('812983666136842241')
        pos = groovyRole.rawPosition + 0.5
        tier = 2
    } else {
        // Aesthetic Role
        let aesthethicRole = await guild.roles.fetch('812926342249185320')
        pos = aesthethicRole.rawPosition + 0.5
        tier = 1
    }

    let role = await guild.roles.create({
        name: roleName,
        color: roleColor,
        hoist: true,
        permissions: [],
        position: pos,
        mentionable: true,
    })

    target.roles.add(role)

    await channel.send({ content: "**Creating Custom Tier " + tier + " Role...**\nKeep in mind you can edit or upgrade your custom role tier, if eligible, using the $edit command" })

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    await wait(5000);

    console.log("Tier " + tier + " role has been created for " + user.username + " called " + roleName +
    "\nBadge Color: " + roleColor)

    database.updateRoles(user.id, role, tier)

    return true
}

module.exports = {
    updateMarket : updateMarket,
    awaitMarketReaction : awaitMarketReaction,
    sendRestrictMessage : sendRestrictMessage,
    sendUnrestrictMessage : sendUnrestrictMessage,
    awaitResponse : awaitResponse,
    validHexColor : validHexColor
}