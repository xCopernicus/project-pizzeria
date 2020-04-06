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
    this.dom.carouselBtnActive = this.dom.wrapper.querySelector(select.home.carouselBtnActive);
  }

  carousel(){

  }
}
