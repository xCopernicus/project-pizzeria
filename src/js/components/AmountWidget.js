import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget{
  constructor(element){
    const initValue =  parseInt(element.querySelector(select.widgets.amount.input).value);
    super(element, initValue);

    this.getElements();
    this.btnUnavailable();
    this.initActions();
  }

  getElements(){

    this.dom.input = this.dom.wrapper.querySelector(select.widgets.amount.input);
    this.dom.linkDecrease = this.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    this.dom.linkIncrease = this.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(newValue){
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
  }

  initActions(){
    const thisWidget = this;

    this.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });

    this.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.value -= 0.5;
    });

    this.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.value += 0.5;
    });
  }

  renderValue(){
    //console.log('widget value: ', this.value);
    this.dom.input.value = this.value;
  }
}
