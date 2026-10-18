(function () {
  'use strict';
  var $ = function(s,r) { return (r || document).querySelector(s); };
  var $$ = function(s,r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GOOGLE_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby0XQE0A8Bfsm6J10yGDsK_Efd30VGuRzN9jL0ovfeiBJ0qCh5dnwWC4UAf_L99YK6Pag/exec';
  var backendReady = false, jdReady = false, jobs = [], selectedJob = null;
  // Keep content and anchor destinations clear of the persistent header.
  function measureHeader() {
    document.documentElement.style.setProperty('--header-height', Math.ceil($('.site-header').getBoundingClientRect().height) + 'px');
  }
  measureHeader();
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe($('.site-header'));
  else window.addEventListener('resize', measureHeader);

  /* Smooth scroll for in-page links */
  /* Smooth scroll for in-page links */
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '1'; el.style.transform = 'none';
    var header = document.querySelector('.site-header');
    var headerH = header ? header.getBoundingClientRect().height : 70;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (headerH + 12), behavior: 'smooth' });
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

  /* Hero: arc draw, Scout hop and speech bubble */
  var arc = $('#qlArc'), dot = $('#qlDot'), scout = $('#qlScout'), bubble = $('#qlBubble');
  var lines = ['Hi, I’m Scout. Looking for your next leap?', 'I sniff out good fits.', 'Three who fit beat thirty who might.', 'Your CV goes to a person. Not a pile.', 'One more jump. Then treats.'];
  var arriving = false;
  var lineIdx = 0, hopping = false, bubbleOn = false, bubbleT;
  function showBubble(on) { if (!bubble) return; bubbleOn = on; bubble.style.transform = 'scale(' + (on ? 1 : 0) + ')'; }
  setTimeout(function () { if (arc) arc.setAttribute('stroke-dashoffset', '0'); }, 150);
  function scoutEntrance() {
    if (!scout || reducedMotion) return;
    arriving = true;
    showBubble(false);
    scout.classList.add('scout-arriving');
    var finished = false, fallback;
    function finish() {
      if (finished) return;
      finished = true; clearTimeout(fallback);
      scout.removeEventListener('animationend', onEnd);
      scout.classList.remove('scout-arriving');
      scout.classList.add('scout-settled');
      if (bubble) {
        bubble.textContent = 'Made it! Ready for your next leap?';
        showBubble(true);
        bubbleT = setTimeout(function () { showBubble(false); }, 3200);
      }
    }
    function onEnd(event) {
      if (event.target === scout && event.animationName === 'qlScoutEntrance') finish();
    }
    scout.addEventListener('animationend', onEnd);
    fallback = setTimeout(finish, 4100);
  }
  // Run once when the hero is actually visible, including visits to a deep link.
  if (scout && !reducedMotion) {
    if ('IntersectionObserver' in window) {
      var entranceObserver = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          entranceObserver.disconnect(); scoutEntrance();
        }
      }, { threshold: 0.15 });
      entranceObserver.observe(scout.parentElement);
    } else { scoutEntrance(); }
  }

  function hop(quiet) {
    if (!scout || arriving || hopping || reducedMotion) return;
    hopping = true;
    if (!quiet) {
      lineIdx = (lineIdx + 1) % lines.length;
      bubble.textContent = lines[lineIdx];
      showBubble(true);
      clearTimeout(bubbleT);
      bubbleT = setTimeout(function () { showBubble(false); }, 3200);
    }
    scout.style.transition = 'transform .3s cubic-bezier(.2,.8,.3,1)';
    scout.style.transform = 'translateY(-70px) rotate(-8deg) scale(1,1.04)';
    setTimeout(function () {
      scout.style.transition = 'transform .12s ease-out';
      scout.style.transform = 'translateY(0) rotate(0deg) scale(1.06,.92)';
      if (dot) dot.style.transform = 'scale(1.4)';
    }, 320);
    setTimeout(function () {
      hopping = false;
      scout.style.transition = 'transform .5s cubic-bezier(.3,1.8,.5,1)';
      scout.style.transform = 'translateY(0) rotate(0deg) scale(1,1)';
    }, 470);
    setTimeout(function () { if (dot) dot.style.transform = 'scale(1)'; }, 760);
  }
  if (scout) { scout.addEventListener('click', function () { hop(false); }); scout.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hop(false); } }); }
  setInterval(function () { if (!reducedMotion && !document.hidden && !bubbleOn) hop(true); }, 7000);

  /* --- 1. THE "30 DOWN TO 3" TACTILE SIEVE --- */
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
    try {
      var res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        var json = await res.json();
        if (json && typeof json === 'object') return json;
      }
    } catch (fetchErr) {
      // Fall through to JSONP only if fetch fails in legacy environments
    }

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
        jdReady = result.jd_attachments === true;
        $('#jdFile').disabled = !jdReady;
        $('#jdAvailability').textContent = jdReady ? 'Optional PDF or Word JD, up to 5 MB. Stored privately for our recruitment team.' : 'JD uploads will be available shortly. Please include the key requirements in the role summary.';
        jobs = result.jobs.filter(function (job) { return typeof job.id === 'string' && /^QLJ-[A-F0-9]{12}$/.test(job.id); });
        jobsLoadedAt = Date.now();
        $('#postJobButton').disabled = $('#jobForm').dataset.saved === 'true';
        $('#postingAvailability').textContent = 'Your role is saved for our team to review. Only approved jobs appear on the website.';
        renderJobs();
      } catch (error) {
        if (!backendReady) {
          $('#jobsStatus').textContent = 'We’re getting the latest opportunities ready. You can still share your CV below or contact our team.';
          $('#postingAvailability').textContent = 'Public job posting will be available shortly. In the meantime, share your hiring brief with our team below.';
        } else {
          $('#jobsStatus').textContent = 'We couldn’t refresh the roles. Please try again later; availability is checked when you apply.';
        }
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
    var search = $('#jobSearch').value.trim().toLowerCase();
    var area = $('#jobCategory').value;
    var matching = jobs.filter(function (job) {
      return (!area || job.area === area) && (!search || [job.title,job.company,job.location].join(' ').toLowerCase().indexOf(search) !== -1);
    });
    var list = $('#rolesList');
    list.replaceChildren();
    $('#jobsStatus').textContent = !jobs.length ? 'No approved roles are listed right now. Share your CV so we can discuss future opportunities.' :
      !matching.length ? 'No roles match those filters. Try another search or share your CV.' : matching.length + (matching.length === 1 ? ' open role' : ' open roles');
    matching.forEach(function (job) {
      var card = element('article',undefined,'job-card');
      var head = element('div',undefined,'job-card-head');
      var info = element('div');
      info.append(element('h3',job.title),element('p',job.company,'job-company'));
      var apply = element('button','Apply for this role','job-apply');
      apply.type='button';
      apply.addEventListener('click',function () { selectJob(job); setAudience('talent'); scrollToId('cv'); });
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

  /* Scout's original CV catcher: cursor gaze, drag reactions and paper-plane catch. */
  var fileInput=$('#cvFile'), fileBox=$('#cvFileBox'), catcher=$('#scoutCatcherImg'), catcherBubble=$('#scoutCatcherBubble');
  function resetFile() {
    var lbl = $('#cvFileLabel'); if (lbl) lbl.textContent='Drop your CV here, or browse';
    var sub = $('#cvFileSub'); if (sub) { sub.textContent='PDF or Word, up to 5 MB'; sub.style.color='#5B5F6B'; }
    if (fileBox) fileBox.classList.remove('file-attached','drag-active');
    if (catcher) { catcher.src='assets/mascot/scout-default.svg';catcher.style.transform='none'; }
    if (catcherBubble) catcherBubble.textContent='Drag your CV over here — I’ll catch it!';
    var pill = $('#cvBrowsePill'); if (pill) pill.textContent='Browse files';
  }
  function fileValid(file) {return !!file && /\.(pdf|doc|docx)$/i.test(file.name) && file.size>0 && file.size<=5*1024*1024;}
  function showFile(file) {
    if(!file) {resetFile();return;}
    if(!fileValid(file)) {
      if (fileInput) fileInput.value='';
      resetFile();
      var sub = $('#cvFileSub');
      if (sub) { sub.textContent='Please choose a PDF or Word file up to 5 MB.'; sub.style.color='#b42318'; }
      if (catcher) catcher.src='assets/mascot/scout-skeptical.svg';
      if (catcherBubble) catcherBubble.textContent='That one needs another look. PDF or Word, up to 5 MB.';
      return;
    }
    if (fileBox) fileBox.classList.add('file-attached');
    var lbl = $('#cvFileLabel'); if (lbl) lbl.textContent=file.name;
    var sub = $('#cvFileSub'); if (sub) sub.textContent=(file.size/(1024*1024)).toFixed(2)+' MB · Attached and ready to submit';
    var pill = $('#cvBrowsePill'); if (pill) pill.textContent='Replace file';
    if (catcher) catcher.src='assets/mascot/scout-excited.svg';
    if (catcherBubble) catcherBubble.textContent='Caught it! Ready for your next leap?';
    if(!reducedMotion) {
      var plane=$('#cvPaperPlane');
      if (plane) {
        plane.style.animation='none';
        void plane.offsetWidth;
        plane.style.animation='qlPaperPlaneFlight .85s ease forwards';
      }
      if (catcher) {
        catcher.style.animation='qlScoutCatchHop .85s ease';
        setTimeout(function(){catcher.style.animation='none';},900);
      }
    }
  }
  function gaze(event) {
    if(reducedMotion || !fileInput || fileInput.files.length || !fileBox || !catcher) return;
    var rect=fileBox.getBoundingClientRect();
    var ratio=Math.max(0,Math.min(1,(event.clientX-rect.left)/(rect.width||1)));
    catcher.src='assets/mascot/scout-thinking.svg';
    catcher.style.transform='translate(' + ((ratio-.5)*12).toFixed(1)+'px,-8px) rotate('+((ratio-.5)*20).toFixed(1)+'deg)';
  }
  if (fileBox && fileInput && catcher && catcherBubble) {
    fileBox.addEventListener('mousemove',gaze);
    fileBox.addEventListener('mouseleave',function(){catcher.style.transform='none';if(!fileInput.files.length)catcher.src='assets/mascot/scout-default.svg';});
    fileBox.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click();}});
    ['dragenter','dragover'].forEach(function(type){fileBox.addEventListener(type,function(e){e.preventDefault();fileBox.classList.add('drag-active');gaze(e);catcherBubble.textContent='Drop it here. I’m ready.';});});
    fileBox.addEventListener('dragleave',function(e){if(!fileBox.contains(e.relatedTarget)){fileBox.classList.remove('drag-active');catcher.style.transform='none';}});
    fileBox.addEventListener('drop',function(e){e.preventDefault();fileBox.classList.remove('drag-active');if(e.dataTransfer.files.length){fileInput.files=e.dataTransfer.files;showFile(fileInput.files[0]);}});
    fileInput.addEventListener('change',function(){showFile(fileInput.files[0]);});
  }

  function status(el,message,type) {el.textContent=message;el.className='submission-status'+(type?' '+type:'');}
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
      if(!form.reportValidity()||form.elements['bot-field'].value) return;
      if(kind==='job'&&!backendReady){status(message,'Please share your hiring brief with our team below while job posting is being connected.','error');return;}
      var payload=new URLSearchParams();
      payload.set('name',form.elements.name.value.trim());payload.set('email',form.elements.email.value.trim());payload.set('consent','yes');
      var btn=form.querySelector('button[type=submit]'), previous=btn.textContent;
      form.dataset.sending='true';
      btn.disabled=true;btn.textContent='Sending…';status(message,'','');
      var timeout, sent=false;
      try {
        if(kind==='job') {
          payload.set('action','post_job');payload.set('form_type','Job Posting');
          ['company','role','area','city','work_mode','experience','salary','description','closes'].forEach(function(k){payload.set(k,form.elements[k].value.trim());});
          var jd=form.elements.jd_file.files[0];
          if(jd){if(!jdReady)throw new Error('JD uploads are not available yet.');if(!fileValid(jd))throw new Error('Choose a PDF or Word JD up to 5 MB.');payload.set('jd_data',await readFile(jd));payload.set('jd_name',jd.name);payload.set('jd_type',jd.type);}
        } else if(kind==='candidate') {
          var file=fileInput.files[0];
          if(!fileValid(file))throw new Error('Please attach a PDF or Word CV up to 5 MB.');
          if(form.elements.phone.value.replace(/\D/g,'').length<10)throw new Error('Please enter a valid phone number.');
          payload.set('form_type','Candidate Application');
          if(backendReady)payload.set('action','apply');
          ['phone','city','role','link','area'].forEach(function(k){payload.set(k,form.elements[k].value.trim());});
          payload.set('experience',form.elements.exp.value);
          payload.set('job_id',$('#applicationJobId').value);
          if(payload.get('job_id')&&!backendReady)throw new Error('Please refresh the opportunities before applying to this role.');
          payload.set('message','Specialism: '+form.elements.area.value+' | Experience: '+form.elements.exp.value);
          payload.set('file_data',await readFile(file));payload.set('file_name',file.name);payload.set('file_type',file.type);
        } else {
          payload.set('form_type','Contact Inquiry');payload.set('message',form.elements.text.value.trim());
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
  if ($('#feedbackForm')) bindForm('feedbackForm','feedbackStatus','contact');

  /* Blog Read Memo drawers */
  $$('.blog-card').forEach(function(card){
    var btn = $('.blog-read-btn', card), drawer = $('.blog-drawer', card);
    if(btn && drawer) {
      btn.addEventListener('click', function(){
        var isOpen = drawer.classList.contains('open');
        drawer.classList.toggle('open');
        btn.textContent = isOpen ? 'Read Memo →' : 'Close Memo ↑';
      });
    }
  });

  /* Blog filter buttons */
  $$('.blog-filter-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      $$('.blog-filter-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      $$('.blog-card').forEach(function(card){
        if(!filter || filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* Blog Search bar */
  var blogSearch = $('#blogSearch');
  if (blogSearch) {
    blogSearch.addEventListener('input', function() {
      var query = blogSearch.value.trim().toLowerCase();
      $$('.blog-card').forEach(function(card) {
        var text = card.textContent.toLowerCase();
        card.style.display = (!query || text.indexOf(query) !== -1) ? 'flex' : 'none';
      });
    });
  }

  /* Five-scene walkthrough: reasons, uncertainty and review, not a match score. */
  var aiStory=$('.ai-story'), aiPlay=$('#aiPlay'), aiReplay=$('#aiReplay');
  if (aiStory && aiPlay) {
    var aiScene=0, aiTimer=null, aiPlaying=false, aiAutoPlayed=false;
    var aiScenes=[
      ['01 / DEFINE THE BRIEF','Start with the work. Not a list of keywords.','Example brief: a growth marketer who can plan acquisition campaigns, use customer insight and collaborate with creative teams.','The hiring brief','thinking','What does this role need?','Define the role before searching for a match.','WHAT MATTERS','Campaigns. Insight. Collaboration.','Define the work before comparing profiles.'],
      ['02 / THE KEYWORD TRAP','A different title can hide relevant experience.','An exact-title filter looks for “growth marketer”. This profile says “brand strategist”, even though the person has worked on acquisition campaigns.','Title mismatch','skeptical','Read beyond the headline.','An exact-title filter can overlook transferable experience.','WHAT THE FILTER SEES','Brand strategist ≠ Growth marketer','The title differs. That is not evidence that the person cannot do the work.'],
      ['03 / AI-ASSISTED DISCOVERY','Show the evidence behind the possibility.','The proposed AI step compares work described in the CV against the brief. Each suggestion should point to supporting evidence, rather than an unexplained match percentage.','Potential relevance','default','Show me the evidence.','AI suggests a possibility; relevant experience still needs verification.','WHY THIS PROFILE SURFACED','Campaign work → acquisition brief','Customer research → messaging. Creative collaboration → cross-functional work. These are signals, not verified achievements.'],
      ['04 / CHECK THE UNCERTAINTY','Missing information needs a second look.','A second check compares extracted information with the original CV. Unreadable pages, missing dates or uncertain claims should stay in a review queue instead of becoming an automatic rejection.','Needs verification','thinking','Missing isn’t the same as unsuitable.','Extraction errors and unknowns are routed for review in the proposed workflow.','WHAT STILL NEEDS CHECKING','Ownership. Outcomes. Availability.','Who owned the work? What were the outcomes? Are expectations and availability aligned? A second AI pass alone cannot guarantee accuracy.'],
      ['05 / RECRUITER REVIEW','A useful recommendation starts a conversation.','A recruiter checks the source CV, resolves the open questions and speaks with the candidate. A hiring recommendation can then explain both the evidence and its limits.','Conversation to arrange','excited','Now we can ask the right questions.','People review the suggestion. The employer makes the hiring decision.','THE NEXT STEP','Discuss the work. Confirm the context.','Explore contribution, motivation, compensation and availability. The demonstration does not rank, reject or select a real person.']
    ];
    function aiPause(){aiStory.classList.remove('is-playing');clearTimeout(aiTimer);aiTimer=null;aiPlaying=false;aiPlay.textContent=aiScene===4?'Replay the story':'Play the story';}
    function aiShow(scene){
      aiScene=scene;aiStory.dataset.scene=String(scene);
      var copy=aiScenes[scene];
      $('#aiSceneNumber').textContent=copy[0];$('#aiSceneTitle').textContent=copy[1];$('#aiSceneDescription').textContent=copy[2];$('#aiProfileLabel').textContent=copy[3];$('#aiScout').src='assets/mascot/scout-'+copy[4]+'.svg';$('#aiScout').alt='Scout '+copy[4];$('#aiScoutLine').textContent=copy[5];$('#aiStoryStatus').textContent='Step '+(scene+1)+' of 5 · '+copy[6];$('#aiEvidenceLabel').textContent=copy[7];$('#aiEvidenceTitle').textContent=copy[8];$('#aiEvidenceDetail').textContent=copy[9];
      $$('[data-ai-scene]').forEach(function(button){button.setAttribute('aria-pressed',String(Number(button.dataset.aiScene)===scene));});
      if (aiReplay) aiReplay.hidden=scene===0;
      if (!reducedMotion) {
        aiStory.classList.remove('cards-enter');
        // Restart the short entrance on manual selection and timed scene changes.
        void aiStory.offsetWidth;
        aiStory.classList.add('cards-enter');
      }
    }
    function aiNext(){
      if(!aiPlaying)return;
      if(aiScene<4){aiShow(aiScene+1);aiTimer=setTimeout(aiNext,1800);}else{aiPause();}
    }
    aiPlay.addEventListener('click',function(){
      if(aiPlaying){aiPause();return;}
      if(aiScene===4)aiShow(0);
      if(reducedMotion){aiShow(Math.min(4,aiScene+1));aiPlay.textContent=aiScene===4?'Replay the story':'Next step';return;}
      aiPlaying=true;aiStory.classList.add('is-playing');aiPlay.textContent='Pause the story';aiTimer=setTimeout(aiNext,1800);
    });
    if (aiReplay) aiReplay.addEventListener('click',function(){aiPause();aiShow(0);});
    $$('[data-ai-scene]').forEach(function(button){button.addEventListener('click',function(){aiPause();aiShow(Number(button.dataset.aiScene));aiPlay.textContent=aiScene===4?'Replay the story':'Play the story';});});
    document.addEventListener('visibilitychange',function(){if(document.hidden)aiPause();});
    if('IntersectionObserver' in window){var aiVisibility=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)aiPause();else if(!aiAutoPlayed&&!reducedMotion){aiAutoPlayed=true;aiPlay.click();}});});aiVisibility.observe(aiStory);}
  }

  syncHash();
  if (location.hash === '#roles' || location.hash === '#cv') {
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
    var isVisible = true;
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
      circle1.r = circle1.baseR * scale;
      circle2.r = circle2.baseR * scale;

      if (circle1.x === 0 && circle1.y === 0) {
        circle1.x = width * 0.72;
        circle1.y = height * 0.32;
        circle2.x = width * 0.32;
        circle2.y = height * 0.68;
      }
    }

    function generateNaturalBolt(x1, y1, x2, y2, roughness, depth) {
      var pts = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      for (var d = 0; d < depth; d++) {
        var nextPts = [];
        for (var i = 0; i < pts.length - 1; i++) {
          var p1 = pts[i];
          var p2 = pts[i + 1];
          var midX = (p1.x + p2.x) * 0.5;
          var midY = (p1.y + p2.y) * 0.5;
          var dx = p2.x - p1.x;
          var dy = p2.y - p1.y;
          var dist = Math.hypot(dx, dy);
          if (dist > 4) {
            var px = -dy / dist;
            var py = dx / dist;
            var disp = (Math.random() - 0.5) * roughness * dist;
            midX += px * disp;
            midY += py * disp;
          }
          nextPts.push(p1);
          nextPts.push({ x: midX, y: midY });
        }
        nextPts.push(pts[pts.length - 1]);
        pts = nextPts;
      }
      return pts;
    }

    function triggerClash(cx, cy, nx, ny, c1, c2) {
      c1.pulse = 1.0;
      c2.pulse = 1.0;
      lastClashTime = Date.now();

      // Tangent along the contact boundary
      var tx = -ny, ty = nx;
      var contactAngle = Math.atan2(ty, tx);
      var span = Math.min(c1.r, c2.r) * 1.35;

      var bolts = [];

      // Primary lightning discharge: arcs across the contact zone at the natural collision angle
      var startX = cx - tx * (span * 0.48) - nx * 8 + (Math.random() - 0.5) * 14;
      var startY = cy - ty * (span * 0.48) - ny * 8 + (Math.random() - 0.5) * 14;
      var endX = cx + tx * (span * 0.48) + nx * 8 + (Math.random() - 0.5) * 14;
      var endY = cy + ty * (span * 0.48) + ny * 8 + (Math.random() - 0.5) * 14;
      var mainBolt = generateNaturalBolt(startX, startY, endX, endY, 0.48, 4);

      // Secondary companion crackle bolt
      var secStartX = cx - tx * (span * 0.38) + nx * 10 + (Math.random() - 0.5) * 16;
      var secStartY = cy - ty * (span * 0.38) + ny * 10 + (Math.random() - 0.5) * 16;
      var secEndX = cx + tx * (span * 0.38) - nx * 10 + (Math.random() - 0.5) * 16;
      var secEndY = cy + ty * (span * 0.38) - ny * 10 + (Math.random() - 0.5) * 16;
      var secBolt = generateNaturalBolt(secStartX, secStartY, secEndX, secEndY, 0.52, 4);

      bolts.push({ points: mainBolt, isFork: false });
      bolts.push({ points: secBolt, isFork: false });

      // Realistic jagged fork branches shooting off at sharp angles from the trunk
      var forkCount = 3 + Math.floor(Math.random() * 2);
      for (var f = 0; f < forkCount; f++) {
        var forkIdx = Math.floor(mainBolt.length * (0.2 + 0.6 * Math.random()));
        var forkOrigin = mainBolt[forkIdx];
        var forkDir = (Math.random() > 0.5 ? 1 : -1);
        var forkAngle = contactAngle + forkDir * (0.55 + Math.random() * 0.55);
        var forkLen = 35 + Math.random() * 55;
        var forkEndX = forkOrigin.x + Math.cos(forkAngle) * forkLen;
        var forkEndY = forkOrigin.y + Math.sin(forkAngle) * forkLen;
        bolts.push({
          points: generateNaturalBolt(forkOrigin.x, forkOrigin.y, forkEndX, forkEndY, 0.45, 3),
          isFork: true
        });
      }

      // Cross-discharge tendrils leaping across the air gap between the two orbs
      var bridgeCount = 2;
      for (var b = 0; b < bridgeCount; b++) {
        var offset = (b - 0.5) * (span * 0.3);
        var p1x = cx - nx * 16 + tx * offset;
        var p1y = cy - ny * 16 + ty * offset;
        var p2x = cx + nx * 16 + tx * (offset + (Math.random() - 0.5) * 12);
        var p2y = cy + ny * 16 + ty * (offset + (Math.random() - 0.5) * 12);
        bolts.push({
          points: generateNaturalBolt(p1x, p1y, p2x, p2y, 0.5, 3),
          isFork: true
        });
      }

      // Natural directional sparks scattering along the collision interface
      var sparks = [];
      var sparkCount = 14;
      for (var s = 0; s < sparkCount; s++) {
        var tanSpeed = (Math.random() - 0.5) * 8.0;
        var normSpeed = (Math.random() - 0.5) * 4.0;
        sparks.push({
          x: cx + tx * (Math.random() - 0.5) * 16 + nx * (Math.random() - 0.5) * 8,
          y: cy + ty * (Math.random() - 0.5) * 16 + ny * (Math.random() - 0.5) * 8,
          vx: tx * tanSpeed + nx * normSpeed,
          vy: ty * tanSpeed + ny * normSpeed,
          size: 1.2 + Math.random() * 2.0,
          alpha: 1.0
        });
      }

      clashes.push({
        x: cx,
        y: cy,
        angle: contactAngle,
        span: span,
        bolts: bolts,
        sparks: sparks,
        age: 0,
        maxAge: 18
      });
    }

    function update() {
      if (width === 0 || height === 0) return;

      var speedFactor = reducedMotion ? 0.35 : 1.0;

      // Circle 1 motion
      circle1.x += circle1.vx * speedFactor;
      circle1.y += circle1.vy * speedFactor;
      if (circle1.pulse > 0) circle1.pulse = Math.max(0, circle1.pulse - 0.04);

      var pad1 = 20;
      if (circle1.x - circle1.r < -pad1) { circle1.x = -pad1 + circle1.r; circle1.vx = Math.abs(circle1.vx); }
      if (circle1.x + circle1.r > width + pad1) { circle1.x = width + pad1 - circle1.r; circle1.vx = -Math.abs(circle1.vx); }
      if (circle1.y - circle1.r < -pad1) { circle1.y = -pad1 + circle1.r; circle1.vy = Math.abs(circle1.vy); }
      if (circle1.y + circle1.r > height + pad1) { circle1.y = height + pad1 - circle1.r; circle1.vy = -Math.abs(circle1.vy); }

      // Circle 2 motion
      circle2.x += circle2.vx * speedFactor;
      circle2.y += circle2.vy * speedFactor;
      circle2.dashOffset += 0.45;
      if (circle2.pulse > 0) circle2.pulse = Math.max(0, circle2.pulse - 0.04);

      var pad2 = 20;
      if (circle2.x - circle2.r < -pad2) { circle2.x = -pad2 + circle2.r; circle2.vx = Math.abs(circle2.vx); }
      if (circle2.x + circle2.r > width + pad2) { circle2.x = width + pad2 - circle2.r; circle2.vx = -Math.abs(circle2.vx); }
      if (circle2.y - circle2.r < -pad2) { circle2.y = -pad2 + circle2.r; circle2.vy = Math.abs(circle2.vy); }
      if (circle2.y + circle2.r > height + pad2) { circle2.y = height + pad2 - circle2.r; circle2.vy = -Math.abs(circle2.vy); }

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
          bloomGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (0.75 * bloomFade).toFixed(3) + ')');
          bloomGrad.addColorStop(0.25, 'rgba(216, 180, 254, ' + (0.45 * bloomFade).toFixed(3) + ')');
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
              var jx = (Math.random() - 0.5) * 3.2;
              var jy = (Math.random() - 0.5) * 3.2;
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
      if (isVisible) {
        update();
        draw();
      }
      animFrameId = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize, { passive: true });
    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(topSection);
    }
    document.addEventListener('visibilitychange', function () {
      isVisible = !document.hidden;
    });

    resize();
    loop();
  }

  initHeroClashCanvas();
})();
