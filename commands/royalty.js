const { EmbedBuilder } = require('discord.js')
const database = require('../firebaseSDK')

async function royaltyCommand(client, channel) {
    let royalty = [];
    let royaltyIDS = (Object.entries(await database.getRoyalty())).map(([key, value]) => [key, value.id])

    const wavy = await client.guilds.resolve('687839393444397105')

    await royaltyIDS.forEach(async (r, i) => {
        royalty[i] = await wavy.members.fetch(r[1], { force: true })
    })

    let embed = await getEmbed(royalty, royaltyIDS)

    await channel.send({ embeds: [embed] })
}

async function getEmbed(royalty, IDS) {
    let embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】Royalty')
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
    
    royalty.addFields({ name: "These are the <@&813024016776167485> of 𝓦 𝓪 𝓿 𝔂", value: "\u200B" })

    royalty.forEach(async (r, i) => {
        embed.addFields({ name: r.user.username, value: IDS[i][0] })
    })

    return embed
}

module.exports = {
    royaltyCommand : royaltyCommand
}