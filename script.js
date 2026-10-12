(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* --- GOOGLE SHEETS INTEGRATION CONFIG --- */
  var GOOGLE_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby0XQE0A8Bfsm6J10yGDsK_Efd30VGuRzN9jL0ovfeiBJ0qCh5dnwWC4UAf_L99YK6Pag/exec';
  var OPEN_ROLES_CSV_URL = 'https://docs.google.com/spreadsheets/d/1r2VMu159qXGBvh51opvg574rQeKKr6vNsJUVuaurb0c/gviz/tq?tqx=out:csv&sheet=Open%20Roles';

  function sendToGoogleSheet(params) {
    if (!GOOGLE_SCRIPT_WEBAPP_URL || !GOOGLE_SCRIPT_WEBAPP_URL.startsWith('http')) return Promise.resolve();
    var payload = new URLSearchParams();
    Object.keys(params).forEach(function (k) {
      payload.append(k, params[k] || '');
    });
    return fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString()
    }).catch(function (err) {
      console.warn('Google Sheet submission notice:', err);
    });
  }

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
          fitScoutBubble.textContent = 'Three who fit beat thirty who might. Shortlist locked! 🎯';
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
        if (fitSlider) fitSlider.value = 0;
        applySieveState(0);
      });
    }

    if (fitBtnFit) {
      fitBtnFit.addEventListener('click', function () {
        if (fitSlider) fitSlider.value = 100;
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

  /* --- OPEN ROLES: DYNAMIC GOOGLE SHEET FETCH + FILTER + APPLY --- */
  var areaColors = {
    'marketing and digital': '#FF6B4A',
    'creative': '#4F46E5',
    'design and product': '#14213D',
    'technology': '#8B85F0'
  };

  function normalizeArea(a) {
    if (!a) return 'All';
    var lower = a.toLowerCase().trim();
    if (lower.indexOf('market') !== -1) return 'Marketing and digital';
    if (lower.indexOf('creat') !== -1) return 'Creative';
    if (lower.indexOf('design') !== -1 || lower.indexOf('product') !== -1) return 'Design and product';
    if (lower.indexOf('tech') !== -1 || lower.indexOf('dev') !== -1 || lower.indexOf('engine') !== -1) return 'Technology';
    return a;
  }

  function getAreaColor(a) {
    var norm = (normalizeArea(a) || '').toLowerCase();
    return areaColors[norm] || '#4F46E5';
  }

  var currentFilter = 'All';

  function bindRoleEvents() {
    var rfBtns = $$('.ql-rf'), roleRows = $$('.ql-role');
    rfBtns.forEach(function (b) {
      b.onclick = function () {
        currentFilter = b.getAttribute('data-f');
        rfBtns.forEach(function (o) {
          var on = o === b;
          o.style.background = on ? '#14213D' : 'transparent';
          o.style.color = on ? '#FFFFFF' : '#14213D';
          o.style.borderColor = on ? '#14213D' : '#D9D5CC';
        });
        roleRows.forEach(function (r) {
          r.style.display = (currentFilter === 'All' || r.getAttribute('data-area') === currentFilter) ? 'grid' : 'none';
        });
      };
    });

    $$('.ql-apply').forEach(function (b) {
      b.onclick = function () {
        showCvForm();
        cvForm.elements.role.value = b.getAttribute('data-role') || '';
        cvForm.elements.area.value = b.getAttribute('data-area') || '';
        clearErr('area');
        scrollToId('cv');
      };
    });
  }

  function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim().length > 0; });
    return lines.map(function (line) {
      var cells = [];
      var cur = '';
      var inQuote = false;
      for (var i = 0; i < line.length; i++) {
        var c = line[i];
        if (c === '"') {
          inQuote = !inQuote;
        } else if (c === ',' && !inQuote) {
          cells.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += c;
        }
      }
      cells.push(cur.trim().replace(/^"|"$/g, ''));
      return cells;
    });
  }

  function loadRolesFromGoogleSheet() {
    var container = $('#rolesList');
    if (!container) return;
    fetch(OPEN_ROLES_CSV_URL)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        if (!txt || txt.trim().indexOf('<') === 0 || txt.indexOf('<!DOCTYPE') !== -1) return; // Ignore HTML sign-in responses
        var rows = parseCSV(txt);
        if (!rows || rows.length < 2) return;
        var dataRows = rows.slice(1).filter(function (r) { return r[0] && r[0].trim().length > 0; });
        if (!dataRows.length) return;

        var html = '';
        dataRows.forEach(function (row) {
          var title = row[0] || '';
          var category = row[1] || 'General';
          var location = row[2] || 'India';
          var exp = row[3] || 'Experience: Any';
          var normArea = normalizeArea(category);
          var dotColor = getAreaColor(category);

          html += '<div class="ql-role hv8" data-area="' + normArea + '" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:12px 24px;align-items:center;padding:24px 8px;border-bottom:1px solid #E2DED6;transition:background .2s">' +
            '<div style="display:flex;flex-direction:column;gap:6px;grid-column:span 2">' +
              '<h3 style="margin:0;font-family:\'Bricolage Grotesque\',sans-serif;font-weight:800;font-size:24px;letter-spacing:-.03em;color:#14213D">' + title + '</h3>' +
              '<span style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;color:#5B5F6B"><span style="width:8px;height:8px;border-radius:50%;background:' + dotColor + '"></span>' + category + '</span>' +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
              '<span style="font-size:14px;font-weight:500;padding:6px 12px;border-radius:999px;background:#E9E7F5;color:#14213D">' + location + '</span>' +
              '<span style="font-size:14px;font-weight:500;padding:6px 12px;border-radius:999px;background:#E9E7F5;color:#14213D">' + exp + '</span>' +
            '</div>' +
            '<div style="display:flex;justify-content:flex-end">' +
              '<button type="button" class="ql-apply hv9" data-role="' + title + '" data-area="' + normArea + '" style="font-size:16px;font-weight:600;padding:11px 20px;border-radius:999px;cursor:pointer;border:0;background:#14213D;color:#FFFFFF">Apply →</button>' +
            '</div>' +
          '</div>';
        });

        container.innerHTML = html;
        bindRoleEvents();
      })
      .catch(function (err) {
        console.warn('Using static roles fallback:', err);
      });
  }

  /* Candidate tips: expand one at a time */
  var tipEls = $$('.ql-tip');
  tipEls.forEach(function (tip) {
    $('.ql-tip-btn', tip).addEventListener('click', function () {
      var opening = $('.ql-tip-pts', tip).style.display === 'none';
      tipEls.forEach(function (o) { $('.ql-tip-pts', o).style.display = 'none'; $('.ql-tip-btn', o).textContent = 'Read the tips →'; });
      if (opening) { $('.ql-tip-pts', tip).style.display = 'flex'; $('.ql-tip-btn', tip).textContent = 'Show less'; }
    });
  });

  /* CV form: validation + Netlify Forms + Google Sheets */
  var cvForm = $('#cvForm'), cvThanks = $('#cvThanks');
  function showCvForm() { cvThanks.style.display = 'none'; cvForm.style.display = 'grid'; }

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

  /* --- 2. SCOUT CATCHES THE CV (DRAG & DROP CATCHER) --- */
  var fileInput = $('#cvFile'),
      fileLabel = $('#cvFileLabel'),
      fileSub = $('#cvFileSub'),
      fileBox = $('#cvFileBox'),
      scoutCatcherImg = $('#scoutCatcherImg'),
      scoutCatcherBubble = $('#scoutCatcherBubble'),
      cvPaperPlane = $('#cvPaperPlane'),
      cvBoxIcon = $('#cvBoxIcon'),
      cvBrowsePill = $('#cvBrowsePill');

  function resetFileUi() {
    if (fileLabel) fileLabel.textContent = 'Drop your CV here, or browse';
    if (fileSub) {
      fileSub.textContent = 'PDF or Word, up to 5 MB';
      fileSub.style.color = '#5B5F6B';
    }
    if (cvBoxIcon) {
      cvBoxIcon.style.background = '#4F46E5';
      cvBoxIcon.textContent = '↑';
    }
    if (cvBrowsePill) {
      cvBrowsePill.textContent = 'Browse files';
      cvBrowsePill.style.color = '#4F46E5';
      cvBrowsePill.style.background = '#E9E7F5';
    }
    if (fileBox) {
      fileBox.classList.remove('file-attached', 'drag-active');
      fileBox.style.borderColor = '#4F46E5';
    }
    if (scoutCatcherImg) {
      scoutCatcherImg.src = 'assets/mascot/scout-default.svg';
      scoutCatcherImg.style.transform = 'none';
      scoutCatcherImg.style.animation = 'none';
    }
    if (scoutCatcherBubble) {
      scoutCatcherBubble.textContent = 'Drag your CV over here — I’ll catch it! 🐾';
      scoutCatcherBubble.style.borderColor = '#14213D';
      scoutCatcherBubble.style.background = '#FFFFFF';
    }
    if (cvPaperPlane) {
      cvPaperPlane.style.animation = 'none';
      cvPaperPlane.style.opacity = '0';
    }
  }

  function handleFileSelected(file) {
    if (!file) return resetFileUi();
    if (file.size > 5 * 1024 * 1024) {
      fileInput.value = '';
      if (fileLabel) fileLabel.textContent = 'File exceeds 5 MB limit';
      if (fileSub) {
        fileSub.textContent = 'Please attach a file under 5 MB.';
        fileSub.style.color = errColor;
      }
      if (fileBox) {
        fileBox.classList.remove('file-attached');
        fileBox.style.borderColor = errColor;
      }
      if (scoutCatcherImg) scoutCatcherImg.src = 'assets/mascot/scout-skeptical.svg';
      if (scoutCatcherBubble) {
        scoutCatcherBubble.textContent = 'Woof! That file is over 5 MB. Can we trim it down? 🦴';
        scoutCatcherBubble.style.borderColor = errColor;
        scoutCatcherBubble.style.background = '#FEF3F2';
      }
      return;
    }

    // Trigger paper plane animation swooping into Scout
    if (cvPaperPlane) {
      cvPaperPlane.style.animation = 'qlPaperPlaneFlight .85s cubic-bezier(.2,.8,.3,1) forwards';
    }

    // Scout perks up, wags tail and catches the CV
    setTimeout(function () {
      if (scoutCatcherImg) {
        scoutCatcherImg.src = 'assets/mascot/scout-excited.svg';
        scoutCatcherImg.style.animation = 'qlScoutCatchHop .85s cubic-bezier(.34,1.56,.64,1)';
      }
      if (scoutCatcherBubble) {
        scoutCatcherBubble.textContent = 'Good boy got it! Taking this straight to the team.';
        scoutCatcherBubble.style.borderColor = '#12B76A';
        scoutCatcherBubble.style.background = '#F6FEF9';
      }
    }, 380);

    // Update Drop Box UI
    if (fileBox) fileBox.classList.add('file-attached');
    if (fileLabel) fileLabel.textContent = file.name;
    var sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    if (fileSub) {
      fileSub.textContent = sizeMb + ' MB · Scout caught your CV safe and sound';
      fileSub.style.color = '#12B76A';
    }
    if (cvBoxIcon) {
      cvBoxIcon.style.background = '#12B76A';
      cvBoxIcon.textContent = '✓';
    }
    if (cvBrowsePill) {
      cvBrowsePill.textContent = 'Replace file';
      cvBrowsePill.style.color = '#12B76A';
      cvBrowsePill.style.background = '#ECFDF3';
    }
  }

  if (fileBox) {
    function updateScoutGaze(e) {
      if (fileInput.files && fileInput.files.length) return;
      var rect = fileBox.getBoundingClientRect();
      var relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / (rect.width || 1)));
      var tilt = (relX - 0.5) * 22; // -11deg to +11deg tilt towards cursor
      var gazeX = (relX - 0.5) * 12; // -6px to +6px tracking
      if (scoutCatcherImg) {
        scoutCatcherImg.src = 'assets/mascot/scout-thinking.svg';
        scoutCatcherImg.style.transform = 'translate(' + gazeX.toFixed(1) + 'px, -12px) rotate(' + tilt.toFixed(1) + 'deg) scale(1.14)';
      }
    }

    // Hover & gaze tracking
    fileBox.addEventListener('mouseenter', function (e) {
      updateScoutGaze(e);
    });
    fileBox.addEventListener('mousemove', function (e) {
      updateScoutGaze(e);
    });
    fileBox.addEventListener('mouseleave', function () {
      if (!fileInput.files || !fileInput.files.length) {
        if (scoutCatcherImg) {
          scoutCatcherImg.src = 'assets/mascot/scout-default.svg';
          scoutCatcherImg.style.transform = 'none';
        }
      }
    });

    // Drag events: Scout's ears perk up and his gaze follows cursor
    fileBox.addEventListener('dragenter', function (e) {
      e.preventDefault();
      e.stopPropagation();
      fileBox.classList.add('drag-active');
      updateScoutGaze(e);
      if (scoutCatcherBubble) {
        scoutCatcherBubble.textContent = 'Ears perked! Drop it right here! 🐾';
        scoutCatcherBubble.style.borderColor = '#FF6B4A';
        scoutCatcherBubble.style.background = '#FFF5F2';
      }
    });

    fileBox.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
      fileBox.classList.add('drag-active');
      updateScoutGaze(e);
      if (scoutCatcherBubble) {
        scoutCatcherBubble.textContent = 'Ears perked! Drop it right here! 🐾';
        scoutCatcherBubble.style.borderColor = '#FF6B4A';
        scoutCatcherBubble.style.background = '#FFF5F2';
      }
    });

    ['dragleave', 'dragend'].forEach(function (eventName) {
      fileBox.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        fileBox.classList.remove('drag-active');
        if (!fileInput.files || !fileInput.files.length) {
          if (scoutCatcherImg) {
            scoutCatcherImg.src = 'assets/mascot/scout-default.svg';
            scoutCatcherImg.style.transform = 'none';
          }
          if (scoutCatcherBubble) {
            scoutCatcherBubble.textContent = 'Drag your CV over here — I’ll catch it! 🐾';
            scoutCatcherBubble.style.borderColor = '#14213D';
            scoutCatcherBubble.style.background = '#FFFFFF';
          }
        }
      });
    });

    fileBox.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      fileBox.classList.remove('drag-active');
      var droppedFiles = e.dataTransfer && e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length) {
        fileInput.files = droppedFiles;
        handleFileSelected(droppedFiles[0]);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      handleFileSelected(f);
    });
  }

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

    // Background backup to Netlify Forms (silent catch so it never triggers false errors)
    try {
      fetch('/', { method: 'POST', body: new FormData(cvForm) }).catch(function () {});
    } catch (err) {}

    function handleSubmission(filePayload) {
      var sheetData = {
        form_type: 'Candidate Application',
        name: cvForm.elements.name.value.trim(),
        email: cvForm.elements.email.value.trim(),
        phone: cvForm.elements.phone.value.trim(),
        city: cvForm.elements.city.value.trim(),
        role: cvForm.elements.role.value.trim() || cvForm.elements.area.value,
        link: cvForm.elements.link.value.trim(),
        message: 'Specialism: ' + cvForm.elements.area.value + ' | Experience: ' + cvForm.elements.exp.value
      };
      if (filePayload) {
        sheetData.file_data = filePayload.data;
        sheetData.file_name = filePayload.name;
        sheetData.file_type = filePayload.type;
      }
      sendToGoogleSheet(sheetData).then(function () {
        $('#cvFirst').textContent = cvForm.elements.name.value.trim().split(' ')[0] || 'friend';
        cvForm.style.display = 'none';
        cvThanks.style.display = 'flex';
        btn.disabled = false;
        btn.textContent = 'Submit your CV';
      });
    }

    var selectedFile = fileInput.files && fileInput.files[0];
    if (selectedFile) {
      var reader = new FileReader();
      reader.onload = function (ev) {
        var base64 = (ev.target.result || '').split(',')[1] || '';
        handleSubmission({ data: base64, name: selectedFile.name, type: selectedFile.type });
      };
      reader.onerror = function () { handleSubmission(null); };
      reader.readAsDataURL(selectedFile);
    } else {
      handleSubmission(null);
    }
  });

  $('#cvReset').addEventListener('click', function () {
    cvForm.reset(); resetFileUi();
    ['name', 'email', 'phone', 'area'].forEach(clearErr);
    showCvForm();
  });

  /* Contact form: Netlify Forms + Google Sheets */
  var msgForm = $('#msgForm'), msgThanks = $('#msgThanks');
  msgForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!msgForm.checkValidity()) { msgForm.reportValidity(); return; }
    var btn = $('button[type="submit"]', msgForm);
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    // Background backup to Netlify Forms
    try {
      var body = new URLSearchParams(new FormData(msgForm)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body }).catch(function () {});
    } catch (err) {}

    sendToGoogleSheet({
      form_type: 'Contact Inquiry',
      name: msgForm.elements.name.value.trim(),
      email: msgForm.elements.email.value.trim(),
      message: msgForm.elements.text.value.trim()
    }).then(function () {
      msgForm.style.display = 'none';
      msgThanks.style.display = 'flex';
      if (btn) { btn.disabled = false; btn.textContent = 'Send message'; }
    });
  });

  /* Initial bindings */
  bindRoleEvents();
  loadRolesFromGoogleSheet();
})();
