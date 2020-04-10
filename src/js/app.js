import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {Booking} from './components/Booking.js';
import {Home} from './components/Home.js';
import {settings, select, classNames} from './settings.js';


const app = {
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
    console.log(this.pages);

    this.navLinks = Array.from(document.querySelectorAll(select.nav.links));
    console.log(this.navLinks);

    let pagesMatchingHash = [];

    if (window.location.hash.length > 2) {
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page){
        return page.id == idFromHash;
      });
    }

    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);

    for (const link of this.navLinks) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const id = link.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
      });
    }
  },

  activatePage: function(pageId) {
    for (const link of this.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for (const page of this.pages) {
      page.classList.toggle(classNames.nav.active, page.getAttribute('id') == pageId);
    }

    window.location.hash = '#/' + pageId;
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
