import {templates} from '../settings.js';

export class Home {
  constructor(homeWidget){


    this.render(homeWidget);
  }

  render(homeWidget){
    const html = templates.home();

    this.dom = {};
    this.dom.wrapper = homeWidget;
    this.dom.wrapper.innerHTML = html;
  }
}
