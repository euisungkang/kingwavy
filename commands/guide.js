const { EmbedBuilder } = require('discord.js')
const database = require('../firebaseSDK')

async function guideCommand(channel) {

    let embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Guide")
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
    .addFields(
        { name: "Currency System", value: "<#824106380222005288>: Learn About the 𝓦 𝓪 𝓿 𝔂 currency system\n\n"},
        //{ name: '\u200B', value: '\u200B' },
        { name: "Announcements", value: "<#813132145966186567>: Stay updated on new features and raffles"},
        { name: "Raffles/Giveaways", value: "<#962308831944265768>: Spend coins for a chance at irl rewards"},
        { name: "Market", value: "<#820051777650556990>: Spend coins to buy server perks and features"},
        { name: "Casino", value: "<#825143682139029555>: Learn casino games to earn coins against others"}
    )
    .setFooter({
        text: 'Type ./$help <CommandName>./ for bot commands',
        iconURL: 'https://cdn.discordapp.com/app-icons/812904867462643713/c3713856eae103c4cad96111e26bce21.png?size=512'
    });

    return await channel.send({ embeds: [embed] })
}

module.exports = {
    guideCommand : guideCommand
}