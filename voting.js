const { EmbedBuilder } = require('discord.js');

async function votingSystem() {
    let vc = await client.channels.fetch('824740900567646248')
    let m = await vc.messages.fetch('824740965214060574')
    let e = new EmbedBuilder()
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Channel Names")
    .setDescription("React with the emoji corresponding to whichever name you like. "
                +   "You can vote for multiple names. The names with the most votes will be added to 𝓪𝓻𝓬𝓪𝓭𝓮. \n\n"
                +   "**Wavy members can continue giving suggestions and the list will be updated**\n\n"
                +   "**NOTE** These names are not final, they can be edited to fit the vaporwave theme once voted on")
    .setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: '微 𝕨𝕖𝕚 𝕓𝕚 笔', value: '🔥'},
        { name: 'ꜱʜᴀᴛᴛᴇʀᴇᴅ ᴅɪꜱᴋ', value: '☕'},
        { name: '日本語プレス 1', value: '🎇'},
        { name: 'joystation', value: '🙏'},
        { name: 'deluxe edition', value: '🚬'},
        { name: 'Neon Public', value: '🚀'},
        { name: 'Dialup Dreams', value: '😍'},
        { name: 'Gucci Gang', value: '🚷'},
        { name: 'Obunga Boys', value: '👨🏿'},
        { name: "Lion's Libido", value: '🦁'}
    )

    m.react('🔥')
    m.react('☕')
    m.react('🎇')
    m.react('🙏')
    m.react('🚬')
    m.react('🚀')
    m.react('😍')
    m.react('🚷')
    m.react('👨🏿')
    m.react('🦁')
    m.edit(e)
}

async function votingSystem() {
    let vc = await client.channels.fetch('888391559442223205')
    let m = await vc.messages.fetch('888397457975808060')
    let e = new EmbedBuilder()
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Banner Vote")
    .setDescription("React with the emoji corresponding to whichever banner you like. "
                +   "You can vote for multiple banners. The banner with the most votes will be added to 𝓪𝓻𝓬𝓪𝓭𝓮. \n\n"
                +   "Emojis correspond to each image from **top to down**\n")
    .setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: '1     🔥', value: '\u200B'},
        { name: '2     ☕', value: '\u200B'},
        { name: '3     🎇', value: '\u200B'},
        { name: '4     🙏', value: '\u200B'},
    )

    m.react('🔥')
    m.react('☕')
    m.react('🎇')
    m.react('🙏')
    m.edit(e)
}

async function votingSystemPP(client) {
    let vc = await client.channels.fetch('970076413413691412')
    let m = await vc.messages.fetch('970292465561137242')
    let e = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Profile Picture Vote")
    .setDescription("React with the emoji corresponding to whichever picture/gif you like. "
                +   "You can vote for multiple pics. The one with the most votes will be the new server picture. \n\n"
                +   "Emojis correspond to each image from **top to down**\n")
    .setThumbnail('https://cdn.discordapp.com/app-icons/813021543998554122/63a65ef8e3f8f0700f7a8d462de63639.png?size=512')
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: '1     🔥', value: '\u200B'},
        { name: '2     ☕', value: '\u200B'},
        { name: '3     🎇', value: '\u200B'},
        { name: '4     🙏', value: '\u200B'},
        { name: '5     🐟', value: '\u200B'}
    )

    m.react('🔥')
    m.react('☕')
    m.react('🎇')
    m.react('🙏')
    m.react('🐟')
    m.edit(e)
}

//https://help.minecraft.net/hc/en-us/articles/360046470431-Minecraft-Types-of-Biomes
async function votingSystem() {
    let vc = await client.channels.fetch('970076413413691412')
    let m = await vc.messages.fetch('917677585209630750')
    let e = new EmbedBuilder()
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】 Minecraft Server v2: Starting Biome")
    .setDescription("Due to sufficient demand, we will be restarting the 【 𝓦 𝓪 𝓿 𝔂 】 Minecraft server. "
                +   "This vote will decide which biome the spawning point will be set at. \n\n"
                +   "The link below lists all the available biomes.\n"
                +   "> https://help.minecraft.net/hc/en-us/articles/360046470431-Minecraft-Types-of-Biomes\n\n"
                +   "**You can vote for as many biomes as you want**")
    .setThumbnail('https://i.ibb.co/5kL7hBD/Wavy-Logo.png')
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: 'Plains     🌿', value: '\u200B'},
        { name: 'Forest     🌳', value: '\u200B'},
        { name: 'Jungle     🐵', value: '\u200B'},
        { name: 'Mountain     ⛰️', value: '\u200B'},
        { name: 'Desert     ☀️', value: '\u200B'},
        { name: 'Taiga     🐯', value: '\u200B'},
        { name: 'Snowy Tundra     ❄️', value: '\u200B'},
        { name: 'Swamp     💩', value: '\u200B'},
        { name: 'Savannah     🦙', value: '\u200B'},
        { name: 'Badlands     🍂', value: '\u200B'},
        { name: 'Ocean     🌊', value: '\u200B'},
        { name: 'Nether     🔥', value: '\u200B'},
    )

    m.react('🌿')
    m.react('🌳')
    m.react('🐵')
    m.react('⛰️')
    m.react('☀️')
    m.react('🐯')
    m.react('❄️')
    m.react('💩')
    m.react('🦙')
    m.react('🍂')
    m.react('🌊')
    m.react('🔥')
    m.edit(e)
}

module.exports = {
    votingSystemPP : votingSystemPP
}