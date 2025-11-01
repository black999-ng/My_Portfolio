// Minimal JS for interactivity
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
        // focus the first link for keyboard users
        const firstLink = nav.querySelector('a');
        if(firstLink) firstLink.focus();
      }
    })
    // Close nav when a link is clicked (mobile)
    nav.addEventListener('click',(e)=>{
      if(e.target && e.target.tagName === 'A' && nav.classList.contains('open')){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    })
    // Close on Escape
    document.addEventListener('keydown',(e)=>{
      if(e.key === 'Escape' && nav.classList.contains('open')){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    })
  }

  // Initialize EmailJS with your public key
  emailjs.init("Ss_SM2CajVCHM510b"); // Replace with your EmailJS public key

  // Custom notification handler
  const notification = document.querySelector('.notification');
  function showNotification(message, type = 'success') {
    const icon = notification.querySelector('.icon');
    const messageEl = notification.querySelector('.message');
    
    // Set icon based on type
    icon.innerHTML = type === 'success' 
      ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" stroke="#4ade80"/></svg>'
      : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke="#ff3b3b"/></svg>';
    
    messageEl.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Hide after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 4000);
  }

  // Contact form handler with EmailJS
  const form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      
      // Disable button and show loading state
      btn.disabled = true;
      btn.classList.add('sending-btn');
      btn.textContent = 'Sending';

      try {
        // Get form data
        const formData = {
          name: form.name.value,          // Template variable {{name}}
          email: form.email.value,        // Template variable {{email}}
          message: form.message.value,    // Will be used in content
          reply_to: form.email.value      // For reply functionality
        };

        // Send email using EmailJS and wait for response
        const response = await emailjs.send(
          "service_7focmrx",     // Your verified Gmail service
          "template_ijcx1qz",    // Your "Auto-Reply" template
          formData,              // Form data matching template variables
          "Ss_SM2CajVCHM510b"   // Your public key
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
        // Reset button state
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
    // fallback: reveal immediately
    reveals.forEach(el=>el.classList.add('is-visible'));
  }

  // Hero card tilt / subtle parallax
  const heroCard = document.querySelector('.hero-card');
  if(heroCard){
    // Pointer movement for desktop
    heroCard.addEventListener('mousemove', (e)=>{
      const rect = heroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (y * 8).toFixed(2);
      const ry = (-x * 12).toFixed(2);
      heroCard.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    // Reset on leave
    heroCard.addEventListener('mouseleave', ()=>{
      heroCard.style.transform = '';
    });
    // Slight parallax on scroll
    window.addEventListener('scroll', ()=>{
      const offset = window.scrollY * 0.05;
      heroCard.style.transform = `translateY(${Math.min(20, offset)}px)`;
    },{passive:true});
  }

  // Typing animation for the hero name (replaces the cube)
  (function(){
    const names = [
      'John Eboh',
      'Black999-ng',
      'Blaxk'
    ];
    const typedName = document.getElementById('typed-name');
    const wrapper = document.querySelector('.typed-wrapper');
    if(!typedName || !wrapper) return;

    // helper sleep
    const wait = ms => new Promise(r => setTimeout(r, ms));

    // Auto-fit font-size so long names don't overflow the container
    function fitFontSizeToWidth(el, text, options = {}){
      const maxSize = options.maxSize || parseFloat(getComputedStyle(el).fontSize) || 42;
      const minSize = options.minSize || 12;
      // put full text to measure
      el.style.fontSize = maxSize + 'px';
      el.textContent = text;
      // If it fits immediately, keep the size
      let attempts = 0;
      while(el.scrollWidth > wrapper.clientWidth && attempts < 40){
        const current = parseFloat(getComputedStyle(el).fontSize);
        const next = Math.max(minSize, current - Math.max(1, Math.round(current * 0.06)));
        el.style.fontSize = next + 'px';
        attempts++;
      }
    }

    // Type one name then delete it (full typing + full erase effect)
    async function typeName(name, charDelay = 35, hold = 900, deleteDelay = 28, postDeletePause = 250){
      // compute fit based on full name
      fitFontSizeToWidth(typedName, name, { maxSize: 42, minSize: 14 });

      // ensure starting empty, then type characters one-by-one
      typedName.textContent = '';
      for(let i = 0; i < name.length; i++){
        typedName.textContent += name[i];
        await wait(charDelay);
      }

      // hold on the full name for a moment
      await wait(hold);

      // delete characters one-by-one to create a full typing-cycle effect
      for(let i = name.length; i > 0; i--){
        // remove last character
        typedName.textContent = typedName.textContent.slice(0, -1);
        await wait(deleteDelay);
      }

      // small pause after fully erased before next type begins
      await wait(postDeletePause);
    }

    // loop names
    (async function loop(){
      while(true){
        for(const n of names){
          await typeName(n, 35, 900);
        }
      }
    })();
  })();

  /* Circuit background: responsive canvas with subtle animated nodes/lines */
  (function(){
    const canvas = document.getElementById('circuit-bg');
    if(!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0, height = 0, dpr = 1;
    let points = [];
    let animationId = null;
    let frame = 0; // used to throttle some per-frame work
    const prefsReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // configuration for viewport-fixed background with enhanced visibility
    const config = {
      rows: 24, // reference for density calculations
      cols: 24, // reference for density calculations
      jitter: 5, // slight increase for more movement
      connectDistance: 300, // longer connections for better coverage
      lineAlpha: 0.15, // increased line visibility
      nodeAlpha: 0.8, // stronger node visibility
      pulseSpeed: 0.3, // balanced animation speed
      backgroundFade: 0.015, // reduced fade for more persistent trails
      maxPoints: 280, // increased total points for better coverage
      maxNeighbors: 8 // more connections for denser network
    };

    function resize(){
      // cap DPR to avoid extremely large canvas sizes on high-DPI devices
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      // Use viewport dimensions since background is now fixed
      width = window.innerWidth;
      height = window.innerHeight;
      
      // Make canvas slightly larger than viewport to ensure edge coverage
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
      // adapt grid to screen size but maintain density for full coverage
      const cols = Math.max(3, Math.round((width/400) * config.cols));
      const rows = Math.max(3, Math.round((height/250) * config.rows));
      const xGap = width / (cols + 1);
      const yGap = height / (rows + 1);
      
      // Helper to create a point with specific vertical bounds
      const createPoint = (x, y) => ({
        x, y,
        ox: x, oy: y,
        vx: (Math.random()-0.5) * 0.15,
        vy: (Math.random()-0.5) * 0.15,
        pulse: Math.random() * Math.PI * 2
      });

      // Top cluster (0-50% of viewport height)
      const topHeight = height * 0.5; // 50vh
      for(let i = 0; i < config.maxPoints / 2; i++) {
        const x = (Math.random() * width * 0.95) + (width * 0.025); // 2.5% padding on sides
        const y = Math.random() * topHeight;
        points.push(createPoint(x, y));
      }

      // Bottom cluster (50-100% of viewport height)
      const bottomStart = height * 0.5; // Starts at 50vh
      for(let i = 0; i < config.maxPoints / 2; i++) {
        const x = (Math.random() * width * 0.95) + (width * 0.025); // 2.5% padding on sides
        const y = bottomStart + (Math.random() * (height - bottomStart));
        points.push(createPoint(x, y));
      }
    }

    function step(ts){
      if(prefsReduced){
        // static subtle background when reduced motion requested
        drawStatic();
        return;
      }

      ctx.clearRect(0,0,width,height);
      // draw semi-transparent overlay to smooth trails (very subtle)
      ctx.fillStyle = `rgba(6,6,6,${config.backgroundFade})`;
      ctx.fillRect(0,0,width,height);

      // move points slightly with jitter. Throttle heavy randomness every other frame to save CPU
      frame++;
      const jitterThisFrame = (frame % 2) === 0;
      for(const p of points){
        if(jitterThisFrame){
          p.vx += (Math.random()-0.5) * 0.12;
          p.vy += (Math.random()-0.5) * 0.12;
        }
        // clamp velocity
        p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
        p.vy = Math.max(-0.5, Math.min(0.5, p.vy));
        p.x += p.vx;
        p.y += p.vy;
        // gently pull back to origin to avoid runaway
        p.x += (p.ox - p.x) * 0.006;
        p.y += (p.oy - p.y) * 0.006;
        p.pulse += config.pulseSpeed * 0.02;
      }

      // draw lines between nearby points but limit neighbors per point to reduce work
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

      // draw nodes with subtle pulse
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

    // responsiveness & visibility
    let resizeTimer = null;
    function scheduleResize(){
      if(resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    }

    // pause when page not visible
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

    // init
    resize();
    if(prefsReduced){
      drawStatic();
    } else {
      animationId = requestAnimationFrame(step);
    }

    // cleanup if needed (not strictly necessary in single page)
    // return function to stop animation
    // window._stopCircuitBg = () => { if(animationId) cancelAnimationFrame(animationId); animationId=null };
  })();
})
