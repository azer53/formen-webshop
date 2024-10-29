if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

dyCheckout = {};

function removeDoubleCheckoutReviewFields()
{
  // document.getElementById('gui-form-newsletter').remove();
  // document.getElementById('gui-form-terms').remove();
  const guiformGuiconfirm = document.querySelector('.gui-form.gui-confirm');
  
  if( guiformGuiconfirm )
  {
    guiformGuiconfirm.remove();
  }
}

function hydrateCheckoutTotalSum()
{
  const reviewSumElem = document.querySelector('#gui-block-review .gui-cart-sum');   
  document.getElementById('checkout-total-sum').innerHTML = reviewSumElem.innerHTML;
  
  document.getElementById('checkout-total-sum').querySelector('.gui-item.gui-right').remove();
}

const checkoutProcessFlowMap = {
  'gui-block-billing-address' : {
    'prev': false,
    'next': 'gui-block-shipping-address',
  },
  'gui-block-shipping-address' : {
    'prev': 'gui-block-billing-address',
    'next': 'gui-block-shipment-method',
  },
  'gui-block-shipment-method' : {
    'prev': 'gui-block-shipping-address',
    'next': 'gui-block-payment-method',
  },
  'gui-block-payment-method' : {
    'prev': 'gui-block-shipment-method',
    'next': 'gui-block-review',
  }
};

function enableBuyButton()
{
  
}

  document.addEventListener('DOMContentLoaded', function()
                            {

if( theme.checkout.theme == 'onepage' )
{
  dyCheckout.buyButton = {
    show: function()
    {
      $('.checkout-buy-button').addClass('checkout-buy-button-visible');
      sessionStorage.setItem('checkout_buy_button_visible', true);
      dyCheckout.buyButton.isVisible = true;
    },
    isVisible: false,
    init: function()
    {
      if( sessionStorage.getItem('checkout_buy_button_visible') || theme.checkout.data.terms === true )
      {
        dyCheckout.buyButton.show();
        return;
      }
      
      const orderSubmitBlock = document.getElementById('submit-order-block');
      let buyButtonIsVisible = false;

      const orderReviewObserver = new IntersectionObserver(function(entries)
      {
        if(entries[0].isIntersecting === true && !dyCheckout.buyButton.isVisible)
        { 
          dyCheckout.buyButton.show();

          orderReviewObserver.unobserve(orderSubmitBlock);
        }
      });

      orderReviewObserver.observe(orderSubmitBlock);
    }
  };
  
  // Remap titles
  const checkoutStepTitleMap = {
  	'gui-block-payment-method': 'Review your order'
	};
    
  // Move terms popup
	const newParent = document.getElementById('gui-form');
	const termsPopover = document.getElementById('gui-popover-terms-and-conditions');
  if( termsPopover ) // only if terms box is  found, if page is empty, it does not exists
  {
  newParent.appendChild(termsPopover.cloneNode(true));
  
  termsPopover.remove();
  }
  
  // Move order confirm block to payment step
  const submitOrdeBlockElem = document.getElementById('submit-order-block');
  const paymentButtonsElem = document.getElementById('gui-form-payment-method').querySelector('.gui-buttons');
  
  if( window.innerWidth > 767 )
  {
  console.log('payelem')
  console.log(paymentButtonsElem);
  
  paymentButtonsElem.parentNode.insertBefore( submitOrdeBlockElem, paymentButtonsElem);
  submitOrdeBlockElem.classList.add('loaded');
  
  // Remove original checkboxes from confirm
  // if( window.innerWidth > 767 )
  // {
  removeDoubleCheckoutReviewFields();
  }
  else if(submitOrdeBlockElem)
  {
    // or remove because on mobile were using the default
    submitOrdeBlockElem.remove();
  }
  
  // Init totals
  hydrateCheckoutTotalSum();
  
  
  
  
  const guiCheckoutSteps = document.querySelectorAll('.gui-checkout-steps .gui-step');
  const currentCheckoutStep = theme.checkout.data.step;

  let currentStepId = 'gui-block-billing-address';

  switch( currentCheckoutStep )
  {
    case 'shipping':
      currentStepId = 'gui-block-shipping-address';
      break;
    case 'shipment':
      currentStepId = 'gui-block-shipment-method';
      break;
    case 'payment':
    case 'review':
    case 'confirm':
      currentStepId = 'gui-block-payment-method';
      break;
  }

  const currentStepElement = document.getElementById(currentStepId);

  //currentStepElement.classList.add('theme-checkout-step-active');


  function toggleFollowingStepElement()
  {
    guiCheckoutSteps.forEach(function(elem, index)
    {
      elem.classList.remove('theme-checkout-step-active');
    });

    const targetId = this.getAttribute('data-toggle-step');
    const direction = this.getAttribute('data-toggle-direction');
    let targetElem = document.getElementById(targetId);

    if( targetElem.classList.contains('gui-hide') )
    {
      let currentFlowMap = checkoutProcessFlowMap[targetId];
      let nextElemToToggle = currentFlowMap[direction];

      targetElem = nextElemToToggle ? document.getElementById(nextElemToToggle) : targetElem;
    }

    // let currentFlowMap = checkoutProcessFlowMap[targetId];

    // let prevStepElem = currentFlowMap.prev ? document.getElementById(currentFlowMap.prev) : false;
    // let nextStepElem = currentFlowMap.next ? document.getElementById(currentFlowMap.next) : false;

    theme.log('Toggling '+targetElem.id);
    targetElem.classList.add('theme-checkout-step-active');
  }

  function toggleStepElement()
  {
    const parent = this.parentElement;
    
    guiCheckoutSteps.forEach(function(elem, index)
    {
      elem.classList.remove('theme-checkout-step-active');
    });
    
    parent.classList.toggle('theme-checkout-step-active');
  }
  
  function addStepButton(stepId, type, holder)
  {
    console.log('AddStepButton for step: '+stepId);
    let currentFlowMap = checkoutProcessFlowMap[stepId];

    let prevStepElem = currentFlowMap.prev ? document.getElementById(currentFlowMap.prev) : false;
    let nextStepElem = currentFlowMap.next ? document.getElementById(currentFlowMap.next) : false;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('button', 'ml-2');

    if( prevStepElem )
    {
      const prevButton = button.cloneNode();
      prevButton.classList.add('button-lined');
      prevButton.innerHTML = 'Previous';
      prevButton.setAttribute('data-toggle-step', currentFlowMap.prev);
      prevButton.setAttribute('data-toggle-direction', 'prev');

      prevButton.onclick = toggleFollowingStepElement;

      holder.appendChild(prevButton);
    }

    if( nextStepElem )
    {
      button.innerHTML = 'Next step';
      button.setAttribute('data-toggle-step', currentFlowMap.next);
      button.setAttribute('data-toggle-direction', 'next');

      button.onclick = toggleFollowingStepElement;

      holder.appendChild(button);
    }
  }

  guiCheckoutSteps.forEach(function(elem, index)
  {
    console.log('guiCheckoutSteps: '+elem.id);
    return;
    
    const buttons = elem.querySelector('.gui-buttons');
    buttons.classList.add('d-flex', 'justify-content-end');

    buttons.innerHTML = '';

    addStepButton(elem.id, 'next', buttons);
    
    
    elem.querySelector('.gui-block-title').onclick = toggleStepElement;
    
  });
  
  let checkoutReviewObserver = new MutationObserver( function(mutations)
	{
    hydrateCheckoutTotalSum();
    
    if( window.innerWidth > 767 )
    {
    	removeDoubleCheckoutReviewFields();
    }
    
    console.log(mutations);
  });

  checkoutReviewObserver.observe( document.getElementById('gui-block-review'), {
  characterDataOldValue: true, 
  subtree: true, 
  childList: true, 
  characterData: true
  });
  
  
  // check if review block has been seen,
  // so we can enable the buy button
 
  dyCheckout.buyButton.init();

  if( window.innerWidth > 767 )
  {
    const cc = $id('checkout-cart-content');
    const cb = $id('checkout-confirm-button');

    isFixed = false;
    let initialOffset = 0;

    const cbObserver = new IntersectionObserver(function(entries)
    {
      if(entries[0].isIntersecting === true && !isFixed)
      {
        //initialOffset = cc.getBoundingClientRect().top + window.pageYOffset;
        initialOffset = window.pageYOffset;

        console.log('cb intersecting');
        isFixed = true;

        cc.style.transform = 'translateY(-'+(cc.scrollHeight-window.innerHeight+65)+'px)';
        cc.style.width = cc.scrollWidth+'px';
        cc.style.position = 'fixed';
        cc.style.top = '50px';
      }
    }, {
      threshold: 1.0
    });

    document.addEventListener('scroll', function(e)
    {
      if( isFixed === true )
      {
        console.log('InitialOffset: '+initialOffset);

        if( window.pageYOffset <= initialOffset )
        {
          cc.style.transform = 'none';
          cc.style.width = 'auto';
          cc.style.position = 'static';
          cc.style.top = '0';

          isFixed = false;
        }
      }
    });

    if( cc.getBoundingClientRect().top >= 0 && (cc.scrollHeight) <= window.innerHeight )
    {
      cc.style.position = 'sticky';
      cc.style.top = '25px';
    }
    else
    {
      cbObserver.observe(cb);
    }
  }
}

});