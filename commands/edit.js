const { EmbedBuilder } = require('discord.js');
const database = require('../firebaseSDK');
const market = require('../market')

async function editCommand(client, msg) {
    const wavy = await client.guilds.resolve('687839393444397105')

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
            { name: "React with the corresponding emoji to edit one of your features", value: "\u200B" }
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
                    embed.addFields({ name: nn.newNickname, value: "Old Name: " + nn.oldNickname + "\nExpiration: " + nn.date.toDate().toLocaleDateString() + "\nUsername: " + nn.username, inline: true })
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
    }

    initialMSG.edit({ embeds: [embed] })

    let filter = (reaction, user) => (reaction.emoji.name == '👑' ||
                                        reaction.emoji.name == 'wavyheart' ||
                                        reaction.emoji.name == 'groovy' ||
                                        reaction.emoji.name == 'aesthetic' ||
                                        reaction.emoji.name == '💎') &&
                                        user.id != '813021543998554122'
    
    let reaction = await initialMSG.awaitReactions({ filter, max: 1, time: 30000 })
    .catch(err => console.log(err))

    let reactionName = reaction.first().emoji.name

    let embed2 = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】 $edit command')
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
    
    if (reactionName == '👑') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit a **custom role**" })

        let role = subscriptions.get(rolePurchased)
        let roleOBJ = await wavy.roles.fetch(role.id).catch(err => console.log(err))

        embed2.addFields(
            { name: "Your editable role:",
              value: "Tier: **" + role.tier + "**\nName: **" + role.name + "**\nColor: " + role.color },
            { name: "\u200B", value: "Do you wish to edit the **name** (<:shek:968122117453393930>) or the **color** (<:srsly:1002091997970042920>)?" }
        )

        let featureMSG = await msg.author.send({ embeds: [embed2] })
        featureMSG.react("<:shek:968122117453393930>")
        featureMSG.react("<:srsly:1002091997970042920>")

        filter = (reaction, user) => (reaction.emoji.name == 'shek' || reaction.emoji.name == 'srsly') &&
                                      user.id != '813021543998554122'

        reaction = await featureMSG.awaitReactions({ filter, max: 1, time: 30000 })
        .catch(err => console.log(err))

        reactionName = reaction.first().emoji.name
        filter = (m) => m.author.id == msg.author.id

        let optionMSG

        if (reactionName == 'shek') {
            optionMSG = await msg.author.send({ content: "Current role name is: " + role.name + "\nWhat do you want to change the name to?"})
            
            let newName = await market.awaitResponse(optionMSG.channel, filter, 30000, true)
            if (newName == false) {
                await msg.author.send({ content: "Request timed out. Try sending a new request in market next time "})
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
                await msg.author.send({ content: "Request timed out. Try sending a new request in market next time "})
                return false
            }

            role.color = newColor

            roleOBJ.edit({ color: newColor }).then(res => console.log("Edited role color to " + res.color))

            await database.updateRoles(msg.author.id, role, role.tier)

            await msg.author.send({ content: "Successfully edited the color of your custom role (tier " + role.tier + ") to " + role.color})
        }

    } else if (reactionName == 'wavyheart') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit a **custom badge**" })

        let badges = await database.getBadges(msg.author.id)
        
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
            badgeID = badgeID - 1
            if (badgeID == false) {
                await msg.author.send({ content: "Input Error: Try sending a new request in market next time"})
                return false
            }
        }
        console.log(badges.length)
        embed2.spliceFields(badges.length + 2, 1)
        
        embed2.addFields({ name: "\u200B", value: "Do you wish to edit the **name** (<:shek:968122117453393930>) or the **color** (<:srsly:1002091997970042920>)?" })

        //let badgeOBJ = await wavy.roles.fetch(badges[badgeID].id).catch(err => console.log(err))

        featureMSG.edit({ embeds: [embed2] })
        featureMSG.react("<:shek:968122117453393930>")
        featureMSG.react("<:srsly:1002091997970042920>")

        // STUB: continue badge development

        // filter = (reaction, user) => (reaction.emoji.name == 'shek' || reaction.emoji.name == 'srsly') &&
        //                               user.id != '813021543998554122'

        // reaction = await featureMSG.awaitReactions({ filter, max: 1, time: 30000 })
        // .catch(err => console.log(err))

        // reactionName = reaction.first().emoji.name
        // filter = (m) => m.author.id == msg.author.id

        // let optionMSG

        // if (reactionName == 'shek') {
        //     optionMSG = await msg.author.send({ content: "Current role name is: " + role.name + "\nWhat do you want to change the name to?"})
            
        //     let newName = await market.awaitResponse(optionMSG.channel, filter, 30000, true)
        //     if (newName == false) {
        //         await msg.author.send({ content: "Request timed out. Try sending a new request in market next time "})
        //         return false
        //     }

        //     role.name = newName

        //     roleOBJ.edit({ name: role.name }).then(res => console.log("Edited role name to " + res.name))

        //     await database.updateRoles(msg.author.id, role, role.tier)

        //     await msg.author.send({ content: "Successfully edited the name of your custom role (tier " + role.tier + ") to " + role.name})



        // } else if (reactionName == 'srsly') {
        //     optionMSG = await msg.author.send({ content: "Current role hexcode color: " + role.color + "\nWhat do you want to change the color to? Enter a valid hexcode." +
        //                                                     "\n\n*Use this online color picker to get your desired hex code:* <https://htmlcolorcodes.com/color-picker/>" })
        
        //     let newColor = await market.awaitResponse(optionMSG.channel, filter, 90000, false)
        //     newColor = await market.validHexColor(optionMSG.channel, newColor)
        //     if (newColor == false) {
        //         await msg.author.send({ content: "Request timed out. Try sending a new request in market next time "})
        //         return false
        //     }

        //     role.color = newColor

        //     roleOBJ.edit({ color: newColor }).then(res => console.log("Edited role color to " + res.color))

        //     await database.updateRoles(msg.author.id, role, role.tier)

        //     await msg.author.send({ content: "Successfully edited the color of your custom role (tier " + role.tier + ") to " + role.color})
        // }

    } else if (reactionName == 'groovy') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit a **restricted nickname**" })
    } else if (reactionName == 'aesthetic') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit the **server icon**" })
    } else if (reactionName == '💎') {
        embed2.addFields({ name: "\u200B", value: "You have chosen to edit the **server name**" })
    }

    // Resolve Request
    // Update database and appropriate server features
}

module.exports = {
    editCommand: editCommand
}