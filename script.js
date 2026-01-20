document.addEventListener('DOMContentLoaded', ()=>{
  // Year
  const y = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = y;

  // Nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if(toggle && nav){
    toggle.addEventListener('click', ()=>{
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      if(open){
        const firstLink = nav.querySelector('a');
        if(firstLink) firstLink.focus();
      }
    })
    nav.addEventListener('click',(e)=>{
      if(e.target && e.target.tagName === 'A' && nav.classList.contains('open')){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    })
    document.addEventListener('keydown',(e)=>{
      if(e.key === 'Escape' && nav.classList.contains('open')){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    })
  }

  // Initialize EmailJS
  emailjs.init("Ss_SM2CajVCHM510b");

  // Custom notification handler
  const notification = document.querySelector('.notification');
  function showNotification(message, type = 'success') {
    const icon = notification.querySelector('.icon');
    const messageEl = notification.querySelector('.message');
    
    icon.innerHTML = type === 'success' 
      ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" stroke="#4ade80"/></svg>'
      : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke="#ff3b3b"/></svg>';
    
    messageEl.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 4000);
  }

  // Contact form handler
  const form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      
      btn.disabled = true;
      btn.classList.add('sending-btn');
      btn.textContent = 'Sending';

      try {
        const formData = {
          name: form.name.value,
          email: form.email.value,
          message: form.message.value,
          reply_to: form.email.value
        };

        const response = await emailjs.send(
          "service_7focmrx",
          "template_ijcx1qz",
          formData,
          "Ss_SM2CajVCHM510b"
        );
        
        if (response.status === 200) {
          showNotification('Message sent successfully! I\'ll get back to you soon.');
          form.reset();
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        showNotification(
          error.text || 'Failed to send message. Please check your connection and try again.',
          'error'
        );
      } finally {
        btn.disabled = false;
        btn.classList.remove('sending-btn');
        btn.textContent = originalText;
      }
    })
  }

  // IntersectionObserver for reveal animations
  const reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      })
    },{threshold:0.12});
    reveals.forEach(el=>io.observe(el));
  } else {
    reveals.forEach(el=>el.classList.add('is-visible'));
  }

  // Hero card tilt
  const heroCard = document.querySelector('.hero-card');
  if(heroCard){
    heroCard.addEventListener('mousemove', (e)=>{
      const rect = heroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (y * 8).toFixed(2);
      const ry = (-x * 12).toFixed(2);
      heroCard.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    heroCard.addEventListener('mouseleave', ()=>{
      heroCard.style.transform = '';
    });
    window.addEventListener('scroll', ()=>{
      const offset = window.scrollY * 0.05;
      heroCard.style.transform = `translateY(${Math.min(20, offset)}px)`;
    },{passive:true});
  }

  // Typing animation
  (function(){
    const names = [
      'John Eboh',
      'Black999-ng',
      'Blaxk'
    ];
    const typedName = document.getElementById('typed-name');
    const wrapper = document.querySelector('.typed-wrapper');
    if(!typedName || !wrapper) return;

    const wait = ms => new Promise(r => setTimeout(r, ms));

    function fitFontSizeToWidth(el, text, options = {}){
      const maxSize = options.maxSize || parseFloat(getComputedStyle(el).fontSize) || 42;
      const minSize = options.minSize || 12;
      el.style.fontSize = maxSize + 'px';
      el.textContent = text;
      let attempts = 0;
      while(el.scrollWidth > wrapper.clientWidth && attempts < 40){
        const current = parseFloat(getComputedStyle(el).fontSize);
        const next = Math.max(minSize, current - Math.max(1, Math.round(current * 0.06)));
        el.style.fontSize = next + 'px';
        attempts++;
      }
    }

    async function typeName(name, charDelay = 50, hold = 5000, deleteDelay = 100, postDeletePause = 250){
      fitFontSizeToWidth(typedName, name, { maxSize: 42, minSize: 14 });

      typedName.textContent = '';
      for(let i = 0; i < name.length; i++){
        typedName.textContent += name[i];
        await wait(charDelay);
      }

      await wait(hold);

      for(let i = name.length; i > 0; i--){
        typedName.textContent = typedName.textContent.slice(0, -1);
        await wait(deleteDelay);
      }

      await wait(postDeletePause);
    }

    (async function loop(){
      while(true){
        for(const n of names){
          await typeName(n, 35, 900);
        }
      }
    })();
  })();

  /* Circuit background animation */
  (function(){
    const canvas = document.getElementById('circuit-bg');
    if(!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0, height = 0, dpr = 1;
    let points = [];
    let animationId = null;
    let frame = 0;
    const prefsReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const config = {
      rows: 24,
      cols: 24,
      jitter: 5,
      connectDistance: 300,
      lineAlpha: 0.15,
      nodeAlpha: 0.8,
      pulseSpeed: 0.3,
      backgroundFade: 0.015,
      maxPoints: 280,
      maxNeighbors: 8
    };

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      
      const scale = 1.1;
      canvas.width = Math.round(width * dpr * scale);
      canvas.height = Math.round(height * dpr * scale);
      canvas.style.width = (width * scale) + 'px';
      canvas.style.height = (height * scale) + 'px';
      
      ctx.setTransform(dpr,0,0,dpr,0,0);
      buildPoints();
    }

    function buildPoints(){
      points = [];
      const topHeight = height * 0.5;
      for(let i = 0; i < config.maxPoints / 2; i++) {
        const x = (Math.random() * width * 0.95) + (width * 0.025);
        const y = Math.random() * topHeight;
        points.push(createPoint(x, y));
      }

      const bottomStart = height * 0.5;
      for(let i = 0; i < config.maxPoints / 2; i++) {
        const x = (Math.random() * width * 0.95) + (width * 0.025);
        const y = bottomStart + (Math.random() * (height - bottomStart));
        points.push(createPoint(x, y));
      }
    }

    const createPoint = (x, y) => ({
      x, y,
      ox: x, oy: y,
      vx: (Math.random()-0.5) * 0.15,
      vy: (Math.random()-0.5) * 0.15,
      pulse: Math.random() * Math.PI * 2
    });

    function step(ts){
      if(prefsReduced){
        drawStatic();
        return;
      }

      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = `rgba(6,6,6,${config.backgroundFade})`;
      ctx.fillRect(0,0,width,height);

      frame++;
      const jitterThisFrame = (frame % 2) === 0;
      for(const p of points){
        if(jitterThisFrame){
          p.vx += (Math.random()-0.5) * 0.12;
          p.vy += (Math.random()-0.5) * 0.12;
        }
        p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
        p.vy = Math.max(-0.5, Math.min(0.5, p.vy));
        p.x += p.vx;
        p.y += p.vy;
        p.x += (p.ox - p.x) * 0.006;
        p.y += (p.oy - p.y) * 0.006;
        p.pulse += config.pulseSpeed * 0.02;
      }

      ctx.lineWidth = 1;
      for(let i=0;i<points.length;i++){
        const a = points[i];
        let neighbors = 0;
        for(let j=i+1;j<points.length && neighbors < config.maxNeighbors;j++){
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx,dy);
          if(dist < config.connectDistance){
            const alpha = (1 - dist / config.connectDistance) * config.lineAlpha;
            ctx.strokeStyle = `rgba(255,90,90,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            neighbors++;
          }
        }
      }

      for(const p of points){
        const r = 1.6 + Math.sin(p.pulse) * 1.3;
        ctx.fillStyle = `rgba(255,80,80,${config.nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, r), 0, Math.PI*2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(step);
    }

    function drawStatic(){
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = `rgba(6,6,6,${config.backgroundFade})`;
      ctx.fillRect(0,0,width,height);
      ctx.lineWidth = 1;
      for(let i=0;i<points.length;i++){
        const a = points[i];
        for(let j=i+1;j<points.length;j++){
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx,dy);
          if(dist < config.connectDistance){
            const alpha = (1 - dist / config.connectDistance) * config.lineAlpha * 0.9;
            ctx.strokeStyle = `rgba(255,90,90,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for(const p of points){
        ctx.fillStyle = `rgba(255,80,80,${config.nodeAlpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI*2);
        ctx.fill();
      }
    }

    let resizeTimer = null;
    function scheduleResize(){
      if(resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    }

    function handleVisibility(){
      if(document.hidden){
        if(animationId) cancelAnimationFrame(animationId);
        animationId = null;
      } else {
        if(!animationId && !prefsReduced) animationId = requestAnimationFrame(step);
      }
    }

    window.addEventListener('resize', scheduleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    resize();
    if(prefsReduced){
      drawStatic();
    } else {
      animationId = requestAnimationFrame(step);
    }
  })();
})
