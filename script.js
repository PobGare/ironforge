const $ = (s, sc = document) => sc.querySelector(s),
  $$ = (s, sc = document) => [...sc.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
  coarse = matchMedia("(pointer: coarse)").matches;
if (!reduced) {
  const ob = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          ob.unobserve(e.target);
        }
      }),
    { threshold: 0.1 },
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 45}ms`;
    ob.observe(el);
  });
} else $$(".reveal").forEach((el) => el.classList.add("in"));
const nav = $(".site-nav"),
  menu = $(".menu-btn");
menu?.addEventListener("click", () => {
    const open = nav.classList.toggle("mobile-open");

    menu.textContent = open ? "CLOSE" : "MENU";
    menu.setAttribute("aria-expanded", String(open));
});
nav?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("mobile-open");
    if (menu) menu.textContent = "MENU";
  }),
);
const file = location.pathname.split("/").pop() || "index.html";
$$(".site-nav nav a").forEach((a) =>
  a.classList.toggle("active", a.getAttribute("href") === file),
);
// Seamless home program preview. Preload all images so swaps never flash.
const preview = $("#programPreview"),
  previewImg = preview?.querySelector("img");
$$(".program-row").forEach((row) => {
  if (row.dataset.img) {
    const im = new Image();
    im.src = row.dataset.img;
  }
  row.addEventListener("pointerenter", () => {
    $$(".program-row").forEach((r) => r.classList.remove("active"));
    row.classList.add("active");
    if (!preview || !previewImg || !row.dataset.img) return;
    const next = row.dataset.img;
    if (previewImg.getAttribute("src") === next) return;
    preview.classList.add("swap");
    setTimeout(() => {
      previewImg.src = next;
      previewImg.alt =
        row.querySelector("h3")?.textContent || "Training program";
      const cap = preview.querySelector("figcaption b");
      if (cap)
        cap.textContent = `${row.querySelector("h3")?.textContent.toUpperCase()} / ${row.querySelector(":scope > span")?.textContent}`;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => preview.classList.remove("swap")),
      );
    }, 260);
  });
});
// Clickable cards with nested buttons still behaving normally.
$$("[data-href]").forEach((card) => {
  card.addEventListener("click", (e) => {
    if (e.target.closest("a,button")) return;
    location.href = card.dataset.href;
  });
  card.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !e.target.closest("a,button"))
      location.href = card.dataset.href;
  });
});
// FAQ with smooth height transition handled by CSS grid.
$$(".faq-item button").forEach((btn) =>
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item"),
      open = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  }),
);
$$("form[data-demo]").forEach((form) =>
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = form.querySelector(".form-note");
    if (note) {
      note.textContent =
        "Portfolio preview — no data was submitted.";
      note.style.color = "#d6ff3c";
    }
  }),
);
function bindTilt(el) {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(),
      rx = ((e.clientY - r.top) / r.height - 0.5) * -3,
      ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
    el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  el.addEventListener("pointerleave", () => (el.style.transform = ""));
}
if (!coarse && !reduced) {
  $$("[data-tilt]").forEach(bindTilt);
  $$(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.13}px ${(e.clientY - r.top - r.height / 2) * 0.13}px`;
    });
    el.addEventListener("pointerleave", () => (el.style.translate = ""));
  });
  const c = $(".forge-cursor");
  let x = -50,
    y = -50,
    tx = -50,
    ty = -50;
  addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX - 18;
      ty = e.clientY - 18;
    },
    { passive: true },
  );
  (function loop() {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    c.style.transform = `translate3d(${x}px,${y}px,0)`;
    requestAnimationFrame(loop);
  })();
  $$("a,button,input,select,textarea,[data-tilt],.clickable-card").forEach(
    (el) => {
      el.addEventListener("pointerenter", () => c.classList.add("hot"));
      el.addEventListener("pointerleave", () => c.classList.remove("hot"));
    },
  );
}
// Lightweight cursor particle trail.
(function particles() {
  if (coarse || reduced) return;
  const c = $("#forgeParticles");
  if (!c) return;
  const ctx = c.getContext("2d"),
    ps = [];
  let last = 0;
  function resize() {
    const d = Math.min(devicePixelRatio, 1.35);
    c.width = innerWidth * d;
    c.height = innerHeight * d;
    c.style.width = innerWidth + "px";
    c.style.height = innerHeight + "px";
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  resize();
  addEventListener("resize", resize);
  addEventListener(
    "pointermove",
    (e) => {
      const n = performance.now();
      if (n - last > 24) {
        last = n;
        ps.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          life: 1,
          r: Math.random() * 2 + 1,
        });
      }
    },
    { passive: true },
  );
  function f() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.vy += 0.015;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.022;
      if (p.life <= 0) {
        ps.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life * 0.38;
      ctx.fillStyle = i % 3 ? "#d6ff3c" : "#ff3b1f";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(f);
  }
  f();
})();
// Native WebGL energy field used by every kinetic hero.
(function initEnergy() {
  if (reduced) return;
  $$(".energy-canvas").forEach((c, index) => {
    const g = c.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!g) return;
    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fs = `precision mediump float;uniform vec2 r;uniform vec2 m;uniform float t;float ln(float x){return smoothstep(.035,.0,abs(fract(x)-.5));}void main(){vec2 q=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);vec2 mm=(m/r-.5)*2.;float dist=length(q-mm*.12);float lines=ln((q.x+q.y*.34)*10.+sin(q.y*8.+t*.7)*.15);float pulse=.06/(dist+.11);float ring=smoothstep(.015,.0,abs(length(q+vec2(.14,-.04))-.43-.025*sin(t+atan(q.y,q.x)*4.)));vec3 col=vec3(.01);col+=vec3(.82,1.,.14)*lines*.10;col+=vec3(1.,.08,.025)*ring*.34;col+=vec3(.8,.12,.02)*pulse*.12;gl_FragColor=vec4(col,min(.65,lines*.2+ring*.5+pulse*.18));}`;
    const sh = (type, src) => {
        const s = g.createShader(type);
        g.shaderSource(s, src);
        g.compileShader(s);
        return s;
      },
      p = g.createProgram();
    g.attachShader(p, sh(g.VERTEX_SHADER, vs));
    g.attachShader(p, sh(g.FRAGMENT_SHADER, fs));
    g.linkProgram(p);
    g.useProgram(p);
    const b = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, b);
    g.bufferData(
      g.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      g.STATIC_DRAW,
    );
    const l = g.getAttribLocation(p, "p");
    g.enableVertexAttribArray(l);
    g.vertexAttribPointer(l, 2, g.FLOAT, false, 0, 0);
    const ur = g.getUniformLocation(p, "r"),
      um = g.getUniformLocation(p, "m"),
      ut = g.getUniformLocation(p, "t");
    let mx = innerWidth * (0.58 + index * 0.015),
      my = innerHeight * 0.42;
    addEventListener(
      "pointermove",
      (e) => {
        mx = e.clientX;
        my = innerHeight - e.clientY;
      },
      { passive: true },
    );
    function size() {
      const d = Math.min(devicePixelRatio, 1.25),
        w = Math.max(1, c.clientWidth * d),
        h = Math.max(1, c.clientHeight * d);
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
        g.viewport(0, 0, w, h);
      }
    }
    function draw(n) {
      size();
      g.uniform2f(ur, c.width, c.height);
      g.uniform2f(
        um,
        mx * (c.width / innerWidth),
        my * (c.height / innerHeight),
      );
      g.uniform1f(ut, n * 0.001 + index * 0.6);
      g.drawArrays(g.TRIANGLES, 0, 6);
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  });
})();
