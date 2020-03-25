import {select, classNames, settings} from '../settings.js';

export class AmountWidget {
  constructor(element){
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.getElements();
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.btnUnavailable();
    thisWidget.initActions();

    //console.log('thisWidget: ', thisWidget);
    //console.log('Constructor Arg: ', thisWidget.element);
  }

  getElements(){
    const thisWidget = this;

    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);
    //console.log(newValue);

    if (settings.amountWidget.defaultMin <= newValue && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
      thisWidget.announce();
      thisWidget.btnUnavailable();
    }

    thisWidget.input.value = thisWidget.value;

  }

  btnUnavailable(){
    const thisWidget = this;

    if (thisWidget.value == settings.amountWidget.defaultMin){
      thisWidget.linkDecrease.classList.add(classNames.widgets.btnUnavailable);
    } else if (thisWidget.value == settings.amountWidget.defaultMax){
      thisWidget.linkIncrease.classList.add(classNames.widgets.btnUnavailable);
    } else {
      thisWidget.linkDecrease.classList.remove(classNames.widgets.btnUnavailable);
      thisWidget.linkIncrease.classList.remove(classNames.widgets.btnUnavailable);
    }
  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);

  }
}
