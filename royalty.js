const database = require('./firebaseSDK')
const { EmbedBuilder } = require('discord.js')

async function updateRoyalty(members, roles, currRoyalty) {
    console.log("updating royalty")

    let royalty = await database.getRoyalty()
    let royaltyIDS = (Object.values(royalty)).map(({ id }) => id)

    let royaltyRoleOBJ = await roles.fetch('813024016776167485', { force: true })

    // Assign royalty role
    royaltyIDS.forEach(async r => {
        let target = await members.fetch(r, { force: true })

        if (!target.roles.cache.has('813024016776167485')) {
            console.log("Added " + target.user.id + " (" + target.user.username + ") to Royalty")
            await target.roles.add(royaltyRoleOBJ)
        }
    })

    currRoyalty.forEach(async r => {
        let target = await members.fetch(r, { force: true })

        if (target.roles.cache.has('813024016776167485') && !royaltyIDS.includes(target.user.id)) {
            console.log("Removed " + target.user.id + " (" + target.user.username + ") from Royalty")
            await target.roles.remove(royaltyRoleOBJ)
        }
    })
}

module.exports = {
    updateRoyalty : updateRoyalty
}