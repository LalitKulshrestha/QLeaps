(function () {
  'use strict';
  var $ = function(s,r) { return (r || document).querySelector(s); };
  var $$ = function(s,r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
  var reducedMotion=motionPreference.matches, motionPaused=reducedMotion;
  var motionButton=document.querySelector('#motionToggle');
  function updateMotion() {
    document.documentElement.classList.toggle('motion-paused',motionPaused);
    if(motionButton){motionButton.textContent=motionPaused?'Play ambient motion':'Pause ambient motion';motionButton.setAttribute('aria-pressed',String(!motionPaused));}
    document.dispatchEvent(new Event('ql-motion-change'));
  }
  if(motionButton)motionButton.addEventListener('click',function(){motionPaused=!motionPaused;updateMotion();});
  motionPreference.addEventListener('change',function(e){reducedMotion=e.matches;motionPaused=reducedMotion;updateMotion();});
  updateMotion();
  var heroVideo=document.querySelector('.hero-video-player'), videoVisible=false;
  function syncVideo(){
    if(!heroVideo)return;
    if(motionPaused||document.hidden||!videoVisible){heroVideo.pause();return;}
    heroVideo.play().catch(function(){heroVideo.controls=true;});
  }
  if(heroVideo){
    if('IntersectionObserver' in window)new IntersectionObserver(function(entries){videoVisible=entries[0].isIntersecting;syncVideo();}).observe(heroVideo);
    else {videoVisible=true;syncVideo();}
    document.addEventListener('ql-motion-change',syncVideo);document.addEventListener('visibilitychange',syncVideo);
  }
  /* Original, soft grand-piano-style motif, occasional shore waves and distant birds synthesized without samples. Audio is created only after an explicit opt-in. */
  (function initBackgroundMusic(){
    if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
    var AudioEngine = window.AudioContext || window.webkitAudioContext;
    if(!AudioEngine)return;
    var musicButton=document.createElement('button');
    musicButton.type='button';musicButton.className='music-toggle';
    musicButton.setAttribute('role','switch');
    musicButton.setAttribute('aria-label','Background music');
    musicButton.setAttribute('aria-checked','false');
    musicButton.title='Optional soft piano, gentle shore waves and distant birds';
    musicButton.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg><span class="music-switch-track" aria-hidden="true"><span class="music-switch-thumb"></span></span><span class="music-state" aria-hidden="true">Off</span>';
    document.body.appendChild(musicButton);
    var engine=null,master=null,timer=null,enabled=false,step=0,nextTime=0,nextNatureTime=0;
    var eighth=60/84/2;
    // Light syncopated notes over warm harmony, without percussion or a driving bass.
    var harmony=[[50,54,57,61,64],[50,54,57,61,64],[47,50,54,57,61],[47,50,54,57,61],[52,55,59,62,66],[57,61,64,67,71],[50,54,57,61,64],[50,54,57,61,64]];
    var melody=[73,null,76,78,null,76,73,null,69,null,73,76,null,74,73,null,71,null,73,74,null,73,69,null,66,null,69,73,null,71,69,null,71,null,74,78,null,76,74,null,73,null,76,79,null,76,73,null,74,null,78,81,null,78,76,null,73,null,69,71,null,73,74,null];
    function tone(note,time,duration,level,bass){
      var voice=engine.createGain();
      var frequency=440*Math.pow(2,(note-69)/12);
      voice.gain.setValueAtTime(0,time);
      voice.gain.linearRampToValueAtTime(level,time+.009);
      voice.gain.exponentialRampToValueAtTime(level*.7,time+.11);
      voice.gain.exponentialRampToValueAtTime(.0001,time+duration);
      voice.connect(master);
      var sources=[];
      [1,2,3,4,5,6].forEach(function(partial){
        var oscillator=engine.createOscillator(),weight=engine.createGain();
        oscillator.type='sine';
        // Slight string inharmonicity and faster upper-partial decay soften the piano tone.
        oscillator.frequency.value=frequency*partial*Math.sqrt(1+.00008*partial*partial);
        var strength=[0,1,.28,.12,.05,.018,.008][partial];
        weight.gain.setValueAtTime(strength,time);
        weight.gain.exponentialRampToValueAtTime(.0001,time+duration/(1+(partial-1)*.3));
        oscillator.connect(weight);weight.connect(voice);
        oscillator.start(time);oscillator.stop(time+duration+.04);
        oscillator.onended=function(){oscillator.disconnect();weight.disconnect();};
        sources.push(oscillator);
      });
      sources[0].addEventListener('ended',function(){voice.disconnect();});
    }
    var waterBuffer=null,nextBirdTime=0;
    function natureSwell(time){
      // One quiet incoming wave and a longer retreat, followed by genuine silence.
      if(!waterBuffer){
        waterBuffer=engine.createBuffer(1,Math.ceil(engine.sampleRate*8),engine.sampleRate);
        var samples=waterBuffer.getChannelData(0),deep=0;
        for(var i=0;i<samples.length;i++){
          var white=Math.random()*2-1;
          deep=.98*deep+.02*white;
          samples[i]=deep*4+white*.18;
        }
      }
      var shore=engine.createBufferSource(),low=engine.createBiquadFilter(),high=engine.createBiquadFilter(),envelope=engine.createGain();
      shore.buffer=waterBuffer;
      high.type='highpass';high.frequency.value=65;high.Q.value=.45;
      low.type='lowpass';low.Q.value=.35;
      low.frequency.setValueAtTime(650,time);
      low.frequency.linearRampToValueAtTime(1500,time+2.4);
      low.frequency.linearRampToValueAtTime(500,time+7.5);
      envelope.gain.setValueAtTime(0,time);
      envelope.gain.linearRampToValueAtTime(.025,time+.35);
      envelope.gain.linearRampToValueAtTime(.14,time+2.4);
      envelope.gain.linearRampToValueAtTime(.07,time+4.2);
      envelope.gain.linearRampToValueAtTime(.018,time+6);
      envelope.gain.linearRampToValueAtTime(0,time+7.5);
      shore.connect(high);high.connect(low);low.connect(envelope);envelope.connect(master);
      shore.start(time);shore.stop(time+7.7);
      shore.onended=function(){shore.disconnect();high.disconnect();low.disconnect();envelope.disconnect();};
    }
    function distantBird(time){
      // Brief, irregular warbles: no sustained pure-tone whistle or repeating alarm.
      var base=1750+Math.random()*350;
      [0,.19,.43].forEach(function(offset,index){
        var start=time+offset,duration=.09+Math.random()*.05;
        var bird=engine.createOscillator(),flutter=engine.createOscillator(),depth=engine.createGain(),gain=engine.createGain();
        bird.type='triangle';flutter.frequency.value=27+Math.random()*12;depth.gain.value=35;
        flutter.connect(depth);depth.connect(bird.frequency);
        bird.frequency.setValueAtTime(base*(index===1?1.18:1),start);
        bird.frequency.exponentialRampToValueAtTime(base*(index===2?.92:1.35),start+duration*.45);
        bird.frequency.exponentialRampToValueAtTime(base*.98,start+duration);
        gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.022,start+.018);
        gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
        bird.connect(gain);gain.connect(master);bird.start(start);flutter.start(start);
        bird.stop(start+duration+.02);flutter.stop(start+duration+.02);
        bird.onended=function(){bird.disconnect();flutter.disconnect();depth.disconnect();gain.disconnect();};
      });
    }
    function schedule(){
      if(!enabled||!engine||engine.state!=='running'||document.hidden)return;
      // A delayed background timer must never queue a burst of missed notes.
      if(nextTime<engine.currentTime)nextTime=engine.currentTime+.05;
      if(engine.currentTime+.18>=nextNatureTime){natureSwell(engine.currentTime+.08);nextNatureTime=engine.currentTime+13+Math.random()*6;}
      if(engine.currentTime+.18>=nextBirdTime){distantBird(engine.currentTime+.08);nextBirdTime=engine.currentTime+16+Math.random()*12;}
      while(nextTime<engine.currentTime+.18){
        var bar=Math.floor(step/8)%8,position=step%8,chord=harmony[bar];
        if(position===0)chord.forEach(function(note,i){tone(note,nextTime+i*.018,4.5,.022,false);});
        var note=melody[step%melody.length];
        if(note!==null)tone(note-12,nextTime,3.2,.038,false);
        nextTime+=eighth;step=(step+1)%64;
      }
    }
    var wanted=false,startedAt=0;
    function updateMusicButton(){
      musicButton.setAttribute('aria-checked',String(enabled));
      musicButton.querySelector('.music-state').textContent=enabled?'On':(wanted?'Resume':'Off');
      musicButton.title=wanted&&!enabled?'Tap to resume music if your browser blocks playback.':'Optional soft piano, gentle shore waves and distant birds';
    }
    function releaseAudio(){
      enabled=false;clearInterval(timer);timer=null;
      var previous=engine,previousMaster=master;engine=null;master=null;
      if(previous){
        previousMaster.gain.cancelScheduledValues(previous.currentTime);
        previousMaster.gain.setTargetAtTime(0,previous.currentTime,.025);
        setTimeout(function(){previous.close().catch(function(){});},120);
      }
      updateMusicButton();
    }
    function stopMusic(){wanted=false;startedAt=0;releaseAudio();}
    function startMusic(){
      wanted=true;if(!startedAt)startedAt=Date.now();
      try{
        if(!engine){
          engine=new AudioEngine();waterBuffer=null;master=engine.createGain();master.gain.value=.22;
          var limiter=engine.createDynamicsCompressor();
          limiter.threshold.value=-18;limiter.knee.value=18;limiter.ratio.value=3;
          var warmth=engine.createBiquadFilter();warmth.type='lowpass';warmth.frequency.value=2400;warmth.Q.value=.5;
          master.connect(warmth);warmth.connect(limiter);limiter.connect(engine.destination);
          var current=engine;
          function activate(){
            if(engine!==current||!wanted||current.state!=='running'||document.hidden)return;
            if(!enabled){
              enabled=true;step=Math.floor(Math.max(0,Date.now()-startedAt)/1000/eighth)%64;
              nextTime=current.currentTime+.06;nextNatureTime=current.currentTime+.1;nextBirdTime=current.currentTime+5;
              clearInterval(timer);timer=setInterval(schedule,80);schedule();
            }
            updateMusicButton();
          }
          current.addEventListener('statechange',activate);
          current.resume().then(activate).catch(function(){if(engine===current)updateMusicButton();});
        }else{
          engine.resume().catch(function(){updateMusicButton();});
        }
      }catch(error){releaseAudio();}
      updateMusicButton();
    }
    musicButton.addEventListener('click',function(){if(enabled)stopMusic();else startMusic();});
    // Homepage-only audio; gesture fallback handles stricter browser playback policies.
    function resumeAfterGesture(event){
      if(wanted&&!enabled&&!musicButton.contains(event.target))startMusic();
    }
    document.addEventListener('pointerdown',resumeAfterGesture,{passive:true});
    document.addEventListener('keydown',resumeAfterGesture);
    document.addEventListener('visibilitychange',function(){
      if(!wanted||!engine)return;
      if(document.hidden)engine.suspend().catch(function(){});
      else engine.resume().then(function(){if(engine){nextTime=engine.currentTime+.06;schedule();}}).catch(function(){enabled=false;updateMusicButton();});
    });
    window.addEventListener('pagehide',releaseAudio);
    window.addEventListener('pageshow',function(event){
      if(!event.persisted)return;
      if(wanted)startMusic();else releaseAudio();
    });
    if(wanted)startMusic();

  })();

  var GOOGLE_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby0XQE0A8Bfsm6J10yGDsK_Efd30VGuRzN9jL0ovfeiBJ0qCh5dnwWC4UAf_L99YK6Pag/exec';
  var backendReady = false, candidateDetailsReady = false, jdReady = false, jobs = [], selectedJob = null, jobsState = 'loading';
  // Keep content and anchor destinations clear of the persistent header.
  function measureHeader() {
    document.documentElement.style.setProperty('--header-height', Math.ceil(($('.site-header') || document.body).getBoundingClientRect().height) + 'px');
  }
  var headerEl = $('.site-header'), navToggle = $('.nav-toggle');
  function closeNavigation(returnFocus) {
    if (!headerEl || !navToggle) return;
    headerEl.classList.remove('is-open'); navToggle.setAttribute('aria-expanded','false');
    if (returnFocus) navToggle.focus();
  }
  if (headerEl && navToggle) {
    headerEl.classList.add('nav-ready');
    navToggle.addEventListener('click',function(){
      var open = navToggle.getAttribute('aria-expanded') !== 'true';
      headerEl.classList.toggle('is-open',open); navToggle.setAttribute('aria-expanded',String(open));
    });
    headerEl.addEventListener('keydown',function(e){if(e.key==='Escape')closeNavigation(true);});
    headerEl.addEventListener('click',function(e){if(e.target.closest('nav a'))closeNavigation(false);});
    document.addEventListener('click',function(e){if(!headerEl.contains(e.target))closeNavigation(false);});
    headerEl.addEventListener('focusout',function(e){if(e.relatedTarget&&!headerEl.contains(e.relatedTarget))closeNavigation(false);});
  }
  var requestedJobId = new URLSearchParams(location.search).get('job_id');
  var requestedJobResolved = !requestedJobId;
  measureHeader();
  if ('ResizeObserver' in window && $('.site-header')) new ResizeObserver(measureHeader).observe($('.site-header'));
  else window.addEventListener('resize', measureHeader);

  /* Smooth scroll for in-page links */
  /* Smooth scroll for in-page links */
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '1'; el.style.transform = 'none';
    var header = document.querySelector('.site-header');
    var headerH = header ? header.getBoundingClientRect().height : 70;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (headerH + 12), behavior: reducedMotion ? 'auto' : 'smooth' });
  }
  $$('[data-target]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var targetId = a.getAttribute('data-target');
      if (targetId && document.getElementById(targetId)) {
        e.preventDefault();
        if (a.getAttribute('data-view')) setAudience(a.getAttribute('data-view'));
        scrollToId(targetId);
      }
    });
  });

  /* Reveal sections on scroll */
  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
      });
    }, { threshold: 0.06 });
    $$('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.style.opacity = '0'; el.style.transform = 'translateY(36px)';
      el.style.transition = 'opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1)';
      io.observe(el);
    });
  }

  var closingFlow = $('.closing-conversation');
  if(closingFlow && 'IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      closingFlow.classList.toggle('flow-visible',entries[0].isIntersecting);
    }).observe(closingFlow);
  }

  /* A visitor-controlled story connects hiring to the work ahead. */
  var moveStories = {
    account: ['01 / 03', 'The pitch is won.\nNow deliver on it.', 'Build the team around the brief: the craft, the pace and the people your new account needs.', 'The work ahead · Team gaps · Start dates'],
    specialist: ['02 / 03', 'One missing skill.\nA whole new possibility.', 'Find the depth your team needs, from marketing and creative craft to design, engineering and data.', 'The skill gap · Relevant work · Ways of working'],
    leader: ['03 / 03', 'The next chapter\nneeds the right lead.', 'Start with the decisions, team and responsibilities this person will own. Then shape the search around them.', 'The mandate · Team context · First priorities']
  };
  $$('[data-move]').forEach(function(button){
    button.addEventListener('click',function(){
      var story=moveStories[button.getAttribute('data-move')];
      if(!story)return;
      $$('[data-move]').forEach(function(other){other.setAttribute('aria-pressed',String(other===button));});
      $('#moveIndex').textContent=story[0];$('#moveTitle').textContent=story[1];
      $('#moveDescription').textContent=story[2];$('#moveFocus').textContent=story[3];
      var panel=$('.move-brief');
      if(!reducedMotion&&!motionPaused&&panel.animate)panel.animate([{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
    });
  });

  /* Interactive illustrative shortlist */
  var fitWrap = $('#qlFit');
  if (fitWrap) {
    var fitSlider = $('#qlFitSlider');
    var fitBtnVolume = $('#qlFitBtnVolume');
    var fitBtnFit = $('#qlFitBtnFit');
    var fitScoutImg = $('#qlFitScoutImg');
    var fitScoutBubble = $('#qlFitScoutBubble');
    var fitCap = $('#qlFitCap');
    var fitHint = $('#qlFitHint');
    var fitTray = $('#qlFitCardsTray');
    var dots = $$('.ql-fd', fitWrap);

    function applySieveState(progress) { // progress from 0 (Volume) to 100 (Fit)
      var ratio = progress / 100;
      if (fitBtnVolume) fitBtnVolume.setAttribute('aria-pressed', String(progress === 0));
      if (fitBtnFit) fitBtnFit.setAttribute('aria-pressed', String(progress === 100));
      if (fitSlider) fitSlider.setAttribute('aria-valuetext', progress + '% through the illustrative shortlist example');
      var isFit = ratio >= 0.7;
      var isMid = ratio > 0.25 && ratio < 0.7;

      // Update dots with physics scale, opacity, scatter bounce, and pulse rings
      dots.forEach(function (d, idx) {
        var isMatch = d.getAttribute('data-hi') === '1';
        if (isMatch) {
          d.style.background = '#FF6B4A';
          d.style.opacity = '1';
          d.style.transform = 'scale(' + (1 + ratio * 0.45) + ') translate(0, 0)';
          d.style.animation = isFit ? 'qlPulseRing 2.2s infinite' : 'none';
        } else {
          var dotScale = Math.max(0.14, 1 - ratio * 0.86);
          var dotOpacity = Math.max(0.06, 0.9 - ratio * 0.84);
          // Scatter physics: radial dispersal
          var angle = (idx * 47) % 360;
          var dist = ratio * 18;
          var scatterX = Math.cos(angle * Math.PI / 180) * dist;
          var scatterY = Math.sin(angle * Math.PI / 180) * dist;
          d.style.background = '#E9E7F5';
          d.style.opacity = dotOpacity;
          d.style.transform = 'translate(' + scatterX.toFixed(1) + 'px,' + scatterY.toFixed(1) + 'px) scale(' + dotScale + ')';
          d.style.animation = 'none';
        }
      });

      // Update button highlights
      if (fitBtnVolume && fitBtnFit) {
        fitBtnVolume.style.background = ratio < 0.5 ? 'rgba(255,255,255,.22)' : 'transparent';
        fitBtnVolume.style.color = ratio < 0.5 ? '#FFFFFF' : '#E9E7F5';
        fitBtnFit.style.background = ratio >= 0.5 ? '#FF6B4A' : 'transparent';
        fitBtnFit.style.color = '#FFFFFF';
      }

      // Update Scout's commentary & pose
      if (isFit) {
        if (fitScoutImg) fitScoutImg.src = 'assets/mascot/scout-excited.svg';
        if (fitScoutBubble) {
          fitScoutBubble.textContent = 'Three who fit beat thirty who might. Shortlist locked! ';
          fitScoutBubble.style.borderColor = '#FF6B4A';
          fitScoutBubble.style.background = 'rgba(255,107,74,.25)';
        }
        if (fitCap) fitCap.textContent = '3 who fit.';
        if (fitHint) fitHint.textContent = 'The curated shortlist';
        if (fitTray) fitTray.style.display = 'flex';
      } else if (isMid) {
        if (fitScoutImg) fitScoutImg.src = 'assets/mascot/scout-default.svg';
        if (fitScoutBubble) {
          fitScoutBubble.textContent = 'Filtering noise... testing craft, culture & track record.';
          fitScoutBubble.style.borderColor = '#4F46E5';
          fitScoutBubble.style.background = 'rgba(79,70,229,.35)';
        }
        if (fitCap) fitCap.textContent = Math.round(30 - ratio * 27) + ' candidates filtering...';
        if (fitHint) fitHint.textContent = 'Keep sliding toward Fit';
        if (fitTray) fitTray.style.display = 'none';
      } else {
        if (fitScoutImg) fitScoutImg.src = 'assets/mascot/scout-thinking.svg';
        if (fitScoutBubble) {
          fitScoutBubble.textContent = '30 resumes is mostly keyword noise. Slide to filter...';
          fitScoutBubble.style.borderColor = 'rgba(79,70,229,.6)';
          fitScoutBubble.style.background = 'rgba(79,70,229,.35)';
        }
        if (fitCap) fitCap.textContent = '30 who might.';
        if (fitHint) fitHint.textContent = 'Drag slider or tap to filter';
        if (fitTray) fitTray.style.display = 'none';
      }
    }

    if (fitSlider) {
      fitSlider.addEventListener('input', function () {
        applySieveState(parseFloat(fitSlider.value) || 0);
      });
    }

    if (fitBtnVolume) {
      fitBtnVolume.addEventListener('click', function () {
        if (fitSlider) fitSlider.value = 0; fitBtnVolume.setAttribute('aria-pressed','true'); fitBtnFit.setAttribute('aria-pressed','false');
        applySieveState(0);
      });
    }

    if (fitBtnFit) {
      fitBtnFit.addEventListener('click', function () {
        if (fitSlider) fitSlider.value = 100; fitBtnFit.setAttribute('aria-pressed','true'); fitBtnVolume.setAttribute('aria-pressed','false');
        applySieveState(100);
      });
    }

    var dotsGrid = $('#qlFitDotsGrid');
    if (dotsGrid) {
      dotsGrid.addEventListener('click', function () {
        var cur = parseFloat(fitSlider ? fitSlider.value : 0) || 0;
        var nextVal = cur >= 50 ? 0 : 100;
        if (fitSlider) fitSlider.value = nextVal;
        applySieveState(nextVal);
      });
    }
  }

  /* How we work: highlight step on hover */
  var steps = $$('.ql-step');
  steps.forEach(function (st, i) {
    st.addEventListener('mouseenter', function () {
      steps.forEach(function (o, j) {
        var d = $('.ql-step-dot', o);
        if (!d) return;
        d.style.background = i === j ? '#4F46E5' : '#14213D';
        d.style.transform = 'scale(' + (i === j ? 1.14 : 1) + ')';
      });
    });
  });

  /* Meet Scout: pose picker */
  var poseImg = $('#qlPoseImg'), poseAnim = $('#qlPoseAnim'), poseWrap = $('#qlPoseWrap'), poseLine = $('#qlPoseLine');
  var poseBtns = $$('.ql-pose');
  poseBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      poseBtns.forEach(function (o) { var on = o === b; o.style.background = on ? '#14213D' : 'transparent'; o.style.color = on ? '#FFFFFF' : '#14213D'; });
      var slug = b.getAttribute('data-pose');
      if (poseImg) {
        poseImg.src = 'assets/mascot/scout-' + slug + '.svg';
        poseImg.alt = 'Scout, ' + slug;
      }
      if (poseAnim) poseAnim.style.animation = (slug === 'sleepy' ? 'qlBreathe 3.4s' : 'qlBob 3s') + ' ease-in-out infinite';
      if (poseLine) poseLine.textContent = b.getAttribute('data-line');
      if (poseWrap) {
        poseWrap.style.transform = 'scale(.9) translateY(10px)';
        setTimeout(function () { poseWrap.style.transform = 'scale(1) translateY(0)'; }, 160);
      }
    });
  });


  function setAudience(view, moveFocus) {
    var hp = $('#hiringPanel'), tp = $('#talentPanel');
    if (!hp || !tp) return;
    var talent = view === 'talent';
    hp.hidden = talent;
    tp.hidden = !talent;
    ['hiring','talent'].forEach(function (name) {
      var tab = $('#' + name + 'Tab');
      if (!tab) return;
      var on = name === view;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && moveFocus) tab.focus();
    });
    document.body.classList.toggle('talent-view',talent);
    var hd = $('#heroDescription');
    if (hd) {
      hd.textContent = talent ?
        'Your next move deserves a proper conversation. Explore marketing, creative, design and technology opportunities, or let Scout help you share your CV.' :
        'For brands building what’s next, and agencies making it happen. Specialist hiring for marketing, creative, design and technology teams across India.';
    }
    if (talent) loadJobs();
  }
  $$('[data-audience]').forEach(function (tab) {
    tab.addEventListener('click', function () { setAudience(tab.getAttribute('data-audience')); });
    tab.addEventListener('keydown', function (e) {
      if (['ArrowLeft','ArrowRight','Home','End'].indexOf(e.key) === -1) return;
      e.preventDefault();
      var target = e.key === 'Home' ? 'hiring' : e.key === 'End' ? 'talent' : tab.getAttribute('data-audience') === 'hiring' ? 'talent' : 'hiring';
      setAudience(target, true);
    });
  });
  // Hero links also switch views before scrolling into their hidden panel.
  $$('a[data-target="cv"], a[data-target="roles"]').forEach(function (link) {
    link.addEventListener('click', function () { setAudience('talent'); scrollToId(link.getAttribute('data-target')); });
  });
  $$('a[data-target="contact"], a[data-target="post-job"]').forEach(function (link) {
    link.addEventListener('click', function () { setAudience('hiring'); scrollToId(link.getAttribute('data-target')); });
  });
  function syncHash() {
    var hash = location.hash.slice(1);
    if (['roles','cv','insights','returners'].indexOf(hash) >= 0) setAudience('talent');
    if (['contact','post-job','specialisms','how','fit','buyers','ai-matching'].indexOf(hash) >= 0) setAudience('hiring');
  }
  window.addEventListener('hashchange', syncHash);

  function token() {
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(function (b) { return b.toString(16).padStart(2,'0'); }).join('');
  }
  async function googleRead(params) {
    // Attempt standard CORS fetch with credentials: 'omit' to prevent 3rd-party cookies
    var query = new URLSearchParams(params);
    var url = GOOGLE_SCRIPT_WEBAPP_URL + '?' + query.toString();
    var readController=new AbortController(), readTimeout=setTimeout(function(){readController.abort();},8000);
    try {
      var res = await fetch(url, {
        method: 'GET',
        signal: readController.signal,
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        var json = await res.json();
        if (json && typeof json === 'object') return json;
      }
    } catch (fetchErr) {
      // ContentService can require its read-only JSONP path.
    } finally {clearTimeout(readTimeout);}

    // Google ContentService's documented JSONP fallback. Read-only public jobs or
    // random-token receipts only; no personal details or resume URLs in responses.
    return new Promise(function (resolve, reject) {
      var callback = 'ql_' + token();
      var node = document.createElement('script');
      var timer;
      function cleanup() { clearTimeout(timer); node.remove(); delete window[callback]; }
      window[callback] = function (data) { cleanup(); resolve(data); };
      query.set('callback', callback);
      node.src = GOOGLE_SCRIPT_WEBAPP_URL + '?' + query.toString();
      node.onerror = function () { cleanup(); reject(new Error('The Google service could not be reached.')); };
      timer = setTimeout(function () { cleanup(); reject(new Error('The Google service did not reply.')); }, 12000);
      document.head.appendChild(node);
    });
  }
  var jobsLoading = null;
  var jobsLoadedAt = 0;
  async function loadJobs(force) {
    if (jobsLoading) return jobsLoading;
    if (!force && Date.now() - jobsLoadedAt < 60000) return;
    jobsLoading = (async function () {
      try {
        var result = await googleRead({action:'jobs'});
        if (result.version !== 2 || result.status !== 'success' || !Array.isArray(result.jobs)) throw new Error('Job service not ready');
        backendReady = true;
        candidateDetailsReady = result.candidate_details === true;
        jobsState='ready';
        status($('#applicationServiceStatus'),candidateDetailsReady ? 'Ready to receive your CV. Uploaded files are private to our recruitment team.' : 'CV submissions are temporarily unavailable. Please email contact@qleaps.in or try again shortly.',candidateDetailsReady?'':'error');
        jdReady = result.jd_attachments === true;
        var jdFile = $('#jdFile');
        if (jdFile) jdFile.disabled = !jdReady;
        var jdAvail = $('#jdAvailability');
        if (jdAvail) jdAvail.textContent = jdReady ? 'Optional PDF or Word JD, up to 5 MB. Stored privately for our recruitment team.' : 'JD uploads will be available shortly. Please include the key requirements in the role summary.';
        jobs = result.jobs.filter(function (job) { return typeof job.id === 'string' && /^QLJ-[A-F0-9]{12}$/.test(job.id); });
        jobsLoadedAt = Date.now();
        var postJobBtn = $('#postJobButton');
        var jobFrm = $('#jobForm');
        if (postJobBtn && jobFrm) postJobBtn.disabled = jobFrm.dataset.saved === 'true';
        var postAvail = $('#postingAvailability');
        if (postAvail) postAvail.textContent = 'Your role is saved for our team to review. Only approved jobs appear on the website.';
        resolveRequestedJob();
        renderJobs();
      } catch (error) {
        jobsState='error';
        status($('#applicationServiceStatus'),'We couldn’t connect the CV service. Please email contact@qleaps.in or try again shortly.','error');
        var jStatus = $('#jobsStatus');
        var pAvail = $('#postingAvailability');
        if (!backendReady) {
          if (jStatus) jStatus.textContent = 'We couldn’t load current opportunities. Please retry or contact our team; no roles are shown until confirmed.';
          if (pAvail) pAvail.textContent = 'Public job posting will be available shortly. In the meantime, share your hiring brief with our team below.';
        } else {
          if (jStatus) jStatus.textContent = 'We couldn’t refresh the roles. Please try again later; availability is checked when you apply.';
        }
      } finally {
        var list = $('#rolesList'); if(list) list.setAttribute('aria-busy','false');
      }
    })();
    try { await jobsLoading; } finally { jobsLoading = null; }
  }
  function element(tag, text, className) {
    var el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function renderJobs() {
    var mandatesTitles = $('#activeMandatesTitles');
    var mandatesStatus = $('#activeMandatesStatus');
    if (mandatesTitles && mandatesStatus) {
      if (jobs.length > 0) {
        var topTitles = jobs.slice(0, 4).map(function (j) { return j.title; }).join(' · ');
        mandatesTitles.textContent = topTitles;
        mandatesStatus.textContent = '● ' + jobs.length + (jobs.length === 1 ? ' active mandate approved' : ' active mandates approved');
        mandatesStatus.style.color = '#047857';
      } else {
        mandatesTitles.textContent = 'Marketing · Creative · Design · Technology';
        mandatesStatus.textContent = 'No public roles listed right now · General CVs welcome';
        mandatesStatus.style.color = '#2563EB';
      }
    }

    var searchEl = $('#jobSearch');
    var search = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var catEl = $('#jobCategory');
    var area = catEl ? catEl.value : '';
    var matching = jobs.filter(function (job) {
      return (!area || job.area === area) && (!search || [job.title,job.company,job.location].join(' ').toLowerCase().indexOf(search) !== -1);
    });
    var list = $('#rolesList');
    if (!list) return;
    list.replaceChildren();
    var jobsStatus = $('#jobsStatus');
    if (jobsStatus) {
      jobsStatus.textContent = jobsState==='loading' ? 'Loading approved opportunities…' : jobsState==='error' ? 'We couldn’t refresh current roles. Please retry or contact our team.' : !jobs.length ? 'No approved roles are listed right now. Share your CV so we can discuss future opportunities.' :
        !matching.length ? 'No roles match those filters. Try another search or share your CV.' : matching.length + (matching.length === 1 ? ' open role' : ' open roles');
    }
    matching.forEach(function (job) {
      var card = element('article',undefined,'job-card');
      var head = element('div',undefined,'job-card-head');
      var info = element('div');
      info.append(element('h2',job.title,'job-title'),element('p',job.company,'job-company'));
      var apply = element('a','Apply for this role','job-apply');
      apply.href = '/submit-cv/?job_id=' + encodeURIComponent(job.id);
      head.append(info,apply);
      var meta = element('div',undefined,'job-meta');
      [job.area,job.location,job.work_mode,job.experience,job.salary,job.closes ? 'Closes ' + job.closes : ''].filter(Boolean).forEach(function (text) {meta.append(element('span',text));});
      var details = element('details');
      details.append(element('summary','About this role'),element('p',job.description,'job-description'));
      card.append(head,meta,details);
      list.append(card);
    });
  }
  var jobSearchEl = $('#jobSearch');
  if (jobSearchEl) jobSearchEl.addEventListener('input',renderJobs);
  var jobCatEl = $('#jobCategory');
  if (jobCatEl) jobCatEl.addEventListener('change',renderJobs);
  function selectJob(job) {
    var applicationForm=$('#cvForm');
    if(!applicationForm || applicationForm.dataset.sending==='true') return;
    applicationForm.dataset.saved='false';
    var submitBtn = applicationForm.querySelector('button[type=submit]');
    if (submitBtn) {
      submitBtn.disabled=false;
      submitBtn.textContent='Submit your CV';
    }
    status($('#cvStatus'),'','');
    selectedJob = job;
    requestedJobResolved = true;
    requestedJobId = job ? job.id : null;
    if (!job && new URLSearchParams(location.search).has('job_id')) {
      var cleanUrl = new URL(location.href); cleanUrl.searchParams.delete('job_id');
      history.replaceState(null,'',cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
    }
    var appJobId = $('#applicationJobId');
    if (appJobId) appJobId.value = job ? job.id : '';
    var target = $('#applicationTarget');
    if (target) {
      target.replaceChildren();
      target.hidden = !job;
    }
    if (applicationForm.elements && applicationForm.elements.role) {
      var role = applicationForm.elements.role;
      role.readOnly = !!job;
      if (!job) { role.value=''; return; }
      role.value=job.title;
      if (applicationForm.elements.area) applicationForm.elements.area.value=job.area;
      if (target) {
        target.append(element('span','Applying for ' + job.title + ' at ' + job.company));
        var clear=element('button','General application instead','clear-job');
        clear.type='button';clear.addEventListener('click',function(){selectJob(null);});
        target.append(clear);
      }
    }
  }

  function resolveRequestedJob() {
    if (!$('#cvForm') || !requestedJobId) return;
    var match = jobs.find(function(job){return job.id === requestedJobId;});
    if (match) { selectJob(match); return; }
    requestedJobResolved = false;
    var target = $('#applicationTarget');
    if(target) {
      target.hidden=false; target.replaceChildren(element('span','This role is closed or unavailable. Choose a general application or browse current roles.'));
      var general=element('button','Make a general application','clear-job'); general.type='button';
      general.addEventListener('click',function(){selectJob(null);}); target.append(general);
    }
  }
  if(requestedJobId && $('#applicationTarget')) {
    $('#applicationTarget').hidden=false;
    $('#applicationTarget').textContent='Checking the role you selected…';
  }
  var retryJobs=$('#retryJobs');
  if(retryJobs)retryJobs.addEventListener('click',function(){
    var list=$('#rolesList'); if(list)list.setAttribute('aria-busy','true');
    status($('#jobsStatus'),'Checking current opportunities…',''); loadJobs(true);
  });

  /* Tactile CV Upload & Scout Mascot Reactivity */
  var fileInput=$('#cvFile'), dropzone=$('#cvDropzone')||$('#cvFileBox'), scoutIcon=$('#scoutCvIcon')||$('#scoutCatcherImg'), cvDropText=$('#cvDropText')||$('#cvFileLabel'), cvErrSpan=$('[data-err="cv"]');

  function getMascotSrc(iconName) {
    if (!scoutIcon) return 'assets/mascot/' + iconName;
    var current = scoutIcon.getAttribute('src') || '';
    var idx = current.lastIndexOf('/');
    var prefix = idx !== -1 ? current.substring(0, idx + 1) : 'assets/mascot/';
    return prefix + iconName;
  }

  function fileValid(file) {
    return !!file && /\.(pdf|doc|docx)$/i.test(file.name) && file.size > 0 && file.size <= 5 * 1024 * 1024;
  }

  function resetCvUpload() {
    if (fileInput) fileInput.value = '';
    if (dropzone) dropzone.classList.remove('drag-active', 'file-attached');
    if (scoutIcon) {
      scoutIcon.src = getMascotSrc('scout-default.svg');
      scoutIcon.classList.remove('scout-animated-wag', 'scout-animated-perk');
    }
    if (cvDropText) {
      cvDropText.textContent = 'Drop your CV here or click to browse';
    }
    var attachedCard = $('#cvAttachedCard');
    if (attachedCard) attachedCard.remove();
    var defaultInfo = $('#cvDefaultInfo');
    if (defaultInfo) defaultInfo.style.display = 'flex';
  }

  function handleCvFile(file) {
    if (!file) {
      resetCvUpload();
      return;
    }
    if (!fileValid(file)) {
      resetCvUpload();
      if (fileInput) fileInput.value = '';
      if (scoutIcon) {
        scoutIcon.src = getMascotSrc('scout-skeptical.svg');
        scoutIcon.classList.remove('scout-animated-wag');
      }
      if (cvErrSpan) cvErrSpan.textContent = 'Please choose a PDF or Word document up to 5 MB.';
      return;
    }

    if (cvErrSpan) cvErrSpan.textContent = '';
    if (dropzone) dropzone.classList.remove('drag-active');
    if (scoutIcon) {
      scoutIcon.src = getMascotSrc('scout-excited.svg');
      scoutIcon.classList.add('scout-animated-wag');
    }

    var defaultInfo = $('#cvDefaultInfo');
    if (defaultInfo) defaultInfo.style.display = 'flex';
    if (cvDropText) cvDropText.textContent='CV attached. Click to choose a different file.';

    var existingCard = $('#cvAttachedCard');
    if (existingCard) existingCard.remove();

    var sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    var card = document.createElement('div');
    card.id = 'cvAttachedCard';
    card.className = 'cv-attached-card';
    card.innerHTML =
      '<div class="cv-attached-info">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>' +
          '<polyline points="14 2 14 8 20 8"></polyline>' +
          '<line x1="16" y1="13" x2="8" y2="13"></line>' +
          '<line x1="16" y1="17" x2="8" y2="17"></line>' +
          '<polyline points="10 9 9 9 8 9"></polyline>' +
        '</svg>' +
        '<div style="display:flex;flex-direction:column;gap:2px">' +
          '<span class="cv-attached-name">' + 'Attached document' + '</span>' +
          '<span class="cv-attached-size">' + sizeMb + ' MB · Ready to submit</span>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="cv-remove-btn" id="cvRemoveFileBtn">Remove file</button>';

    $('.cv-attached-name',card).textContent = file.name;
    var container = dropzone.querySelector('div') || dropzone;
    dropzone.parentElement.appendChild(card);

    var removeBtn = $('#cvRemoveFileBtn');
    if (removeBtn) {
      removeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        resetCvUpload(); fileInput.focus();
      });
    }
  }

  if (dropzone && fileInput) {
    var innerDiv = dropzone.querySelector('div');
    if (innerDiv && !$('#cvDefaultInfo')) {
      innerDiv.id = 'cvDefaultInfo';
    }

    ['dragenter', 'dragover'].forEach(function (type) {
      dropzone.addEventListener(type, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-active');
        if (scoutIcon) {
          scoutIcon.src = getMascotSrc('scout-excited.svg');
          scoutIcon.classList.add('scout-animated-wag');
        }
        if (cvDropText) cvDropText.textContent = 'Release to hand your CV to Scout!';
      });
    });

    dropzone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!dropzone.contains(e.relatedTarget)) {
        dropzone.classList.remove('drag-active');
        if (!fileInput.files.length) {
          if (scoutIcon) {
            scoutIcon.src = getMascotSrc('scout-default.svg');
            scoutIcon.classList.remove('scout-animated-wag');
          }
          if (cvDropText) cvDropText.textContent = 'Drop your CV here or click to browse';
        }
      }
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-active');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleCvFile(fileInput.files[0]);
        fileInput.dispatchEvent(new Event('input',{bubbles:true}));
      }
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files.length) {
        handleCvFile(fileInput.files[0]);
      }
    });

    var cvForm = $('#cvForm');
    if (cvForm && scoutIcon) {
      cvForm.addEventListener('focusin', function (e) {
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'select' || tag === 'textarea') {
          scoutIcon.classList.remove('scout-animated-perk');
          void scoutIcon.offsetWidth;
          scoutIcon.classList.add('scout-animated-perk');
          setTimeout(function () { scoutIcon.classList.remove('scout-animated-perk'); }, 450);
        }
      });
    }
  }

  function status(el,message,type) {if(!el)return;el.textContent=message;el.className='submission-status'+(type?' '+type:'');}
  function readFile(file) {
    return new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(String(reader.result).split(',')[1]);};reader.onerror=function(){reject(new Error('We couldn’t read that CV. Please choose the file again.'));};reader.readAsDataURL(file);});
  }
  async function receipt(requestId) {
    for(var attempt=0;attempt<5;attempt++) {
      var result=await googleRead({action:'receipt',request_id:requestId});
      if(result.status==='success'||result.status==='error') return result;
      await new Promise(function(resolve){setTimeout(resolve,2000);});
    }
    return {status:'pending'};
  }
  function bindForm(id,statusId,kind) {
    var form=$('#'+id), message=$('#'+statusId);
    if (!form || !message) return;
    // Retain the token across an uncertain retry of the same payload.
    var lastPayload='', requestId='';
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      if(form.dataset.sending==='true') return;
      var honeypot=form.elements['bot-field'];
      if(!form.reportValidity()||(honeypot&&honeypot.value)) return;
      if(kind==='candidate' && !requestedJobResolved){status(message,'Please resolve the selected role above, or choose a general application.','error');return;}
      if(kind==='candidate' && !candidateDetailsReady){
        status(message,'CV submissions are temporarily unavailable while we connect the application service. Please email contact@qleaps.in or try again shortly.','error');
        loadJobs(true); return;
      }
      if(kind==='job'&&!backendReady){status(message,'Please share your hiring brief with our team below while job posting is being connected.','error');return;}
      var payload=new URLSearchParams();
      payload.set('name',form.elements.namedItem('name').value.trim());payload.set('email',form.elements.namedItem('email').value.trim());payload.set('consent','yes');
      var btn=form.querySelector('button[type=submit]'), previous=btn.textContent;
      form.dataset.sending='true';
      btn.disabled=true;btn.textContent='Sending…';status(message,'','');
      var timeout, sent=false;
      try {
        if(kind==='job') {
          payload.set('action','post_job');payload.set('form_type','Job Posting');
          ['company','role','area','city','work_mode','experience','salary','description','closes'].forEach(function(k){payload.set(k,form.elements[k] ? form.elements[k].value.trim() : '');});
          var jd=form.elements.jd_file.files[0];
          if(jd){if(!jdReady)throw new Error('JD uploads are not available yet.');if(!fileValid(jd))throw new Error('Choose a PDF or Word JD up to 5 MB.');payload.set('jd_data',await readFile(jd));payload.set('jd_name',jd.name);payload.set('jd_type',jd.type);}
        } else if(kind==='candidate') {
          var file=(fileInput&&fileInput.files&&fileInput.files[0])||(form.elements.cv&&form.elements.cv.files&&form.elements.cv.files[0]);
          if(!fileValid(file))throw new Error('Please attach a PDF or Word CV up to 5 MB.');
          if(form.elements.phone&&form.elements.phone.value.replace(/\D/g,'').length<10)throw new Error('Please enter a valid phone number.');
          payload.set('form_type','Candidate Application');
          if(backendReady)payload.set('action','apply');
          ['phone','city','role','link','linkedin','current_title','notice','relocation','salary','area'].forEach(function(k){if(form.elements[k])payload.set(k,form.elements[k].value.trim());});
          var expVal=form.elements.exp?form.elements.exp.value:'';
          payload.set('experience',expVal);
          var appJobId=$('#applicationJobId');
          payload.set('job_id',appJobId?appJobId.value:'');
          if(payload.get('job_id')&&!backendReady)throw new Error('Please refresh the opportunities before applying to this role.');
          var areaVal=form.elements.area?form.elements.area.value:'General';
          payload.set('message','Specialism: '+areaVal+(expVal?' | Experience: '+expVal:''));
          payload.set('file_data',await readFile(file));payload.set('file_name',file.name);payload.set('file_type',file.type);
        } else {
          var isFeedback=kind==='feedback';
          var textControl=form.elements[isFeedback?'message':'text'];
          var context=isFeedback ? ['Topic: '+form.elements.topic.value,'Role / organisation: '+form.elements.role.value].join(' | ')+'\n\n' : '';
          payload.set('form_type',isFeedback?'Editorial Feedback':'Contact Inquiry');
          payload.set('message',context+textControl.value.trim());
          if(backendReady)payload.set('action','contact');
        }
        var raw=payload.toString();
        if(raw!==lastPayload||!requestId){requestId=token();lastPayload=raw;}
        payload.set('request_id',requestId);
        var controller=new AbortController();
        timeout=setTimeout(function(){controller.abort();},35000);
        await fetch(GOOGLE_SCRIPT_WEBAPP_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload.toString(),signal:controller.signal});
        sent=true;clearTimeout(timeout);
        if(!backendReady){status(message,'Sent for processing. If you don’t hear from us, email contact@qleaps.in. Your details remain here; please avoid submitting again until our team confirms.','');return;}
        var result=await receipt(requestId);
        if(result.status==='error'){requestId='';var serverError=new Error(result.message||'We couldn’t save your submission. Please try again.');serverError.confirmed=true;throw serverError;}
        if(result.status!=='success'){status(message,'Your request is still processing. Receipt is not confirmed yet. Please contact our team before submitting again.','');return;}
        status(message,(kind==='job'?'Your job is saved for review. It will appear after approval. ':kind==='candidate'?'Your profile and CV are saved'+(selectedJob?' for '+selectedJob.title+'. ':'. '):'Your enquiry is saved. ')+'Reference: '+result.reference,'success');
        // Keep submitted forms disabled to prevent accidental duplicate uploads.
        form.dataset.saved='true';
        btn.textContent='Submitted';
      } catch(err) {
        status(message,err.name==='AbortError'?'The request timed out. Please contact our team before retrying; delivery is uncertain.':sent&&!err.confirmed?'We couldn’t confirm receipt. Please contact our team before retrying.':err.message,'error');
      } finally {
        clearTimeout(timeout);
        form.dataset.sending='false';
        if(form.dataset.saved!=='true'){btn.disabled=false;btn.textContent=previous;}
      }
    });
    form.addEventListener('input',function(){if(form.dataset.saved==='true'){form.dataset.saved='false';var b=form.querySelector('button[type=submit]');b.disabled=false;b.textContent=kind==='job'?'Submit for review':kind==='candidate'?'Submit your CV':'Send message';status(message,'','');}});
  }
  $$('.ql-tip').forEach(function(tip){
    var btn = $('.ql-tip-btn', tip);
    if (!btn) return;
    btn.addEventListener('click',function(){
      var open=$('.ql-tip-pts',tip) && $('.ql-tip-pts',tip).style.display==='none';
      $$('.ql-tip').forEach(function(other){
        var pts = $('.ql-tip-pts',other), b = $('.ql-tip-btn',other);
        if (pts) pts.style.display='none';
        if (b) b.textContent='Read the tips →';
      });
      if(open){
        var pts = $('.ql-tip-pts',tip);
        if (pts) pts.style.display='flex';
        btn.textContent='Show less';
      }
    });
  });
  bindForm('jobForm','jobStatus','job');bindForm('cvForm','cvStatus','candidate');bindForm('msgForm','msgStatus','contact');
  if ($('#feedbackForm')) bindForm('feedbackForm','feedbackStatus','feedback');

  /* One filter state: category and query always apply together. */
  var activeBlogCategory='all', blogSearch=$('#blogSearch');
  function filterBlog() {
    var query=blogSearch ? blogSearch.value.trim().toLowerCase() : '', count=0;
    $$('.blog-card').forEach(function(card){
      var visible=(activeBlogCategory==='all'||card.dataset.category===activeBlogCategory)&&(!query||card.textContent.toLowerCase().includes(query));
      card.hidden=!visible; if(visible)count++;
    });
    var results=$('#blogResultsStatus'); if(results)results.textContent=count ? count+' articles found' : 'No articles match. Try another topic or clear your search.';
  }
  $$('.blog-filter-btn').forEach(function(btn){
    btn.setAttribute('aria-pressed',String(btn.classList.contains('active')));
    btn.addEventListener('click',function(){
      activeBlogCategory=btn.dataset.filter||'all';
      $$('.blog-filter-btn').forEach(function(other){other.classList.toggle('active',other===btn);other.setAttribute('aria-pressed',String(other===btn));});
      filterBlog();
    });
  });
  if(blogSearch)blogSearch.addEventListener('input',filterBlog);
  $$('.blog-card').forEach(function(card,index){
    var btn=$('.blog-read-btn',card),drawer=$('.blog-drawer',card);
    if(!btn||!drawer)return;
    drawer.id='memo-content-'+index;btn.setAttribute('aria-controls',drawer.id);btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click',function(){var open=drawer.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));btn.textContent=open?'Close Memo ↑':'Read Memo →';});
  });

  var legacyDestinations={how:'/how-we-work/',contact:'/contact/#contact','post-job':'/contact/#post-job',roles:'/roles/',cv:'/submit-cv/#cv','ai-matching':'/how-we-work/',insights:'/blogs/',returners:'/careers/#returners-program'};
  if((location.pathname==='/'||location.pathname==='/index.html')&&legacyDestinations[location.hash.slice(1)]) {
    location.replace(legacyDestinations[location.hash.slice(1)]);
  }
  syncHash();
  if ($('#cvForm') || $('#jobForm') || $('#rolesList') || location.hash === '#roles' || location.hash === '#cv') {
    loadJobs();
  } else if ('requestIdleCallback' in window) {
    requestIdleCallback(function () {
      var rolesEl = document.getElementById('roles');
      if (rolesEl && 'IntersectionObserver' in window) {
        var ro = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { loadJobs(); ro.disconnect(); }
        }, { rootMargin: '400px' });
        ro.observe(rolesEl);
      } else {
        setTimeout(loadJobs, 2500);
      }
    });
  } else {
    setTimeout(loadJobs, 2500);
  }

  /* =========================================================================
     Hero Section Kinetic Orbs with Dynamic Collision Lightning & Lightening Flash
     ========================================================================= */
  function initHeroClashCanvas() {
    var canvas = document.getElementById('heroCanvas');
    var topSection = document.getElementById('top');
    if (!canvas || !topSection) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = 0, height = 0, dpr = 1;
    var animFrameId = null;
    var isVisible = false;
    var lastClashTime = 0;

    var circle1 = {
      x: 0, y: 0,
      vx: 1.25, vy: 0.85,
      baseR: 185,
      r: 185,
      mass: 1.2,
      pulse: 0
    };

    var circle2 = {
      x: 0, y: 0,
      vx: -1.05, vy: -1.35,
      baseR: 135,
      r: 135,
      mass: 0.9,
      dashOffset: 0,
      pulse: 0
    };

    var clashes = [];

    function orbitInset(){return 2;}
    function containCircle(circle){
      var inset=orbitInset();
      var left=inset+circle.r,right=width-inset-circle.r;
      var top=inset+circle.r,bottom=height-inset-circle.r;
      if(circle.x<left){circle.x=left;circle.vx=Math.abs(circle.vx);}
      if(circle.x>right){circle.x=right;circle.vx=-Math.abs(circle.vx);}
      if(circle.y<top){circle.y=top;circle.vy=Math.abs(circle.vy);}
      if(circle.y>bottom){circle.y=bottom;circle.vy=-Math.abs(circle.vy);}
    }

    function resize() {
      var rect = topSection.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      var scale = Math.max(0.65, Math.min(1.15, width / 1100));
      var radiusLimit = Math.max(12, (Math.min(width,height) - 2 * orbitInset()) * .36);
      circle1.r = Math.min(circle1.baseR * scale, radiusLimit);
      circle2.r = Math.min(circle2.baseR * scale, radiusLimit);

      if (circle1.x === 0 && circle1.y === 0) {
        circle1.x = width * 0.72;
        circle1.y = height * 0.32;
        circle2.x = width * 0.32;
        circle2.y = height * 0.68;
      }
      containCircle(circle1);containCircle(circle2);
    }

    // A short, local electrical arc follows the tangent at the point of contact.
    function triggerClash(cx, cy, nx, ny, c1, c2) {
      if (reducedMotion || motionPaused || Date.now() - lastClashTime < 1600) return;
      c1.pulse = 0.65;
      c2.pulse = 0.65;
      lastClashTime = Date.now();
      var span = Math.min(150, width * 0.2);
      var tx = -ny, ty = nx;
      var points = [];
      for (var j = 0; j <= 12; j++) {
        var along = (j / 12 - 0.5) * span;
        var offset = j === 0 || j === 12 || j === 6 ? 0 : (Math.random() - 0.5) * 24;
        points.push({x:cx + tx * along + nx * offset,y:cy + ty * along + ny * offset});
      }
      var bolts = [{points:points,isFork:false}];
      [3,8].forEach(function(index){
        var root = points[index];
        var side = index === 3 ? -1 : 1;
        bolts.push({isFork:true,points:[root,{x:root.x+nx*side*18+tx*8,y:root.y+ny*side*18+ty*8},{x:root.x+nx*side*30-tx*4,y:root.y+ny*side*30-ty*4}]});
      });
      var sparks = [];
      for (var k = 0; k < 8; k++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 0.8 + Math.random() * 1.8;
        sparks.push({x:cx,y:cy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,alpha:1,size:0.7+Math.random()});
      }
      clashes.push({x:cx,y:cy,span:span,age:0,maxAge:24,bolts:bolts,sparks:sparks});
    }

    function update() {
      if (width === 0 || height === 0) return;

      var speedFactor = reducedMotion ? 0.35 : 1.0;

      // Circle 1 motion
      circle1.x += circle1.vx * speedFactor;
      circle1.y += circle1.vy * speedFactor;
      if (circle1.pulse > 0) circle1.pulse = Math.max(0, circle1.pulse - 0.04);

      containCircle(circle1);

      // Circle 2 motion
      circle2.x += circle2.vx * speedFactor;
      circle2.y += circle2.vy * speedFactor;
      circle2.dashOffset += 0.45;
      if (circle2.pulse > 0) circle2.pulse = Math.max(0, circle2.pulse - 0.04);

      containCircle(circle2);

      // Collision detection between Circle 1 and Circle 2
      var dx = circle2.x - circle1.x;
      var dy = circle2.y - circle1.y;
      var dist = Math.hypot(dx, dy);
      var minDist = circle1.r + circle2.r;

      if (dist < minDist && dist > 1) {
        var nx = dx / dist;
        var ny = dy / dist;

        var cx = circle1.x + nx * (circle1.r + (dist - circle1.r - circle2.r) * 0.5);
        var cy = circle1.y + ny * (circle1.r + (dist - circle1.r - circle2.r) * 0.5);

        var overlap = minDist - dist;
        circle1.x -= nx * overlap * 0.5;
        circle1.y -= ny * overlap * 0.5;
        circle2.x += nx * overlap * 0.5;
        circle2.y += ny * overlap * 0.5;

        var kx = circle1.vx - circle2.vx;
        var ky = circle1.vy - circle2.vy;
        var p = 2 * (nx * kx + ny * ky) / (circle1.mass + circle2.mass);

        if (nx * kx + ny * ky > 0) {
          circle1.vx -= p * circle2.mass * nx;
          circle1.vy -= p * circle2.mass * ny;
          circle2.vx += p * circle1.mass * nx;
          circle2.vy += p * circle1.mass * ny;

          var s1 = Math.hypot(circle1.vx, circle1.vy);
          if (s1 < 0.9) { circle1.vx = (circle1.vx / s1 || 1) * 1.15; circle1.vy = (circle1.vy / s1 || 0.5) * 1.15; }
          if (s1 > 2.2) { circle1.vx = (circle1.vx / s1) * 2.0; circle1.vy = (circle1.vy / s1) * 2.0; }

          var s2 = Math.hypot(circle2.vx, circle2.vy);
          if (s2 < 0.9) { circle2.vx = (circle2.vx / s2 || -1) * 1.15; circle2.vy = (circle2.vy / s2 || -0.5) * 1.15; }
          if (s2 > 2.2) { circle2.vx = (circle2.vx / s2) * 2.0; circle2.vy = (circle2.vy / s2) * 2.0; }

          triggerClash(cx, cy, nx, ny, circle1, circle2);
        }
      }

      // Collision separation can push a circle outward; contain it again before drawing.
      containCircle(circle1);containCircle(circle2);

      // Gentle convergence bias if no clash for > 5 seconds
      if (Date.now() - lastClashTime > 4500 && dist > minDist * 1.3) {
        var pull = 0.006;
        circle1.vx += (dx / dist) * pull;
        circle1.vy += (dy / dist) * pull;
        circle2.vx -= (dx / dist) * pull;
        circle2.vy -= (dy / dist) * pull;
      }

      for (var i = clashes.length - 1; i >= 0; i--) {
        var c = clashes[i];
        c.age++;
        c.sparks.forEach(function (sp) {
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.94;
          sp.vy *= 0.94;
          sp.alpha = Math.max(0, 1 - c.age / c.maxAge);
        });
        if (c.age >= c.maxAge) clashes.splice(i, 1);
      }
    }

    function draw() {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Lightening effect: subtle ambient flash across purple canvas when clashing
      var maxFlash = 0;
      clashes.forEach(function (c) {
        var f = Math.max(0, 1 - c.age / 7);
        if (f > maxFlash) maxFlash = f;
      });
      if (maxFlash > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.32 * maxFlash).toFixed(3) + ')';
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Circle 1 (Purple/indigo filled orb)
      ctx.save();
      var p1 = circle1.pulse;
      var g1 = ctx.createRadialGradient(circle1.x, circle1.y, circle1.r * 0.1, circle1.x, circle1.y, circle1.r);
      g1.addColorStop(0, 'rgba(' + Math.floor(79 + 50 * p1) + ', ' + Math.floor(70 + 40 * p1) + ', 229, ' + (0.16 + 0.14 * p1).toFixed(3) + ')');
      g1.addColorStop(0.7, 'rgba(79, 70, 229, ' + (0.09 + 0.08 * p1).toFixed(3) + ')');
      g1.addColorStop(1, 'rgba(79, 70, 229, ' + (0.02 + 0.04 * p1).toFixed(3) + ')');
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(circle1.x, circle1.y, circle1.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 1.8 + 2 * p1;
      ctx.strokeStyle = p1 > 0 ? 'rgba(167, 139, 250, ' + (0.4 + 0.5 * p1).toFixed(2) + ')' : 'rgba(79, 70, 229, 0.22)';
      if (p1 > 0) {
        ctx.shadowColor = '#A78BFA';
        ctx.shadowBlur = 16 * p1;
      }
      ctx.beginPath();
      ctx.arc(circle1.x, circle1.y, circle1.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw Circle 2 (Dashed dynamic orb)
      ctx.save();
      var p2 = circle2.pulse;
      var g2 = ctx.createRadialGradient(circle2.x, circle2.y, circle2.r * 0.15, circle2.x, circle2.y, circle2.r);
      g2.addColorStop(0, 'rgba(' + Math.floor(99 + 60 * p2) + ', 102, 241, ' + (0.12 + 0.12 * p2).toFixed(3) + ')');
      g2.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(circle2.x, circle2.y, circle2.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -circle2.dashOffset;
      ctx.lineWidth = 2.2 + 2 * p2;
      ctx.strokeStyle = p2 > 0 ? 'rgba(192, 132, 252, ' + (0.5 + 0.45 * p2).toFixed(2) + ')' : 'rgba(79, 70, 229, 0.35)';
      if (p2 > 0) {
        ctx.shadowColor = '#C084FC';
        ctx.shadowBlur = 18 * p2;
      }
      ctx.beginPath();
      ctx.arc(circle2.x, circle2.y, circle2.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw Clashes: Natural Angled Lightning Strike & Diffuse Lightening Bloom
      clashes.forEach(function (c) {
        var progress = c.age / c.maxAge;
        var fade = 1 - progress;

        // 1. Natural Soft Diffuse Lightening Bloom (smooth organic illumination around impact epicenter)
        if (c.age < 12) {
          var bloomFade = 1 - c.age / 12;
          var bloomR = c.span * 0.75;
          var bloomGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, bloomR);
          bloomGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (0.35 * bloomFade).toFixed(3) + ')');
          bloomGrad.addColorStop(0.25, 'rgba(216, 180, 254, ' + (0.24 * bloomFade).toFixed(3) + ')');
          bloomGrad.addColorStop(0.65, 'rgba(147, 51, 234, ' + (0.12 * bloomFade).toFixed(3) + ')');
          bloomGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
          ctx.save();
          ctx.fillStyle = bloomGrad;
          ctx.beginPath();
          ctx.arc(c.x, c.y, bloomR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 2. Jagged Natural Lightning Bolts (active electric crackle with dynamic frame micro-jitter)
        if (c.age < 15) {
          var boltFade = 1 - c.age / 15;
          c.bolts.forEach(function (bolt) {
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'bevel';

            // Outer electric violet / lavender glow aura
            ctx.strokeStyle = 'rgba(192, 132, 252, ' + ((bolt.isFork ? 0.6 : 0.88) * boltFade).toFixed(3) + ')';
            ctx.lineWidth = bolt.isFork ? 2.0 : 3.6;
            ctx.shadowColor = '#8B5CF6';
            ctx.shadowBlur = bolt.isFork ? 8 : 16;
            ctx.beginPath();
            bolt.points.forEach(function (pt, idx) {
              // Rapid micro-jitter on each frame gives authentic live electric plasma crackle
              var jx = (Math.random() - 0.5) * 0.8;
              var jy = (Math.random() - 0.5) * 0.8;
              if (idx === 0) ctx.moveTo(pt.x + jx, pt.y + jy);
              else ctx.lineTo(pt.x + jx, pt.y + jy);
            });
            ctx.stroke();

            // Brilliant white-hot core strike filament
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.95 * boltFade).toFixed(3) + ')';
            ctx.lineWidth = bolt.isFork ? 0.9 : 1.6;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#FFFFFF';
            ctx.stroke();

            ctx.restore();
          });
        }

        // 3. Sparks flying naturally from impact
        c.sparks.forEach(function (sp) {
          if (sp.alpha <= 0) return;
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, ' + sp.alpha.toFixed(3) + ')';
          ctx.shadowColor = '#C084FC';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      });

      ctx.restore();
    }

    function loop() {
      animFrameId=null;
      if(!isVisible||document.hidden||motionPaused)return;
      update();draw();animFrameId=requestAnimationFrame(loop);
    }
    function syncCanvas(){
      if(animFrameId!==null){cancelAnimationFrame(animFrameId);animFrameId=null;}
      if(motionPaused){draw();return;}
      if(isVisible&&!document.hidden)animFrameId=requestAnimationFrame(loop);
    }
    window.addEventListener('resize',function(){resize();if(motionPaused)draw();},{passive:true});
    if('ResizeObserver' in window)new ResizeObserver(function(){resize();if(motionPaused)draw();}).observe(topSection);
    document.addEventListener('visibilitychange',syncCanvas);
    document.addEventListener('ql-motion-change',syncCanvas);
    resize();draw();
    if('IntersectionObserver' in window)new IntersectionObserver(function(entries){isVisible=entries[0].isIntersecting;syncCanvas();}).observe(topSection);
    else {isVisible=true;syncCanvas();}
  }

  /* ==========================================================================
     Interactive Sample Calibrated Dossier Modal (The Executive Deliverable)
     ========================================================================== */
  var DOSSIER_CANDIDATES = [
    {
      id: 'cmo',
      tabTitle: '01 · CMO (Growth & D2C)',
      codeName: 'Candidate A — Chief Marketing Officer',
      headline: 'Ex-Consumer Unicorn CMO · 14 Yrs Experience · Mumbai / Bengaluru',
      targetRole: 'Chief Marketing Officer / Head of Growth',
      overallScore: '9.6',
      radarScores: [
        { label: 'Domain & P&L Mastery', score: '9.8 / 10', pct: 98 },
        { label: 'Growth & CAC Scaling', score: '9.7 / 10', pct: 97 },
        { label: 'Cross-Functional Velocity', score: '9.4 / 10', pct: 94 },
        { label: 'Motivation & transition discussion', score: '9.5 / 10', pct: 95 }
      ],
      preflight: [
        { kicker: 'Current Compensation', val: '₹68L Base + 20% Variable + ESOPS' },
        { kicker: 'Target Compensation', val: '₹82L – ₹85L Fixed Base' },
        { kicker: 'Notice Period Status', val: '30 Days (Serving notice · 22 days remaining)' },
        { kicker: 'Counter-Offer Risk', val: 'To discuss — transition plans need direct confirmation' },
        { kicker: 'Confidential References', val: '2 Backchannel partner calls completed (Ex-CBO & Board)' },
        { kicker: 'Location & Relocation', val: 'Bengaluru based · Open to Tier-1 Hybrid' }
      ],
      partnerCommentary: 'Exceptional 0-to-1 and 1-to-10 performance marketing architect. Scaled ARR from ₹30Cr to ₹180Cr in 30 months while cutting Blended CAC by 28%. Unusually analytical for a creative brand storyteller; builds attribution engines hands-on and holds agencies strictly accountable. Recommended for high-growth consumer or fintech ventures seeking immediate ARR velocity without undisciplined ad spend burn.',
      tradeoff: 'Demands clear mandate ownership and direct CEO reporting line. Will become disenchanted if micromanaged by non-marketing executive committees. Best paired with an operations-heavy COO or disciplined CFO.',
      diagnosticProbes: [
        '“Walk through your exact unit-economic defense when Blended CAC spiked 40% post-iOS privacy rollout in your last venture.”',
        '“How did you balance creative brand storytelling with 200+ weekly performance ad variants without brand equity dilution?”'
      ]
    },
    {
      id: 'vpe',
      tabTitle: '02 · VP Engineering (Distributed Systems)',
      codeName: 'Candidate B — VP of Engineering',
      headline: 'High-Concurrency Systems & Platform Lead · 16 Yrs Experience · Bengaluru / Pune',
      targetRole: 'VP of Engineering / Head of Platform Infrastructure',
      overallScore: '9.5',
      radarScores: [
        { label: 'Architecture & Distributed Systems', score: '9.9 / 10', pct: 99 },
        { label: 'Talent Magnet & Retention', score: '9.5 / 10', pct: 95 },
        { label: 'High-Concurrency Delivery', score: '9.6 / 10', pct: 96 },
        { label: 'Executive Governance & FinOps', score: '9.2 / 10', pct: 92 }
      ],
      preflight: [
        { kicker: 'Current Compensation', val: '₹85L Fixed + ₹20L Bonus + RSUs' },
        { kicker: 'Target Compensation', val: '₹1.05Cr Fixed + Meaningful Long-Term Equity' },
        { kicker: 'Notice Period Status', val: '60 Days (Pre-agreed 30-day buyout release eligible)' },
        { kicker: 'Counter-Offer Risk', val: 'To discuss — autonomy and reasons for moving' },
        { kicker: 'Confidential References', val: 'Verified via former VP Product and Principal Cloud Architect' },
        { kicker: 'Location & Relocation', val: 'Bengaluru / Pune · Open to Mumbai' }
      ],
      partnerCommentary: 'A rare engineering leader who scaled distributed microservices across 40,000 req/sec at 99.99% SLA while maintaining hands-on code review rigor. Built an 80-engineer organization with less than 6% annualized attrition over 4 years. Understands infrastructure FinOps deeply, having reduced AWS/GCP cloud run-rate by $1.2M annually without latency regression. Ideal anchor for Series B/C scale or enterprise modernization.',
      tradeoff: 'Prioritizes architectural rigor and automated testing discipline over quick-and-dirty hackathon prototypes. Requires a clear product roadmap to prevent premature microservices decomposition.',
      diagnosticProbes: [
        '“Describe the most severe distributed transaction failure or data corruption your team handled in production, and how your post-mortem changed deployment guardrails.”',
        '“How do you quantitatively govern the boundary between shipping new feature velocity and paying down technical debt?”'
      ]
    },
    {
      id: 'ecd',
      tabTitle: '03 · Executive Creative Director (Brand & UX)',
      codeName: 'Candidate C — Executive Creative Director',
      headline: 'Award-Winning Creative & Brand Systems Lead · 13 Yrs Experience · Mumbai / NCR',
      targetRole: 'Executive Creative Director / Head of Brand & Design',
      overallScore: '9.4',
      radarScores: [
        { label: 'Creative Vision & Art Direction', score: '9.8 / 10', pct: 98 },
        { label: 'Omnichannel Brand Identity', score: '9.6 / 10', pct: 96 },
        { label: 'Consumer Cultural Resonance', score: '9.4 / 10', pct: 94 },
        { label: 'Cross-Functional Design Velocity', score: '9.1 / 10', pct: 91 }
      ],
      preflight: [
        { kicker: 'Current Compensation', val: '₹52L Fixed Base + Campaign Incentives' },
        { kicker: 'Target Compensation', val: '₹62L – ₹65L Fixed Base' },
        { kicker: 'Notice Period Status', val: '30 Days (Direct partner pre-alignment)' },
        { kicker: 'Counter-Offer Risk', val: 'To discuss — motivations and counter-offer exposure' },
        { kicker: 'Confidential References', val: 'Discreetly vetted with 2 Top Agency Founders & 1 CMO' },
        { kicker: 'Location & Relocation', val: 'Mumbai / NCR · Open to Tier-1 Hybrid' }
      ],
      partnerCommentary: 'Combines tier-1 international design sensibility with deep understanding of multi-tier Indian consumer vernaculars. Built headline campaigns that achieved viral organic reach without inflated paid distribution budgets. Equally adept at crafting pixel-perfect design systems, television/digital film narratives, and packaging typography. Seeking a visionary leadership team ready to build a generational brand.',
      tradeoff: 'Requires an executive seat at the table with direct access to founders. If treated as a ticket-execution production service for marketing managers, their strategic leverage will be lost.',
      diagnosticProbes: [
        '“How do you bridge the divide between purely aesthetic high-craft visual design and performance conversion metrics?”',
        '“Tell us about a time a client or CEO rejected your boldest campaign proposal and how you steered alignment without diluting the core idea.”'
      ]
    }
  ];

  function initDossierModal() {
    var activeIdx = 0, previousFocus = null, previousOverflow = '', inertStates = [];

    function createModalDOM() {
      var existing = $('#dossierBackdrop');
      if (existing) return existing;
      var isSubdir = window.location.pathname.includes('/') && window.location.pathname.split('/').filter(Boolean).length > 0;
      var logoSrc = isSubdir ? '../assets/logo/ql-logo-horizontal-rev.svg' : 'assets/logo/ql-logo-horizontal-rev.svg';
      var contactUrl = isSubdir ? '../contact/' : 'contact/';

      var b = document.createElement('div');
      b.id = 'dossierBackdrop';
      b.className = 'dossier-backdrop';
      b.setAttribute('role', 'dialog');
      b.setAttribute('aria-modal', 'true');
      b.setAttribute('aria-describedby','dossierSampleNote');
      b.setAttribute('aria-label', 'Calibrated Shortlist Dossier');

      b.innerHTML =
        '<div class="dossier-modal">' +
          '<div class="dossier-header">' +
            '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
              '<img src="' + logoSrc + '" alt="Quantum Leaps" height="24">' +
              '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:15px;letter-spacing:-.01em">Calibrated Shortlist Dossier</span>' +
              '<span style="font-size:11px;font-weight:700;background:rgba(37,99,235,0.35);border:1px solid rgba(147,197,253,0.4);color:#93C5FD;padding:3px 10px;border-radius:999px;letter-spacing:.05em;text-transform:uppercase">Executive Deliverable</span>' +
            '</div>' +
            '<button type="button" class="dossier-close-btn" id="dossierCloseBtn" aria-label="Close dossier">✕</button>' +
          '</div>' +
          '<p class="dossier-sample-note" id="dossierSampleNote">Illustrative sample deliverable · Fictional profiles and figures. No real candidate, placement or benchmark data. Scores demonstrate a layout, not a validated prediction.</p>' +
          '<div class="dossier-tabs" id="dossierTabs" role="group" aria-label="Example profiles"></div>' +
          '<div class="dossier-body" id="dossierBody"></div>' +
          '<div class="dossier-footer-cta">' +
            '<div style="display:flex;flex-direction:column;gap:2px">' +
              '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:15px;color:#0F172A">Ready for calibrated candidate dossiers on your next search?</span>' +
              '<span style="font-size:13px;color:#64748B">Discuss your brief, assessment criteria and a realistic shortlist timeline.</span>' +
            '</div>' +
            '<a href="' + contactUrl + '" class="header-cta" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;padding:10px 22px;border-radius:999px;background:#2563EB;color:#FFFFFF;font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(37,99,235,0.3)">' +
              'Let’s talk hiring →' +
            '</a>' +
          '</div>' +
        '</div>';

      document.body.appendChild(b);

      b.addEventListener('click', function (e) {
        if (e.target === b) closeDossier();
      });

      var closeBtn = $('#dossierCloseBtn', b);
      if (closeBtn) closeBtn.addEventListener('click', closeDossier);

      return b;
    }

    function renderTabs(b) {
      var tabsContainer = $('#dossierTabs', b);
      if (!tabsContainer) return;
      tabsContainer.innerHTML = '';
      DOSSIER_CANDIDATES.forEach(function (cand, idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dossier-tab-btn' + (idx === activeIdx ? ' active' : '');
        btn.textContent = cand.tabTitle;
        btn.setAttribute('aria-pressed',String(idx===activeIdx));
        btn.addEventListener('click', function () {
          activeIdx = idx;
          renderTabs(b);
          renderCandidate(b, DOSSIER_CANDIDATES[activeIdx]);
          $$('.dossier-tab-btn',b)[activeIdx].focus();
        });
        tabsContainer.appendChild(btn);
      });
    }

    function renderCandidate(b, cand) {
      var body = $('#dossierBody', b);
      if (!body) return;

      var scoresHtml = cand.radarScores.map(function (s) {
        var parts = s.score.split('/');
        var num = parts[0].trim();
        var den = parts[1] ? ('/' + parts[1].trim()) : '';
        return (
          '<div class="dossier-score-card">' +
            '<div class="dossier-score-header">' +
              '<span class="dossier-score-label">' + s.label + '</span>' +
              '<span class="dossier-score-val">' + num + ' <span class="dossier-score-denom">' + den + '</span></span>' +
            '</div>' +
            '<div class="dossier-meter">' +
              '<div class="dossier-meter-fill" style="width:' + s.pct + '%"></div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      var preflightHtml = cand.preflight.map(function (p) {
        return (
          '<div class="dossier-preflight-item">' +
            '<span style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748B">' + p.kicker + '</span>' +
            '<span class="dossier-preflight-val">' + p.val + '</span>' +
          '</div>'
        );
      }).join('');

      var probesHtml = cand.diagnosticProbes.map(function (pr) {
        return '<li style="margin-bottom:6px">' + pr + '</li>';
      }).join('');

      body.innerHTML =
        '<div class="dossier-candidate-hero">' +
          '<div style="display:flex;flex-direction:column;gap:6px;max-width:580px">' +
            '<div style="display:flex;align-items:center;gap:8px">' +
              '<span style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2563EB">Fictional candidate example</span>' +
              '<span style="width:6px;height:6px;border-radius:50%;background:#059669"></span>' +
              '<span style="font-size:12px;font-weight:700;color:#059669">Illustrative details</span>' +
            '</div>' +
            '<h2 style="margin:0;font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:clamp(22px,2.8vw,28px);color:#0F172A">' + cand.codeName + '</h2>' +
            '<p style="margin:0;font-size:14.5px;color:#475569">' + cand.headline + '</p>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;align-items:flex-end;background:#F8FAFC;border:1px solid #E2E8F0;padding:10px 18px;border-radius:16px;gap:2px">' +
            '<div style="display:flex;align-items:baseline;gap:4px">' +
              '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:800;font-size:28px;color:#2563EB">' + cand.overallScore + '</span>' +
              '<span style="font-size:14px;color:#64748B;font-weight:600">/ 10</span>' +
            '</div>' +
            '<span style="font-size:11px;font-weight:700;color:#059669;letter-spacing:.04em;text-transform:uppercase">Example rubric only</span>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:12px">' +
          '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#64748B">01 / Competency &amp; Radar Scorecard</span>' +
          '<div class="dossier-scorecard-grid">' + scoresHtml + '</div>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:12px">' +
          '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#64748B">02 / India Pre-Flight Operational Verification</span>' +
          '<div class="dossier-preflight-box">' + preflightHtml + '</div>' +
        '</div>' +

        '<div class="dossier-commentary">' +
          '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#2563EB">Quantum Leaps Partner Appraisal &amp; Context</span>' +
          '<p style="margin:0;font-size:14.5px;line-height:1.65;color:#1E293B">' + cand.partnerCommentary + '</p>' +
        '</div>' +

        '<div class="dossier-tradeoff">' +
          '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#D97706">Candid Tradeoff &amp; Executive Watchout</span>' +
          '<p style="margin:0;font-size:14px;line-height:1.6;color:#78350F">' + cand.tradeoff + '</p>' +
        '</div>' +

        '<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:18px;padding:20px 24px;display:flex;flex-direction:column;gap:10px">' +
          '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#475569">Round-1 Recommended Executive Probes (Tailored for CEO / Board Interview)</span>' +
          '<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;font-size:13.5px;color:#334155;line-height:1.55">' + probesHtml + '</ul>' +
        '</div>';
    }

    function openDossier() {
      previousFocus=document.activeElement; previousOverflow=document.body.style.overflow;
      var b = createModalDOM();
      inertStates=Array.from(document.body.children).filter(function(el){return el!==b;}).map(function(el){var state=[el,el.inert];el.inert=true;return state;});
      renderTabs(b);
      renderCandidate(b, DOSSIER_CANDIDATES[activeIdx]);
      b.classList.add('active');
      document.body.style.overflow = 'hidden';
      $('#dossierCloseBtn',b).focus();
    }

    function closeDossier() {
      var b = $('#dossierBackdrop');
      if (b) {
        b.classList.remove('active');
        document.body.style.overflow = previousOverflow;
      inertStates.forEach(function(state){state[0].inert=state[1];}); inertStates=[];
      if(previousFocus&&previousFocus.isConnected)previousFocus.focus();
      }
    }

    document.addEventListener('keydown', function (e) {
      var modal=$('#dossierBackdrop'); if(!modal||!modal.classList.contains('active'))return;
      if (e.key === 'Escape') closeDossier();
      if (e.key === 'Tab') {
        var focusable=$$('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]',modal).filter(function(el){return el.getClientRects().length;});
        var first=focusable[0],last=focusable[focusable.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.open-dossier-btn, [data-open-dossier]');
      if (trigger) {
        e.preventDefault();
        openDossier();
      }
    });
  }

  initHeroClashCanvas();
  initDossierModal();
})();
