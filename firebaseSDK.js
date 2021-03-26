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

module.exports = {
    getTopWallets : getTopWallets,
    getProducts : getProducts,
    getCurrency : getCurrency
}