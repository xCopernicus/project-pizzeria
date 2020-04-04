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
    this.chooseTable();
    console.log(this);
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
    this.dom.phone = this.dom.wrapper.querySelector(select.booking.phone);
    this.dom.address = this.dom.wrapper.querySelector(select.booking.address);
    this.dom.bookTableBtn = this.dom.wrapper.querySelector(select.booking.bookTableBtn);
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

    this.dom.bookTableBtn.addEventListener('click', function(){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(this.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(this.datePicker.maxDate);

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

    console.log('getData urls', urls);

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
      .catch(function(err){
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
        let date = utils.dateToStr(utils.addDays(this.datePicker.minDate, i));
        this.makeBooked(date, eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
      }
    }
    console.log('this.booked: ', this.booked);
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
    this.duration = parseInt(this.hoursAmount.dom.input.value);

    for (const table of this.dom.tables){
      const tableNo = parseInt(table.getAttribute(settings.booking.tableIdAttribute));

      if (this.booked[this.date] && this.booked[this.date][this.hour] && this.booked[this.date][this.hour].includes(tableNo)){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

      table.classList.remove('clicked');
    }

    console.log(this.booked);
  }

  chooseTable(){

    const thisBooking = this;

    for (const tableAll of this.dom.tables){
      tableAll.addEventListener('click', function(){
        if(!tableAll.classList.contains('booked')){
          tableAll.classList.toggle('clicked');
          for (const tableClicked of thisBooking.dom.tables){
            if (!(tableAll == tableClicked)){
              tableClicked.classList.remove('clicked');
            }
          }
        }
      });
    }
  }

  sendBooking(){

    const thisBooking = this;

    this.clickedTable = this.dom.wrapper.querySelector('.floor-plan .clicked');
    const tableNo = parseInt(this.clickedTable.getAttribute(settings.booking.tableIdAttribute));

    let booking = {
      date: this.date,
      hour: this.hourPicker.value,
      table: tableNo,
      repeat: false,
      duration: parseInt(this.hoursAmount.dom.input.value),
      ppl: parseInt(this.peopleAmount.dom.input.value),
      starters: [],
      phone: parseInt(this.dom.phone.value),
      address: this.dom.address.value,
    };

    const url = settings.db.url + '/' + settings.db.booking;


    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
        thisBooking.getData();
      })
      .catch(function(err){
        alert(err);
      });
  }
}
