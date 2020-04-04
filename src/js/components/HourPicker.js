/* global rangeSlider */

import {select, settings} from '../settings.js';
import {utils} from '../utils.js';
import {BaseWidget} from './BaseWidget.js';

export class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);

    this.dom.input = wrapper.querySelector(select.widgets.hourPicker.input);
    this.dom.output = wrapper.querySelector(select.widgets.hourPicker.output);
    this.initPlugin();
    this.value = this.dom.input.value;
  }

  initPlugin(){
    const thisWidget = this;
    this.minHour = settings.hours.open;
    this.maxHour = settings.hours.close;

    rangeSlider.create(this.dom.input);

    this.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  parseValue(newValue){
    return utils.numberToHour(newValue);
  }

  isValid(){
    return true;
  }

  renderValue(){
    this.dom.output.innerHTML = this.value;
  }

  btnUnavailable(){

  }
}
