// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlu_EBXjKPS3SygjiOs3p4MolE_Jf71Ww",
  authDomain: "lista-casamento-5752e.firebaseapp.com",
  projectId: "lista-casamento-5752e",
  storageBucket: "lista-casamento-5752e.appspot.com",
  messagingSenderId: "64989080392",
  appId: "1:64989080392:web:4ba0d830e7092b9553617d"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();

let giftList = [];
let _routeParams = '';

async function getAllItems() {
  giftList = [];
  return new Promise((res, rej) => {
    db.collection("items").get().then((qs) => {
      qs.forEach(item => {
        giftList.push(item.data());
      });
      res();
    }).catch((e) => rej(e));
  })
}

function updateItem(itemQuery, obj) {
  db.collection("items").where(itemQuery[0], "==", itemQuery[1]).get().then((querySnapshot) => {
    querySnapshot.forEach((item) => {
      const data = {...item.data(), ...obj};
      db.collection("items").doc(item.id).update(data);
    });
  }).catch((e) => console.error(e))
}

function updateItemById(id, data) {
  return new Promise((res, rej) => {
    db.collection("items").where('id', "==", id).get().then((querySnapshot) => {
      querySnapshot.forEach((item) => {
        const dataItem = {...item.data(), ...data}
        db.collection("items").doc(item.id).update(dataItem).then(() => res()).catch((e) => rej(e));
      })
    }).catch((e) => console.error(e))
  });
}

function payForItem(id, nome) {
  updateItemById(id, {pagoPor: nome}).then(() => {
    console.log('atualizou');
    navigateTo('agradecimento');
  }).catch((e) => console.error(e));
}

function renderGiftList() {
  const giftListEl = $('.gift-list ul');

  giftList.forEach((giftItem) => {
    const li = document.createElement('li');
    li.classList.add('item-card');
    const giftImage = document.createElement('img');
    giftImage.src = giftItem.imageUrl;
    const giftTitle = document.createElement('p');
    giftTitle.classList.add('card-text');
    giftTitle.innerText = giftItem.item;
    const giftPrice = document.createElement('p');
    giftPrice.classList.add('card-price');
    giftPrice.innerText = `R$${giftItem.preco},00`;
    const giftButton = document.createElement('button');
    giftButton.classList.add('primary-btn');
    giftButton.innerText = 'Presentear';
    giftButton.addEventListener('click', () => {
      navigateTo('presente', giftItem);
    })
    li.append(giftImage);
    li.append(giftTitle);
    li.append(giftPrice);
    li.append(giftButton);
    giftListEl.append(li);
  })
}

async function initHome() {
  await getAllItems();
  renderGiftList();
}

function initPresente() {
  const giftInfoTitulo = $('#giftInfoTitulo');
  const giftInfoPreco = $('#giftInfoPreco');
  const nome = $('#nome');
  const concluirBtn = $('#concluirBtn');

  giftInfoTitulo.text(_routeParams.item);
  giftInfoPreco.text(`R$${_routeParams.preco},00`);
  console.log(concluirBtn);
  concluirBtn.click(() => {
    payForItem(_routeParams.id, nome.val())
  })
}

function setBackHomeBtn() {
  const voltarListaBtn = document.querySelector('#voltarListaBtn');
  voltarListaBtn.addEventListener('click', () => {
    navigateTo('home');
  });
}

function navigateTo(route, params) {
  _routeParams = params;
  $('#mainContainer').load(`/lista-casamento/pages/${route}.html`, async () => {
    if (route === 'home') {
      await initHome();
    } else if (route === 'presente') {
      setBackHomeBtn();
      initPresente();
    }
    $("html, body").animate({ scrollTop: 0 }, 0);
  });
}

$('document').ready(async () => {
  navigateTo('home');
})