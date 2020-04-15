import {select, templates} from '../settings.js';
import {utils} from '../utils.js';

export class Home {
  constructor(homeWidget){
    this.slideAuto = 1;
    this.render(homeWidget);
    this.carousel();
    this.links();
  }

  render(homeWidget){
    const thisHome = this;
    const html = templates.home();

    this.dom = {};
    this.dom.wrapper = homeWidget;
    this.dom.wrapper.innerHTML = html;

    this.dom.order = this.dom.wrapper.querySelector(select.home.order);
    this.dom.booking = this.dom.wrapper.querySelector(select.home.booking);
    this.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    this.navLinks = Array.from(document.querySelectorAll(select.nav.links));
    this.dom.carouselBtns = this.dom.wrapper.querySelectorAll(select.home.carouselBtns);
    this.dom.slides = this.dom.wrapper.querySelectorAll(select.home.slides);

    window.onpopstate = function(){
      const currentLocation = window.location.hash.replace('#/', '');
      if(currentLocation === 'home'){
        thisHome.startInterval();
      } else {
        thisHome.stopInterval();
      }
    };
  }

  links(){
    const thisHome = this;

    this.dom.order.addEventListener('click', (event) => {
      event.preventDefault();
      const id = this.dom.order.getAttribute('href').replace('#', '');
      utils.activatePage(id, thisHome.navLinks, thisHome.pages);
    });

    this.dom.booking.addEventListener('click', (event) => {
      event.preventDefault();
      const id = this.dom.booking.getAttribute('href').replace('#', '');
      utils.activatePage(id, thisHome.navLinks, thisHome.pages);
    });
  }

  startInterval() {
    const thisHome = this;

    this.interval = setInterval(function(){
      console.log('Interval');

      thisHome.dom.carouselBtns[thisHome.slideAuto].dispatchEvent(new Event('click'));
      thisHome.slideAuto < (thisHome.dom.slides.length - 1) ? thisHome.slideAuto++ : thisHome.slideAuto = 0;
    }, 3000);
  }

  stopInterval() {
    clearInterval(this.interval);
  }

  carousel(){
    const thisHome = this;
    const currentLocation = window.location.hash.replace('#/', '');

    if(currentLocation === 'home'){
      this.startInterval();
    };

    for (let index1 = 0; index1 < this.dom.slides.length; index1++){
      const slide1 = this.dom.slides[index1];
      const button1 = this.dom.carouselBtns[index1];

      slide1.style.transform = 'translateX(' + 100 * (index1) + '%)';
      button1.addEventListener('click', function(){
        thisHome.slideAuto = index1;
        for (let index2 = 0; index2 < thisHome.dom.slides.length; index2++){
          const slide2 = thisHome.dom.slides[index2];
          const button2 = thisHome.dom.carouselBtns[index2];

          slide2.style.transform = 'translateX(' + 100 * ((index2) - (index1)) + '%)';
          button2.classList.remove('btn-carousel--active');
        }
        button1.classList.add('btn-carousel--active');
      });
    }
  }
}
