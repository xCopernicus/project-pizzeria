import {select, templates} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';

export class Booking {

  constructor(bookingWidget){
    this.render(bookingWidget);
    this.initWidgets();
  }

  render(bookingWidget){
    const html = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = bookingWidget;
    this.dom.wrapper.innerHTML = html;
    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
  }
}
