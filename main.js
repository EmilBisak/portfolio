"use strict";

// whole application namespace
const app = {};

// navigation module
app.nav = (function () {
  let navigationShown = false;

  const $navigationElements = {
    nav: document.getElementsByTagName('nav')[0],
    menu: document.getElementsByClassName('nav-list')[0],
    buttonLines: {
      first: document.getElementById('nav-button').children[0],
      middle: document.getElementById('nav-button').children[1],
      last: document.getElementById('nav-button').children[2]
    }
  };

  function toggleNav() {
    navigationShown = !navigationShown;

    transformButtonLookToHamburgerOrClose();
    transformNavigationMenuLooks();
    onNavClick();
  };

  function isNavigationShown() {
    return navigationShown;
  }

  function transformButtonLookToHamburgerOrClose() {
    if (isNavigationShown()) {
      transformToCloseButton();
    } else {
      transformToHamburgerButton();
    }
  };

  function transformToCloseButton() {
    $navigationElements.buttonLines.first.className = "menu-to-close-first";
    $navigationElements.buttonLines.middle.style.background = "none";
    $navigationElements.buttonLines.last.className = "menu-to-close-last";
  }

  function transformToHamburgerButton() {
    $navigationElements.buttonLines.first.className = "";
    $navigationElements.buttonLines.middle.style.background = "#fff";
    $navigationElements.buttonLines.last.className = "";
  }

  function transformNavigationMenuLooks() {
    if (isNavigationShown()) {
      transformNavStyleForOpenedNav();
    } else {
      transformNavStyleForClosedNav();
    }
  };

  function transformNavStyleForOpenedNav() {
    $navigationElements.nav.classList.add("nav-bg-color");
    $navigationElements.menu.classList.add("nav-list-show");
  };

  function transformNavStyleForClosedNav() {
    $navigationElements.nav.classList.remove("nav-bg-color");
    $navigationElements.menu.classList.remove("nav-list-show");
  };

  function navigateSmooth(location) {
    const locationPosition = location === '#' ? 0 : document.querySelector(location).offsetTop;

    window.scrollTo({
      left: 0,
      top: locationPosition,
      behavior: 'smooth',
    });
  };

  function onNavClick() {
    event && event.preventDefault();
    const linksSelection = document.querySelectorAll('.navigation-link');
    const links = [...linksSelection];

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.target.tagName === "A") {
          const href = event.target.getAttribute('href') || event.target.dataset.href;

          navigateSmooth(href);
        } else {
          navigateSmooth("#home");
        }
      });
    });
  };

  return {
    toggleNav,
    isNavigationShown,
    onNavClick
  };
}());



app.scroll = (function () {

  function debounce(func, wait, immediate) {
    let timeout;
    return function () {
      let context = this, args = arguments;
      let later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      let callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  function animatePageElements() {
    let skillsElements = document.querySelectorAll('.inner-hex');
    let skillset = document.querySelector('#skillset');

    let about = document.querySelector('#about');
    let arrowToTop = document.querySelector('.arrow-to-top');

    let arrowImg = document.querySelector('.arrow-to-top svg');

    let footer = document.querySelector('footer');

    let bottomOffset = window.scrollY + window.innerHeight;
    let trigerHeight = skillset.offsetTop + (skillset.offsetHeight / 1.4);

    let trigerArrow = about.offsetTop + (about.offsetHeight / 2.5);

    let footerTriger = footer.offsetTop;

    if (bottomOffset >= trigerHeight) {
      for (let i = 0; i < skillsElements.length; i++) {
        let k = i;
        setTimeout(function () {
          skillsElements[k].classList.add("show-skills");
          skillsElements[k].style.transition = `all .4s ease-in`;
        }, 150 * (k + 1));
      }
    }

    if (bottomOffset >= trigerArrow) {
      if (window.innerWidth < 768) {
        arrowToTop.setAttribute(
          "style",
          "position:fixed; right:20px; bottom:20px; z-index: 2; width: 60px; height:60px;"
        );
        arrowImg.setAttribute(
          "style",
          "left: 10px; top: 5px;"
        );
      } else {
        arrowToTop.setAttribute(
          "style",
          "position:fixed; right:20px; bottom:20px; z-index: 2;"
        );
        arrowImg.setAttribute(
          "style",
          "top: 15px;"
        );
      }
    } else if (bottomOffset < trigerArrow) {
      arrowToTop.setAttribute(
        "style",
        "position:relative; bottom:85px;"
      );
      // arrowImg.style.top = "10px";
    }

    if (bottomOffset >= footerTriger) {
      arrowToTop.setAttribute(
        "style",
        "position:relative; "
      );
      arrowImg.setAttribute(
        "style",
        "left: 20px; top: 0;"
      );
    }
  };

  return {
    debounce,
    animatePageElements
  };
}());

document.onkeydown = function (e) {
  e = e || window.event;

  if (e.key === "Escape" && app.nav.isNavigationShown()) {
    app.nav.toggleNav();
  }
  if (e.keyCode === 13 && !app.nav.isNavigationShown()) {
    app.nav.toggleNav();
  }
};

document.onscroll = app.scroll.debounce(app.scroll.animatePageElements, 15);

window.onload = app.nav.onNavClick();




