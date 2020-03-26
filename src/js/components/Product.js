import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product {
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    //thisProduct.allActive();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //console.log('New product: ', thisProduct);
  }

  allActive(){
    const thisProduct = this;
    thisProduct.element.classList.add(classNames.menuProduct.wrapperActive);

  }

  renderInMenu(){
    const thisProduct = this;

    /* [DONE] generate html based on a template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* [DONE] create element using utils.reateElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    thisProduct.accordionTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      const articlesActive =  document.querySelectorAll(select.all.menuProductsActive);
      for (let articleActive of articlesActive){
        if (thisProduct.element != articleActive) {
          articleActive.classList.remove(classNames.menuProduct.wrapperActive);
        }
      }
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log('initOrderForm:');

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (const input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

    thisProduct.amountWidgetElem.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
  }

  processOrder(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData: ', formData);

    thisProduct.params = {};

    let price = thisProduct.data.price;

    for (const paramID in thisProduct.data.params){
      for (const optionID in thisProduct.data.params[paramID].options){
        const imgClass = '.' + paramID + '-' + optionID;
        const imgsActive = thisProduct.imageWrapper.querySelectorAll(imgClass);
        if (formData[paramID] && formData[paramID].includes(optionID)){
          if (!thisProduct.params[paramID]){
            thisProduct.params[paramID] = {
              label: thisProduct.data.params[paramID].label,
              options: {}
            };
          }
          thisProduct.params[paramID].options[optionID] = thisProduct.data.params[paramID].options[optionID].label;
          for(const imgActive of imgsActive){
            imgActive.classList.add(classNames.menuProduct.imageVisible);
          }
          if (!thisProduct.data.params[paramID].options[optionID].default){
            price += thisProduct.data.params[paramID].options[optionID].price;
          }
        } else {
          for(const imgActive of imgsActive){
            imgActive.classList.remove(classNames.menuProduct.imageVisible);
          }
          if (thisProduct.data.params[paramID].options[optionID].default){
            price -= thisProduct.data.params[paramID].options[optionID].price;
          }
        }
      }
    }

    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', thisProduct.processOrder());
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}
