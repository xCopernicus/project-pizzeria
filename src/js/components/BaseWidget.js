import {classNames, settings} from '../settings.js';

export class BaseWidget {
  constructor(wrapperElement, initialValue){

    this.dom = {};
    this.dom.wrapper = wrapperElement;
    this.correctValue = initialValue;
  }

  get value(){
    return this.correctValue;
  }

  set value(assignedValue){
    const newValue = this.parseValue(assignedValue);

    if(newValue != this.correctValue && this.isValid(newValue)){
      this.correctValue = newValue;
      this.announce();
    }
    this.renderValue();
    this.btnUnavailable();
  }

  parseValue(newValue){
    if (Number.isInteger(2 * newValue)) {
      return Number(newValue);
    }
  }

  isValid(newValue){
    return !isNaN(newValue);
  }

  renderValue(){
    //console.log('widget value: ', this.value);
  }

  announce(){
    const event = new CustomEvent('updated', {
      bubbles: true,
    });

    this.dom.wrapper.dispatchEvent(event);
  }

  btnUnavailable(){
    const thisWidget = this;

    if (thisWidget.value == settings.amountWidget.defaultMin){
      thisWidget.dom.linkDecrease.classList.add(classNames.widgets.btnUnavailable);
    } else if (thisWidget.value == settings.amountWidget.defaultMax){
      thisWidget.dom.linkIncrease.classList.add(classNames.widgets.btnUnavailable);
    } else {
      thisWidget.dom.linkDecrease.classList.remove(classNames.widgets.btnUnavailable);
      thisWidget.dom.linkIncrease.classList.remove(classNames.widgets.btnUnavailable);
    }
  }
}
