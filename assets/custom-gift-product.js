(() => {
  class GiftProductSection {
    constructor(section) {
      this.section = section;
      this.viewport = section.querySelector('[data-gp-viewport]');
      this.track = section.querySelector('[data-gp-track]');
      this.tabs = Array.from(section.querySelectorAll('[data-gp-tab]'));
      this.slides = Array.from(section.querySelectorAll('[data-gp-slide]'));
      this.layout = section.dataset.layout || 'carousel';
      this.mobileQuery = window.matchMedia('(max-width: 749px)');
      this.bind();
    }

    isCarousel() {
      return this.layout === 'carousel' || this.mobileQuery.matches;
    }

    bind() {
      this.tabs.forEach((tab) => {
        tab.addEventListener('click', () => this.showTab(tab.dataset.tabId, tab));
      });

      this.section.querySelector('[data-gp-prev]')?.addEventListener('click', () => this.scrollBy(-1));
      this.section.querySelector('[data-gp-next]')?.addEventListener('click', () => this.scrollBy(1));
    }

    showTab(tabId, activeTab) {
      this.tabs.forEach((tab) => {
        const selected = tab === activeTab;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      });

      this.slides.forEach((slide) => {
        const match = slide.dataset.tab === tabId;
        slide.classList.toggle('hidden', !match);
        slide.hidden = !match;
      });

      if (!this.isCarousel()) return;

      const scroller = this.track || this.viewport;
      if (scroller) scroller.scrollTo({ left: 0, behavior: 'smooth' });
    }

    scrollBy(direction) {
      if (!this.isCarousel()) return;
      const scroller = this.track || this.viewport;
      if (!scroller) return;
      const slide = this.slides.find((item) => !item.hidden);
      const amount = (slide?.getBoundingClientRect().width || 280) + 16;
      scroller.scrollBy({ left: amount * direction, behavior: 'smooth' });
    }
  }

  const init = () => {
    document.querySelectorAll('[data-gift-product]').forEach((section) => {
      if (section.dataset.gpReady) return;
      section.dataset.gpReady = 'true';
      new GiftProductSection(section);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', init);
})();
