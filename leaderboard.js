const database = require('./firebaseSDK')
const Discord = require('discord.js');

async function getEmbedCurr(c) {
    let top5 = await database.getTopWallets();
    let top5Keys = Array.from(top5.keys());
    let top5Values = Array.from(top5.values());
    // console.log([...top5.entries()]);

    const ldbEmbed = await new Discord.MessageEmbed()
	.setColor('#ff6ad5')
	.setTitle("【 𝓦 𝓪 𝓿 𝔂 】 Currency Leaderboards")
//	.setAuthor('𝒦𝒾𝓃𝑔 𝓌𝒶𝓋𝓎', 'https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
	.setDescription('These are the fattest <:HentaiCoin:814968693981184030> sugar daddies of all time in the server')
	.setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
	.addFields(
        { name: '\u200B', value: '\u200B' },
		{ name: "🥇 : " + await getName(c, top5Keys[0]), value: top5Values[0] + "   <:HentaiCoin:814968693981184030>" },
        { name: '\u200B', value: '\u200B' },
		{ name: '🥈 : ' + await getName(c, top5Keys[1]), value: top5Values[1] + "   <:HentaiCoin:814968693981184030>" },
		{ name: '🥉 : ' + await getName(c, top5Keys[2]), value: top5Values[2] + "   <:HentaiCoin:814968693981184030>" },
        { name: '\u200B', value: '\u200B' },
    )

    for (var i = 3; i < top5Keys.length; i++) {
        ldbEmbed.addField((i + 1) + ": " + await getName(c, top5Keys[i]), top5Values[i] + "   <:HentaiCoin:814968693981184030>", true)
    }

	ldbEmbed
    .addField('\u200B', '\u200B')
	.setFooter('Updated hourly');

    return ldbEmbed;
}

async function getEmbedBoost(c) {
    // Boost role: 812879135487426593

    let wavy = await c.guilds.cache.get('687839393444397105')
    let boosters = await wavy.members.fetch().then(m => CSCmembers = wavy.roles.cache.get('812879135487426593').members)

    //console.log(await boosters.get('237018129664966656'))
    let topBoosters = new Map()

    boosters.forEach(user => {
        topBoosters.set(user.user.username, user.premiumSince)
    })

    topBoosters = new Map([...topBoosters.entries()].sort((a, b) => a[1].getTime() - b[1].getTime()))
    let names = Array.from(topBoosters.keys())
    let dates = Array.from(topBoosters.values())

    const ldbEmbed = await new Discord.MessageEmbed()
	.setColor('#ff6ad5')
	.setTitle("【 𝓦 𝓪 𝓿 𝔂 】 Boost Leaderboards")
//	.setAuthor('𝒦𝒾𝓃𝑔 𝓌𝒶𝓋𝓎', 'https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
	.setDescription('These are the top three longest <@&812879135487426593> in the server\nThank you for your support <:wavyheart:893239268309344266>')
	.setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
	.addFields(
        { name: '\u200B', value: '\u200B' },
		{ name: "🥇 : " + names[0], value: "*since " + dates[0].toLocaleDateString() + "*" },
		{ name: '🥈 : ' + names[1], value: "*since " + dates[1].toLocaleDateString() + "*" },
		{ name: '🥉 : ' + names[2], value: "*since " + dates[2].toLocaleDateString() + "*" },
        { name: '\u200B', value: '\u200B' },
    )
	ldbEmbed
	.setFooter('Updated hourly');

    return ldbEmbed;
}

async function getName(c, id) {
    let user = await c.users.fetch(id)
    return user.username;
}

module.exports = {
    getEmbedCurr : getEmbedCurr,
    getEmbedBoost : getEmbedBoost
}