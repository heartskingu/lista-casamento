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

const appHistory = [];
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

function payForItem(id, nome, valor = 0) {
  const prop = {
    pagoPor: nome
  };
  if (_routeParams.leilao) {
    prop.preco = valor
  }
  updateItemById(id, prop).then(() => {
    if (_routeParams.leilao) {
      db.collection("historico_leilao").doc().set({
        data: new Date().toString(),
        nome,
        preco: valor
      }).then((res) => console.log(res)).catch(err => console.log(err));
    }
    navigateTo('agradecimento');
  }).catch((e) => console.error(e));
}

function renderGiftList() {
  const giftListEl = $('.gift-list ul');

  giftList = giftList.sort((itemA, itemB) => {
    return itemA.preco - itemB.preco;
  });

  giftList = giftList.sort((itemA, itemB) => {
    if (itemA.leilao) {
      return -1;
    }
    if (itemB.leilao) {
      return 1;
    }

    const pagoA = itemA.pagoPor ? 1 : 0;
    const pagoB = itemB.pagoPor ? 1 : 0;
    return pagoA - pagoB;
  })

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
    giftButton.innerText = !giftItem.leilao ? 'Presentear' : 'Participar';
    if (giftItem.pagoPor && !giftItem.leilao) {
      $(giftButton).prop('disabled', true);
      giftButton.innerText = 'Já presenteado';
    }
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
  const itemImg = $('#itemImg');
  const giftInfoTitulo = $('#giftInfoTitulo');
  const giftInfoPreco = _routeParams.leilao ? $('#giftInfoPrecoLeilao') : $('#giftInfoPreco');
  const inputNome = $('#inputNome');
  const nome = inputNome.find('input');
  const concluirBtn = $('#concluirBtn');
  const vipCard = $('#VIPInfo');
  const inputValor = $('#inputValor');
  const inputValorIn = inputValor.find('input');
  const copiarCPF = $('#copiarCPF');
  const qrCodeImg = $('#qrCodeImg');
  const infoCard1 = $('#infoCard1');
  const infoCard2 = $('#infoCard2');
  const infoCard2Title = infoCard2.find('h2.info-card-title');
  const infoCard2Text = infoCard2.find('p.info-card-text');

  itemImg.attr('src', _routeParams.imageUrl);
  qrCodeImg.attr('src', `res/qr-code/${_routeParams.preco}.png`);

  infoCard1.css('display', !_routeParams.leilao ? 'none' : 'block');

  if (_routeParams.leilao) {
    infoCard1.css('display', 'none');
    infoCard2Title.text('Como participar');
    infoCard2Text.html('Insira um valor maior do que o último lance, depois seu nome completo e clique em concluir. A coroação e o pagamento serão realizados no <b>dia do casamento</b> para o maior lance.')
  } else {
    infoCard1.css('display', 'block');
    infoCard2Title.text('PASSO 2:');
    infoCard2Text.text('Após realizar o pagamento, insira seu nome completo no campo abaixo e clique no botão concluir. Qualquer problema iremos entrar em contato :)');
  }
  
  // copiarCPF.click(() => {
  //   navigator.clipboard.writeText('10323795960');
  //   alert('Chave copiada!');
  // });

  var inputValorInEl = inputValorIn.get()[0];
  var maskOptions = {
    mask: [
      { mask: '' },
      {
          mask: 'R$num',
          lazy: false,
          blocks: {
              num: {
                  mask: Number,
                  scale: 0,
                  thousandsSeparator: '',
                  padFractionalZeros: true,
              }
          }
      }
    ]
  };
  IMask(inputValorInEl, maskOptions);

  vipCard.css('display', !_routeParams.leilao ? 'none' : 'flex');
  inputValor.css('display', !_routeParams.leilao ? 'none' : 'flex');

  giftInfoTitulo.text(_routeParams.item);
  giftInfoPreco.text(`${_routeParams.leilao ? _routeParams.pagoPor + ' - ' : ''}R$${_routeParams.preco},00`);

  let invalidForm = false;

  nome.focusout(() => {
    if (!nome.val()) {
      nome.attr('invalid', true);
      inputNome.find('.invalid-input-text').attr('invalid', true);
      invalidForm = true;
    } else {
      nome.attr('invalid', false);
      inputNome.find('.invalid-input-text').attr('invalid', false);
    }
  })

  inputValorIn.focusout(() => {
    const inputValorVal = +inputValorIn.val().replace('R$', '');
    if (_routeParams.leilao && inputValorVal <= _routeParams.preco) {
      inputValorIn.attr('invalid', true);
      inputValor.find('.invalid-input-text').attr('invalid', true);
      invalidForm = true;
    } else {
      inputValorIn.attr('invalid', false);
      inputValor.find('.invalid-input-text').attr('invalid', false);
    }
  })

  concluirBtn.click(() => {
    if (!nome.val()) {
      nome.attr('invalid', true);
      inputNome.find('.invalid-input-text').attr('invalid', true);
      invalidForm = true;
    } else {
      nome.attr('invalid', false);
      inputNome.find('.invalid-input-text').attr('invalid', false);
    }

    const inputValorVal = +inputValorIn.val().replace('R$', '');
    if (_routeParams.leilao && inputValorVal <= _routeParams.preco) {
      inputValorIn.attr('invalid', true);
      inputValor.find('.invalid-input-text').attr('invalid', true);
      invalidForm = true;
    } else {
      inputValorIn.attr('invalid', false);
      inputValor.find('.invalid-input-text').attr('invalid', false);
    }

    if (invalidForm) {
      return;
    }
    payForItem(_routeParams.id, nome.val(), inputValorVal || 0)
  })
}

function setBackHomeBtn() {
  const voltarListaBtn = document.querySelector('#voltarListaBtn');
  voltarListaBtn.addEventListener('click', () => {
    navigateTo('home');
  });
}

function navigateTo(route, params) {
  appHistory.push(route);
  _routeParams = params;
  $('#mainContainer').load(`/pages/${route}.html`, async () => {
    const url = new URL(location);
    url.searchParams.set('page', route);
    history.pushState({}, "", url);

    if (route === 'home') {
      await initHome();
    } else if (route === 'presente') {
      setBackHomeBtn();
      initPresente();
    } else if (route === 'agradecimento') {
      setBackHomeBtn();
    }
    $("html, body").animate({ scrollTop: 0 }, 0);
  });
}

function criarItemFirestore(obj) {
  db.collection("items").doc()
    .set({id: obj.id, idPagamento: obj.idPagamento, imageUrl: obj.imageUrl, item: obj.item, pagoPor: obj.pagoPor, preco: 0})
    .then((res) => console.log(res)).catch(err => console.log(err));
}

function criarItem(id, idPagamento, imageUrl, item, preco = 0) {
  const imageId = imageUrl.split('/')[5]
  return {
    id,
    idPagamento,
    imageUrl: 'https://drive.google.com/uc?id=' + imageId,
    item,
    pagoPor: '',
    preco
  };
}

function createID(){
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

$('document').ready(async () => {
  navigateTo('home');
  
  window.addEventListener('popstate', function(event) {
    appHistory.pop();
    navigateTo(appHistory[appHistory.length - 1]);
}, false);

  // const items = [
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/10xY79vY1hYsr7AZnXD8qvPAPb2kYlRh4/view?usp=sharing', '1 ano de ração super premium para os gatos'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1pL8fAuyyOzEDvPCF9dYx8zvJ41ij2Dj6/view?usp=sharing', '0.01% da lua de mel'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1BvXNGhyRe50uPxRm07pZFNZdluOMDotM/view?usp=sharing', 'Jantar romântico para o casal'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1yPnOfkYZwifh4HZ-YzDU-lrbvyP3jdlQ/view?usp=sharing', '1 ano de cinema'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1CVaZikuvGrx_pIEvEw6F0KSSuhhl99OM/view?usp=sharing', 'Sessão iMax'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1Kg1riS5eliqR7P_GbkutAQAUXaCM9gwV/view?usp=sharing', '1 ano de cinema com pipoca'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1WDgvm-3cBXp7GxlowenS9rinM9LoY3SH/view?usp=sharing', '1 ano de Netflix'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1Gm0J_Sy21zJ-yKudPlQs-IUGraelKjMH/view?usp=sharing', '1 ano de Amazon Prime'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1jZqwCfXjobRO88mJyLjWOuA8SXWngHQX/view?usp=sharing', '1 ano de HBO Max'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1XE751ikUiOUKYaD2YT8lX326GVEZuoNB/view?usp=sharing', '1 ano de Disney+ '),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1_ibDXA_PTd7Sz1EdMtKfTPsNC-NidNq_/view?usp=sharing', '1 ano de Star+'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1p1KmejJ4ICpLGLYs_or8uTzVpAXUkC5p/view?usp=sharing', '1 ano de Paramount+'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1h2_7UHfngIeS71umvllCdXSqyNLpFv_Q/view?usp=sharing', '1 ano de Apple TV'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/18-JhDUVbNDU-8oWdjAcShown9crdjk5J/view?usp=sharing', '1 ano de Crunchyroll'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1M3p82D1xVUgJWwx9acH7iTul1EjK2gTH/view?usp=sharing', 'Decoração para casa'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1At5QFFRBAqoG7azM0xUFe-spZ73XLt7b/view?usp=sharing', 'GoPro'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/12ORIMkwjM6RUh-PzrBoeEVlUDXunbmq8/view?usp=sharing', 'Jogos de tabuleiro'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1OVLiGy3S1iOB5KJ4M-rrOocthuUzz7D_/view?usp=sharing', 'Lego'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1l0x1cUWg8fIrFUXRqLzZFsuwm2jMh_jN/view?usp=sharing', 'Tanque cheio'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1w9Hz1DiZ-uHo7tLFKLnIMeds66jyGHKV/view?usp=sharing', 'Castelo de gato'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/14owE73IOBYjNnsLCLy1QYTd5oYM9E3hl/view?usp=sharing', 'Leitor de livros digital'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/173Y4BWsB1_5NWXXabJLTauM-3r80vwKy/view?usp=sharing', 'Álbum de fotos do casamento '),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1oK9b9ir-HBO2F4BeU6T9bhWwc_oXBaRZ/view?usp=sharing', 'Fechadura digital '),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/19FBhjbZMOgPgjkhGViqd2ItRujknbqT8/view?usp=sharing', 'Filme para polaroid '),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1vxu0_rxuLPWDDRLUs7SIVRA_mw0d8EIO/view?usp=sharing', '1 diária em hotel all inclusive '),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1sYWqPXR2oe1dFIHJtfKXyihDwoa5XwrD/view?usp=sharing', 'Cesta de cafe da manha'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1KBc_afJjCJbc_lQfAShWEksZv1lzMnY2/view?usp=sharing', 'Pijama combinando'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1QpPpm7nAZDngIgqdUr3ONsbG7z1FU9DM/view?usp=sharing', 'Máquina de pipoca'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1T2vg_ExUn9oKK7KD8TtQnHVfIGTrt7ui/view?usp=sharing', 'Conjunto Fondue'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1BnLbwtPbJH5RJXbab_8oOguzEKfhls3Q/view?usp=sharing', 'Frigobar Retrô'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1I9HztX4_dEjah_TXY7e1XbBVF_p9oTmD/view?usp=sharing', 'Cesta de piquenique'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1ffoloVa-4EOIvMV0VtIkTyw5YxTCjeB4/view?usp=sharing', 'JBL'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1Ou2E5HnrApJJB8F3FlAZcctF7sA-9vts/view?usp=sharing', '1 ano de Nescafé'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1W8hBJ0BFMjQGLhk5E6ubA-3Ff-Cocm8n/view?usp=sharing', 'Maquina de sorvete'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/18Pv2AhNu9xtjciFt2r-iBdPsbCWppvlz/view?usp=sharing', 'Sabre de luz'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1El94MD7DMcpmSyU2O5Yis31scDinc4iT/view?usp=sharing', 'Máquina de waffles'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/13ssINuUtyfiPK6NkdFSs3hTusxB6lbT6/view?usp=sharing', 'Cadeira de escritório'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1xVkrmILk7R8fY54UsN_UUcoPN_6MQTtF/view?usp=sharing', 'Coleção de mangá'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1313MwYE0thbDkQz6uTkyORUkSQETfiWF/view?usp=sharing', 'Monitor curvado'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1AbZwgLWhpUQHQQqvn-EBmriCWZo7Yi6l/view?usp=sharing', 'Conjunto de taça '),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1hPqJgKef--wEG6lSWF-xxs1U-G86WFVl/view?usp=sharing', 'Chalé na serra'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1EzE4rAI_t2mtgAHelEw9YWTux89PHeDS/view?usp=sharing', 'Conjunto de toalhas'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/17ervw3Y7i1hhiMcMYvwZiSRxZE7DzD1x/view?usp=sharing', 'Conjunto de roupa de cama'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/17RCbwmNcfO0CzSGyPt8DqceX9zNBIe6M/view?usp=sharing', '6 meses de pizza'),
  //   criarItem(createID(), createID(), 'https://drive.google.com/file/d/1OZXdYhzzgh6rY6CTy8QSY7uAN21o6Dn9/view?usp=sharing', '6 meses de hamburguer'),
  // ]

  // items.forEach(item => criarItemFirestore(item))
})