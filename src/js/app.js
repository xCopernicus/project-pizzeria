import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {settings, select} from './settings.js';


const app = {
  initMenu: function() {
    const thisApp = this;
    //console.log('thisApp.data: ', thisApp.data);

    for (const productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function() {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },

  initData: function() {
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();

      });

    console.log('thisApp.data: ', JSON.stringify(thisApp.data));

    thisApp.data = {};
  },

  init: function() {
    const thisApp = this;

    thisApp.initData();
    this.initCart();
  }
};

app.init();
