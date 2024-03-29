"use strict";
// whole application namespace
const app = {};

// navigation module
app.nav = (function () {
  let navigationShown = false;

  const $navigationElements = {
    nav: document.getElementsByTagName('nav')[0],
    menu: document.getElementsByClassName('nav-list')[0],
    pageOverlapElement: document.getElementsByClassName('navigation-page-overlap')[0],
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
    $navigationElements.pageOverlapElement.style.display = "block";
  };

  function transformNavStyleForClosedNav() {
    $navigationElements.nav.classList.remove("nav-bg-color");
    $navigationElements.menu.classList.remove("nav-list-show");
    $navigationElements.pageOverlapElement.style.display = "none";
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
    headerNode.style.height = `${window.innerHeight - 1}px`;
  };

  return {
    setHeaderHeight
  };
}());

// canvas module
app.canvas = (function () {


  let canvas = document.querySelector("canvas.header-canvas");

  let headerTitle = document.querySelector(".header-content");

  let colorFiller = document.querySelector(".header-content-holder .color-filler");
  let playIcon = document.querySelector(".header-content-holder .color-filler .play-animation");
  let pauseIcon = document.querySelector(".header-content-holder .color-filler .pause-animation");
  let playTitle = document.querySelector(".header-content-holder .color-filler .play-title");
  let pauseTitle = document.querySelector(".header-content-holder .color-filler .pause-title");
  let colorAnimButton = document.querySelector(".header-content-holder .color-animation-button");

  let dotsNotification = document.querySelector(".header-content-holder .dots-notification");

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

  // FILLCOLOR VARIABLES
  // let fillColor = "0,0,0";
  let fillColor = "4,232,231";

  // let red = 0;
  let red = 4;
  // let green = 0;
  let green = 232;
  // let blue = 0;
  let blue = 232;

  let fillTrianglesCounter = 0;

  let coloringAnimation;

  let isCanvasFilled = true;
  let shouldStartColoringAnimation = false;

  let shouldCallFillColor = true;

  // window.addEventListener("resize", redrawCanvas);
  canvas.addEventListener("click", addNewPointOnClick);
  canvas.addEventListener("mouseover", mouseOverCanvas);
  canvas.addEventListener("mouseleave", mouseLeaveCanvas);
  headerTitle.addEventListener("mouseleave", mouseLeaveTitle);
  headerTitle.addEventListener("mouseover", mouseOverTitle);
  // colorFiller.addEventListener("click", coloringTrianglesAnimation);
  colorAnimButton.addEventListener("click", fillTriangle);


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
    mouse.y = window.scrollY > 0 ? (window.scrollY + event.y) : event.y;
  }

  function addNewPointOnClick(event) {
    if ((isSmallScreen && dotsArray.length < (numberOfDots + Math.round(numberOfDots / 2))) || (!isSmallScreen && dotsArray.length < (numberOfDots + Math.round(numberOfDots / 3)))) {
      cancelCanvasAnimation();
      let positionY = window.scrollY > 0 ? (window.scrollY + event.y) : event.y;
      dotsArray.push(new Point(event.x, positionY, 1, 0.5, 80, true))
      animateDots();
      canvas.style.cursor = "pointer";
      dotsNotification.style.opacity = 0;
    } else {
      dotsNotification.style.opacity = 1;
      setTimeout(() => {
        dotsNotification.style.opacity = 0;
      }, 2500);
      canvas.style.cursor = "default";
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

  function fillTriangle() {
    let splashBucket = document.querySelector(".header-content-holder .color-animation-button svg");
    shouldCallFillColor = false;
    
    if (fillTrianglesCounter === 3) {
      red = 0;
      green = 0;
      blue = 0;
      fillTrianglesCounter = 0;
    }
    
    if (!isCanvasFilled) {
      
      if ((red === 0 || red === 5) && (green === 0 || green === 5) && (blue === 0 || blue === 5)) {
        fillTrianglesCounter++;
        if (splashBucket) { splashBucket.style.color = "rgb(4,232,231)" };

        while (blue < 231) {
          (function (blue) {
            setTimeout(() => {
              fillColor = `${blue},${blue},${blue}`;
            }, 8 * blue)
          })(blue++)
        }

        isCanvasFilled = true;
      } else {
        fillTrianglesCounter++;
        if (splashBucket) { splashBucket.style.color = "rgb(229,229,229)" };

        for (let i = red, j = green, p = blue; i >= 0, p > 0, j > 0; i--, j--, p--) {
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
            fillColor = `${i},${j},${p}`;

          }, Math.abs(i) * 7);
          isCanvasFilled = false;
        }


      }


    } else {
      isCanvasFilled = false;
      fillTrianglesCounter++;
      if (splashBucket) { splashBucket.style.color = "rgb(0,2,2)" };

      while (red < 4) {
        (function (red) {
          setTimeout(() => {
            fillColor = `${red},${green},${blue}`;
          }, 50 * red)
        })(red++)
      }
      while (green < 232) {
        (function (green) {
          setTimeout(() => {
            fillColor = `${red},${green},${blue}`;
          }, 5 * green)
        })(green++)
      }
      while (blue < 232) {
        (function (blue) {
          setTimeout(() => {
            fillColor = `${red},${green},${blue}`;
          }, 5 * blue)
        })(blue++)
      }

    }
  }

  function startColoringTrianglesAnimation(intervalTime) {
    coloringAnimation = setInterval(() => {
      fillTriangle();
    }, intervalTime);
    shouldStartColoringAnimation && fillTriangle();
    shouldCallFillColor = true;
  }

  function stopColoringTrianglesAnimation() {
    clearInterval(coloringAnimation);
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
    this.dx = (Math.random() - 0.5);
    this.dy = (Math.random() - 0.5);

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
        if (this.x + this.radius > innerWidth + 50 || this.x - this.radius < -50 /*0*/) {
          this.dx = -this.dx;
        }

        if (this.y + this.radius > innerHeight + 50 || this.y - this.radius < -50 /*0*/) {
          this.dy = -this.dy;
        }
        this.x += this.dx;
        this.y += this.dy;
      }


      dotsArray.forEach(dot => {
        if (this.x - dot.x <= 150 &&
          this.x - dot.x > -150 &&
          this.y - dot.y <= 150 &&
          this.y - dot.y > -150) {

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
          // context.strokeStyle = this.isDotAddedOnClick ? `rgba(4, 194, 201, ${distance})` : isSmallScreen ? `rgba(255, 255, 255, ${distance})` : `rgba(${this.color}, ${this.color}, ${this.color}, ${distance})`;

          context.strokeStyle = isSmallScreen ? `rgba(255, 255, 255, ${distance})` : `rgba(${this.color}, ${this.color}, ${this.color}, ${distance})`;

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
      let y = Math.random() * innerHeight - ((innerHeight + offset) - (innerHeight - offset)) + (innerHeight - offset);


      if (window.innerWidth <= 996) {
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
      createHiDPICanvas(window.innerWidth, (window.innerHeight - 2));

      numberOfDots = Math.floor(window.innerWidth / 18);
      numberOfDots = numberOfDots < 100 ? numberOfDots : 100;
      createDotsArray(numberOfDots);
    }

    // INITIAL CHANGING COLOR INTERVAL
    let counter = 0;

    let addCounter = setInterval(() => {
      counter++
      if (counter <= 1) {
        !isSmallScreen && fillTriangle();
      } else {
        clearInterval(addCounter);
      }
    }, 1);
    // END CHANGING COLOR INTERVAL

    // shouldCallFillColor && fillTriangle();
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

  const navigationElement = document.querySelector('nav');
  const navLinks = document.querySelectorAll('.navigation-link');

  const headerTitleH1 = document.querySelector('.header-title h1');
  const headerSubtitleH1 = document.querySelector('.header-title h1.subtitle');

  const headerArrowDownWrapper = document.querySelector('header .arrow-to-down-wrapper');
  const headerArrowDownFirst = document.querySelector('header .animated-arrow-1');
  const headerArrowDownSecond = document.querySelector('header .animated-arrow-2');


  const aboutSectionTitle = document.querySelector('.about-section-title');
  const authorName = document.querySelector('.about-name');
  const authorImage = document.querySelector('.image-holder');
  const aboutText = document.querySelector('.about-text');
  const aboutTextParagraphs = document.querySelectorAll('.about-text p');
  const cvButton = document.querySelector('.curriculum-vitae');

  const educationElement = document.querySelector('.education-holder');
  const coursesElements = document.querySelectorAll('.courses');

  const skillsElements = document.querySelectorAll('#skillset .inner-hex');
  const skillset = document.querySelector('#skillset');

  const portfolioSection = document.querySelector('#portfolio');
  const projectsTitleElements = document.querySelectorAll('.project-details h3');
  const projectElements = document.querySelectorAll('.project');
  const projectsInfoElements = document.querySelectorAll('.project-info');
  const projectsTechnologiesTitleElements = document.querySelectorAll('.technologies-title');
  const projectsTechnologiesElements = document.querySelectorAll('.technologies');
  const projectHexagonButtons = document.querySelectorAll('.project-details .hex-holder .hexagon-wrapper');
  const laptopElements = document.querySelectorAll('.laptop');

  const aboutAnchor = document.querySelector('#about');
  const arrowToTop = document.querySelector('.arrow-to-top');

  const contact = document.querySelector('#contact');
  const contactHexagons = document.querySelectorAll('.contact-wrapper');

  const footer = document.querySelector('footer');

  const pageSections = document.querySelectorAll('.page-section');

  const animatedSectionTitles = document.querySelectorAll('.animated-section-title');

  const dividerElement = document.querySelectorAll('.divider');

  let isFirefox = typeof InstallTrigger !== 'undefined';


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
      headerSubtitleH1.classList.remove("fade-in");

      headerTitleH1.setAttribute(
        "style",
        `opacity: ${titleOpacity}; `
      );
      headerSubtitleH1.setAttribute(
        "style",
        `opacity: ${titleOpacity}; `
      );
    }
  };


  let isAnimationRunning = false;
  function animateAboutSectionElements(bottomOffset) {

    const authorNameTriger = authorName.offsetTop + (authorName.offsetHeight);
    const educationElementTriger = educationElement.offsetTop + (educationElement.offsetHeight * 2);

    if (bottomOffset <= educationElementTriger) {

      // Animate author image and author name
      if (bottomOffset >= authorNameTriger) {

        authorName.classList.add("fade-in");
        authorName.classList.remove("fade-out");

        aboutSectionTitle.style.opacity = 1;
        authorImage.style.opacity = 1;
      } else {
        let authorNameOpacity = -(authorNameTriger / window.scrollY) / 2.5 + 2;

        authorName.classList.remove("fade-in");
        authorName.classList.add("fade-out");

        aboutSectionTitle.style.opacity = authorNameOpacity;
        authorImage.style.opacity = authorNameOpacity;
      }

      // Animate about text
      animateSelectedNodesCustomAnimations(bottomOffset, aboutTextParagraphs, 1.5)


      // Animate curriculum vitae button
      if (bottomOffset >= (authorNameTriger + aboutText.offsetHeight * 2.2)) {
        cvButton.classList.add("pop-in");
        cvButton.classList.remove("fade-out");
      } else {
        cvButton.classList.remove("pop-in");
        cvButton.classList.add("fade-out");
      }

      // Animate divider
      animateSelectedNodesCustomAnimations(bottomOffset, dividerElement, 3);

    }

    // Stoping and resuming canvas animation
    // if (bottomOffset >= educationElementTriger) {

    //   isAnimationRunning && app.canvas.cancelCanvasAnimation();
    //   isAnimationRunning = false;
    // } else if (bottomOffset < educationElementTriger && bottomOffset >= authorNameTriger) {
    //   !isAnimationRunning && app.canvas.redrawCanvas();
    //   isAnimationRunning = true;
    // }
  }


  // Animate courses
  function animateCourses(bottomOffset) {

    const skillsetTriger = skillset.offsetTop + (skillset.offsetHeight * 1.8);
    const aboutSectionTriger = authorName.offsetTop + (authorName.offsetHeight * 3);

    if ((bottomOffset <= skillsetTriger) && (bottomOffset > aboutSectionTriger)) {
      animateSelectedNodesFadeLeftAndRight(bottomOffset, coursesElements, 0.4);
    }
  }


  // Animate projects
  function animateProjects(bottomOffset) {

    const portfolioSectionTriger = portfolioSection.offsetTop + (portfolioSection.offsetHeight / 10 - 300);

    if (bottomOffset > portfolioSectionTriger) {
      animateSelectedNodesFadeLeftAndRight(bottomOffset, projectsTitleElements, 1.2);
      animateSelectedNodesFadeLeftAndRightWithDelay(bottomOffset, projectsInfoElements, 1.2, ".3");
      animateSelectedNodesFadeLeftAndRightWithDelay(bottomOffset, projectsTechnologiesTitleElements, 1.2, ".5");
      animateSelectedNodesFadeLeftAndRightWithDelay(bottomOffset, projectsTechnologiesElements, 1.2, ".7");
      animateSelectedNodesCustomAnimations(bottomOffset, projectHexagonButtons, 1, true, "flip-in-left");
      animateSelectedNodesCustomAnimations(bottomOffset, laptopElements, 0.6, true, "pop-in");
    }
  }

  // Animate skillset
  function animateSkillset(bottomOffset) {

    const educationElementTriger = educationElement.offsetTop + (educationElement.offsetHeight / 1.6);
    const portfolioSectionTriger = portfolioSection.offsetTop + (portfolioSection.offsetHeight / 1.7);

    if (bottomOffset <= portfolioSectionTriger) {
      if (bottomOffset >= educationElementTriger) {

        for (let i = 0; i < skillsElements.length; i++) {

          skillsElements[i].setAttribute(
            "style",
            `-webkit-animation-delay: 0.${i}s;
             animation-delay: 0.${i}s; `
          );

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

  // Animate contact hexagons
  function animateContactHexagons(bottomOffset) {

    const contactTriger = contact.offsetTop + (contact.offsetHeight / 10 - 200);

    if (bottomOffset >= contactTriger) {

      for (let i = 0; i < contactHexagons.length; i++) {

        let contactHexagonsTriger = contactHexagons[i].offsetTop + (contactHexagons[i].offsetHeight * 1);

        contactHexagons[i].setAttribute(
          "style",
          `-webkit-animation-delay: 0.${5 + i}s;
         animation-delay: 0.${5 + i}s; `
        );

        if (bottomOffset >= contactHexagonsTriger) {
          contactHexagons[i].classList.add(`flip-in-left`);
          contactHexagons[i].classList.remove(`fade-out`);
        } else {
          contactHexagons[i].classList.remove(`flip-in-left`);
          contactHexagons[i].classList.add(`fade-out`);
        }

      }
    }
  }

  function animateArrowToTop(bottomOffset) {

    const arrowImg = document.querySelector('.arrow-to-top svg');

    const arrowToTopTriger = aboutAnchor.offsetTop + (aboutAnchor.offsetHeight / 2.5);
    const footerTriger = footer.offsetTop;
    let isSmallScreen = window.innerWidth < 768;

    if (bottomOffset >= arrowToTopTriger) {
      if (isSmallScreen) {
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
      if (!isFirefox) {
        arrowToTop.setAttribute(
          "style",
          "position:relative; "
        );
        arrowImg.setAttribute(
          "style",
          "left: 20px; top: 0;"
        );
      } else {
        if (isSmallScreen) {
          arrowToTop.setAttribute(
            "style",
            `
          position: fixed;
          right: 50%;
          bottom: 200px;
          transform: translateX(50%);
            `
          );
        } else {
          arrowToTop.setAttribute(
            "style",
            `
            position: fixed;
            right: 50%;
            bottom: 10px;
            transform: translateX(50%);
              `
          );
        }
        arrowImg.setAttribute(
          "style",
          "left: 20px; top: 0;"
        );
      }
    }
  }


  function animateSelectedNodesFadeLeftAndRight(bottomOffset, selectedElementsArray, offset = 1) {

    for (let i = 0; i < selectedElementsArray.length; i++) {

      let selectedElementsTriger = selectedElementsArray[i].offsetTop + (selectedElementsArray[i].offsetHeight * offset);
      let leftOrRightAnimation = i % 2 === 0 ? "left" : "right";

      selectedElementsArray[i].classList.add("fade-animation");

      if (bottomOffset >= selectedElementsTriger) {
        selectedElementsArray[i].classList.add(`fade-in-${leftOrRightAnimation}`);
        selectedElementsArray[i].classList.remove(`fade-out-${leftOrRightAnimation}`);
      } else {
        selectedElementsArray[i].classList.remove(`fade-in-${leftOrRightAnimation}`);
        selectedElementsArray[i].classList.add(`fade-out-${leftOrRightAnimation}`);
      }

    }

  }


  function animateSelectedNodesFadeLeftAndRightWithDelay(bottomOffset, selectedElementsArray, offset = 1, delay = "0.3") {

    for (let i = 0; i < selectedElementsArray.length; i++) {

      let selectedElementsTriger = selectedElementsArray[i].offsetTop + (selectedElementsArray[i].offsetHeight * offset);
      let leftOrRightAnimation = i % 2 === 0 ? "left" : "right";

      selectedElementsArray[i].classList.add("fade-animation");

      selectedElementsArray[i].setAttribute(
        "style",
        `-webkit-animation-delay: ${delay}s;
          animation-delay: ${delay}s;`
      );

      if (bottomOffset >= selectedElementsTriger) {
        selectedElementsArray[i].classList.add(`fade-in-${leftOrRightAnimation}`);
        selectedElementsArray[i].classList.remove(`fade-out-${leftOrRightAnimation}`);
      } else {
        selectedElementsArray[i].classList.remove(`fade-in-${leftOrRightAnimation}`);
        selectedElementsArray[i].classList.add(`fade-out-${leftOrRightAnimation}`);
      }

    }

  }

  function animateSelectedNodesCustomAnimations(bottomOffset, selectedElementsArray, offset = 1, shoulDelay = true, animationIn = "fade-in", animationOut = "fade-out") {

    for (let i = 0; i < selectedElementsArray.length; i++) {


      const selectedElementsTriger = selectedElementsArray[i].offsetTop + (selectedElementsArray[i].offsetHeight * offset);

      selectedElementsArray[i].classList.add("fade-animation");

      let dataDelay = selectedElementsArray[i].getAttribute("data-delay") ? selectedElementsArray[i].getAttribute("data-delay") : `0.${i * 2}`;

      if (shoulDelay) {

        selectedElementsArray[i].setAttribute(
          "style",
          `-webkit-animation-delay: ${dataDelay}s;
            animation-delay: ${dataDelay}s;`
        );
      }


      if (bottomOffset >= selectedElementsTriger) {
        selectedElementsArray[i].classList.add(`${animationIn}`);
        selectedElementsArray[i].classList.remove(`${animationOut}`);
      } else {
        selectedElementsArray[i].setAttribute(
          "style",
          `-webkit-animation-delay: ${0}s;
            animation-delay: ${0}s; `
        );
        selectedElementsArray[i].classList.remove(`${animationIn}`);
        selectedElementsArray[i].classList.add(`${animationOut}`);
      }
    }
  }


  function activateCurrentNavLinkAndNavigation(bottomOffset) {
    const indexArray = [];
    let indexOfActiveNavLink = 0;
    let offset = 1;

    navLinks.forEach(navLink => {
      navLink.classList.remove("active");
    });

    pageSections.forEach((section, i) => {
      offset = i !== 4 ? 8 : 1.3;

      const setNavToFixedPositionTriger = (window.innerHeight * 2 - 3);
      const sectionTriger = section.offsetTop + (section.offsetHeight / offset) + 100;

      if (window.scrollY > 50) {
        navigationElement.classList.add("hide-navigation");
      } else {
        navigationElement.classList.remove("hide-navigation");
      }

      if (bottomOffset >= setNavToFixedPositionTriger) {
        navigationElement.classList.add("fixed-navigation");
        navigationElement.classList.remove("hide-navigation");
      } else {
        navigationElement.classList.remove("fixed-navigation");
      }

      if (bottomOffset >= sectionTriger) {
        navLinks[i].classList.remove("active");
        indexArray.push(i)
      }
    });

    indexOfActiveNavLink = indexArray[indexArray.length - 1];
    navLinks[indexOfActiveNavLink].classList.add("active");
  }


  function animatePageElements(renderedIsLargeScreen) {

    const bottomOffset = window.scrollY + window.innerHeight;

    if (renderedIsLargeScreen) {
      animateHeaderTitle(bottomOffset);
      animateAboutSectionElements(bottomOffset);
      animateCourses(bottomOffset);
      animateProjects(bottomOffset);
      animateSelectedNodesCustomAnimations(bottomOffset, animatedSectionTitles, 3)
      animateContactHexagons(bottomOffset);
    }

    animateHeaderArrow();
    animateSkillset(bottomOffset);
    animateArrowToTop(bottomOffset);
    activateCurrentNavLinkAndNavigation(bottomOffset);
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

      loadingPercentageElement.innerHTML = `${thisImg.completedPercentage}%`;
      // loadingPercentageElement.innerHTML = thisImg.completedPercentage ? `${thisImg.completedPercentage}%` : "";
      // loadingPercentageElement.style.right = thisImg.completedPercentage < 10 ? "0px" : "6px";

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
      const loadingCanvas = document.querySelector(".loading-canvas");
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
      loadingCanvas.style.display = "none";

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

  function shouldLoadIFrame(disableRenderingIframesOnLargeScreens) {
    for (let index = 0; index < laptopElements.length; index++) {
      const projectName = laptopElements[index].getAttribute("data-app-name");
      if (window.innerWidth <= 768) {
        const projectImgName = laptopElements[index].getAttribute("data-image");

        portfolioSection.classList.add("iframes-not-loaded");

        laptopElements[index].innerHTML = `
        <a href="https://emilbisak.github.io/${projectName}/#/" title="${projectName}" target="_blank" rel="noopener">
          <img src="./assets/websitesImages/${projectImgName}.jpg" alt="${projectImgName} project image" >
        </a>`;

      } else if (disableRenderingIframesOnLargeScreens) {
        const projectImgName = laptopElements[index].getAttribute("data-image");

        laptopElements[index].innerHTML = `
        <a href="https://emilbisak.github.io/${projectName}/#/" title="${projectName}" target="_blank" rel="noopener">
          <img src="./assets/computer.jpg" alt="laptop image" >
          <img class="project-computer-image" src="./assets/websitesImages/computerSizeImages/${projectImgName}_comp.png" alt="${projectImgName} project image" >
        </a>`;


      } else {
        const iFrameName = laptopElements[index].getAttribute("data-app-name");

        portfolioSection.classList.remove("iframes-not-loaded");

        laptopElements[index].innerHTML = `
          <img src="./assets/computer.jpg" alt="laptop image" >
          <iframe title="${iFrameName}" src="https://emilbisak.github.io/${iFrameName}/#/"></iframe>`;

      }
    }
  }

  return {
    shouldLoadIFrame
  };
}());


app.loadingCanvas = (function () {
  var $ = {};

  $.Particle = function (opt) {
    this.radius = 7;
    this.x = opt.x;
    this.y = opt.y;
    this.angle = opt.angle;
    this.speed = opt.speed;
    this.accel = opt.accel;
    this.decay = 0.01;
    this.life = 0.8;
  };

  $.Particle.prototype.step = function (i) {
    this.speed += this.accel;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.angle += $.isSmallScreen ? $.PI / 40 : $.PI / 300;
    // this.angle += $.PI / 64;
    this.accel *= 1.01;
    this.life -= this.decay;

    if (this.life <= 0) {
      $.particles.splice(i, 1);
    }
  };

  $.Particle.prototype.draw = function (i) {
    // $.ctx.fillStyle = $.ctx.strokeStyle = 'hsla(' + ($.tick + (this.life * 120)) + ', 100%, 60%, ' + this.life + ')';
    $.ctx.fillStyle = $.ctx.strokeStyle = 'hsla(' + ($.tick + (this.life * 120)) + ', 100%, 90%, ' + this.life + ')';
    // $.ctx.fillStyle = $.ctx.strokeStyle = `rgba(4,194,201,${this.life})`;
    $.ctx.beginPath();
    if ($.particles[i - 1]) {
      $.ctx.moveTo(this.x, this.y);
      $.ctx.lineTo($.particles[i - 1].x, $.particles[i - 1].y);
    }
    $.ctx.stroke();

    $.ctx.beginPath();
    $.ctx.arc(this.x, this.y, Math.max(0.001, this.life * this.radius), 0, $.TWO_PI);
    // $.ctx.fillRect(this.x, this.y, 5, 5);
    $.ctx.fill();

    var size = Math.random() * 1.25;
    $.ctx.fillRect(~~(this.x + ((Math.random() - 0.5) * 35) * this.life), ~~(this.y + ((Math.random() - 0.5) * 35) * this.life), size, size);
  }

  $.step = function () {
    $.particles.push(new $.Particle({
      x: $.width / 2 + Math.cos($.tick / 20) * $.min / 2,
      y: $.height / 2 + Math.sin($.tick / 20) * $.min / 2,
      angle: $.globalRotation + $.globalAngle,
      speed: 0,
      accel: 0.01
    }));

    $.particles.forEach(function (elem, index) {
      elem.step(index);
    });

    $.globalRotation += $.PI / 6;
    $.globalAngle += $.PI / 6;
  };

  $.draw = function () {
    $.ctx.clearRect(0, 0, $.width, $.height);

    $.particles.forEach(function (elem, index) {
      elem.draw(index);
    });
  };

  $.loadingCanvasInit = function () {
    $.canvas = document.querySelector("canvas.loading-canvas");
    $.ctx = $.canvas.getContext('2d');
    $.width = window.innerWidth;
    $.height = window.innerHeight;
    $.canvas.width = $.width * window.devicePixelRatio;
    $.canvas.height = $.height * window.devicePixelRatio;
    $.canvas.style.width = $.width + 'px';
    $.canvas.style.height = $.height + 'px';
    $.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    $.isSmallScreen = window.innerWidth < 996;
    $.isMobileScreen = window.innerWidth <= 425;
    $.min = $.isSmallScreen ? $.isMobileScreen ? Math.min($.height, $.width) * 0.5 : Math.min($.height, $.width) * 0.3 : Math.min($.height, $.width) * 0.2;
    $.particles = [];
    $.globalAngle = 0;
    $.globalRotation = 0;
    $.tick = 0;
    $.PI = Math.PI;
    $.TWO_PI = $.PI * 2;
    $.ctx.globalCompositeOperation = 'lighter';
    document.body.appendChild($.canvas);
    cancelAnimationFrame($.animationID);
    $.loop();
  };

  $.loop = function () {
    $.animationID = requestAnimationFrame($.loop);
    $.step();
    $.draw();
    $.tick++;
  };

  const { loadingCanvasInit } = $

  return { loadingCanvasInit }

}());

function handleArrowToTopClick() {
  app.nav.onNavClick();
  // app.canvas.redrawCanvas();
}

function redrawCanvases() {
  app.canvas.redrawCanvas();
  app.loadingCanvas.loadingCanvasInit();
  app.scroll.animatePageElements(window.innerWidth > 996);
}


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

  document.onscroll = app.scroll.debounce(() => { app.scroll.animatePageElements(window.innerWidth > 996); }, 15);
  window.onresize = app.scroll.debounce(() => { redrawCanvases(); }, 300);

  const disableRenderingIframesOnLargeScreens = true;

  app.loadingIFrames.shouldLoadIFrame(disableRenderingIframesOnLargeScreens);
  app.loadingCanvas.loadingCanvasInit();
  app.nav.onNavClick();
  app.header.setHeaderHeight();
  app.canvas.redrawCanvas();

  let backgroundImageURL = window.innerWidth >= 500 ? "assets/background.jpg" : "assets/background_mobile.jpg";
  app.loading.loadingImage(backgroundImageURL)

}


window.onload = init();