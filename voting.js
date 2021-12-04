async function votingSystem() {
    let vc = await client.channels.fetch('824740900567646248')
    let m = await vc.messages.fetch('824740965214060574')
    let e = await new Discord.MessageEmbed()
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
    let e = await new Discord.MessageEmbed()
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