import { $, $$ } from './dom.js';
import { reducedMotion, motionPaused } from './motion.js';
export function initRecruitmentInteractions() {
  /* Interactive illustrative shortlist */
  var fitWrap = $('#qlFit');
  if (fitWrap) {
    var fitSlider = $('#qlFitSlider');
    var fitBtnVolume = $('#qlFitBtnVolume');
    var fitBtnFit = $('#qlFitBtnFit');
    var fitCap = $('#qlFitCap');
    var fitHint = $('#qlFitHint');
    var fitTray = $('#qlFitCardsTray');
    var dots = $$('.ql-fd', fitWrap);

    function applySieveState(progress) {
      // progress from 0 (Volume) to 100 (Fit)
      var ratio = progress / 100;
      if (fitBtnVolume)
        fitBtnVolume.setAttribute('aria-pressed', String(progress === 0));
      if (fitBtnFit)
        fitBtnFit.setAttribute('aria-pressed', String(progress === 100));
      if (fitSlider)
        fitSlider.setAttribute(
          'aria-valuetext',
          progress + '% through the illustrative shortlist example',
        );
      var isFit = ratio >= 0.7;
      var isMid = ratio > 0.25 && ratio < 0.7;

      // Update dots with physics scale, opacity, scatter bounce, and pulse rings
      dots.forEach(function (d, idx) {
        var isMatch = d.getAttribute('data-hi') === '1';
        if (isMatch) {
          d.style.background = '#FF6B4A';
          d.style.opacity = '1';
          d.style.transform =
            'scale(' + (1 + ratio * 0.45) + ') translate(0, 0)';
          d.style.animation = isFit ? 'qlPulseRing 2.2s infinite' : 'none';
        } else {
          var dotScale = Math.max(0.14, 1 - ratio * 0.86);
          var dotOpacity = Math.max(0.06, 0.9 - ratio * 0.84);
          // Scatter physics: radial dispersal
          var angle = (idx * 47) % 360;
          var dist = ratio * 18;
          var scatterX = Math.cos((angle * Math.PI) / 180) * dist;
          var scatterY = Math.sin((angle * Math.PI) / 180) * dist;
          d.style.background = '#E9E7F5';
          d.style.opacity = dotOpacity;
          d.style.transform =
            'translate(' +
            scatterX.toFixed(1) +
            'px,' +
            scatterY.toFixed(1) +
            'px) scale(' +
            dotScale +
            ')';
          d.style.animation = 'none';
        }
      });

      // Update button highlights
      if (fitBtnVolume && fitBtnFit) {
        fitBtnVolume.style.background =
          ratio < 0.5 ? 'rgba(255,255,255,.22)' : 'transparent';
        fitBtnVolume.style.color = ratio < 0.5 ? '#FFFFFF' : '#E9E7F5';
        fitBtnFit.style.background = ratio >= 0.5 ? '#FF6B4A' : 'transparent';
        fitBtnFit.style.color = '#FFFFFF';
      }

      // Update Scout's commentary & pose
      if (isFit) {
        if (fitCap) fitCap.textContent = '3 who fit.';
        if (fitHint) fitHint.textContent = 'The curated shortlist';
        if (fitTray) fitTray.style.display = 'flex';
      } else if (isMid) {
        if (fitCap)
          fitCap.textContent =
            Math.round(30 - ratio * 27) + ' candidates filtering...';
        if (fitHint) fitHint.textContent = 'Keep sliding toward Fit';
        if (fitTray) fitTray.style.display = 'none';
      } else {
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
        fitBtnVolume.setAttribute('aria-pressed', 'true');
        fitBtnFit.setAttribute('aria-pressed', 'false');
        applySieveState(0);
      });
    }

    if (fitBtnFit) {
      fitBtnFit.addEventListener('click', function () {
        if (fitSlider) fitSlider.value = 100;
        fitBtnFit.setAttribute('aria-pressed', 'true');
        fitBtnVolume.setAttribute('aria-pressed', 'false');
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
}
