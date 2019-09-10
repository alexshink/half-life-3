// detect touch device
function is_touch_device() {
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  var mq = function(query) {
    return window.matchMedia(query).matches;
  };
  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  };
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
};

window.addEventListener('load', function() {

  // append intro block after page loading, 
  var introBlock = document.createElement('div');
  var introAudio = new Audio('resources/audio/valve-theme.wav');
  var introGlitch;

  introBlock.className = 'intro';
  introBlock.innerHTML = '<img src="resources/intro/intro-1.jpg" class="intro__image">' +
                         '<img src="resources/intro/intro-3.jpg" class="intro__glitch-image">' +
                         '<div class="intro__panel">' +
                           '<button type="button" class="button button_sound intro__pause"></button>' +
                           '<button type="button" class="button button_sound intro__close"></button>' +
                         '</div>';
  document.body.append(introBlock);

  var introPlayerButton = document.querySelector('.intro__pause');
  introPlayerButton.addEventListener('click', function() {
    if ( this.className.indexOf('intro__play') < 0 ) {
      introAudio.pause();
    } else {
      introAudio.play();
    }
    this.classList.toggle('intro__play');
  });

  // buttons with sound
  var soundButtons = document.querySelectorAll('.button_sound');
  soundButtons.forEach(function(item) {
    // enable hover sound if not mobile
    if ( !is_touch_device() ) {
      item.addEventListener('mouseenter', function() {
        var audio = new Audio('resources/audio/buttonrollover.wav');
        audio.play();
      });
    };
    // click sound
    item.addEventListener('click', function() {
      var audio = new Audio('resources/audio/buttonclickrelease.wav');
      audio.play();
      item.blur();
      // languages
      if ( item.className.indexOf('languages__button') >= 0 ) {
        var lang = item.innerText.toLowerCase();
        document.querySelector('.languages__button_active').classList.remove('languages__button_active');
        item.classList.add('languages__button_active');
        document.body.className = 'page page_' + lang;
      };
      // open intro
      if ( item.className.indexOf('open-intro__button') >= 0 ) {
        introBlock.classList.add('intro_show');
        introAudio.loop = true;
        introAudio.play();
        introGlitch = setInterval(function(){
          introBlock.classList.add('intro_glitch');
          setTimeout(function(){
            introBlock.classList.remove('intro_glitch');
          }, 85);
        }, 10000);
      };
      // close intro
      if ( item.className.indexOf('intro__close') >= 0 ) {
        // stop doesn't exist, therefore pause and reset audio-time
        introAudio.pause();
        introAudio.currentTime = 0;
        clearInterval(introGlitch);
        introBlock.className = 'intro';
        introPlayerButton.classList.remove('intro__play');
      };
      // stats
      if ( item.className.indexOf('stats') >= 0 ) {
        item.classList.toggle('stats_hidden');
      };
    });
  });

  // timer
  var hlTimerElement = document.querySelector('.timer__inner');
  var hlTimerSeconds = 60;
  var hlTimerSpeed = 1000;
  function runHlTimer() {
    setTimeout(function() {
      hlTimerSeconds -= 1; // take a second
      remainingSeconds = hlTimerSeconds % 60; // calc remaining seconds
      allMinutes = (hlTimerSeconds - remainingSeconds) / 60; // calc minutes
      remainingMinutes = allMinutes % 60; // calc remaining minutes
      allHours = (allMinutes - allMinutes % 60) / 60; // calc hours

      // add zero before single positive minute
      if ( remainingMinutes.toString().length == 1 ) {
        remainingMinutes = '0' + remainingMinutes;
      };

      // replace odd hours with positive
      if ( allHours % 2 == 0 ) {
        allHours = Math.abs(allHours);
      };

      // add zero before single positive hour
      if ( allHours.toString().length == 1 ) {
        allHours = '0' + allHours;
      };

      // reset timer after 24 hours
      if ( allHours == -25 ) {
        hlTimerSeconds = 60;
      };

      // insert values in DOM
      hlTimerElement.innerHTML = allHours + ':' + remainingMinutes + ':' + ('0' + remainingSeconds).slice(-2);

      runHlTimer()
    }, hlTimerSpeed);
  };

  // start button
  var startButton = document.querySelector('.page__start-button');
  setTimeout(function(){
    startButton.classList.add('active');
    startButton.innerText = 'Start';
  }, 1000);
  startButton.addEventListener('click', function(){
    if ( this.className.indexOf('active') >= 0 ) {
      startButton.remove();
      document.body.classList.remove('page_loading');
      runHlTimer();
      // fix preload audio for safari ios
      introAudio.volume = 0;
      introAudio.play();
      introAudio.pause();
      introAudio.currentTime = 0;
      introAudio.volume = 1;
    };
  });
  
  // show/hide timer footer with speed-up-button
  var hlTimerFooter = document.querySelector('.timer__footer');
  hlTimerElement.addEventListener('click', function(e) {
    hlTimerFooter.classList.toggle('timer__footer_show');
  });

  // speed up timer
  var speedButton = document.querySelector('.timer__speedup');
  var speedButtonGreenlevel = 128;
  var speedButtonColor;
  var speedButtonDefaultScale = 1.1;
  var speedButtonIncrement = 0;

  speedButton.addEventListener('click', function(e) {
    speedButtonIncrement++;

    // play voices
    var audio = new Audio('resources/audio/timer-speedup/' + speedButtonIncrement + '.wav');
    audio.volume = 0.7;
    audio.play();

    // while speed increases
    if ( hlTimerSpeed > 1 ) {
      hlTimerSpeed /= 2;
      // change button color
      speedButtonGreenlevel -= 12.8;
      speedButtonColor = 'rgb(255, ' + speedButtonGreenlevel + ', 23)';
      speedButton.style.borderColor = speedButtonColor;
      speedButton.style.color = speedButtonColor;
      // change button scale
      speedButtonDefaultScale += 0.08;
      speedButton.style.transform = 'scale('+ speedButtonDefaultScale +')';
    } else {
      hlTimerFooter.classList.remove('timer__footer_show'); // hide footer with speed-up-button
      speedButton.removeAttribute('style'); // delete button styles (color + scale)
      // reset values for speed-up-button
      speedButtonIncrement = 0;
      speedButtonGreenlevel = 128;
      speedButtonDefaultScale = 1.1;
      // die effect
      document.body.classList.add('page_die');
      // reset values for timer and start again
      setTimeout(function() {
        hlTimerSpeed = 1000; // reset timer speed
        hlTimerSeconds = 61; // reset timer count
        document.body.classList.remove('page_die');
      }, 4500)
    };

    speedButton.blur();
  });


  // items list:
  // symbol = font-icon
  // value  = sound name
  var itemsList = {
    'j': 'bugbait_squeeze2',
    'c': 'iceaxe_swing1',
    'm': 'physcannon_tooheavy',
    'g': 'crossbow_fire1',
    'V': 'wpn_moveselect',
    '+': 'smallmedkit1',
    'b': 'shotgun_fire7',
    'k': 'explode3',
    'l': 'energy_sing_flyby2',
    'd': 'pistol_fire2',
    'i': 'rocket1',
    'e': '357_fire2',
    'h': 'chargeloop',
    'a': 'smg1_fireburst1',
    '*': 'suitchargeok1'
  };

  var itemsListKeys = Object.keys(itemsList);

  // create item button
  var itemsBlock = document.createElement('div');
  itemsBlock.className = 'items';
  var itemsButton = document.createElement('button');
  itemsButton.type = 'button';
  itemsButton.classList = 'button items__button';
  // create first symbol in item button
  itemsButton.innerText = itemsListKeys[0];
  itemsButton.dataset.sound = itemsList[itemsListKeys[0]];
  itemsBlock.append(itemsButton);
  document.querySelector('.content').append(itemsBlock);

  // play sound
  itemsBlock.addEventListener('click', function(e) {
    var audio = new Audio('resources/audio/items/' + itemsButton.dataset.sound + '.wav');
    audio.play();
  });

  // fix touch active buttons
  itemsButton.addEventListener('touchstart', function() {}, false);

  // switching to a random icon and its sound
  setInterval(function() {
    var randomNumber = itemsListKeys.length * Math.random() << 0;
    var randomKeySymbol = itemsListKeys[randomNumber];
    var randomKeySoundName = itemsList[itemsListKeys[randomNumber]];

    // fade out button and get transition duration for fadein
    itemsButton.classList.add('items__button_fade_out');
    var transitionDuration = window.getComputedStyle(itemsButton).transitionDuration.slice(0, -1) * 1000;

    // switch to next icon and fade in
    setTimeout(function(){
      itemsButton.innerText = randomKeySymbol;
      itemsButton.dataset.sound = randomKeySoundName;
      itemsButton.classList.remove('items__button_fade_out');
    }, transitionDuration);
  }, 5000)

  // stats timer
  setInterval(function(){
    var statsCurrentDate  = moment();
    var statsHlEp3Date = moment('2006-05-22 12:00:00');
    var statsDatesDifferenceInMS = statsCurrentDate.diff(statsHlEp3Date);
    var statsTotal = moment.duration(statsDatesDifferenceInMS);
    document.querySelector('.stats__years').innerHTML = statsTotal.years();
    document.querySelector('.stats__months').innerHTML = statsTotal.months();
    document.querySelector('.stats__days').innerHTML = statsTotal.days();
    document.querySelector('.stats__hours').innerHTML = statsTotal.hours();
    document.querySelector('.stats__min').innerHTML = statsTotal.minutes();
    document.querySelector('.stats__sec').innerHTML = statsTotal.seconds();
  }, 1000);

});