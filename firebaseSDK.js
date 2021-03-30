const admin = require("firebase-admin");
const serviceAccount = require("./wavy-46a75-firebase-adminsdk-3pwsf-20426075e0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

async function getTopWallets() {
    const wallets = await db.collection('wallets').get();
    let walletmap = new Map();

    wallets.docs.map(doc => {
      //King wavy
      if(doc.data().userID != '813021543998554122')
        walletmap.set(doc.data().userID, doc.data().currency);
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

  await userDB.set({
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

  await userDB.set({
      userID: id,
      name: name,
      currency: aggregate_amount
  }).then(() => {
      console.log("Document written successfully");
  }).catch(err => {
      console.log("Error: " + err);
  })
}

module.exports = {
    getTopWallets : getTopWallets,
    getProducts : getProducts,
    getCurrency : getCurrency,
    addCurrency : addCurrency,
    removeCurrency : removeCurrency
}