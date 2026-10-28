import { reducedMotion, motionPaused } from './motion.js';
export function initHeroClashCanvas() {
  var canvas = document.getElementById('heroCanvas');
  var topSection = document.getElementById('top');
  if (!canvas || !topSection) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var width = 0,
    height = 0,
    dpr = 1;
  var animFrameId = null;
  var isVisible = false;
  var lastClashTime = 0;

  var circle1 = {
    x: 0,
    y: 0,
    vx: 1.25,
    vy: 0.85,
    baseR: 185,
    r: 185,
    mass: 1.2,
    pulse: 0,
  };

  var circle2 = {
    x: 0,
    y: 0,
    vx: -1.05,
    vy: -1.35,
    baseR: 135,
    r: 135,
    mass: 0.9,
    dashOffset: 0,
    pulse: 0,
  };

  var clashes = [];

  function orbitInset() {
    return 2;
  }
  function containCircle(circle) {
    var inset = orbitInset();
    var left = inset + circle.r,
      right = width - inset - circle.r;
    var top = inset + circle.r,
      bottom = height - inset - circle.r;
    if (circle.x < left) {
      circle.x = left;
      circle.vx = Math.abs(circle.vx);
    }
    if (circle.x > right) {
      circle.x = right;
      circle.vx = -Math.abs(circle.vx);
    }
    if (circle.y < top) {
      circle.y = top;
      circle.vy = Math.abs(circle.vy);
    }
    if (circle.y > bottom) {
      circle.y = bottom;
      circle.vy = -Math.abs(circle.vy);
    }
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
    var radiusLimit = Math.max(
      12,
      (Math.min(width, height) - 2 * orbitInset()) * 0.36,
    );
    circle1.r = Math.min(circle1.baseR * scale, radiusLimit);
    circle2.r = Math.min(circle2.baseR * scale, radiusLimit);

    if (circle1.x === 0 && circle1.y === 0) {
      circle1.x = width * 0.72;
      circle1.y = height * 0.32;
      circle2.x = width * 0.32;
      circle2.y = height * 0.68;
    }
    containCircle(circle1);
    containCircle(circle2);
  }

  // A short, local electrical arc follows the tangent at the point of contact.
  function triggerClash(cx, cy, nx, ny, c1, c2) {
    if (reducedMotion || motionPaused) return;
    c1.pulse = 0.65;
    c2.pulse = 0.65;
    lastClashTime = Date.now();
    var span = Math.min(150, width * 0.2);
    var tx = -ny,
      ty = nx;
    var points = [];
    for (var j = 0; j <= 12; j++) {
      var along = (j / 12 - 0.5) * span;
      var offset =
        j === 0 || j === 12 || j === 6 ? 0 : (Math.random() - 0.5) * 24;
      points.push({
        x: cx + tx * along + nx * offset,
        y: cy + ty * along + ny * offset,
      });
    }
    var bolts = [{ points: points, isFork: false }];
    [3, 8].forEach(function (index) {
      var root = points[index];
      var side = index === 3 ? -1 : 1;
      bolts.push({
        isFork: true,
        points: [
          root,
          {
            x: root.x + nx * side * 18 + tx * 8,
            y: root.y + ny * side * 18 + ty * 8,
          },
          {
            x: root.x + nx * side * 30 - tx * 4,
            y: root.y + ny * side * 30 - ty * 4,
          },
        ],
      });
    });
    var sparks = [];
    for (var k = 0; k < 8; k++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.8 + Math.random() * 1.8;
      sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        size: 0.7 + Math.random(),
      });
    }
    clashes.push({
      x: cx,
      y: cy,
      span: span,
      age: 0,
      maxAge: 24,
      bolts: bolts,
      sparks: sparks,
    });
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

      var cx =
        circle1.x + nx * (circle1.r + (dist - circle1.r - circle2.r) * 0.5);
      var cy =
        circle1.y + ny * (circle1.r + (dist - circle1.r - circle2.r) * 0.5);

      var overlap = minDist - dist;
      circle1.x -= nx * overlap * 0.5;
      circle1.y -= ny * overlap * 0.5;
      circle2.x += nx * overlap * 0.5;
      circle2.y += ny * overlap * 0.5;

      var kx = circle1.vx - circle2.vx;
      var ky = circle1.vy - circle2.vy;
      var p = (2 * (nx * kx + ny * ky)) / (circle1.mass + circle2.mass);

      if (nx * kx + ny * ky > 0) {
        circle1.vx -= p * circle2.mass * nx;
        circle1.vy -= p * circle2.mass * ny;
        circle2.vx += p * circle1.mass * nx;
        circle2.vy += p * circle1.mass * ny;

        var s1 = Math.hypot(circle1.vx, circle1.vy);
        if (s1 < 0.9) {
          circle1.vx = (circle1.vx / s1 || 1) * 1.15;
          circle1.vy = (circle1.vy / s1 || 0.5) * 1.15;
        }
        if (s1 > 2.2) {
          circle1.vx = (circle1.vx / s1) * 2.0;
          circle1.vy = (circle1.vy / s1) * 2.0;
        }

        var s2 = Math.hypot(circle2.vx, circle2.vy);
        if (s2 < 0.9) {
          circle2.vx = (circle2.vx / s2 || -1) * 1.15;
          circle2.vy = (circle2.vy / s2 || -0.5) * 1.15;
        }
        if (s2 > 2.2) {
          circle2.vx = (circle2.vx / s2) * 2.0;
          circle2.vy = (circle2.vy / s2) * 2.0;
        }

        triggerClash(cx, cy, nx, ny, circle1, circle2);
      }
    }

    // Collision separation can push a circle outward; contain it again before drawing.
    containCircle(circle1);
    containCircle(circle2);

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
      ctx.fillStyle =
        'rgba(255, 255, 255, ' + (0.32 * maxFlash).toFixed(3) + ')';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw Circle 1 (Purple/indigo filled orb)
    ctx.save();
    var p1 = circle1.pulse;
    var g1 = ctx.createRadialGradient(
      circle1.x,
      circle1.y,
      circle1.r * 0.1,
      circle1.x,
      circle1.y,
      circle1.r,
    );
    g1.addColorStop(
      0,
      'rgba(' +
        Math.floor(79 + 50 * p1) +
        ', ' +
        Math.floor(70 + 40 * p1) +
        ', 229, ' +
        (0.16 + 0.14 * p1).toFixed(3) +
        ')',
    );
    g1.addColorStop(
      0.7,
      'rgba(79, 70, 229, ' + (0.09 + 0.08 * p1).toFixed(3) + ')',
    );
    g1.addColorStop(
      1,
      'rgba(79, 70, 229, ' + (0.02 + 0.04 * p1).toFixed(3) + ')',
    );
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(circle1.x, circle1.y, circle1.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 1.8 + 2 * p1;
    ctx.strokeStyle =
      p1 > 0
        ? 'rgba(167, 139, 250, ' + (0.4 + 0.5 * p1).toFixed(2) + ')'
        : 'rgba(79, 70, 229, 0.22)';
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
    var g2 = ctx.createRadialGradient(
      circle2.x,
      circle2.y,
      circle2.r * 0.15,
      circle2.x,
      circle2.y,
      circle2.r,
    );
    g2.addColorStop(
      0,
      'rgba(' +
        Math.floor(99 + 60 * p2) +
        ', 102, 241, ' +
        (0.12 + 0.12 * p2).toFixed(3) +
        ')',
    );
    g2.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(circle2.x, circle2.y, circle2.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -circle2.dashOffset;
    ctx.lineWidth = 2.2 + 2 * p2;
    ctx.strokeStyle =
      p2 > 0
        ? 'rgba(192, 132, 252, ' + (0.5 + 0.45 * p2).toFixed(2) + ')'
        : 'rgba(79, 70, 229, 0.35)';
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

      // 1. Natural Soft Diffuse Lightening Bloom
      if (c.age < 12) {
        var bloomFade = 1 - c.age / 12;
        var bloomR = c.span * 0.75;
        var bloomGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, bloomR);
        bloomGrad.addColorStop(
          0,
          'rgba(255, 255, 255, ' + (0.35 * bloomFade).toFixed(3) + ')',
        );
        bloomGrad.addColorStop(
          0.25,
          'rgba(216, 180, 254, ' + (0.24 * bloomFade).toFixed(3) + ')',
        );
        bloomGrad.addColorStop(
          0.65,
          'rgba(147, 51, 234, ' + (0.12 * bloomFade).toFixed(3) + ')',
        );
        bloomGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.save();
        ctx.fillStyle = bloomGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, bloomR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Jagged Natural Lightning Bolts
      if (c.age < 15) {
        var boltFade = 1 - c.age / 15;
        c.bolts.forEach(function (bolt) {
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'bevel';

          // Outer aura
          ctx.strokeStyle =
            'rgba(192, 132, 252, ' +
            ((bolt.isFork ? 0.6 : 0.88) * boltFade).toFixed(3) +
            ')';
          ctx.lineWidth = bolt.isFork ? 2.0 : 3.6;
          ctx.shadowColor = '#A855F7';
          ctx.shadowBlur = bolt.isFork ? 8 : 16;
          ctx.beginPath();
          bolt.points.forEach(function (pt, idx) {
            var jx = (Math.random() - 0.5) * 0.8;
            var jy = (Math.random() - 0.5) * 0.8;
            if (idx === 0) ctx.moveTo(pt.x + jx, pt.y + jy);
            else ctx.lineTo(pt.x + jx, pt.y + jy);
          });
          ctx.stroke();

          // White-hot core strike filament
          ctx.strokeStyle =
            'rgba(255, 255, 255, ' + (0.95 * boltFade).toFixed(3) + ')';
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
    animFrameId = null;
    if (!isVisible || document.hidden || motionPaused) return;
    update();
    draw();
    animFrameId = requestAnimationFrame(loop);
  }
  function syncCanvas() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (motionPaused) {
      draw();
      return;
    }
    if (isVisible && !document.hidden)
      animFrameId = requestAnimationFrame(loop);
  }
  window.addEventListener(
    'resize',
    function () {
      resize();
      if (motionPaused) draw();
    },
    { passive: true },
  );
  if ('ResizeObserver' in window)
    new ResizeObserver(function () {
      resize();
      if (motionPaused) draw();
    }).observe(topSection);
  document.addEventListener('visibilitychange', syncCanvas);
  document.addEventListener('ql-motion-change', syncCanvas);
  resize();
  draw();
  if ('IntersectionObserver' in window)
    new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
      syncCanvas();
    }).observe(topSection);
  else {
    isVisible = true;
    syncCanvas();
  }
}
