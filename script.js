/* EVEX V8 · Block System */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => n.toLocaleString('en-US');

  /* ---------- wordmark pixelado ---------- */
  const GLYPHS = {
    E: ['11111','10000','10000','11110','10000','10000','11111'],
    V: ['10001','10001','10001','10001','01010','01010','00100'],
    X: ['10001','10001','01010','00100','01010','10001','10001']
  };
  const COLORS = ['var(--paper)','var(--sky)','var(--paper)','var(--lime)'];

  $$('.px-word').forEach(word => {
    [...word.dataset.word].forEach((ch, li) => {
      const letter = document.createElement('span');
      letter.className = 'px-letter';
      letter.setAttribute('aria-hidden', 'true');
      GLYPHS[ch].forEach((row, y) => [...row].forEach((bit, x) => {
        const px = document.createElement('i');
        px.className = 'px' + (bit === '1' ? ' on' : '');
        px.style.setProperty('--c', COLORS[li % COLORS.length]);
        // ensamblado diagonal, letra por letra
        px.style.transitionDelay = (li * 0.09 + (x + y) * 0.035 + Math.random() * 0.08).toFixed(3) + 's';
        letter.appendChild(px);
      }));
      word.appendChild(letter);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => word.classList.add('built')));
  });

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const navIO = new IntersectionObserver(([e]) => nav.classList.toggle('scrolled', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
  navIO.observe($('.hero'));

  /* ---------- reveal ---------- */
  const countUp = el => {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = fmt(target); return; }
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round(target * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const revealIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    if (e.target.matches('[data-count]')) countUp(e.target);
    revealIO.unobserve(e.target);
  }), { threshold: 0.18 });
  $$('[data-reveal], .final').forEach(el => revealIO.observe(el));

  /* ---------- barras con alturas orgánicas ---------- */
  const setBars = (sel, arr) => $$(sel).forEach((b, i) => b.style.setProperty('--h', arr[i % arr.length] + '%'));
  setBars('.wave i', [20, 35, 26, 48, 42, 70, 55, 84, 68, 95, 78, 100]);
  setBars('.peak-bars i', [14, 22, 30, 26, 41, 48, 57, 63, 72, 86, 100, 81, 64, 52, 38, 27]);
  const heroBars = $$('.mini-bars i');
  let barData = [32, 41, 36, 52, 47, 58, 50, 66, 61, 72, 64, 79, 74, 88];
  const paintHeroBars = () => heroBars.forEach((b, i) => b.style.setProperty('--h', barData[i] + '%'));
  paintHeroBars();

  /* engagement: 87 de 100 bloques */
  const eng = $('.engage-blocks');
  if (eng) {
    for (let i = 0; i < 30; i++) eng.appendChild(document.createElement('i'));
    const cells = $$('i', eng);
    const engIO = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const on = Math.round(cells.length * 0.87);
      cells.forEach((c, i) => setTimeout(() => i < on && c.classList.add('on'), reduce ? 0 : i * 35));
      engIO.disconnect();
    }, { threshold: .4 });
    engIO.observe(eng);
  }

  /* collage del piloto: cada aviso "+1" suma un registro */
  const clCount = $('.cl-count');
  if (clCount && !reduce) {
    let n = 2841;
    setTimeout(() => setInterval(() => { if (!document.hidden) clCount.textContent = fmt(++n); }, 3600), 800);
  }

  /* ---------- hero: contador vivo (demo) + pasos ---------- */
  const heroCount = $('#heroCount');
  let total = 6848;
  const steps = $$('#heroSteps li');
  let stepIdx = 0;
  if (!reduce) {
    setInterval(() => {
      if (document.hidden) return;
      total += 1 + Math.floor(Math.random() * 3);
      heroCount.textContent = fmt(total);
      barData = [...barData.slice(1), Math.max(30, Math.min(100, barData.at(-1) + (Math.random() * 24 - 10)))];
      paintHeroBars();
    }, 2600);
    setInterval(() => {
      if (document.hidden) return;
      steps[stepIdx].classList.remove('on');
      stepIdx = (stepIdx + 1) % steps.length;
      steps[stepIdx].classList.add('on');
    }, 1700);
  }

  /* ---------- experience: historia pinneada ---------- */
  const exp = $('.experience');
  const stages = $$('.app-stage');
  const expSteps = $$('.exp-steps li');
  const meter = $('.exp-meter span');
  const phone = $('.phone');
  const panel = $('.intel-panel');
  const plus = $('.plusone');
  const live = $('#liveCount');
  let fired = false, running = false, lastIdx = -1;

  const tick = () => {
    if (!running) return;
    const r = exp.getBoundingClientRect();
    const max = exp.offsetHeight - innerHeight;
    const p = Math.max(0, Math.min(1, -r.top / max));
    meter.style.transform = `scaleX(${p})`;
    const idx = p < .33 ? 0 : p < .66 ? 1 : 2;
    if (idx !== lastIdx) {
      stages.forEach((s, i) => s.classList.toggle('active', i === idx));
      expSteps.forEach((s, i) => s.classList.toggle('active', i === idx));
      lastIdx = idx;
    }
    if (!reduce) phone.style.transform = `rotate(${3 - p * 6}deg) translateY(${Math.sin(p * Math.PI) * -14}px)`;
    panel.classList.toggle('on', p > .6);
    if (p > .7 && !fired) {
      fired = true;
      setTimeout(() => {
        live.textContent = '6,848';
        if (!reduce) {
          plus.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-14px)' }], { duration: 1200 });
          $$('.wave i').forEach((b, i) => b.animate([{ transform: 'scaleY(1)' }, { transform: `scaleY(${1.08 + (i % 4) * .1})` }, { transform: 'scaleY(1)' }], { duration: 700, delay: i * 25 }));
        }
      }, 300);
    }
    if (p < .5 && fired) { fired = false; live.textContent = '6,847'; }
    requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) requestAnimationFrame(tick);
  }).observe(exp);

  /* typing del campo nombre */
  const typer = $('.typing');
  let typed = false;
  new MutationObserver(() => {
    if (typed || !typer.closest('.app-stage').classList.contains('active')) return;
    typed = true;
    const t = typer.dataset.text;
    if (reduce) { typer.textContent = t; return; }
    let i = 0;
    const x = setInterval(() => { typer.textContent = t.slice(0, ++i); if (i >= t.length) clearInterval(x); }, 65);
  }).observe($('.s2'), { attributes: true, attributeFilter: ['class'] });

  /* ---------- final: bloques decorativos + CTA magnético ---------- */
  const fb = $('.final-blocks');
  if (fb) {
    const palette = ['var(--electric)', 'var(--sky)', 'var(--lime)', 'var(--indigo)', 'var(--paper)'];
    const cells = [];
    for (let i = 0; i < 64; i++) {
      const c = document.createElement('i');
      const x = i % 8, y = Math.floor(i / 8);
      // densidad decreciente hacia la izquierda: el bloque se "disuelve"
      if (Math.random() < (x + 1) / 9 - y * 0.03) c.style.background = palette[Math.floor(Math.random() * palette.length)];
      fb.appendChild(c); cells.push(c);
    }
    if (!reduce) setInterval(() => {
      if (document.hidden) return;
      const c = cells[Math.floor(Math.random() * cells.length)];
      c.style.background = Math.random() < .5 ? 'transparent' : palette[Math.floor(Math.random() * palette.length)];
    }, 380);
  }

  /* ---------- formulario de solicitud (FormSubmit) ---------- */
  const form = $('#leadForm');
  if (form) {
    const ENDPOINT = 'https://formsubmit.co/ajax/contacto@meridianogis.com';
    const status = $('.f-status', form);
    const btn = $('.f-submit', form);
    const label = $('.f-label', form);
    const planSel = $('#f-plan');
    const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

    // los botones "Cotizar" de cada plan llegan con el plan ya elegido
    $$('[data-plan]').forEach(a => a.addEventListener('click', () => {
      planSel.value = a.dataset.plan;
      setTimeout(() => $('#f-name').focus({ preventScroll: true }), 700);
    }));

    const validate = () => {
      let ok = true;
      $$('[required]', form).forEach(el => {
        const valid = el.type === 'email' ? emailOk(el.value.trim()) : el.value.trim().length > 1;
        el.closest('.f-field').classList.toggle('invalid', !valid);
        el.setAttribute('aria-invalid', String(!valid));
        if (!valid && ok) { el.focus(); ok = false; }
      });
      return ok;
    };
    $$('[required]', form).forEach(el => el.addEventListener('input', () => {
      if (el.closest('.f-field').classList.contains('invalid')) validate();
    }));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      status.className = 'f-status';
      status.textContent = '';
      if (!validate()) return;

      btn.disabled = true;
      label.textContent = 'Enviando…';
      const data = Object.fromEntries(new FormData(form));
      data._replyto = data.email;

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || String(json.success) === 'false') throw new Error(json.message || 'send failed');
        form.classList.add('sent');
        status.classList.add('ok');
        status.innerHTML = `Gracias, ${data.Nombre.split(' ')[0]}. Recibimos tu solicitud.<small>Te escribiremos a ${data.email} en menos de 48 horas hábiles.</small>`;
        form.reset();
      } catch (err) {
        status.classList.add('err');
        status.innerHTML = 'No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos a <a href="mailto:contacto@meridianogis.com">contacto@meridianogis.com</a>.';
        btn.disabled = false;
        label.textContent = 'Enviar solicitud';
      }
    });
  }
})();
