const database = require('./firebaseSDK')
const Discord = require('discord.js');

let client;

async function getEmbed(c) {
    client = c
    let top5 = await database.getTopWallets();
    let top5Keys = Array.from(top5.keys());
    let top5Values = Array.from(top5.values());
    // console.log([...top5.entries()]);

    const ldbEmbed = await new Discord.MessageEmbed()
	.setColor('#ffffff')
	.setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Leaderboards")
//	.setAuthor('𝒦𝒾𝓃𝑔 𝓌𝒶𝓋𝓎', 'https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
	.setDescription('These are the fattest <:HentaiCoin:814968693981184030> wallets in the server currently.\n Updated hourly.')
	.setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
	.addFields(
        { name: '\u200B', value: '\u200B' },
		{ name: "🥇 : " + await getName(top5Keys[0]), value: top5Values[0] + "   <:HentaiCoin:814968693981184030>" },
        { name: '\u200B', value: '\u200B' },
		{ name: '🥈 : ' + await getName(top5Keys[1]), value: top5Values[1] + "   <:HentaiCoin:814968693981184030>" },
		{ name: '🥉 : ' + await getName(top5Keys[2]), value: top5Values[2] + "   <:HentaiCoin:814968693981184030>" },
        { name: '\u200B', value: '\u200B' },
    )

    for (var i = 3; i < top5Keys.length; i++) {
        ldbEmbed.addField((i + 1) + ": " + await getName(top5Keys[i]), top5Values[i] + "   <:HentaiCoin:814968693981184030>", true)
    }

	ldbEmbed
    .addField('\u200B', '\u200B')
	.setFooter('Updated hourly');

    return ldbEmbed;
}

async function getName(id) {
    let user = await client.users.fetch(id)
    return user.username;
}

module.exports = {
    getEmbed : getEmbed
}