const database = require('./firebaseSDK')
const { EmbedBuilder } = require('discord.js')

async function updateRoyalty(members, currRoyalty) {
    console.log("updating royalty")

    let royalty = await database.getRoyalty()

    console.log(royalty)
    console.log(currRoyalty)

    currRoyalty.forEach(async r => {
        let target = await members.fetch(r, { force: true })
    })
}

module.exports = {
    updateRoyalty : updateRoyalty
}