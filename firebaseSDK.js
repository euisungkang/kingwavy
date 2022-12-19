const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(Buffer.from(process.env.DBAuth, "base64").toString("ascii"))
    ),
  });

let db = admin.firestore();

async function getMarketMessage() {
    let meta = await db.collection('market').doc('meta')

    const doc = await meta.get()

    if (doc.exists)
        return doc.data().message

    return false
}

async function updateMarketMessage(msg) {
    let meta = await db.collection('market').doc('meta')

    await meta.update({
        message: msg
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Market Message");
    }).catch(err => {
        console.log("Error: " + err);
    })
}

async function getTopWallets() {
    const wallets = await db.collection('wallets').get();
    let walletmap = new Map();

    wallets.docs.map(doc => {
      //King wavy
      if(doc.data().userID != '813021543998554122')
        walletmap.set(doc.data().userID, doc.data().cum);
    })

    const sorted = await new Map([...walletmap.entries()].sort((a, b) => b[1] - a[1]));

    let index = 0;
    for (let k of sorted.keys()) {
        if (index > 8) {
          sorted.delete(k);
        }
        index++;
    }

    return sorted;
}

async function getProducts() {
  const products = await db.collection('products').get();
  let productArray = [];

  await products.docs.map(doc => {
    productArray.push(doc.data())
  })

  return productArray;
}

async function getCurrency(id) {
  let user = db.collection('wallets').doc(id);

  const doc = await user.get();
  if (doc.exists) {
      return doc.data().currency;
  }

  return 0;
}

async function getCum(id) {
    let user = db.collection("wallets").doc(id);
  
    const doc = await user.get();
    if (doc.exists) {
      return doc.data().cum;
    }
  
    return 0;
}

async function addCurrency(user, amount) {
  let id = user.id
  let name = user.username

  console.log("ID: " + id + "    name:" + name + "    amount: " + amount);

  let userDB = db.collection('wallets').doc(id);
  let aggregate_amount;
  let history = 0

  const doc = await userDB.get();
  if (doc.exists) {
      aggregate_amount = doc.data().currency + amount;
      history = doc.data().history + amount
      console.log(doc.data());
  }

  await userDB.update({
      userID: id,
      name: name,
      currency: aggregate_amount,
      history: history
  }).then(() => {
      console.log("[DATABASE] Document written successfully");
  }).catch(err => {
      console.log("Error: " + err);
  })
};

async function removeCurrency(user, amount) {
  let id = user.id
  let name = user.username

  let userDB = db.collection('wallets').doc(id);
  let aggregate_amount;

  const doc = await userDB.get();
  if (doc.exists) {
      aggregate_amount = doc.data().currency - amount;
      console.log(doc.data());
  }

  await userDB.update({
      userID: id,
      name: name,
      currency: aggregate_amount
  }).then(() => {
      console.log("[DATABASE] Document written successfully");
  }).catch(err => {
      console.log("Error: " + err);
  })
}

async function removeCum(user, amount) {
    let id = user.id
    let name = user.username

    let userDB = db.collection('wallets').doc(id);
    let aggregate_amount;

    const doc = await userDB.get()
    if (doc.exists) {
        aggregate_amount = doc.data().cum - amount;
    }

    await userDB.update({
        userID: id,
        name: name,
        cum: aggregate_amount
    }).then(() => {
        console.log("[DATABASE] Document written successfully")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getRestrictedNicknames() {
  const products = await db.collection('market').doc('nickname')

  const doc = await products.get()

  return doc.data().restricted
}

async function updateRestrictedNicknames(res) {
    let userDB = db.collection('market').doc('nickname')

    await userDB.update({
        restricted: res
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Restricted Nicknames")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getRestrictedServerName() {
    let userDB = db.collection('market').doc('servername')
    let doc = await userDB.get()

    return doc.data().restricted
}

async function updateRestrictedServerName(res) {
    let userDB = db.collection('market').doc('servername')

    await userDB.update({
        restricted: res
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Server Name")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getRestrictedServerIcon() {
    let userDB = db.collection('market').doc('servericon')
    let doc = await userDB.get()

    return doc.data().restricted
}

async function updateRestrictedServerIcon(res) {
    let userDB = db.collection('market').doc('servericon')

    await userDB.update({
        restricted: res
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Server Icon")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getBadges(id) {
    let userDB = db.collection('market').doc('badges')
    
    const doc = await userDB.get()

    return doc.data().badges[id]
}

async function updateBadges(id, badge) {
    let userDB = db.collection('market').doc('badges')

    const doc = await userDB.get()

    let badges = await doc.data().badges

    let newBadge = {
        id: badge.id,
        name: badge.name,
        color: badge.color,
    }

    if (!badges.hasOwnProperty(id))
        badges[id] = [newBadge]
    else
        badges[id].push(newBadge)

    await userDB.update({
        badges: badges
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Custom Badge")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function editBadges(id, bs) {
    let userDB = db.collection('market').doc('badges')
    const doc = await userDB.get()

    let badges = await doc.data().badges

    badges[id] = bs

    await userDB.update({
        badges: badges
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Custom Badges Updated (Whole)")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function editRole(id, role) {
    let userDB = db.collection('market').doc('roles')
    const doc = await userDB.get()

    let roles = await doc.data().roles

    roles[id] = role

    await userDB.update({
        roles: roles
    }).then(() => {
        console.log("[DATABASE] Document written succesfully: Custom Role Updated (Whole)")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function updateRoles(id, role, tier) {
    let userDB = db.collection('market').doc('roles')

    const doc = await userDB.get()

    let roles = await doc.data().roles

    let newRole = {
        id: role.id,
        name: role.name,
        color: role.color,
        tier: tier
    }

    roles[id] = newRole

    await userDB.update({
        roles: roles
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Custom Role")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function hasCustomRole(id) {
    let userDB = db.collection('market').doc('roles')
    const doc = await userDB.get()
    let roles = await doc.data().roles
    
    return roles.hasOwnProperty(id)
}

async function getAllSubscriptions(id) {
    let userDB = db.collection('market')
    const roles = userDB.doc('roles')
    const badges = userDB.doc('badges')
    const nicknames = userDB.doc('nickname')
    const serverName = userDB.doc('servername')
    const serverIcon = userDB.doc('servericon')

    let toReturn = new Map()

    let doc = await roles.get()
    let purchasedRoles = await doc.data().roles
    if (purchasedRoles.hasOwnProperty(id))
        toReturn.set(purchasedRoles[id].tier, purchasedRoles[id])

    doc = await badges.get()
    let purchasedBadges = await doc.data().badges
    if (purchasedBadges.hasOwnProperty(id))
        toReturn.set(4, purchasedBadges[id])

    doc = await nicknames.get()
    let restrictedNicknames = await doc.data().restricted
    if (restrictedNicknames.hasOwnProperty(id))
        toReturn.set(5, restrictedNicknames[id])

    doc = await serverIcon.get()
    let restrictedIcon = await doc.data().restricted
    if (restrictedIcon.hasOwnProperty(id))
        toReturn.set(6, restrictedIcon)

    doc = await serverName.get()
    let restrictedName = await doc.data().restricted
    if (restrictedName.hasOwnProperty(id))
        toReturn.set(7, restrictedName)    
        
    return toReturn
}

async function getRolePositions() {
    let userDB = db.collection('market').doc('meta')
    const doc = await userDB.get()
    let roles = await doc.data().rolePositions

    return roles
}

module.exports = {
    getMarketMessage : getMarketMessage,
    updateMarketMessage : updateMarketMessage,
    getTopWallets : getTopWallets,
    getProducts : getProducts,
    getCurrency : getCurrency,
    getCum : getCum,
    addCurrency : addCurrency,
    removeCurrency : removeCurrency,
    removeCum : removeCum,
    updateBadges : updateBadges,
    getBadges : getBadges,
    editBadges : editBadges,
    updateRoles : updateRoles,
    editRole: editRole,
    hasCustomRole : hasCustomRole,
    getRestrictedNicknames : getRestrictedNicknames,
    updateRestrictedNicknames : updateRestrictedNicknames,
    getRestrictedServerName : getRestrictedServerName,
    updateRestrictedServerName : updateRestrictedServerName,
    getRestrictedServerIcon : getRestrictedServerIcon,
    updateRestrictedServerIcon : updateRestrictedServerIcon,
    getAllSubscriptions : getAllSubscriptions,
    getRolePositions : getRolePositions
}