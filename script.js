(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Smooth scroll for in-page links */
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '1'; el.style.transform = 'none';
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }
  $$('[data-target]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); scrollToId(a.getAttribute('data-target')); });
  });

  /* Reveal sections on scroll */
  if ('IntersectionObserver' in window) {
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
  var lineIdx = 0, hopping = false, bubbleOn = false, bubbleT;
  function showBubble(on) { if (!bubble) return; bubbleOn = on; bubble.style.transform = 'scale(' + (on ? 1 : 0) + ')'; }
  setTimeout(function () { if (arc) arc.setAttribute('stroke-dashoffset', '0'); }, 150);
  setTimeout(function () { showBubble(true); }, 1800);
  setTimeout(function () { showBubble(false); }, 5200);

  function hop(quiet) {
    if (!scout || hopping) return;
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
  if (scout) scout.addEventListener('click', function () { hop(false); });
  setInterval(function () { if (!document.hidden && !bubbleOn) hop(true); }, 7000);

  /* Fit beats volume: 30 dots filter down to 3 */
  var fit = $('#qlFit');
  if (fit) {
    var fitOn = false;
    var setFit = function (on) {
      fitOn = on;
      $$('.ql-fd', fit).forEach(function (d) {
        var h = d.getAttribute('data-hi') === '1';
        d.style.background = on && h ? '#FF6B4A' : '#E9E7F5';
        d.style.opacity = on && !h ? '0.12' : '0.9';
        d.style.transform = 'scale(' + (on ? (h ? 1.3 : 0.7) : 1) + ')';
      });
      $('#qlFitCap').textContent = on ? '3 who fit.' : '30 who might.';
      $('#qlFitHint').textContent = on ? 'That’s the shortlist.' : 'Hover or tap to filter';
    };
    fit.addEventListener('mouseenter', function () { setFit(true); });
    fit.addEventListener('mouseleave', function () { setFit(false); });
    fit.addEventListener('click', function () { setFit(!fitOn); });
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

  /* Open roles: filter + apply */
  var rfBtns = $$('.ql-rf'), roleRows = $$('.ql-role');
  rfBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      rfBtns.forEach(function (o) {
        var on = o === b;
        o.style.background = on ? '#14213D' : 'transparent';
        o.style.color = on ? '#FFFFFF' : '#14213D';
        o.style.borderColor = on ? '#14213D' : '#D9D5CC';
      });
      roleRows.forEach(function (r) { r.style.display = (f === 'All' || r.getAttribute('data-area') === f) ? 'grid' : 'none'; });
    });
  });

  var cvForm = $('#cvForm'), cvThanks = $('#cvThanks');
  function showCvForm() { cvThanks.style.display = 'none'; cvForm.style.display = 'grid'; }
  $$('.ql-apply').forEach(function (b) {
    b.addEventListener('click', function () {
      showCvForm();
      cvForm.elements.role.value = b.getAttribute('data-role');
      cvForm.elements.area.value = b.getAttribute('data-area');
      clearErr('area');
      scrollToId('cv');
    });
  });

  /* Candidate tips: expand one at a time */
  var tipEls = $$('.ql-tip');
  tipEls.forEach(function (tip) {
    $('.ql-tip-btn', tip).addEventListener('click', function () {
      var opening = $('.ql-tip-pts', tip).style.display === 'none';
      tipEls.forEach(function (o) { $('.ql-tip-pts', o).style.display = 'none'; $('.ql-tip-btn', o).textContent = 'Read the tips →'; });
      if (opening) { $('.ql-tip-pts', tip).style.display = 'flex'; $('.ql-tip-btn', tip).textContent = 'Show less'; }
    });
  });

  /* CV form: validation + Netlify Forms submission */
  var errColor = '#B42318', okColor = '#E2DED6';
  function setErr(k, msg) {
    var span = $('[data-err="' + k + '"]', cvForm);
    if (span) span.textContent = msg;
    var field = cvForm.elements[k];
    if (field && field.style) field.style.borderColor = errColor;
  }
  function clearErr(k) {
    var span = $('[data-err="' + k + '"]', cvForm);
    if (span) span.textContent = '';
    var field = cvForm.elements[k];
    if (field && field.style) field.style.borderColor = okColor;
  }
  ['name', 'email', 'phone', 'area'].forEach(function (k) {
    cvForm.elements[k].addEventListener('input', function () { clearErr(k); });
    cvForm.elements[k].addEventListener('change', function () { clearErr(k); });
  });

  var fileInput = $('#cvFile'), fileLabel = $('#cvFileLabel'), fileSub = $('#cvFileSub'), fileBox = $('#cvFileBox');
  function resetFileUi() { fileLabel.textContent = 'Attach your CV *'; fileSub.textContent = 'PDF or Word, up to 5 MB'; fileSub.style.color = '#5B5F6B'; fileBox.style.borderColor = '#4F46E5'; }
  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    if (!f) return resetFileUi();
    if (f.size > 5 * 1024 * 1024) { fileInput.value = ''; fileLabel.textContent = 'Attach your CV *'; fileSub.textContent = 'That file is over 5 MB. Please attach a smaller one.'; fileSub.style.color = errColor; fileBox.style.borderColor = errColor; return; }
    fileLabel.textContent = f.name; fileSub.textContent = 'Click to replace'; fileSub.style.color = '#5B5F6B'; fileBox.style.borderColor = '#4F46E5';
  });

  function validate() {
    var el = cvForm.elements, ok = true;
    if (!el.name.value.trim()) { setErr('name', 'Please add your name'); ok = false; }
    if (!/^\S+@\S+\.\S+$/.test(el.email.value)) { setErr('email', 'Please add a valid email'); ok = false; }
    if (el.phone.value.replace(/\D/g, '').length < 10) { setErr('phone', 'Please add a 10-digit number'); ok = false; }
    if (!el.area.value) { setErr('area', 'Pick one'); ok = false; }
    if (!fileInput.files || !fileInput.files[0]) { fileSub.textContent = 'Please attach your CV'; fileSub.style.color = errColor; fileBox.style.borderColor = errColor; ok = false; }
    return ok;
  }

  cvForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var btn = $('button[type="submit"]', cvForm);
    btn.disabled = true; btn.textContent = 'Sending…';
    fetch('/', { method: 'POST', body: new FormData(cvForm) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(function () {
        $('#cvFirst').textContent = cvForm.elements.name.value.trim().split(' ')[0] || 'friend';
        cvForm.style.display = 'none'; cvThanks.style.display = 'flex';
      })
      .catch(function () { alert('Sorry, something went wrong. Please email your CV to contact@qleaps.in'); })
      .then(function () { btn.disabled = false; btn.textContent = 'Submit your CV'; });
  });

  $('#cvReset').addEventListener('click', function () {
    cvForm.reset(); resetFileUi();
    ['name', 'email', 'phone', 'area'].forEach(clearErr);
    showCvForm();
  });

  /* Contact form: Netlify Forms submission */
  var msgForm = $('#msgForm'), msgThanks = $('#msgThanks');
  msgForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!msgForm.checkValidity()) { msgForm.reportValidity(); return; }
    var body = new URLSearchParams(new FormData(msgForm)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) { if (!r.ok) throw new Error(r.status); msgForm.style.display = 'none'; msgThanks.style.display = 'flex'; })
      .catch(function () { alert('Sorry, something went wrong. Please email us at contact@qleaps.in'); });
  });
})();
