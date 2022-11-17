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
        console.log("Document written successfully: Market Message");
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

  const doc = await userDB.get();
  if (doc.exists) {
      aggregate_amount = doc.data().currency + amount;
      console.log(doc.data());
  }

  await userDB.update({
      userID: id,
      name: name,
      currency: aggregate_amount
  }).then(() => {
      console.log("Document written successfully");
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
      console.log("Document written successfully");
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
        console.log(doc.data())
    }

    await userDB.update({
        userID: id,
        name: name,
        cum: aggregate_amount
    }).then(() => {
        console.log("Document written successfully")
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
        console.log("Document written successfully: Restricted Nicknames")
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
        console.log("Document written succesfully: Server Name")
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
        console.log("Document written succesfully: Server Icon")
    }).catch(err => {
        console.log("Error: " + err)
    })
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
    getRestrictedNicknames : getRestrictedNicknames,
    updateRestrictedNicknames : updateRestrictedNicknames,
    getRestrictedServerName : getRestrictedServerName,
    updateRestrictedServerName : updateRestrictedServerName,
    getRestrictedServerIcon : getRestrictedServerIcon,
    updateRestrictedServerIcon : updateRestrictedServerIcon,
}