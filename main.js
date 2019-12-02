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
    event && event.stopPropagation();
    const linksSelection = document.querySelectorAll('.navigation-link');
    const links = [...linksSelection];

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.target.tagName === "A") {
          const href = event.target.getAttribute('href') || event.target.dataset.href;

          navigateSmooth(href);
        } else if (event.target.parentNode.tagName === "A") {
          const href = event.target.parentNode.getAttribute('href') || event.target.parentNode.dataset.href;
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


// header module
app.header = (function () {
  const headerNode = document.querySelector("header");

  function setHeaderHeight() {

    if (window.innerWidth <= 500) {
      headerNode.style.height = `${window.innerHeight}px`;
    } else {
      headerNode.style.height = "100%";
    }

  };

  return {
    setHeaderHeight
  };
}());

// canvas module
app.canvas = (function () {
  let canvas = document.querySelector("canvas");

  let context = canvas.getContext('2d');

  let isSmallScreen = false;

  const mouse = {
    x: undefined,
    y: undefined,
  }

  let circleArray = [];


  canvas.addEventListener("mouseover", mouseOverCanvas);
  canvas.addEventListener("mouseleave", mouseLeaveCanvas);
  window.addEventListener("resize", redrawCanvas);


  function mouseOverCanvas() {
    document.addEventListener("mousemove", updateMousePosition);
  }

  function mouseLeaveCanvas() {
    mouse.x = undefined;
    mouse.y = undefined;
    document.removeEventListener("mousemove", updateMousePosition);
  }

  function updateMousePosition(event) {
    mouse.x = event.x;
    mouse.y = event.y;
  }

  function Circle(x, y, radius, opacity, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.opacity = opacity;
    this.color = color;
    this.randomRedColor = Math.round(Math.random() * 255);
    this.randomGreenColor = Math.round(Math.random() * 255);
    this.randomBlueColor = Math.round(Math.random() * 255);
    this.radians = Math.random() * Math.PI * 2;

    this.draw = function () {
      // drawing circles ***
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      context.fillStyle = `rgba(${this.randomRedColor},${this.randomGreenColor},${this.randomBlueColor}, .92)`;
      context.fill();
      context.stroke();
      context.closePath();

      // drawing lines ***
      context.beginPath();
      context.lineJoin = "round";
      context.moveTo(this.x, this.y);
      context.lineTo(this.x, this.y + innerHeight * 2);
      context.lineWidth = 0.9;
      context.strokeStyle = `rgba(${this.color}, ${this.color}, ${this.color}, ${this.opacity})`;
      context.stroke();
      context.closePath();
    }

    this.update = function () {
      let circleSize = isSmallScreen ? innerWidth / 1.6 : innerHeight / 1.6;

      this.radians += 0.0008;
      this.x = x + Math.cos(this.radians) * circleSize;
      this.y = y + Math.sin(this.radians) * circleSize;


      if (
        mouse.x <= this.x + 50 &&
        mouse.x > this.x - 50 &&
        mouse.y > this.y
      ) {
        this.opacity < 0.9 ? this.opacity += 0.04 : null;
        this.color += 5;
        this.radius < (radius + 0.5) ? this.radius += 0.08 : this.radius -= 0.08;
      } else {
        this.opacity = opacity;
        this.color <= color ? color : this.color -= 5;
        this.radius = this.radius > radius ? this.radius - 0.02 : radius;
      }


      this.draw();
    }
  }

  function createCircleArray(numberOfCircle) {

    for (let index = 0; index < numberOfCircle; index++) {

      let radius = 1;
      let x = Math.floor(Math.random() * (innerWidth / 8 - radius * 2) + innerWidth / 2.4 + radius);
      let y = Math.floor(Math.random() * (innerHeight - radius * 2) + radius);

      circleArray.push(new Circle(x, y, radius, 0.5, 128))
    }

    animateCircle();

  }

  var animationRequestID;
  // Animate Circle
  function animateCircle() {
    animationRequestID = requestAnimationFrame(animateCircle);
    context.clearRect(0, 0, innerWidth, innerHeight);

    circleArray.forEach(circle => {
      circle.update();
    });
  }

  function redrawCanvas() {
    cancelAnimationFrame(animationRequestID);
    isSmallScreen = window.innerWidth <= 500;
    circleArray = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let numberOfCircle = window.innerWidth >= 1024 ? 120 : 50;
    createCircleArray(numberOfCircle);
  }

  function cancelCanvasAnimation() {
    cancelAnimationFrame(animationRequestID);
  }

  return {
    redrawCanvas,
    cancelCanvasAnimation,
  };
}());


// scroll module
app.scroll = (function () {

  const headerTitleH1 = document.querySelector('.header-title h1');
  const headerTitleH2 = document.querySelector('.header-title h2');

  const authorName = document.querySelector('.about-name');
  const authorImage = document.querySelector('.image-holder');

  const educationElement = document.querySelector('.education-holder');

  const skillsElements = document.querySelectorAll('#skillset .inner-hex');
  const skillset = document.querySelector('#skillset');

  const portfolioSection = document.querySelector('#portfolio');

  const aboutAnchor = document.querySelector('#about');
  const arrowToTop = document.querySelector('.arrow-to-top');

  const footer = document.querySelector('footer');


  const isSmallScreen = window.innerWidth <= 500;


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


  function animateHeaderTitle(bottomOffset) {

    const headerTitleTriger = headerTitleH1.offsetTop + (headerTitleH1.offsetHeight * 7);
    const authorNameTriger = authorName.offsetTop + (authorName.offsetHeight);

    if (bottomOffset >= headerTitleTriger && bottomOffset <= authorNameTriger) {

      let subtrahend = window.scrollY > 100 ? 0.05 : 0;

      let titleOpacity = (headerTitleTriger / window.scrollY) / 20 - subtrahend;

      headerTitleH1.classList.remove("fade-in");
      headerTitleH2.classList.remove("fade-in");

      headerTitleH1.setAttribute(
        "style",
        `opacity: ${titleOpacity};`
      );
      headerTitleH2.setAttribute(
        "style",
        `opacity: ${titleOpacity};`
      );
    }
  };


  let isAnimationRunning = false;
  function animateAuthorImage(bottomOffset) {

    const authorNameTriger = authorName.offsetTop + (authorName.offsetHeight);
    const skillsetTriger = skillset.offsetTop + (skillset.offsetHeight / 2.5);
    const educationElementTriger = educationElement.offsetTop + (educationElement.offsetHeight / 10);


    if (bottomOffset <= skillsetTriger) {
      if (bottomOffset >= authorNameTriger) {

        authorName.classList.add("fade-in");
        authorName.classList.remove("fade-out");

        authorImage.setAttribute(
          "style",
          `opacity: 1;`
        );
      } else {
        let authorNameOpacity = -(authorNameTriger / window.scrollY) / 2.5 + 2;

        authorName.classList.remove("fade-in");
        authorName.classList.add("fade-out");

        authorImage.setAttribute(
          "style",
          `opacity: ${authorNameOpacity};`
        );
      }
    }

    // Stoping and resuming canvas animation
    if (bottomOffset >= educationElementTriger) {

      isAnimationRunning && app.canvas.cancelCanvasAnimation();
      isAnimationRunning = false;
    } else if (bottomOffset < educationElementTriger && bottomOffset >= authorNameTriger) {
      !isAnimationRunning && app.canvas.redrawCanvas();
      isAnimationRunning = true;
    }

  }




  function animateSkillset(bottomOffset) {

    const skillsetTriger = skillset.offsetTop + (skillset.offsetHeight / 3.6);
    const portfolioSectionTriger = portfolioSection.offsetTop + (portfolioSection.offsetHeight / 10);

    if (bottomOffset <= portfolioSectionTriger) {
      if (bottomOffset >= skillsetTriger) {


        for (let i = 0; i < skillsElements.length; i++) {

          let skillsElementsTriger = skillsElements[i].offsetTop + (skillsElements[i].offsetHeight * 1.6);
          if (bottomOffset >= skillsElementsTriger) {
            skillsElements[i].classList.add("show-skills");
          } else {
            skillsElements[i].classList.remove("show-skills");
          }

        }
      }

    }

    // Skills animation 2 

    // if (bottomOffset >= skillsetTriger) {
    //   for (let i = 0; i < skillsElements.length; i++) {
    //     let k = i;
    //     setTimeout(function () {
    //       skillsElements[k].classList.add("show-skills");
    //       skillsElements[k].style.transition = `all .2s ease-in`;
    //     }, 150 * (k + 1));
    //   }
    // } else {
    //   for (let i = skillsElements.length - 1; i >= 0; i--) {
    //     let k = i;
    //     setTimeout(function () {
    //       skillsElements[k].classList.remove("show-skills");
    //       skillsElements[k].style.transition = `all .2s ease-out`;
    //     }, 150 * (k + 1));
    //   }
    // }
  }


  function animateArrowToTop(bottomOffset) {

    const arrowImg = document.querySelector('.arrow-to-top svg');

    const arrowToTopTriger = aboutAnchor.offsetTop + (aboutAnchor.offsetHeight / 2.5);
    const footerTriger = footer.offsetTop;

    if (bottomOffset >= arrowToTopTriger) {
      if (window.innerWidth < 768) {
        arrowToTop.setAttribute(
          "style",
          `
          position:fixed; 
          right:20px; 
          bottom:20px; 
          z-index: 2; 
          width: 60px; 
          height:60px;
          `
        );
        arrowImg.setAttribute(
          "style",
          "left: 10px; top: 5px;"
        );
      } else {
        arrowToTop.setAttribute(
          "style",
          `
          position:fixed; 
          right:20px; 
          bottom:20px; 
          z-index: 2;
          `
        );
        arrowImg.setAttribute(
          "style",
          "top: 15px;"
        );
      }
    } else if (bottomOffset < arrowToTopTriger) {
      arrowToTop.setAttribute(
        "style",
        `
        position:relative; 
        bottom:85px;
        `
      );
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
  }


  function animatePageElements() {

    const bottomOffset = window.scrollY + window.innerHeight;

    if (!isSmallScreen) {
      animateHeaderTitle(bottomOffset);
      animateAuthorImage(bottomOffset);
    }

    animateSkillset(bottomOffset);
    animateArrowToTop(bottomOffset);

  };

  return {
    debounce,
    animatePageElements
  };
}());


// loading module
app.loading = (function () {
  const loadingPercentageElement = document.querySelector(".loading-percentage");
  const loadingBarElement = document.querySelector(".inside-bar");

  Image.prototype.load = function (url) {
    const thisImg = this;
    const xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open('GET', url, true);
    xmlHTTP.responseType = 'arraybuffer';
    xmlHTTP.onprogress = function (e) {
      thisImg.completedPercentage = parseInt((e.loaded / e.total) * 100);

      loadingPercentageElement.innerHTML = thisImg.completedPercentage ? `${thisImg.completedPercentage}%` : "";
      loadingPercentageElement.style.right = thisImg.completedPercentage < 10 ? "0px" : "6px";

      loadingBarElement.style.width = `${thisImg.completedPercentage}%`;
    };
    xmlHTTP.onloadstart = function () {
      thisImg.completedPercentage = 0;
    };

    xmlHTTP.send();
  };


  function loadingImage(url) {
    const backgroungImageObject = new Image();
    backgroungImageObject.load(url);
    backgroungImageObject.src = url;

    backgroungImageObject.onload = function () {
      const body = document.querySelector("body");
      const header = document.querySelector("header");
      const wrapper = document.querySelector(".wrapper");
      const nav = document.querySelector("nav");
      const loading = document.querySelector(".loading-holder");
      const projectBg = document.querySelectorAll(".projects-bg");

      body.style.background = "#fff";
      header.style.backgroundImage = `url(${url})`;
      wrapper.style.display = "block";
      nav.style.display = "block";

      projectBg.forEach(node => {
        node.style.backgroundImage = `url(${url})`;
        disableParallaxOnIE(node);
      });

      loading.style.display = "none";

      disableParallaxOnIE(header);
    }

  }

  function disableParallaxOnIE(element) {
    const ua = window.navigator.userAgent;

    const msie = ua.indexOf('MSIE ');
    const trident = ua.indexOf('Trident/');
    const edge = ua.indexOf('Edge/');

    if (msie > 0 || trident > 0 || edge > 0) {
      element.style.backgroundAttachment = "initial";
    }
  }

  return {
    loadingImage
  };
}());


// loadingIFrames module
app.loadingIFrames = (function () {
  const portfolioSection = document.querySelector(".portfolio");
  const laptopElements = document.querySelectorAll(".laptop");

  function shouldLoadIFrame() {
    for (let index = 0; index < laptopElements.length; index++) {
      if (window.innerWidth <= 768) {
        const projectImgName = laptopElements[index].getAttribute("data-image");

        portfolioSection.classList.add("iframes-not-loaded");

        laptopElements[index].innerHTML = `<img src="./assets/websitesImages/${projectImgName}.jpg" alt="project image">`;

      } else {
        const iFrameName = laptopElements[index].getAttribute("data-app-name");

        portfolioSection.classList.remove("iframes-not-loaded");

        laptopElements[index].innerHTML = `
          <img src="./assets/computer.jpg" alt="laptop image">
          <iframe src="https://emilbisak.github.io/${iFrameName}/#/"></iframe>`;

      }

    }
  }

  return {
    shouldLoadIFrame
  };
}());

function init() {

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

  app.loadingIFrames.shouldLoadIFrame();
  app.nav.onNavClick();
  app.header.setHeaderHeight();
  app.canvas.redrawCanvas();

  let backgroundImageURL = window.innerWidth >= 500 ? "assets/background.jpg" : "assets/background_mobile.jpg";
  app.loading.loadingImage(backgroundImageURL)

}


window.onload = init();