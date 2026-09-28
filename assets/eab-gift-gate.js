(() => {
  if (window.__eabGiftGateStarted) return;
  window.__eabGiftGateStarted = true;

  const GATE_SELECTOR = '[data-eab-gift-gate]';
  const READY_CLASS = 'is-eab-gift-ready';
  const GIFT_ROOT_ID = 'servicify-gift';
  const GIFT_TOGGLE_ID = 'servicify-gift-toggle';
  const GIFT_FORM_ID = 'servicify-gift-form';
  const GIFT_MODAL_ID = 'servicify-gift-modal';

  const gateForms = () => document.querySelectorAll(GATE_SELECTOR);

  const isFilled = (input) => Boolean(input && !input.disabled && String(input.value || '').trim());

  const isGiftComplete = () => {
    const toggle = document.getElementById(GIFT_TOGGLE_ID);
    const root = document.getElementById(GIFT_ROOT_ID);
    if (!toggle || !toggle.checked || !root) return false;

    const summary = root.querySelector('.sg-summary');
    const summarySaved = Boolean(summary && !summary.hidden && !summary.hasAttribute('hidden'));

    const nameInput = root.querySelector('[data-gift="name"]');
    const emailInput = root.querySelector('[data-gift="email"]');
    const dateInput = root.querySelector('[data-gift="date"]');
    const fieldsSaved = isFilled(nameInput) && isFilled(emailInput) && (!dateInput || dateInput.disabled || isFilled(dateInput));

    return summarySaved || fieldsSaved;
  };

  const syncGate = (form) => {
    const ready = isGiftComplete();
    form.classList.toggle(READY_CLASS, ready);
    form.querySelectorAll('[type="submit"][name="add"], .product-form__submit').forEach((button) => {
      if (ready) {
        button.removeAttribute('aria-hidden');
        if (button.dataset.eabGiftDisabled === 'true') {
          button.removeAttribute('disabled');
          delete button.dataset.eabGiftDisabled;
        }
      } else {
        button.setAttribute('aria-hidden', 'true');
        if (!button.disabled) {
          button.dataset.eabGiftDisabled = 'true';
          button.setAttribute('disabled', 'disabled');
        }
      }
    });
  };

  const syncAll = () => {
    gateForms().forEach(syncGate);
  };

  const onProductSubmit = (event) => {
    const form = event.target.closest(GATE_SELECTOR);
    if (!form || isGiftComplete()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const observeGiftUi = () => {
    const observed = new Set();

    const watch = (node) => {
      if (!node || observed.has(node)) return;
      observed.add(node);
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['hidden', 'disabled', 'value', 'checked', 'open'],
        childList: true,
        subtree: true,
      });
    };

    const observer = new MutationObserver(() => {
      watch(document.getElementById(GIFT_ROOT_ID));
      watch(document.getElementById(GIFT_MODAL_ID));
      requestAnimationFrame(syncAll);
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    watch(document.getElementById(GIFT_ROOT_ID));
    watch(document.getElementById(GIFT_MODAL_ID));
  };

  const start = () => {
    document.addEventListener(
      'submit',
      (event) => {
        if (event.target && event.target.id === GIFT_FORM_ID) {
          requestAnimationFrame(syncAll);
          setTimeout(syncAll, 50);
          setTimeout(syncAll, 250);
          return;
        }
        onProductSubmit(event);
      },
      true
    );

    document.addEventListener(
      'change',
      (event) => {
        const target = event.target;
        if (!target) return;
        if (
          target.id === GIFT_TOGGLE_ID ||
          target.closest?.('#servicify-gift') ||
          target.closest?.('#servicify-gift-form')
        ) {
          requestAnimationFrame(syncAll);
        }
      },
      true
    );

    document.addEventListener(
      'click',
      (event) => {
        if (event.target?.closest?.('#servicify-gift, #servicify-gift-modal')) {
          requestAnimationFrame(syncAll);
          setTimeout(syncAll, 50);
        }
      },
      true
    );

    document.addEventListener('close', (event) => {
      if (event.target && event.target.id === GIFT_MODAL_ID) syncAll();
    });

    document.addEventListener('cancel', (event) => {
      if (event.target && event.target.id === GIFT_MODAL_ID) {
        requestAnimationFrame(syncAll);
        setTimeout(syncAll, 50);
      }
    });

    document.addEventListener('shopify:section:load', syncAll);

    observeGiftUi();
    syncAll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
