class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
    this.summary = this.mainDetailsToggle.querySelector('summary');
    this.mediaQuery = window.matchMedia('(min-width: 990px)');

    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.onSummaryClick = this.onSummaryClick.bind(this);
    this.onMediaChange = this.onMediaChange.bind(this);

    this.summary.addEventListener('click', this.onSummaryClick);
    this.bindDesktopInteractions();

    if (typeof this.mediaQuery.addEventListener === 'function') {
      this.mediaQuery.addEventListener('change', this.onMediaChange);
    } else if (typeof this.mediaQuery.addListener === 'function') {
      this.mediaQuery.addListener(this.onMediaChange);
    }
  }

  get isDesktop() {
    return this.mediaQuery.matches;
  }

  bindDesktopInteractions() {
    this.removeEventListener('mouseenter', this.openMenu);
    this.removeEventListener('mouseleave', this.closeMenu);

    if (this.isDesktop) {
      this.addEventListener('mouseenter', this.openMenu);
      this.addEventListener('mouseleave', this.closeMenu);
    }
  }

  onMediaChange() {
    this.bindDesktopInteractions();
    if (!this.isDesktop) this.close();
  }

  openMenu() {
    if (!this.isDesktop) return;

    document.querySelectorAll('header-menu details[open]').forEach((details) => {
      if (details !== this.mainDetailsToggle) {
        details.removeAttribute('open');
        const summary = details.querySelector('summary');
        if (summary) summary.setAttribute('aria-expanded', false);
      }
    });

    this.mainDetailsToggle.setAttribute('open', '');
    this.summary.setAttribute('aria-expanded', true);
    this.onToggle();
  }

  closeMenu() {
    if (!this.isDesktop) return;
    this.close();
    this.onToggle();
  }

  onSummaryClick(event) {
    if (!this.isDesktop) return;

    const link = event.target.closest('a');
    event.preventDefault();

    if (link && link.getAttribute('href')) {
      window.location.assign(link.href);
      return;
    }

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}

customElements.define('header-menu', HeaderMenu);
