import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {Booking} from './components/Booking.js';
import {Home} from './components/Home.js';
import {settings, select} from './settings.js';
import {utils} from './utils.js';


const app = window.app = {
  initMenu: function() {
    const thisApp = this;
    console.log('thisApp.data: ', thisApp.data);

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
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        console.log('parsedResponse: ', parsedResponse);

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      })
      .catch(err => alert(err));

    thisApp.data = {};
  },

  initPages: function() {
    const thisApp = this;

    this.pages = Array.from(document.querySelector(select.containerOf.pages).children);

    this.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    let pagesMatchingHash = [];

    if (window.location.hash.length > 2) {
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page){
        return page.id == idFromHash;
      });
    }

    utils.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id, thisApp.navLinks, thisApp.pages);

    for (const link of this.navLinks) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const id = link.getAttribute('href').replace('#', '');
        utils.activatePage(id, thisApp.navLinks, thisApp.pages);
      });
    }
  },

  initBooking: function() {
    const bookingWidget = document.querySelector(select.containerOf.booking);

    new Booking(bookingWidget);
  },

  initHome: function(){
    const homeWidget = document.querySelector(select.containerOf.home);
    console.log(homeWidget);

    new Home(homeWidget);
  },

  init: function() {
    console.log('thisApp: ', this);

    this.initPages();
    this.initHome();
    this.initData();
    this.initCart();
    this.initBooking();
  }
};

app.init();
