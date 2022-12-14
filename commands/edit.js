const { EmbedBuilder } = require('discord.js');
const database = require('../firebaseSDK');
const market = require('../market')

async function editCommand(client, msg) {
    const wavy = await client.guilds.resolve('687839393444397105')
    let mkt_logs = await client.channels.fetch('1038822879787229214')

    let replyChannel = await client.channels.fetch(msg.channel.id)
    replyChannel.send({ content: "Check your DMs <@" + msg.author.id + ">\n" + 
                                "Your editable <#820051777650556990> features were sent by me" })

    let embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】 $edit command')
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
    .addFields({ name: "Loading...", value: "\u200B" })

    let initialMSG = await msg.author.send({ embeds: [embed] })

    embed.spliceFields(0, 1)

    let subscriptions = await database.getAllSubscriptions(msg.author.id)
    let rolePurchased
    //console.log(subscriptions)
    if (subscriptions.size == 0) {
        embed.addFields(
            { name: "Seems like you don't have any editable features from the market\nPurchase something and try again" , value: "\u200B" }
        )
    } else {
        embed.addFields(
            { name: "Your editable market features", value: "\u200B" },
            { name: "\u200B", value: "**React with the corresponding emoji to edit one of your features**" },
            { name: "React ❌ if you wish to cancel this $edit request", value: "\u200B" }
        )
        await subscriptions.forEach((value, key) => {
            if (key >= 1 && key <= 3) {
                rolePurchased = key
                embed.addFields({ name: "Editable Role: 👑",
                                  value: "Tier: **" + value.tier + "**\nName: **" + value.name + "**\nColor: " + value.color })
                initialMSG.react("👑")
            } else if (key == 4) {
                embed.addFields({ name: '\u200B', value: "**Editable Badges: ** <:wavyheart:893239268309344266>" })
                value.forEach(badge => {
                    embed.addFields({ name: badge.name, value: "Color: " + badge.color, inline: true})
                })
                initialMSG.react("<:wavyheart:893239268309344266>")
            } else if (key == 5) {
                embed.addFields({ name: '\u200B', value: "**Editable Nicknames: ** <:groovy:1044251839715102790>" })
                value.forEach(nn => {
                    embed.addFields({ name: nn.username, value: "Current Nickname: " + nn.newNickname + "\nOld Name: " + nn.oldNickname + "\nExpiration: " + nn.date.toDate().toLocaleDateString(), inline: true })
                })
                initialMSG.react("<:groovy:1044251839715102790>")
            } else if (key == 6) {
                embed.addFields({ name: '\u200B', value: "**Server icon is editable!** <:aesthetic:1044251723251855441>" })
                initialMSG.react("<:aesthetic:1044251723251855441>")
            } else if (key == 7) {
                embed.addFields({ name: "\u200B\nServer Name: " + value[msg.author.id].newName + " 💎", value: "Expiration: " + value[msg.author.id].date.toDate().toLocaleDateString()})
                initialMSG.react("💎")
            }
        })
        initialMSG.react('❌')
    }

    initialMSG.edit({ embeds: [embed] })

    let filter = (reaction, user) => (reaction.emoji.name == '👑' ||
                                        reaction.emoji.name == 'wavyheart' ||
                                        reaction.emoji.name == 'groovy' ||
                                        reaction.emoji.name == 'aesthetic' ||
                                        reaction.emoji.name == '💎' ||
                                        reaction.emoji.name == '❌') &&
                                        user.id != '813021543998554122'
    
    let reaction = await initialMSG.awaitReactions({ filter, max: 1, time: 30000 }).catch(err => console.log(err))

    if (reaction.size < 1) {
        await msg.author.send({ content: "Request Timed Out. Try requesting a new $edit, and try again. *Boomer Fingers*" })
        return false
    }

    let reactionName = reaction.first().emoji.name

    let embed2 = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】 $edit command')
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
    
    if (reactionName == '❌') {
        await msg.author.send({ content: "Your $edit request is cancelled.\nFeel free to type $edit in any text channel if you change your mind"})
        return false
    } else if (reactionName == '👑') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit/upgrade a **custom role**" })

        let role = subscriptions.get(rolePurchased)
        let roleOBJ = await wavy.roles.fetch(role.id).catch(err => console.log(err))

        embed2.addFields(
            { name: "Your editable role:",
              value: "Tier: **" + role.tier + "**\nName: **" + role.name + "**\nColor: " + role.color },
            { name: "\u200B", value: "Do you wish to edit the **name** (<:shek:968122117453393930>), the **color** (<:srsly:1002091997970042920>), or upgrade your role tier (<:PikaO:804086658000748584>)?" }
        )
        
        let featureMSG = await msg.author.send({ embeds: [embed2] })
        featureMSG.react("<:shek:968122117453393930>")
        featureMSG.react("<:srsly:1002091997970042920>")
        featureMSG.react("<:PikaO:804086658000748584>")

        filter = (reaction, user) => (reaction.emoji.name == 'shek' || reaction.emoji.name == 'srsly' || reaction.emoji.name == 'PikaO') &&
                                      user.id != '813021543998554122'

        reaction = await featureMSG.awaitReactions({ filter, max: 1, time: 30000 })
        .catch(err => console.log(err))

        if (reaction.size < 1) {
            await msg.author.send({ content: "Request Timed Out. Try requesting a new $edit, and try again. *Boomer Fingers*" })
            return false
        }

        reactionName = reaction.first().emoji.name
        filter = (m) => m.author.id == msg.author.id

        let optionMSG

        if (reactionName == 'shek') {
            optionMSG = await msg.author.send({ content: "Current role name is: " + role.name + "\nWhat do you want to change the name to?"})
            
            let newName = await market.awaitResponse(optionMSG.channel, filter, 30000, true)
            if (newName == false) {
                await msg.author.send({ content: "Request timed out. Try sending a new $edit request next time "})
                return false
            }

            role.name = newName

            roleOBJ.edit({ name: role.name }).then(res => console.log("Edited role name to " + res.name))

            await database.updateRoles(msg.author.id, role, role.tier)

            await msg.author.send({ content: "Successfully edited the name of your custom role (tier " + role.tier + ") to " + role.name})

        } else if (reactionName == 'srsly') {
            optionMSG = await msg.author.send({ content: "Current role hexcode color: " + role.color + "\nWhat do you want to change the color to? Enter a valid hexcode." +
                                                            "\n\n*Use this online color picker to get your desired hex code:* <https://htmlcolorcodes.com/color-picker/>" })
        
            let newColor = await market.awaitResponse(optionMSG.channel, filter, 90000, false)
            newColor = await market.validHexColor(optionMSG.channel, newColor)
            if (newColor == false) {
                await msg.author.send({ content: "Request timed out. Try sending a new $edit request next time "})
                return false
            }

            role.color = newColor

            roleOBJ.edit({ color: newColor }).then(res => console.log("Edited role color to " + res.color))

            await database.updateRoles(msg.author.id, role, role.tier)

            await msg.author.send({ content: "Successfully edited the color of your custom role (tier " + role.tier + ") to " + role.color})
        
        } else if (reactionName == 'PikaO') {
            let positions = await database.getRolePositions();

            let tier = role.tier
            let target = await wavy.members.fetch(msg.author.id, { force: true })

            if (tier == 3 && target.roles.cache.has(positions[3])) {
                await msg.author.send({ content: "You are already of rank 𝓦𝓪𝓿𝔂, and have the highest custom role tier." })
                return false
            } else if (tier == 1 && !target.roles.cache.has(positions[1])) {
                await msg.author.send({ content: "You have to be of at least 𝕒 𝕖 𝕤 𝕥 𝕙 𝕖 𝕥 𝕚 𝕔 rank to upgrade to a **Tier 1 Custom Role**" })
                return false
            } else if (tier == 2 && !target.roles.cache.has(positions[2])) {
                await msg.author.send({ content: "You have to be of at least 𝒢𝓇❀❁𝓋𝓎 rank to upgrade to a **Tier 2 Custom Role**" })
                return false
            } else if (tier == 3 && !target.roles.cache.has(positions[3])) {
                await msg.author.send({ content: "You have to be of 𝓦𝓪𝓿𝔂 rank to upgrade a **Tier 3 Custom Role**" })
                return false
            }

            let productID;
            let products = await database.getProducts()

            if (tier == 2)
                productID = 1
            else if (tier == 1)
                productID = 2
            
            let priceDifference = products[productID - 1].price - products[productID].price

            let wallet = await database.getCum(msg.author.id)

            if (priceDifference > wallet) {
                msg.author.send({ content: "You currently have " + wallet + "<:HentaiCoin:814968693981184030>\n" +
                                           "Custom Role upgrade from Tier " + tier + " to Tier " + (tier + 1) + " costs " + priceDifference + "<:HentaiCoin:814968693981184030>\n" +
                                           "Try again when you're not broke" })
                return false
            }

            optionMSG = await msg.author.send({ content: "An upgrade from Tier **" + tier + "** to Tier **" + (tier + 1) + 
                                                         "** will cost you **" + priceDifference + "**<:HentaiCoin:814968693981184030>\n" +
                                                         "You currently have **" + wallet + "**<:HentaiCoin:814968693981184030>\n" +
                                                         "Continue with the transaction?" })

            optionMSG.react('✅')
            optionMSG.react('❌')
            
            const filter = (reaction, user) => (reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id != '813021543998554122'
            let reaction = await optionMSG.awaitReactions({ filter, max: 1, time: 10000 })

            if (reaction.size < 1) {
                await msg.author.send({ content: "Request Timed Out. Try requesting a new $edit, and try again. *Boomer Fingers*" })
                return false
            }

            let emoji = reaction.first().emoji.name

            if (emoji == '❌') {
                await msg.author.send({ content: "Got it, your tier upgrade won't go through" })
                return false
            } else if (emoji == '✅') {

                let pivotOBJ = await wavy.roles.fetch(positions[tier + 1]).catch(err => console.log(err))

                let pos = pivotOBJ.position + 0.5

                role.tier = tier + 1

                roleOBJ.edit({ position: pos }).then(res => console.log("Edited role " + res.name + " to position " + res.position))

                await database.editRole(msg.author.id, role)

                //await database.removeCum(msg.author, priceDifference)

                await msg.author.send({ content: "Successfully upgraded your " + role.name + " role from Tier " + tier + " to Tier " + (tier + 1) + 
                                                 "\nChanges will be actualized shortly"})
            
                await mkt_logs.send({ content: "```" + new Date().toUTCString() +
                    "\nProduct: $edit Custom Role Tier Upgrade" +
                    "\nID: " + msg.author.id +
                    "\nName: " + msg.author.username +
                    "\nTier: " + tier + " -> " + (tier + 1) +
                    "\nPrice: " + priceDifference +
                    "\nCurrency Before: " + wallet +
                    "\nRemaining: " + (wallet - priceDifference) +
                    "```"
                })
            }

        }

    } else if (reactionName == 'wavyheart') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit a **custom badge**" })

        let badges = subscriptions.get(4)
        
        let featureMSG
        let badgeID = 0

        embed2.addFields({ name: '\u200B', value: "**Editable Badge(s): **" })
        badges.forEach((badge, i) => {
            embed2.addFields({ name: badge.name, value: "ID: " + (i + 1) + "\nColor: " + badge.color, inline: true})
        })
        if (badges.length > 1) {
            embed2.addFields({ name: '\u200B', value: "Type the **ID** of the badge you want to edit (i.e. 1)" })
            featureMSG = await msg.author.send({ embeds: [embed2] })

            filter = (m) => m.author.id == msg.author.id
            badgeID = await market.awaitResponse(featureMSG.channel, filter, 30000, false)
            if (await validInput(msg.author, badgeID, badges.length) == false)
                return false
            badgeID = badgeID - 1
            embed2.spliceFields(badges.length + 2, 1)
        } else
            featureMSG = await msg.author.send({ embeds: [embed2] })
        
        embed2.addFields({ name: "\u200B", value: "Do you wish to edit the **name** (<:shek:968122117453393930>) or the **color** (<:srsly:1002091997970042920>)?" })

        let badge = badges[badgeID]
        let badgeOBJ = await wavy.roles.fetch(badges[badgeID].id).catch(err => console.log(err))

        featureMSG.edit({ embeds: [embed2] })
        featureMSG.react("<:shek:968122117453393930>")
        featureMSG.react("<:srsly:1002091997970042920>")

        filter = (reaction, user) => (reaction.emoji.name == 'shek' || reaction.emoji.name == 'srsly') &&
                                      user.id != '813021543998554122'

        reaction = await featureMSG.awaitReactions({ filter, max: 1, time: 30000 }).catch(err => console.log(err))
        
        if (reaction.size < 1) {
            await msg.author.send({ content: "Request Timed Out. Try requesting a new $edit, and try again. *Boomer Fingers*" })
            return false
        }

        reactionName = reaction.first().emoji.name

        filter = (m) => m.author.id == msg.author.id

        let optionMSG
        if (reactionName == 'shek') {
            optionMSG = await msg.author.send({ content: "Current badge name is: " + badge.name + "\nWhat do you want to change the name to?"})
            
            let newName = await market.awaitResponse(optionMSG.channel, filter, 30000, true)
            if (newName == false) {
                await msg.author.send({ content: "Request timed out. Try sending a new $edit request next time "})
                return false
            }

            badge.name = newName

            badges[badgeID] = badge

            badgeOBJ.edit({ name: badge.name }).then(res => console.log("Edited badge name to " + res.name))

            await database.editBadges(msg.author.id, badges)

            await msg.author.send({ content: "Successfully edited the name of your custom badge to " + badge.name})

        } else if (reactionName == 'srsly') {
            optionMSG = await msg.author.send({ content: "Current badge hexcode color: " + badge.color + "\nWhat do you want to change the color to? Enter a valid hexcode." +
                                                            "\n\n*Use this online color picker to get your desired hex code:* <https://htmlcolorcodes.com/color-picker/>" })
        
            let newColor = await market.awaitResponse(optionMSG.channel, filter, 90000, false)
            newColor = await market.validHexColor(optionMSG.channel, newColor)
            if (newColor == false) {
                await msg.author.send({ content: "Request timed out. Try sending a new $edit request next time "})
                return false
            }

            badge.color = newColor

            badges[badgeID] = badge

            badgeOBJ.edit({ color: newColor }).then(res => console.log("Edited badge color to " + res.color))

            await database.editBadges(msg.author.id, badges)

            await msg.author.send({ content: "Successfully edited the color of your custom badge to " + badge.color})
        }

    } else if (reactionName == 'groovy') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit a **restricted nickname**" })

        let nicknames = subscriptions.get(5)

        let featureMSG
        let nicknameID = 0

        embed2.addFields({ name: '\u200B', value: "**Editable Restricted Nickname(s): **" })
        nicknames.forEach((nn, i) => {
            embed2.addFields({ name: nn.username, value: "**ID**: " + (i + 1) + "\nCurrent Nickname: " + nn.newNickname + "\nOld Name: " + nn.oldNickname + "\nExpiration: " + nn.date.toDate().toLocaleDateString(), inline: true })
        })
        if (nicknames.length > 1) {
            embed2.addFields({ name: '\u200B', value: "Type the **ID** of the nickname you want to change (i.e. 1)" })
            featureMSG = await msg.author.send({ embeds: [embed2] })

            filter = (m) => msg.author.id == m.author.id
            nicknameID = await market.awaitResponse(featureMSG.channel, filter, 30000, false)
            if (await validInput(msg.author, nicknameID, nicknames.length) == false)
                return false
            nicknameID = nicknameID - 1
            embed2.spliceFields(nicknames.length + 2, 1)
        } else
            featureMSG = await msg.author.send({ embeds: [embed2] })
        
        let nickname = nicknames[nicknameID]
        let nicknameOBJ = await wavy.members.fetch(nickname.id, { force: true })

        filter = (m) => m.author.id == msg.author.id
        let optionMSG = await msg.author.send({ content: "User: " + nickname.username + " has a restricted nickname of " + nickname.newNickname + "\nWhat do you want to change the nickname to?" })
        let newName = await market.awaitResponse(optionMSG.channel, filter, 30000, true)
        if (newName == false) {
            await msg.author.send({ content: "Request timed out. Try sending a new $edit request next time "})
            return false
        }

        nickname.newNickname = newName
        nicknames[nicknameID] = nickname

        nicknameOBJ.setNickname(newName)

        await market.sendRestrictMessage(nickname, nicknameOBJ)

        let format = await database.getRestrictedNicknames()
        format[msg.author.id] = nicknames
        await database.updateRestrictedNicknames(format)

        await msg.author.send({ content: "Successfully edited the nickname of " + nickname.username + " to " + nickname.newNickname})

    } else if (reactionName == 'aesthetic') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit the **server icon**" })

        let serverIconFormat = subscriptions.get(6)
        let serverIcon = serverIconFormat[msg.author.id]

        embed2.addFields(
            { name: "\u200B", value: "**Editable Server Icon: " },
            { name: "\u200B", value: "**Current Server Icon URL: **" + serverIcon.newIcon }
        )

        let featureMSG = await msg.author.send({ content: "Upload the new server icon as an image.\nAccepted dimensions are strictly **512x512** pixels and **8MB** max size" +
                                                          "\n\nYou can use whatever resize/compress tool, but here's some recs\nImage Resizer: <https://imageresizer.com/>\nImage Compressor: <https://imagecompressor.com/>\nImage Cropper: <https://www.iloveimg.com/crop-image>" })

        let filter = (m) => m.author.id == msg.author.id
        let newIcon = await featureMSG.channel.awaitMessages({ filter, max: 1, time: 90000, errors: ['time'] })
        .catch(err => {
            console.log(err)
            return null
        })
        if (newIcon == null) 
            return false
        
        newIcon = newIcon.first().attachments.values().next().value

        if (newIcon.height != 512 && newIcon.width != 512) {
            await msg.author.send({ content: "The server icon dimensions **must** be **512x512** pixels\n" + 
                                          "The image you uploaded has dimensions of " + newIcon.width + "x" + newIcon.height +
                                          "\n\nResize your image with Image Resizer: <https://imageresizer.com/>"})
            return false
        } else if (newIcon.size >= 8000000) {
            await msg.author.send({ content: "The server icon size **must** be **less than 8MB**" +
                                          "The image you uploaded is of size " + Math.trunc(newIcon.size/1000000) +
                                          "\n\nResize your image with Image Compressor: <https://imagecompressor.com/>"})
            return false
        }

        serverIcon.newIcon = newIcon.url
        serverIconFormat[msg.author.id] = serverIcon

        await database.updateRestrictedServerIcon(serverIconFormat)
        await wavy.setIcon(newIcon.url)

        await msg.author.send({ content: "Successfully edited the server icon. Changes will be actualized shortly" +
                                         "\nYour server icon product expiration is: **" + serverIcon.date.toDate().toLocaleDateString() + "**"})

        return true

    } else if (reactionName == '💎') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit the **server name**" })

        let serverNameFormat = subscriptions.get(7)
        let serverName = serverNameFormat[msg.author.id]

        embed2.addFields(
            { name: "\u200B", value: "**Editable Server Name: **"},
            { name: serverName.newName, value: "Old Name: " + serverName.oldName + "\nExpiration: " + serverName.date.toDate().toLocaleDateString() }
        )
        let featureMSG = await msg.author.send({ embeds: [embed2] })
        filter = (m) => m.author.id == msg.author.id
        let optionMSG = await msg.author.send({ content: "What would you like to change the server name to?"})
        let newServerName = await market.awaitResponse(optionMSG.channel, filter, 30000, true)
        if (newServerName == false) {
            await msg.author.send({ content: "Request Timed Out or Invalid Input. Try sending a new $edit request next time"})
            return false
        }

        let oldName = serverName.newName

        serverName.newName = newServerName
        serverNameFormat[msg.author.id] = serverName

        wavy.setName(newServerName)

        await database.updateRestrictedServerName(serverNameFormat)

        await msg.author.send({ content: "Successfully edited server name from **" + oldName + "** to **" + newServerName + "**"})
    }
}

async function validInput(channel, input, max) {
    if (isNaN(input)) {
        await channel.send({ content: "Please enter a valid number <:PepeKindaCringe:815507957935898654>" })
        return false
    } else if (Number(input) % 1.0 != 0.0) {
        await channel.send({ content: "Why the decimals? Want me to split you up into decimals and fuckin decimate u bish?" })
        return false
    } else if (input < 1) {
        await channel.send({ content: "Input Error: The ID you inputted does not exist. Try sending a new request in market next time"})
        return false
    } else if (input > max) {
        await channel.send({ content: "Input Error: The ID you inputted is too damn high (what the fuck?). Try sending a new request in market next time"})
        return false
    }

    return true
}

module.exports = {
    editCommand: editCommand
}