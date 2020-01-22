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

    let isMobileChrome = window.innerWidth <= 768 && isChrome();

    window.scrollTo({
      left: 0,
      top: locationPosition,
      behavior: isMobileChrome ? 'auto' : "smooth",
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

  function isChrome() {
    let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
    return isChrome;
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

    if (window.innerWidth <= 996) {
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

  let headerTitle = document.querySelector(".header-content");

  let colorFiller = document.querySelector(".header-content-holder .color-filler");
  let playIcon = document.querySelector(".header-content-holder .color-filler .play-animation");
  let pauseIcon = document.querySelector(".header-content-holder .color-filler .pause-animation");
  let playTitle = document.querySelector(".header-content-holder .color-filler .play-title");
  let pauseTitle = document.querySelector(".header-content-holder .color-filler .pause-title");

  let context = canvas.getContext('2d');

  let isSmallScreen = window.innerWidth <= 996;

  const initialWindowHeight = window.innerHeight;
  const initialWindowWidth = window.innerWidth;

  const mouse = {
    x: undefined,
    y: undefined,
  }
  let isMouseOverTitle = false;

  let dotsArray = [];
  let numberOfDots = Math.floor(window.innerWidth / 15);

  let animationRequestID;

  let fillColor = "0,0,0";


  window.addEventListener("resize", redrawCanvas);
  canvas.addEventListener("click", addNewPointOnClick);
  canvas.addEventListener("mouseover", mouseOverCanvas);
  canvas.addEventListener("mouseleave", mouseLeaveCanvas);
  headerTitle.addEventListener("mouseleave", mouseLeaveTitle);
  headerTitle.addEventListener("mouseover", mouseOverTitle);
  colorFiller.addEventListener("click", coloringTrianglesAnimation);


  function mouseOverCanvas() {
    document.addEventListener("mousemove", updateMousePosition);
  }

  function mouseOverTitle() {
    isMouseOverTitle = true;
  }

  function mouseLeaveTitle() {
    isMouseOverTitle = false;
  }

  function mouseLeaveCanvas() {
    setTimeout(() => {

      if (!isMouseOverTitle) {
        mouse.x = undefined;
        mouse.y = undefined;
        document.removeEventListener("mousemove", updateMousePosition);
      }

    }, 10);
  }

  function updateMousePosition(event) {
    mouse.x = event.x;
    mouse.y = event.y;
  }

  function addNewPointOnClick(event) {
    if ((isSmallScreen && dotsArray.length < (numberOfDots + Math.round(numberOfDots / 2))) || (!isSmallScreen && dotsArray.length < (numberOfDots + Math.round(numberOfDots / 3)))) {
      cancelCanvasAnimation();
      dotsArray.push(new Point(event.x, event.y, 1, 0.5, 80, true))
      animateDots();
    } else {
      return
    }
  }


  let PIXEL_RATIO = (function () {
    let dpr = window.devicePixelRatio || 1,
      bsr = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;

    return dpr / bsr;
  })();

  function createHiDPICanvas(w, h, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    // canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    if (1 !== ratio) {
      context.scale(ratio, ratio)
    }
    return canvas;
  }

  let red = 0;
  let green = 0;
  let blue = 0;

  let fillTrianglesCounter = 0;

  let coloringAnimation;

  let isCanvasFilled = false;
  let shouldStartColoringAnimation = false;

  function fillTriangle() {

    if (fillTrianglesCounter === 3) {
      red = 0;
      green = 0;
      blue = 0;
      fillTrianglesCounter = 0;
    }


    if (!isCanvasFilled) {

      if ((red === 0 || red === 5) && (green === 0 || green === 5) && (blue === 0 || blue === 5)) {
        fillTrianglesCounter++;


        // while (red < 4) {
        //   (function (red) {
        //     setTimeout(() => {
        //       // fillColor = `${red},${green},${blue}`
        //     }, 8 * red)
        //   })(red++)
        // }
        // while (green < 221) {
        //   (function (green) {
        //     setTimeout(() => {
        //       // fillColor = `${red},${green},${blue}`
        //     }, 8 * green)
        //   })(green++)
        // }
        while (blue < 231) {
          (function (blue) {
            setTimeout(() => {
              fillColor = `${blue},${blue},${blue}`
            }, 8 * blue)
          })(blue++)
        }

        isCanvasFilled = true;
      } else {
        fillTrianglesCounter++;
        for (let i = red, j = green, p = blue; i >= 0, p > 0, j > 0; i-- , j-- , p--) {
          setTimeout(() => {
            if (i < 2) i = 0;
            if (j == 1) j = 0;
            if (p == 1) p = 0;
            if (i === 0 && j === 0 && p === 0) {
              red = 0;
              green = 0;
              blue = 0;
              fillTrianglesCounter = 0;
            }
            fillColor = `${i},${j},${p}`

          }, Math.abs(i) * 7);
          isCanvasFilled = false;
        }


      }


    } else {
      isCanvasFilled = false;
      fillTrianglesCounter++;

      while (red < 4) {
        (function (red) {
          setTimeout(() => {
            fillColor = `${red},${green},${blue}`
          }, 10 * red)
        })(red++)
      }
      while (green < 232) {
        (function (green) {
          setTimeout(() => {
            fillColor = `${red},${green},${blue}`
          }, 10 * green)
        })(green++)
      }
      while (blue < 232) {
        (function (blue) {
          setTimeout(() => {
            fillColor = `${red},${green},${blue}`
          }, 10 * blue)
        })(blue++)
      }

    }
  }

  function startColoringTrianglesAnimation(intervalTime) {
    coloringAnimation = setInterval(() => {
      fillTriangle();
    }, intervalTime);
    shouldStartColoringAnimation && fillTriangle();
  }

  function stopColoringTrianglesAnimation() {
    clearInterval(coloringAnimation)
  }

  function coloringTrianglesAnimation() {
    shouldStartColoringAnimation = !shouldStartColoringAnimation;

    if (shouldStartColoringAnimation) {
      playIcon.style.display = "none";
      playTitle.style.display = "none";
      pauseIcon.style.display = "block";
      pauseTitle.style.display = "block";
      startColoringTrianglesAnimation(8000);
    } else {
      playIcon.style.display = "block";
      playTitle.style.display = "block";
      pauseIcon.style.display = "none";
      pauseTitle.style.display = "none";
      stopColoringTrianglesAnimation();
    }

  }

  function Point(x, y, radius, opacity, color, isDotAddedOnClick) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.opacity = opacity;
    this.color = color;
    this.randomRedColor = Math.round(Math.random() * 255);
    this.randomGreenColor = Math.round(Math.random() * 255);
    this.randomBlueColor = Math.round(Math.random() * 255);
    this.dotsColor = ["rgba(255, 255, 255", "rgba(33, 150, 243", "rgba(4, 194, 201", "rgba(32, 156, 238", "rgba(33, 33, 255"]
    this.randomDotColorIndex = Math.floor(Math.random() * this.dotsColor.length);
    this.radians = Math.random() * Math.PI * 2;
    this.isDotAddedOnClick = isDotAddedOnClick;
    this.dx = (Math.random() - 0.5);;
    this.dy = (Math.random() - 0.5);;

    this.draw = function () {
      if (isSmallScreen) {
        // DRAWING SQUARES //
        // context.fillStyle = `rgba(${this.randomRedColor},${this.randomGreenColor},${this.randomBlueColor}, 0.9)`;
        context.fillStyle = `${this.dotsColor[this.randomDotColorIndex]},1)`;
        context.fillRect(this.x, this.y, this.radius, this.radius)
      } else {
        // DRAWING CIRCLES //
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        // context.fillStyle = `rgba(${this.randomRedColor},${this.randomGreenColor},${this.randomBlueColor}, .92)`;
        context.fillStyle = `${this.dotsColor[this.randomDotColorIndex]},1)`;
        context.fill();
        // context.stroke();
        context.closePath();
      }

    }

    this.update = function () {
      const conectedDots = [];

      let circleWidth = isSmallScreen ? innerWidth / 2.5 : innerHeight / 1.6;
      let circleHeight = isSmallScreen ? innerWidth / 3 : innerHeight / 3;

      if (!this.isDotAddedOnClick && !isSmallScreen) {
        this.radians += 0.001;
        this.x = x + Math.cos(this.radians) * circleWidth;
        this.y = y + Math.sin(this.radians) * circleHeight;
        // this.x = x + Math.cos(this.radians) * circleWidth - mouse.x / 20;
        // this.y = y + Math.sin(this.radians) * circleHeight - mouse.y / 20;
      } else {
        if (this.x + this.radius > innerWidth + 100 || this.x - this.radius < -100 /*0*/) {
          this.dx = -this.dx;
        }

        if (this.y + this.radius > innerHeight + 100 || this.y - this.radius < -100 /*0*/) {
          this.dy = -this.dy;
        }
        this.x += this.dx;
        this.y += this.dy;
      }


      dotsArray.forEach(dot => {
        if (this.x - dot.x <= 120 &&
          this.x - dot.x > -120 &&
          this.y - dot.y <= 120 &&
          this.y - dot.y > -120) {

          // DRAWING LINES BETWEEN DOTS //
          context.beginPath();
          context.lineJoin = "round";
          context.moveTo(this.x, this.y);
          context.lineTo(dot.x, dot.y);
          context.fill();

          // CALCULATING DISTANCE BETWEEN DOTS //
          let distance = (1 - ((Math.abs(this.x - dot.x) + Math.abs(this.y - dot.y)) / 240)).toFixed(3);

          // SETTING LINE WIDTH //
          context.lineWidth = distance;

          // SETTING LINE COLOR //
          context.strokeStyle = this.isDotAddedOnClick ? `rgba(4, 194, 201, ${distance})` : isSmallScreen ? `rgba(255, 255, 255, ${distance})` : `rgba(${this.color}, ${this.color}, ${this.color}, ${distance})`;

          // FILLING ELEMENTS //
          if (fillColor !== "0,0,0") {

            conectedDots.length = fillTrianglesCounter === 0 ? 0 : conectedDots.length;

            if (!conectedDots.includes(dot)) { conectedDots.push(dot); }


            if (conectedDots.length > 0) {
              context.lineWidth = distance / 4;
              context.lineTo(conectedDots[0].x, conectedDots[0].y);
              context.fillStyle = `rgba(${fillColor}, ${distance / 6})`;
              context.fill();
            } else {
              context.lineWidth = distance;
            }
          }
          // FILLING ELEMENTS END //


          // ON MOUSE HOVER LINES //
          if (
            !isSmallScreen &&
            mouse.x <= this.x + 120 &&
            mouse.x > this.x - 120 &&
            mouse.y <= this.y + 120 &&
            mouse.y > this.y - 120
          ) {
            this.color < 255 ? this.color += 2 : null;
            this.radius < (radius + 0.8) ? this.radius += 0.08 : this.radius -= 0.08;
            context.lineWidth = distance;
            context.strokeStyle = `rgba(${this.color}, ${this.color}, ${this.color}, ${distance + 0.1})`;

            // context.strokeStyle = `rgba(${this.randomRedColor}, ${this.randomGreenColor}, ${this.randomBlueColor}, ${distance})`;

            // context.lineTo(mouse.x, mouse.y);
            // context.fillStyle = `${this.dotsColor[this.randomDotColorIndex]}, ${0.02})`;
            // context.fillStyle = `${fillColor}, ${0.02})`;
            context.fill();
          } else {
            this.color <= color ? color : this.color -= 1;
            this.radius = this.radius > radius ? this.radius - 0.02 : radius;
          }
          // ON MOUSE HOVER LINES END //


          // // SETTING LINE WIDTH TO BE THICKER ON ONE SIDE OF SCREEN //
          // if (this.y > 0 && dot.y > 0) {
          //   context.lineWidth = (this.y * dot.y) / 300000;
          //   // context.lineWidth = (this.x * dot.x) / 300000;
          // context.lineWidth = (this.y / this.x) * (dot.y / dot.x)/2;
          //   context.strokeStyle = `rgba(${this.color}, ${this.color}, ${this.color}, ${distance})`;
          // } else {
          // context.lineWidth = 0.0001;
          // context.strokeStyle = "#222";
          // }

          context.stroke();
        }
      });


      this.draw();
    }
  }


  function createDotsArray(numberOfDots) {

    for (let index = 0; index < numberOfDots; index++) {
      const offset = 200;
      const offsetX = window.innerWidth <= 996 ? 2.3 : 2.4;

      let radius = 1;
      let x = Math.floor(Math.random() * (innerWidth / 8 - radius * 2) + innerWidth / offsetX + radius);
      // let y = Math.floor(Math.random() * (innerHeight - radius * 2) + radius);
      let y = Math.random() * innerHeight - ((innerHeight + offset) - (innerHeight - offset)) + (innerHeight - offset);


      if (window.innerWidth <= 996) {
        // let minY = innerHeight / 3 - 200;
        // let maxY = innerHeight / 1.5 + 200;
        // y = Math.random() * (maxY - minY) + minY;
        // radius = 1.5;
        x = Math.floor(Math.random() * innerWidth);
        y = Math.floor(Math.random() * innerHeight);
      }

      dotsArray.push(new Point(x, y, radius, 0, 180, false))
    }

    animateDots();

  }

  // Animate Dots ***
  function animateDots() {
    animationRequestID = requestAnimationFrame(animateDots);
    context.clearRect(0, 0, innerWidth, innerHeight);

    dotsArray.forEach(dot => {
      dot.update();
    });
  }

  function redrawCanvas() {
    isSmallScreen = window.innerWidth <= 996;

    if (shouldDisableCanvasOnIE()) {
      canvas.style.display = "none";
      return
    };

    if (
      isSmallScreen
      && initialWindowHeight !== window.innerHeight
      && initialWindowWidth == window.innerWidth
    ) {
      return
    } else {
      app.header.setHeaderHeight();
      cancelAnimationFrame(animationRequestID);
      dotsArray = [];

      // canvas.width = window.innerWidth;
      // canvas.height = window.innerHeight;
      createHiDPICanvas(window.innerWidth, window.innerHeight);

      numberOfDots = Math.floor(window.innerWidth / 18);
      numberOfDots = numberOfDots < 100 ? numberOfDots : 100;
      createDotsArray(numberOfDots);
    }
  }


  function cancelCanvasAnimation() {
    cancelAnimationFrame(animationRequestID);
  }


  function shouldDisableCanvasOnIE() {
    const ua = window.navigator.userAgent;

    const msie = ua.indexOf('MSIE ');
    const trident = ua.indexOf('Trident/');
    const edge = ua.indexOf('Edge/');

    let shouldDisableCanvas = false;

    if (msie > 0 || trident > 0 || edge > 0) {
      shouldDisableCanvas = true;
    }

    return shouldDisableCanvas;
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

  const headerArrowDownWrapper = document.querySelector('header .arrow-to-down-wrapper');
  const headerArrowDownFirst = document.querySelector('header .animated-arrow-1');
  const headerArrowDownSecond = document.querySelector('header .animated-arrow-2');


  const authorName = document.querySelector('.about-name');
  const authorImage = document.querySelector('.image-holder');

  const educationElement = document.querySelector('.education-holder');

  const skillsElements = document.querySelectorAll('#skillset .inner-hex');
  const skillset = document.querySelector('#skillset');

  const portfolioSection = document.querySelector('#portfolio');

  const aboutAnchor = document.querySelector('#about');
  const arrowToTop = document.querySelector('.arrow-to-top');

  const footer = document.querySelector('footer');


  const isSmallScreen = window.innerWidth <= 996;


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


  function animateHeaderArrow() {
    let titleTriger = headerTitleH1.offsetTop + headerTitleH1.offsetHeight

    if (window.scrollY < titleTriger) {

      headerArrowDownFirst.setAttribute(
        "style",
        `bottom: 30px;
            border-color: rgba(187, 187, 187, 1);
            pointer-events: all; `
      );
      headerArrowDownSecond.setAttribute(
        "style",
        `bottom: 30px;
            border-color: rgba(187, 187, 187, 1);
            pointer-events: all; `
      );
      headerArrowDownWrapper.setAttribute(
        "style",
        `cursor: pointer;
            pointer-events: all; `
      );
    } else {
      headerArrowDownFirst.setAttribute(
        "style",
        `bottom: -40px;
            transition: all .4s;
            border-color: rgba(255, 255, 255, 0);
            pointer-events: none; `
      );
      headerArrowDownSecond.setAttribute(
        "style",
        `bottom: -40px;
            transition: all .4s;
            border-color: rgba(255, 255, 255, 0);
            pointer-events: none; `
      );
      headerArrowDownWrapper.setAttribute(
        "style",
        `cursor: default ;
            pointer-events: none; `
      );
    }
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
        `opacity: ${titleOpacity}; `
      );
      headerTitleH2.setAttribute(
        "style",
        `opacity: ${titleOpacity}; `
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
          `opacity: 1; `
        );
      } else {
        let authorNameOpacity = -(authorNameTriger / window.scrollY) / 2.5 + 2;

        authorName.classList.remove("fade-in");
        authorName.classList.add("fade-out");

        authorImage.setAttribute(
          "style",
          `opacity: ${authorNameOpacity}; `
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
    //       skillsElements[k].style.transition = `all .2s ease -in `;
    //     }, 150 * (k + 1));
    //   }
    // } else {
    //   for (let i = skillsElements.length - 1; i >= 0; i--) {
    //     let k = i;
    //     setTimeout(function () {
    //       skillsElements[k].classList.remove("show-skills");
    //       skillsElements[k].style.transition = `all .2s ease - out`;
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
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 6;
            width: 60px;
            height: 60px;
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
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 6;
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
          position: relative;
          bottom: 85px;
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

    animateHeaderArrow();
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

        laptopElements[index].innerHTML = `<img src="./assets/websitesImages/${projectImgName}.jpg" alt="project image" >`;

      } else {
        const iFrameName = laptopElements[index].getAttribute("data-app-name");

        portfolioSection.classList.remove("iframes-not-loaded");

        laptopElements[index].innerHTML = `
          <img src="./assets/computer.jpg" alt="laptop image" >
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