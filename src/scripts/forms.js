import { $, $$ } from './dom.js';
import { scrollToId } from './navigation.js';
export function initForms() {
  var GOOGLE_SCRIPT_WEBAPP_URL =
    'https://script.google.com/macros/s/AKfycby0XQE0A8Bfsm6J10yGDsK_Efd30VGuRzN9jL0ovfeiBJ0qCh5dnwWC4UAf_L99YK6Pag/exec';
  var backendReady = false,
    candidateDetailsReady = false,
    jdReady = false,
    jobs = [],
    selectedJob = null,
    jobsState = 'loading';
  var requestedJobId = new URLSearchParams(location.search).get('job_id');
  var requestedJobResolved = !requestedJobId;
  function token() {
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map(function (b) {
        return b.toString(16).padStart(2, '0');
      })
      .join('');
  }
  async function googleRead(params) {
    // Attempt standard CORS fetch with credentials: 'omit' to prevent 3rd-party cookies
    var query = new URLSearchParams(params);
    var url = GOOGLE_SCRIPT_WEBAPP_URL + '?' + query.toString();
    var readController = new AbortController(),
      readTimeout = setTimeout(function () {
        readController.abort();
      }, 8000);
    try {
      var res = await fetch(url, {
        method: 'GET',
        signal: readController.signal,
        mode: 'cors',
        credentials: 'omit',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        var json = await res.json();
        if (json && typeof json === 'object') return json;
      }
    } catch (fetchErr) {
      // ContentService can require its read-only JSONP path.
    } finally {
      clearTimeout(readTimeout);
    }

    // Google ContentService's documented JSONP fallback. Read-only public jobs or
    // random-token receipts only; no personal details or resume URLs in responses.
    return new Promise(function (resolve, reject) {
      var callback = 'ql_' + token();
      var node = document.createElement('script');
      var timer;
      function cleanup() {
        clearTimeout(timer);
        node.remove();
        delete window[callback];
      }
      window[callback] = function (data) {
        cleanup();
        resolve(data);
      };
      query.set('callback', callback);
      node.src = GOOGLE_SCRIPT_WEBAPP_URL + '?' + query.toString();
      node.onerror = function () {
        cleanup();
        reject(new Error('The Google service could not be reached.'));
      };
      timer = setTimeout(function () {
        cleanup();
        reject(new Error('The Google service did not reply.'));
      }, 12000);
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
        var result = await googleRead({ action: 'jobs' });
        if (
          result.version !== 2 ||
          result.status !== 'success' ||
          !Array.isArray(result.jobs)
        )
          throw new Error('Job service not ready');
        backendReady = true;
        candidateDetailsReady = result.candidate_details === true;
        jobsState = 'ready';
        status(
          $('#applicationServiceStatus'),
          candidateDetailsReady
            ? 'Ready to receive your CV. Uploaded files are private to our recruitment team.'
            : 'CV submissions are temporarily unavailable. Please email contact@qleaps.in or try again shortly.',
          candidateDetailsReady ? '' : 'error',
        );
        jdReady = result.jd_attachments === true;
        var jdFile = $('#jdFile');
        if (jdFile) jdFile.disabled = !jdReady;
        var jdAvail = $('#jdAvailability');
        if (jdAvail)
          jdAvail.textContent = jdReady
            ? 'Optional PDF or Word JD, up to 5 MB. Stored privately for our recruitment team.'
            : 'JD uploads will be available shortly. Please include the key requirements in the role summary.';
        jobs = result.jobs.filter(function (job) {
          return (
            typeof job.id === 'string' && /^QLJ-[A-F0-9]{12}$/.test(job.id)
          );
        });
        jobsLoadedAt = Date.now();
        var postJobBtn = $('#postJobButton');
        var jobFrm = $('#jobForm');
        if (postJobBtn && jobFrm)
          postJobBtn.disabled = jobFrm.dataset.saved === 'true';
        var postAvail = $('#postingAvailability');
        if (postAvail)
          postAvail.textContent =
            'Your role is saved for our team to review. Only approved jobs appear on the website.';
        resolveRequestedJob();
        renderJobs();
      } catch (error) {
        jobsState = 'error';
        status(
          $('#applicationServiceStatus'),
          'We couldn’t connect the CV service. Please email contact@qleaps.in or try again shortly.',
          'error',
        );
        var jStatus = $('#jobsStatus');
        var pAvail = $('#postingAvailability');
        if (!backendReady) {
          if (jStatus)
            jStatus.textContent =
              'We couldn’t load current opportunities. Please retry or contact our team; no roles are shown until confirmed.';
          if (pAvail)
            pAvail.textContent =
              'Public job posting will be available shortly. In the meantime, share your hiring brief with our team below.';
        } else {
          if (jStatus)
            jStatus.textContent =
              'We couldn’t refresh the roles. Please try again later; availability is checked when you apply.';
        }
      } finally {
        var list = $('#rolesList');
        if (list) list.setAttribute('aria-busy', 'false');
      }
    })();
    try {
      await jobsLoading;
    } finally {
      jobsLoading = null;
    }
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
        var topTitles = jobs
          .slice(0, 4)
          .map(function (j) {
            return j.title;
          })
          .join(' · ');
        mandatesTitles.textContent = topTitles;
        mandatesStatus.textContent =
          jobs.length +
          (jobs.length === 1
            ? ' active mandate approved'
            : ' active mandates approved');
        mandatesStatus.style.color = '#2563eb';
      } else {
        mandatesTitles.textContent =
          'Marketing · Creative · Design · Technology';
        mandatesStatus.textContent =
          'No public roles listed right now · General CVs welcome';
        mandatesStatus.style.color = '#2563eb';
      }
    }

    var searchEl = $('#jobSearch');
    var search = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var catEl = $('#jobCategory');
    var area = catEl ? catEl.value : '';
    var matching = jobs.filter(function (job) {
      return (
        (!area || job.area === area) &&
        (!search ||
          [job.title, job.company, job.location]
            .join(' ')
            .toLowerCase()
            .indexOf(search) !== -1)
      );
    });
    var list = $('#rolesList');
    if (!list) return;
    list.replaceChildren();
    var jobsStatus = $('#jobsStatus');
    if (jobsStatus) {
      jobsStatus.textContent =
        jobsState === 'loading'
          ? 'Loading approved opportunities…'
          : jobsState === 'error'
            ? 'We couldn’t refresh current roles. Please retry or contact our team.'
            : !jobs.length
              ? 'No approved roles are listed right now. Share your CV so we can discuss future opportunities.'
              : !matching.length
                ? 'No roles match those filters. Try another search or share your CV.'
                : matching.length +
                  (matching.length === 1 ? ' open role' : ' open roles');
    }
    matching.forEach(function (job) {
      var card = element('article', undefined, 'job-card');
      var head = element('div', undefined, 'job-card-head');
      var info = element('div');
      info.append(
        element('h2', job.title, 'job-title'),
        element('p', job.company, 'job-company'),
      );
      var apply = element('a', 'Apply for this role', 'job-apply');
      apply.href = '/submit-cv/?job_id=' + encodeURIComponent(job.id);
      head.append(info, apply);
      var meta = element('div', undefined, 'job-meta');
      [
        job.area,
        job.location,
        job.work_mode,
        job.experience,
        job.salary,
        job.closes ? 'Closes ' + job.closes : '',
      ]
        .filter(Boolean)
        .forEach(function (text) {
          meta.append(element('span', text));
        });
      var details = element('details');
      details.append(
        element('summary', 'About this role'),
        element('p', job.description, 'job-description'),
      );
      card.append(head, meta, details);
      list.append(card);
    });
  }
  var jobSearchEl = $('#jobSearch');
  if (jobSearchEl) jobSearchEl.addEventListener('input', renderJobs);
  var jobCatEl = $('#jobCategory');
  if (jobCatEl) jobCatEl.addEventListener('change', renderJobs);
  function selectJob(job) {
    var applicationForm = $('#cvForm');
    if (!applicationForm || applicationForm.dataset.sending === 'true') return;
    applicationForm.dataset.saved = 'false';
    var submitBtn = applicationForm.querySelector('button[type=submit]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit your CV';
    }
    status($('#cvStatus'), '', '');
    selectedJob = job;
    requestedJobResolved = true;
    requestedJobId = job ? job.id : null;
    if (!job && new URLSearchParams(location.search).has('job_id')) {
      var cleanUrl = new URL(location.href);
      cleanUrl.searchParams.delete('job_id');
      history.replaceState(
        null,
        '',
        cleanUrl.pathname + cleanUrl.search + cleanUrl.hash,
      );
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
      if (!job) {
        role.value = '';
        return;
      }
      role.value = job.title;
      if (applicationForm.elements.area)
        applicationForm.elements.area.value = job.area;
      if (target) {
        target.append(
          element('span', 'Applying for ' + job.title + ' at ' + job.company),
        );
        var clear = element(
          'button',
          'General application instead',
          'clear-job',
        );
        clear.type = 'button';
        clear.addEventListener('click', function () {
          selectJob(null);
        });
        target.append(clear);
      }
    }
  }

  function resolveRequestedJob() {
    if (!$('#cvForm') || !requestedJobId) return;
    var match = jobs.find(function (job) {
      return job.id === requestedJobId;
    });
    if (match) {
      selectJob(match);
      return;
    }
    requestedJobResolved = false;
    var target = $('#applicationTarget');
    if (target) {
      target.hidden = false;
      target.replaceChildren(
        element(
          'span',
          'This role is closed or unavailable. Choose a general application or browse current roles.',
        ),
      );
      var general = element(
        'button',
        'Make a general application',
        'clear-job',
      );
      general.type = 'button';
      general.addEventListener('click', function () {
        selectJob(null);
      });
      target.append(general);
    }
  }
  if (requestedJobId && $('#applicationTarget')) {
    $('#applicationTarget').hidden = false;
    $('#applicationTarget').textContent = 'Checking the role you selected…';
  }
  var retryJobs = $('#retryJobs');
  if (retryJobs)
    retryJobs.addEventListener('click', function () {
      var list = $('#rolesList');
      if (list) list.setAttribute('aria-busy', 'true');
      status($('#jobsStatus'), 'Checking current opportunities…', '');
      loadJobs(true);
    });

  const fileInput = $('#cvFile');
  const dropzone = $('#cvDropzone') || $('#cvFileBox');
  const cvDropText = $('#cvDropText') || $('#cvFileLabel');
  const cvErrSpan = $('[data-err="cv"]');
  function fileValid(file) {
    return (
      !!file &&
      /\.(pdf|doc|docx)$/i.test(file.name) &&
      file.size > 0 &&
      file.size <= 5 * 1024 * 1024
    );
  }
  function resetCvUpload() {
    if (fileInput) {
      fileInput.value = '';
      fileInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    dropzone?.classList.remove('drag-active', 'file-attached');
    if (cvDropText)
      cvDropText.textContent = 'Drop your CV here or click to browse';
    $('#cvAttachedCard')?.remove();
    if (cvErrSpan) cvErrSpan.textContent = '';
  }
  function handleCvFile(file) {
    $('#cvAttachedCard')?.remove();
    if (!fileValid(file)) {
      resetCvUpload();
      if (cvErrSpan)
        cvErrSpan.textContent = 'Choose a PDF or Word CV up to 5 MB.';
      return;
    }
    if (cvErrSpan) cvErrSpan.textContent = '';
    if (cvDropText)
      cvDropText.textContent = 'CV attached. Click to choose a different file.';
    dropzone?.classList.remove('drag-active');
    const card = element('div', '', 'cv-attached-card');
    card.id = 'cvAttachedCard';
    const info = element('div', '', 'cv-attached-info');
    const details = element('div');
    details.append(
      element('span', file.name, 'cv-attached-name'),
      element(
        'span',
        `${(file.size / 1048576).toFixed(2)} MB · Ready to submit`,
        'cv-attached-size',
      ),
    );
    info.append(details);
    const remove = element('button', 'Remove file', 'cv-remove-btn');
    remove.type = 'button';
    remove.addEventListener('click', () => {
      resetCvUpload();
      fileInput.focus();
    });
    card.append(info, remove);
    dropzone.parentElement.append(card);
  }
  if (fileInput && dropzone) {
    ['dragenter', 'dragover'].forEach((type) =>
      dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.add('drag-active');
      }),
    );
    dropzone.addEventListener('dragleave', (event) => {
      if (!dropzone.contains(event.relatedTarget))
        dropzone.classList.remove('drag-active');
    });
    dropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropzone.classList.remove('drag-active');
      if (event.dataTransfer?.files.length) {
        fileInput.files = event.dataTransfer.files;
        handleCvFile(fileInput.files[0]);
        fileInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    fileInput.addEventListener('change', () =>
      handleCvFile(fileInput.files[0]),
    );
  }
  function status(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = 'submission-status' + (type ? ' ' + type : '');
  }
  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result).split(',')[1]);
      };
      reader.onerror = function () {
        reject(
          new Error('We couldn’t read that CV. Please choose the file again.'),
        );
      };
      reader.readAsDataURL(file);
    });
  }
  async function receipt(requestId) {
    for (var attempt = 0; attempt < 5; attempt++) {
      var result = await googleRead({
        action: 'receipt',
        request_id: requestId,
      });
      if (result.status === 'success' || result.status === 'error')
        return result;
      await new Promise(function (resolve) {
        setTimeout(resolve, 2000);
      });
    }
    return { status: 'pending' };
  }
  function bindForm(id, statusId, kind) {
    var form = $('#' + id),
      message = $('#' + statusId);
    if (!form || !message) return;
    // Retain the token across an uncertain retry of the same payload.
    var lastPayload = '',
      requestId = '';
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (form.dataset.sending === 'true') return;
      var honeypot = form.elements['bot-field'];
      if (!form.reportValidity() || (honeypot && honeypot.value)) return;
      if (kind === 'candidate' && !requestedJobResolved) {
        status(
          message,
          'Please resolve the selected role above, or choose a general application.',
          'error',
        );
        return;
      }
      if (kind === 'candidate' && !candidateDetailsReady) {
        status(
          message,
          'CV submissions are temporarily unavailable while we connect the application service. Please email contact@qleaps.in or try again shortly.',
          'error',
        );
        loadJobs(true);
        return;
      }
      if (kind === 'job' && !backendReady) {
        status(
          message,
          'Please share your hiring brief with our team below while job posting is being connected.',
          'error',
        );
        return;
      }
      var payload = new URLSearchParams();
      payload.set('name', form.elements.namedItem('name').value.trim());
      payload.set('email', form.elements.namedItem('email').value.trim());
      payload.set('consent', 'yes');
      var btn = form.querySelector('button[type=submit]'),
        previous = btn.textContent;
      form.dataset.sending = 'true';
      btn.disabled = true;
      btn.textContent = 'Sending…';
      status(message, '', '');
      var timeout,
        sent = false;
      try {
        if (kind === 'job') {
          payload.set('action', 'post_job');
          payload.set('form_type', 'Job Posting');
          [
            'company',
            'role',
            'area',
            'city',
            'work_mode',
            'experience',
            'salary',
            'description',
            'closes',
          ].forEach(function (k) {
            payload.set(
              k,
              form.elements[k] ? form.elements[k].value.trim() : '',
            );
          });
          var jd = form.elements.jd_file.files[0];
          if (jd) {
            if (!jdReady) throw new Error('JD uploads are not available yet.');
            if (!fileValid(jd))
              throw new Error('Choose a PDF or Word JD up to 5 MB.');
            payload.set('jd_data', await readFile(jd));
            payload.set('jd_name', jd.name);
            payload.set('jd_type', jd.type);
          }
        } else if (kind === 'candidate') {
          var file =
            (fileInput && fileInput.files && fileInput.files[0]) ||
            (form.elements.cv &&
              form.elements.cv.files &&
              form.elements.cv.files[0]);
          if (!fileValid(file))
            throw new Error('Please attach a PDF or Word CV up to 5 MB.');
          if (
            form.elements.phone &&
            form.elements.phone.value.replace(/\D/g, '').length < 10
          )
            throw new Error('Please enter a valid phone number.');
          payload.set('form_type', 'Candidate Application');
          if (backendReady) payload.set('action', 'apply');
          [
            'phone',
            'city',
            'role',
            'link',
            'linkedin',
            'current_title',
            'notice',
            'relocation',
            'salary',
            'area',
          ].forEach(function (k) {
            if (form.elements[k]) payload.set(k, form.elements[k].value.trim());
          });
          var expVal = form.elements.exp ? form.elements.exp.value : '';
          payload.set('experience', expVal);
          var appJobId = $('#applicationJobId');
          payload.set('job_id', appJobId ? appJobId.value : '');
          if (payload.get('job_id') && !backendReady)
            throw new Error(
              'Please refresh the opportunities before applying to this role.',
            );
          var areaVal = form.elements.area
            ? form.elements.area.value
            : 'General';
          payload.set(
            'message',
            'Specialism: ' +
              areaVal +
              (expVal ? ' | Experience: ' + expVal : ''),
          );
          payload.set('file_data', await readFile(file));
          payload.set('file_name', file.name);
          payload.set('file_type', file.type);
        } else {
          var isFeedback = kind === 'feedback';
          var textControl = form.elements[isFeedback ? 'message' : 'text'];
          var context = isFeedback
            ? [
                'Topic: ' + form.elements.topic.value,
                'Role / organisation: ' + form.elements.role.value,
              ].join(' | ') + '\n\n'
            : form.elements.service
              ? 'Service: ' +
                form.elements.service.selectedOptions[0].textContent.trim() +
                '\n\n'
              : '';
          payload.set(
            'form_type',
            isFeedback ? 'Editorial Feedback' : 'Contact Inquiry',
          );
          payload.set('message', context + textControl.value.trim());
          if (backendReady) payload.set('action', 'contact');
        }
        var raw = payload.toString();
        if (raw !== lastPayload || !requestId) {
          requestId = token();
          lastPayload = raw;
        }
        payload.set('request_id', requestId);
        var controller = new AbortController();
        timeout = setTimeout(function () {
          controller.abort();
        }, 35000);
        await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload.toString(),
          signal: controller.signal,
        });
        sent = true;
        clearTimeout(timeout);
        if (!backendReady) {
          status(
            message,
            'Sent for processing. If you don’t hear from us, email contact@qleaps.in. Your details remain here; please avoid submitting again until our team confirms.',
            '',
          );
          return;
        }
        var result = await receipt(requestId);
        if (result.status === 'error') {
          requestId = '';
          var serverError = new Error(
            result.message ||
              'We couldn’t save your submission. Please try again.',
          );
          serverError.confirmed = true;
          throw serverError;
        }
        if (result.status !== 'success') {
          status(
            message,
            'Your request is still processing. Receipt is not confirmed yet. Please contact our team before submitting again.',
            '',
          );
          return;
        }
        status(
          message,
          (kind === 'job'
            ? 'Your job is saved for review. It will appear after approval. '
            : kind === 'candidate'
              ? 'Your profile and CV are saved' +
                (selectedJob ? ' for ' + selectedJob.title + '. ' : '. ')
              : 'Your enquiry is saved. ') +
            'Reference: ' +
            result.reference,
          'success',
        );
        // Keep submitted forms disabled to prevent accidental duplicate uploads.
        form.dataset.saved = 'true';
        btn.textContent = 'Submitted';
      } catch (err) {
        status(
          message,
          err.name === 'AbortError'
            ? 'The request timed out. Please contact our team before retrying; delivery is uncertain.'
            : sent && !err.confirmed
              ? 'We couldn’t confirm receipt. Please contact our team before retrying.'
              : err.message,
          'error',
        );
      } finally {
        clearTimeout(timeout);
        form.dataset.sending = 'false';
        if (form.dataset.saved !== 'true') {
          btn.disabled = false;
          btn.textContent = previous;
        }
      }
    });
    form.addEventListener('input', function () {
      if (form.dataset.saved === 'true') {
        form.dataset.saved = 'false';
        var b = form.querySelector('button[type=submit]');
        b.disabled = false;
        b.textContent =
          kind === 'job'
            ? 'Submit for review'
            : kind === 'candidate'
              ? 'Submit your CV'
              : 'Send message';
        status(message, '', '');
      }
    });
  }
  $$('.ql-tip').forEach(function (tip) {
    var btn = $('.ql-tip-btn', tip);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open =
        $('.ql-tip-pts', tip) && $('.ql-tip-pts', tip).style.display === 'none';
      $$('.ql-tip').forEach(function (other) {
        var pts = $('.ql-tip-pts', other),
          b = $('.ql-tip-btn', other);
        if (pts) pts.style.display = 'none';
        if (b) b.textContent = 'Read the tips →';
      });
      if (open) {
        var pts = $('.ql-tip-pts', tip);
        if (pts) pts.style.display = 'flex';
        btn.textContent = 'Show less';
      }
    });
  });
  bindForm('jobForm', 'jobStatus', 'job');
  bindForm('cvForm', 'cvStatus', 'candidate');
  bindForm('msgForm', 'msgStatus', 'contact');
  if ($('#feedbackForm'))
    bindForm('feedbackForm', 'feedbackStatus', 'feedback');

  loadJobs();
}
