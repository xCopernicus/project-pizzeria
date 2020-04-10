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
    //console.log(this);
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
    this.dom.water = this.dom.wrapper.querySelector(select.booking.water);
    this.dom.bread = this.dom.wrapper.querySelector(select.booking.bread);
    this.dom.bookTableBtn = this.dom.wrapper.querySelector(select.booking.bookTableBtn);
  }

  initWidgets(){
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount, 0.5);
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
      closed: settings.db.repeatParam + '&' + utils.queryParams(endDate),
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
    //console.log('getData params', params);

    const urls = {
      closed: settings.db.url + '/' + settings.db.closed + '?' + params.closed,
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.closed),
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([closedResponse, bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          closedResponse.json(),
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([closed, bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(closed, bookings, eventsCurrent, eventsRepeat);
      })
      .catch(function(err){
        alert('Error!' + err);
      });
  }

  parseData(closed, bookings, eventsCurrent, eventsRepeat){
    //console.log('closedResponse: ', closedResponse);
    //console.log('bookings: ', bookings);
    //console.log('eventsCurrent: ', eventsCurrent);
    //console.log('eventsRepeat: ', eventsRepeat);

    this.booked = {};

    for (const close of closed){
      console.log(close);
      for (let i = 0; i <= settings.datePicker.maxDaysInFuture; i++){
        let date = utils.dateToStr(utils.addDays(this.datePicker.minDate, i));
        this.makeBooked(date, close.hour, close.duration, close.table);
      }
    }

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
    this.duration = parseInt(this.hoursAmount.value);

    for (const table of this.dom.tables){
      for (let i = 0; i < this.duration; i += 0.5){

        const tableNo = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
        if (this.hour + i >= 24) {
          this.hour = 0;
        }

        if (this.booked[this.date] && this.booked[this.date][this.hour + i] && this.booked[this.date][this.hour + i].includes(tableNo)){
          table.classList.add(classNames.booking.tableBooked);
          break;
        } else {
          table.classList.remove(classNames.booking.tableBooked);
        }
      }
      table.classList.remove(classNames.booking.tableClicked);
    }
    //console.log(this.booked);
  }

  chooseTable(){

    const thisBooking = this;

    for (const table of this.dom.tables){
      table.addEventListener('click', function(){
        if(!table.classList.contains(classNames.booking.tableBooked)){
          table.classList.toggle(classNames.booking.tableClicked);
          for (const tableClicked of thisBooking.dom.tables){
            if (!(table == tableClicked)){
              tableClicked.classList.remove(classNames.booking.tableClicked);
            }
          }
        }
      });
    }
  }

  sendBooking(){

    const thisBooking = this;

    this.clickedTable = this.dom.wrapper.querySelector(select.booking.clickedTable);
    const tableNo = parseInt(this.clickedTable.getAttribute(settings.booking.tableIdAttribute));

    let booking = {
      date: this.date,
      hour: this.hourPicker.value,
      table: tableNo,
      repeat: false,
      duration: this.hoursAmount.value,
      ppl: this.peopleAmount.value,
      starters: [],
      phone: this.dom.phone.value,
      address: this.dom.address.value,
    };

    if(this.dom.water.checked){
      booking.starters.push(settings.booking.water);
    }

    if (this.dom.bread.checked) booking.starters.push(settings.booking.bread);



    const url = settings.db.url + '/' + settings.db.booking;


    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    };

    fetch(url, options)
      .then(response => response.json())
      .then(parsedResponse => {
        console.log('parsedResponse: ', parsedResponse);
        thisBooking.getData();
      })
      .catch(err => alert(err));
  }
}
