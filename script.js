(function () {
  'use strict';
  var $ = function(s,r) { return (r || document).querySelector(s); };
  var $$ = function(s,r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GOOGLE_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby0XQE0A8Bfsm6J10yGDsK_Efd30VGuRzN9jL0ovfeiBJ0qCh5dnwWC4UAf_L99YK6Pag/exec';
  var backendReady = false, jobs = [], selectedJob = null;
  // Keep content and anchor destinations clear of the persistent header.
  function measureHeader() {
    document.documentElement.style.setProperty('--header-height', Math.ceil($('.site-header').getBoundingClientRect().height) + 'px');
  }
  measureHeader();
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe($('.site-header'));
  else window.addEventListener('resize', measureHeader);

  /* Smooth scroll for in-page links */
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '1'; el.style.transform = 'none';
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (document.querySelector('.site-header').getBoundingClientRect().height + 12), behavior: 'smooth' });
  }
  $$('[data-target]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); if (a.getAttribute('data-view')) setAudience(a.getAttribute('data-view')); scrollToId(a.getAttribute('data-target')); });
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
      arriving = false;
      bubble.textContent = 'Made it! Ready for your next leap?';
      showBubble(true);
      bubbleT = setTimeout(function () { showBubble(false); }, 3200);
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
      poseImg.src = 'assets/mascot/scout-' + slug + '.svg';
      poseImg.alt = 'Scout, ' + slug;
      poseAnim.style.animation = (slug === 'sleepy' ? 'qlBreathe 3.4s' : 'qlBob 3s') + ' ease-in-out infinite';
      poseLine.textContent = b.getAttribute('data-line');
      poseWrap.style.transform = 'scale(.9) translateY(10px)';
      setTimeout(function () { poseWrap.style.transform = 'scale(1) translateY(0)'; }, 160);
    });
  });


  function setAudience(view, moveFocus) {
    var talent = view === 'talent';
    $('#hiringPanel').hidden = talent;
    $('#talentPanel').hidden = !talent;
    ['hiring','talent'].forEach(function (name) {
      var tab = $('#' + name + 'Tab');
      var on = name === view;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && moveFocus) tab.focus();
    });
    document.body.classList.toggle('talent-view',talent);
    $('#heroDescription').textContent = talent ?
      'Your next move deserves a proper conversation. Explore marketing, creative, design and technology opportunities, or let Scout help you share your CV.' :
      'For brands building what’s next, and agencies making it happen. Specialist hiring for marketing, creative, design and technology teams across India.';
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
  function googleRead(params) {
    // Google ContentService's documented JSONP route. Read-only public jobs or
    // random-token receipts only; no personal details or resume URLs in responses.
    return new Promise(function (resolve, reject) {
      var callback = 'ql_' + token();
      var node = document.createElement('script');
      var timer;
      function cleanup() { clearTimeout(timer); node.remove(); delete window[callback]; }
      window[callback] = function (data) { cleanup(); resolve(data); };
      var query = new URLSearchParams(params);
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
  $('#jobSearch').addEventListener('input',renderJobs);
  $('#jobCategory').addEventListener('change',renderJobs);
  function selectJob(job) {
    var applicationForm=$('#cvForm');
    if(applicationForm.dataset.sending==='true') return;
    applicationForm.dataset.saved='false';
    applicationForm.querySelector('button[type=submit]').disabled=false;
    applicationForm.querySelector('button[type=submit]').textContent='Submit your CV';
    status($('#cvStatus'),'','');
    selectedJob = job;
    $('#applicationJobId').value = job ? job.id : '';
    var target = $('#applicationTarget');
    target.replaceChildren();
    target.hidden = !job;
    var role = $('#cvForm').elements.role;
    role.readOnly = !!job;
    if (!job) { role.value=''; return; }
    role.value=job.title;
    $('#cvForm').elements.area.value=job.area;
    target.append(element('span','Applying for ' + job.title + ' at ' + job.company));
    var clear=element('button','General application instead','clear-job');
    clear.type='button';clear.addEventListener('click',function(){selectJob(null);});
    target.append(clear);
  }

  /* Scout's original CV catcher: cursor gaze, drag reactions and paper-plane catch. */
  var fileInput=$('#cvFile'), fileBox=$('#cvFileBox'), catcher=$('#scoutCatcherImg'), catcherBubble=$('#scoutCatcherBubble');
  function resetFile() {
    $('#cvFileLabel').textContent='Drop your CV here, or browse';
    $('#cvFileSub').textContent='PDF or Word, up to 5 MB';
    $('#cvFileSub').style.color='#5B5F6B';
    fileBox.classList.remove('file-attached','drag-active');
    catcher.src='assets/mascot/scout-default.svg';catcher.style.transform='none';
    catcherBubble.textContent='Drag your CV over here — I’ll catch it!';
    $('#cvBrowsePill').textContent='Browse files';
  }
  function fileValid(file) {return !!file && /\.(pdf|doc|docx)$/i.test(file.name) && file.size>0 && file.size<=5*1024*1024;}
  function showFile(file) {
    if(!file) {resetFile();return;}
    if(!fileValid(file)) {
      fileInput.value='';resetFile();
      $('#cvFileSub').textContent='Please choose a PDF or Word file up to 5 MB.';
      $('#cvFileSub').style.color='#b42318';
      catcher.src='assets/mascot/scout-skeptical.svg';
      catcherBubble.textContent='That one needs another look. PDF or Word, up to 5 MB.';
      return;
    }
    fileBox.classList.add('file-attached');
    $('#cvFileLabel').textContent=file.name;
    $('#cvFileSub').textContent=(file.size/(1024*1024)).toFixed(2)+' MB · Attached and ready to submit';
    $('#cvBrowsePill').textContent='Replace file';
    catcher.src='assets/mascot/scout-excited.svg';
    catcherBubble.textContent='Caught it! Ready for your next leap?';
    if(!reducedMotion) {
      var plane=$('#cvPaperPlane');plane.style.animation='none';
      void plane.offsetWidth;
      plane.style.animation='qlPaperPlaneFlight .85s ease forwards';
      catcher.style.animation='qlScoutCatchHop .85s ease';
      setTimeout(function(){catcher.style.animation='none';},900);
    }
  }
  function gaze(event) {
    if(reducedMotion || fileInput.files.length) return;
    var rect=fileBox.getBoundingClientRect();
    var ratio=Math.max(0,Math.min(1,(event.clientX-rect.left)/(rect.width||1)));
    catcher.src='assets/mascot/scout-thinking.svg';
    catcher.style.transform='translate(' + ((ratio-.5)*12).toFixed(1)+'px,-8px) rotate('+((ratio-.5)*20).toFixed(1)+'deg)';
  }
  fileBox.addEventListener('mousemove',gaze);
  fileBox.addEventListener('mouseleave',function(){catcher.style.transform='none';if(!fileInput.files.length)catcher.src='assets/mascot/scout-default.svg';});
  fileBox.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click();}});
  ['dragenter','dragover'].forEach(function(type){fileBox.addEventListener(type,function(e){e.preventDefault();fileBox.classList.add('drag-active');gaze(e);catcherBubble.textContent='Drop it here. I’m ready.';});});
  fileBox.addEventListener('dragleave',function(e){if(!fileBox.contains(e.relatedTarget)){fileBox.classList.remove('drag-active');catcher.style.transform='none';}});
  fileBox.addEventListener('drop',function(e){e.preventDefault();fileBox.classList.remove('drag-active');if(e.dataTransfer.files.length){fileInput.files=e.dataTransfer.files;showFile(fileInput.files[0]);}});
  fileInput.addEventListener('change',function(){showFile(fileInput.files[0]);});

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
  $$('.ql-tip').forEach(function(tip){$('.ql-tip-btn',tip).addEventListener('click',function(){var open=$('.ql-tip-pts',tip).style.display==='none';$$('.ql-tip').forEach(function(other){$('.ql-tip-pts',other).style.display='none';$('.ql-tip-btn',other).textContent='Read the tips →';});if(open){$('.ql-tip-pts',tip).style.display='flex';$('.ql-tip-btn',tip).textContent='Show less';}});});
  bindForm('jobForm','jobStatus','job');bindForm('cvForm','cvStatus','candidate');bindForm('msgForm','msgStatus','contact');

  /* Five-scene walkthrough: reasons, uncertainty and review, not a match score. */
  var aiStory=$('.ai-story'), aiPlay=$('#aiPlay'), aiReplay=$('#aiReplay');
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
    aiReplay.hidden=scene===0;
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
  aiReplay.addEventListener('click',function(){aiPause();aiShow(0);});
  $$('[data-ai-scene]').forEach(function(button){button.addEventListener('click',function(){aiPause();aiShow(Number(button.dataset.aiScene));aiPlay.textContent=aiScene===4?'Replay the story':'Play the story';});});
  document.addEventListener('visibilitychange',function(){if(document.hidden)aiPause();});
  if('IntersectionObserver' in window){var aiVisibility=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)aiPause();else if(!aiAutoPlayed&&!reducedMotion){aiAutoPlayed=true;aiPlay.click();}});});aiVisibility.observe(aiStory);}

  // Discover v2 without requiring any new Netlify server or paid form service.
  loadJobs();syncHash();
})();
