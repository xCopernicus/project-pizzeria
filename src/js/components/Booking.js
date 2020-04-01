import {select, classNames, settings, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';

export class Booking {

  constructor(bookingWidget){
    this.render(bookingWidget);
    this.initWidgets();
    this.getData();
  }

  render(bookingWidget){
    const html = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = bookingWidget;
    this.dom.wrapper.innerHTML = html;
    //console.log(this.dom.wrapper);
    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets(){
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.datePicker = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);

    const thisBooking = this;
    this.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }

  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };


    //console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      })
      .catch(function(err) {
        alert('Error!' + err);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    //console.log('bookings: ', bookings);
    //console.log('eventsCurrent: ', eventsCurrent);
    //console.log('eventsRepeat: ', eventsRepeat);

    this.booked = {};

    for (const eventCurrent of eventsCurrent){
      this.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
    }

    for (const booking of bookings){
      this.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    }

    for (const eventRepeat of eventsRepeat){
      for (let i = 0; i <= settings.datePicker.maxDaysInFuture; i++){
        let date = utils.dateToStr(utils.addDays(eventRepeat.date, i));
        this.makeBooked(date, eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
      }
    }
    //console.log('this.booked: ', this.booked);
    this.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const hourStr = utils.hourToNumber(hour);
    if (!this.booked[date]) this.booked[date] = {};

    if (!this.booked[date][hourStr]) this.booked[date][hourStr] = [];
    this.booked[date][hourStr].push(table);

    if (!this.booked[date][hourStr + duration - 0.5]) this.booked[date][hourStr + duration - 0.5] = [];
    this.booked[date][hourStr + duration - 0.5].push(table);

    for (let i  = hourStr + 0.5; i < hourStr + duration - 0.5; i += 0.5){
      if (!this.booked[date][i]) this.booked[date][i] = [];
      this.booked[date][i].push(table);
    }
  }

  updateDOM(){
    this.date = this.datePicker.value;
    this.hour = utils.hourToNumber(this.hourPicker.value);

    for (const table of this.dom.tables){
      const tableNo = parseInt(table.getAttribute(settings.booking.tableIdAttribute));

      if (this.booked[this.date][this.hour] && this.booked[this.date][this.hour].includes(tableNo)){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
}
