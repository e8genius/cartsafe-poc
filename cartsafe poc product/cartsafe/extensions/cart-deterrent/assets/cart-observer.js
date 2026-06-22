(function() {
  let isUpdating = false;

  // Add CSS to hide express checkout buttons when cart is active
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .cartsafe-hide-express .additional-checkout-buttons,
    .cartsafe-hide-express .shopify-payment-button,
    .cartsafe-hide-express [data-shopify-buttoncontainer="true"],
    .cartsafe-hide-express .dynamic-checkout__buttons,
    .cartsafe-hide-express .additional-checkout-buttons--device-button {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    .cartsafe-warning-banner {
      background-color: #fff5f5;
      border: 1px solid #fc8181;
      color: #c53030;
      padding: 12px;
      margin: 15px 0;
      border-radius: 6px;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
      display: none;
    }
  `;
  document.head.appendChild(styleEl);

  function createWarningBanner() {
    let banner = document.querySelector('.cartsafe-warning-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'cartsafe-warning-banner';
      banner.innerText = 'CartSafe Margin Guard: Promo codes and gift cards cannot be stacked. Express checkout (Apple Pay/Google Pay) is disabled to prevent stacking. Please proceed through standard checkout.';
      
      // Try to find checkout button to insert banner before it
      const checkoutBtn = document.querySelector('[name="checkout"], .checkout-button, .cart__submit');
      if (checkoutBtn && checkoutBtn.parentNode) {
        checkoutBtn.parentNode.insertBefore(banner, checkoutBtn);
      } else {
        // Fallback: prepend to cart form or container
        const cartForm = document.querySelector('form[action="/cart"], .cart-container');
        if (cartForm) {
          cartForm.prepend(banner);
        }
      }
    }
    return banner;
  }

  async function checkCartState() {
    if (isUpdating) return;
    
    // Check if the guard is disabled via shop settings
    if (window.CartSafe && window.CartSafe.isActive === false) {
      document.body.classList.remove('cartsafe-hide-express');
      const banner = document.querySelector('.cartsafe-warning-banner');
      if (banner) banner.style.display = 'none';
      
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();
        const currentDiscountAttr = cart.attributes && cart.attributes._discount_active;
        if (currentDiscountAttr === 'true') {
          isUpdating = true;
          await fetch('/cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attributes: {
                _discount_active: 'false'
              }
            })
          });
          isUpdating = false;
          console.log(`[CartSafe] Cart protection disabled, reset _discount_active attribute to: false`);
        }
      } catch (err) {
        console.error('[CartSafe] Error resetting cart state:', err);
        isUpdating = false;
      }
      return;
    }

    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();

      // Check if any discount codes or automated discounts are applied
      const hasDiscount = (cart.cart_level_discount_applications && cart.cart_level_discount_applications.length > 0) ||
                          (cart.items && cart.items.some(item => item.discounts && item.discounts.length > 0));

      const currentDiscountAttr = cart.attributes && cart.attributes._discount_active;
      const targetDiscountAttr = hasDiscount ? 'true' : 'false';

      // 1. Manage Warning UI & Express Buttons
      const banner = createWarningBanner();
      if (hasDiscount) {
        document.body.classList.add('cartsafe-hide-express');
        if (banner) banner.style.display = 'block';
      } else {
        document.body.classList.remove('cartsafe-hide-express');
        if (banner) banner.style.display = 'none';
      }

      // 2. Sync Cart Attribute on Backend if it has changed
      if (currentDiscountAttr !== targetDiscountAttr) {
        isUpdating = true;
        await fetch('/cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attributes: {
              _discount_active: targetDiscountAttr
            }
          })
        });
        isUpdating = false;
        console.log(`[CartSafe] Cart attribute _discount_active updated to: ${targetDiscountAttr}`);
      }
    } catch (err) {
      console.error('[CartSafe] Error checking cart state:', err);
      isUpdating = false;
    }
  }

  // Intercept Fetch and XHR to capture dynamic AJAX cart updates
  const originalFetch = window.fetch;
  window.fetch = function() {
    return originalFetch.apply(this, arguments).then(response => {
      const url = arguments[0];
      if (typeof url === 'string' && (url.includes('/cart/add') || url.includes('/cart/change') || url.includes('/cart/update') || url.includes('/cart/clear') || url.includes('/discount/'))) {
        // Debounce to allow cart state to settle
        setTimeout(checkCartState, 500);
      }
      return response;
    });
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener('load', function() {
      const url = this.responseURL;
      if (url && (url.includes('/cart/add') || url.includes('/cart/change') || url.includes('/cart/update') || url.includes('/cart/clear') || url.includes('/discount/'))) {
        setTimeout(checkCartState, 500);
      }
    });
    return originalSend.apply(this, arguments);
  };

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCartState);
  } else {
    checkCartState();
  }

  // Fallback observer to ensure buttons are hidden if DOM elements render late
  const observer = new MutationObserver(() => {
    const hasExpressClass = document.body.classList.contains('cartsafe-hide-express');
    if (hasExpressClass) {
      createWarningBanner().style.display = 'block';
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
