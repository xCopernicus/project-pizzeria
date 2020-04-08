import {select, templates} from '../settings.js';

export class Home {
  constructor(homeWidget){
    this.render(homeWidget);
    this.carousel();
  }

  render(homeWidget){
    const html = templates.home();

    this.dom = {};
    this.dom.wrapper = homeWidget;
    this.dom.wrapper.innerHTML = html;

    this.dom.carouselBtns = this.dom.wrapper.querySelectorAll(select.home.carouselBtns);
    this.dom.slides = this.dom.wrapper.querySelectorAll(select.home.slides);
    console.log(this.dom.slides);
  }

  carousel(){
    const thisHome = this;
    let slideAuto = 1;

    window.setInterval(function(){

      thisHome.dom.carouselBtns[slideAuto].dispatchEvent(new Event('click'));
      slideAuto < (thisHome.dom.slides.length - 1) ? slideAuto++ : slideAuto = 0;
    }, 5000);

    for (let index1 = 0; index1 < this.dom.slides.length; index1++){
      const slide1 = this.dom.slides[index1];
      const button1 = this.dom.carouselBtns[index1];

      slide1.style.transform = 'translateX(' + 100 * (index1) + '%)';
      button1.addEventListener('click', function(){
        slideAuto = index1;
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
