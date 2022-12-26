const database = require('./firebaseSDK')
const { EmbedBuilder } = require('discord.js');

async function updateLeaderboards(guild, channel) {
    console.log('updating ldb')

    let boostEmbed = await getBoostEmbed(guild)
    let boostMSG = await database.getLDBBoostMessage()

    let exists = true
    try {
        await channel.messages.fetch(boostMSG)
    } catch(err) {
        console.log("No Boost Leaderboard msg detected: creating new message")
        exists = false
    } finally {
        if (!exists) {
            let msg = await channel.send({ embeds: [boostEmbed] })
            database.updateLDBBoostMessage(msg.id)
        } else {
            let msg = await channel.messages.fetch(boostMSG)
            msg.edit(boostEmbed)
        }
    }

    let currencyEmbed = await getEmbedCurr(guild.members)
    let currencyMSG = await database.getLDBHistoryMessage()

    exists = true
    try {
        await channel.messages.fetch(currencyMSG)
    } catch(err) {
        console.log("No Currency Leaderboard msg detected: creating new message")
    } finally {
        if (!exists) {
            let msg = await channel.send({ embeds: [currencyEmbed] })
            database.updateLDBHistoryMessage(msg.id)
        } else {
            let msg = await channel.messages.fetch(currencyMSG)
            msg.edit(currencyEmbed)
        }
    }
}

async function getBoostEmbed(guild) {
    // Boost role: 812879135487426593

    let boosters = await guild.members.fetch().then(m => CSCmembers = guild.roles.cache.get('812879135487426593').members)
    let topBoosters = new Map()

    boosters.forEach(user => {
        topBoosters.set(user.user.id, user.premiumSince)
    })

    topBoosters = new Map([...topBoosters.entries()].sort((a, b) => a[1].getTime() - b[1].getTime()))
    let names = Array.from(topBoosters.keys())
    let dates = Array.from(topBoosters.values())

    let royalty = await database.getRoyalty()

    await filterDuplicates("boost", royalty, topBoosters)

    const ldbEmbed = new EmbedBuilder()
	.setColor('#ff6ad5')
	.setTitle("【 𝓦 𝓪 𝓿 𝔂 】 Boost Leaderboards")
//	.setAuthor('𝒦𝒾𝓃𝑔 𝓌𝒶𝓋𝓎', 'https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
	.setDescription('These are the top three longest <@&812879135487426593> in the server\nThank you for your support <:wavyheart:893239268309344266>')
	.setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
	.addFields(
        { name: '\u200B', value: '\u200B' },
		{ name: "🥇 : " + await getName(guild.members, names[0]), value: "*since " + dates[0].toLocaleDateString() + "*" },
		{ name: '🥈 : ' + await getName(guild.members, names[1]), value: "*since " + dates[1].toLocaleDateString() + "*" },
		{ name: '🥉 : ' + await getName(guild.members, names[2]), value: "*since " + dates[2].toLocaleDateString() + "*" },
        { name: '\u200B', value: '\u200B' },
    )
	ldbEmbed
	.setFooter({
        text: 'Updated hourly'
    });

    return ldbEmbed;
}

async function getEmbedCurr(members) {
    let top5 = await database.getTopWallets();
    let top5Keys = Array.from(top5.keys());
    let top5Values = Array.from(top5.values());
    
    let royalty = await database.getRoyalty()

    await filterDuplicates("currency", royalty, top5)

    const ldbEmbed = new EmbedBuilder()
	.setColor('#ff6ad5')
	.setTitle("【 𝓦 𝓪 𝓿 𝔂 】 Currency Leaderboards")
//	.setAuthor('𝒦𝒾𝓃𝑔 𝓌𝒶𝓋𝓎', 'https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
	.setDescription('These are the fattest <:HentaiCoin:814968693981184030> sugar daddies of all time in the server')
	.setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
	.addFields(
        { name: '\u200B', value: '\u200B' },
		{ name: "🥇 : " + await getName(members, top5Keys[0]), value: top5Values[0] + "   <:HentaiCoin:814968693981184030>" },
        { name: '\u200B', value: '\u200B' },
		{ name: '🥈 : ' + await getName(members, top5Keys[1]), value: top5Values[1] + "   <:HentaiCoin:814968693981184030>" },
		{ name: '🥉 : ' + await getName(members, top5Keys[2]), value: top5Values[2] + "   <:HentaiCoin:814968693981184030>" },
        { name: '\u200B', value: '\u200B' },
    )

    for (var i = 3; i < top5Keys.length; i++) {
        ldbEmbed.addFields(
            { name: (i + 1) + ": " + await getName(members, top5Keys[i]), value: top5Values[i] + "   <:HentaiCoin:814968693981184030>", inline: true }
        )
    }

	ldbEmbed
    .addFields({ name: '\u200B', value: '\u200B' })
	.setFooter({
        text: 'Updated monthly'
    });

    return ldbEmbed;
}

async function filterDuplicates(type, royalty, ts) {
    let top = [...ts][0][0]

    // If user is fixed, then user always gets boost as royalty
    if (royalty[type].fixed === true)
    database.editRoyalty(type, true, top)

    // If not fixed, check for duplicates
    else {
        let duplicate = false

        for (const [key, value] of Object.entries(royalty))
            if (key != type && top == value.id)
                duplicate = true

        if (duplicate) 
            database.editRoyalty(type, false, [...ts][1][0])
        else
            database.editRoyalty(type, false, top)
    }
}

async function getName(members, id) {
    let member = await members.fetch(id, { force: true })
    return member.user.username;
}

module.exports = {
    updateLeaderboards : updateLeaderboards,
    getEmbedCurr : getEmbedCurr,
    getBoostEmbed : getBoostEmbed
}