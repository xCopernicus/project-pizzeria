/* global flatpickr */

import {select, settings} from '../settings.js';
import {utils} from '../utils.js';
import {BaseWidget} from './BaseWidget.js';

export class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));

    this.dom.input = wrapper.querySelector(select.widgets.datePicker.input);
    this.initPlugin();
  }

  initPlugin(){
    this.minDate = new Date(this.value);
    this.maxDate = utils.addDays(this.minDate, settings.datePicker.maxDaysInFuture);

    flatpickr(this.dom.input, {
      'defaultDate': this.minDate,
      'minDate': this.minDate,
      'maxDate': this.maxDate,
      'locale': {
        'firstDayOfWeek': 1
      },
      'disable': [
        function(date) {
          return (date.getDay() === 1);
        }
      ],
      onChange: function(dateStr){
        this.value = dateStr;
      }
    });
  }

  parseValue(newValue){
    return newValue;
  }

  isValid(){
    return true;
  }

  btnUnavailable(){
  }
}
