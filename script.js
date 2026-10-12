(function () {
  'use strict';
  var GOOGLE_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby0XQE0A8Bfsm6J10yGDsK_Efd30VGuRzN9jL0ovfeiBJ0qCh5dnwWC4UAf_L99YK6Pag/exec';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('year').textContent = new Date().getFullYear();

  // Content is visible by default; only progressively enhance below the fold.
  if ('IntersectionObserver' in window && !reducedMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.scenario, .expertise, .steps article, .human-section, .faq-section').forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal', 'pending');
        observer.observe(el);
      }
    });
  }

  var sieve = document.getElementById('sieve');
  var volumeButton = document.getElementById('volumeButton');
  var fitButton = document.getElementById('fitButton');
  function setFit(on) {
    sieve.classList.toggle('is-fit', on);
    volumeButton.setAttribute('aria-pressed', String(!on));
    fitButton.setAttribute('aria-pressed', String(on));
    document.getElementById('fitCount').textContent = on ? '3' : '30';
    document.getElementById('fitCaption').textContent = on ? 'reasons to have a real conversation.' : 'profiles. Where do you start?';
    document.getElementById('shortlistNotes').hidden = !on;
    document.getElementById('fitStatus').textContent = on ? 'A focused shortlist. Clear reasons behind the recommendation.' : 'Tap “Find the fit” to see the difference.';
  }
  volumeButton.addEventListener('click', function () { setFit(false); });
  fitButton.addEventListener('click', function () { setFit(true); });
  document.querySelectorAll('[data-brief]').forEach(function (link) {
    link.addEventListener('click', function () {
      var field = document.getElementById('msgForm').elements.message;
      if (!field.value) field.value = link.getAttribute('data-brief') + ': ';
    });
  });
  document.querySelectorAll('a[href="#cv"]').forEach(function (link) {
    link.addEventListener('click', function () { document.querySelector('.candidate-details').open = true; });
  });

  function setStatus(status, message, isError) {
    status.textContent = message;
    status.classList.toggle('error', !!isError);
  }
  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result).split(',')[1]); };
      reader.onerror = function () { reject(new Error('We couldn’t read that file. Please choose it again or email your CV.')); };
      reader.readAsDataURL(file);
    });
  }
  function attachForm(formId, statusId, candidate) {
    var form = document.getElementById(formId);
    var status = document.getElementById(statusId);
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (form.elements['bot-field'].value) return;
      var button = form.querySelector('button[type="submit"]');
      var buttonText = button.innerHTML;
      var payload = new URLSearchParams();
      payload.set('form_type', candidate ? 'Candidate Application' : 'Contact Inquiry');
      payload.set('name', form.elements.name.value.trim());
      payload.set('email', form.elements.email.value.trim());
      payload.set('consent', 'yes');
      if (candidate) {
        var file = form.elements.cv.files[0];
        if (!file || !/\.(pdf|doc|docx)$/i.test(file.name) || file.size > 5 * 1024 * 1024 || file.size === 0) {
          setStatus(status, 'Choose a PDF or Word CV between 1 byte and 5 MB.', true);
          return;
        }
        if (form.elements.phone.value.replace(/\D/g, '').length < 10) {
          setStatus(status, 'Please enter a valid phone number, including the country code if needed.', true);
          form.elements.phone.focus();
          return;
        }
        ['phone', 'city', 'role', 'link'].forEach(function (key) { payload.set(key, form.elements[key].value.trim()); });
        payload.set('message', 'Specialism: ' + form.elements.area.value + ' | Experience: ' + form.elements.exp.value);
      } else {
        payload.set('role', form.elements.role.value.trim());
        // Keep the existing handler's message field contract.
        payload.set('message', 'Company: ' + form.elements.company.value.trim() + '\nRole: ' + form.elements.role.value.trim() + '\n' + form.elements.message.value.trim());
      }
      button.disabled = true;
      button.textContent = 'Sending…';
      setStatus(status, '', false);
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 30000);
      try {
        if (candidate) {
          payload.set('file_data', await readFile(file));
          payload.set('file_name', file.name);
          payload.set('file_type', file.type || 'application/octet-stream');
        }
        // Apps Script does not expose a CORS-readable acknowledgement.
        // Never claim confirmed receipt based on an opaque response.
        await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload.toString(), signal: controller.signal
        });
        setStatus(status, 'Your submission has been sent for processing. Receipt cannot be confirmed here. If you don’t hear from us within two working days, email contact@qleaps.in. Your details remain below in case you need them.', false);
      } catch (error) {
        setStatus(status, error.name === 'AbortError' ? 'The request timed out; delivery is uncertain. Please email contact@qleaps.in before submitting again.' : 'We couldn’t complete the submission. Your details are still here. Please try again or email contact@qleaps.in.', true);
      } finally {
        clearTimeout(timeout);
        button.disabled = false;
        button.innerHTML = buttonText;
      }
    });
  }
  attachForm('msgForm', 'msgStatus', false);
  attachForm('cvForm', 'cvStatus', true);
})();
