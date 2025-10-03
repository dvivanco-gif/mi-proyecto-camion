/* ============================
   SIMULADOR (grupo 2)
============================ */
const page = document.getElementById('page'),
      slider = document.querySelector('.swiper'),
      inner1 = document.getElementById('inner-1'),
      inner2 = document.getElementById('inner-2'),
      title = document.querySelectorAll('.title');

const innerAnimationActive = {
  duration: 1,
  delay: 0.5,
  ease: Power4.easeOut,
  autoAlpha: 1,
  yPercent: 0,
};
const innerAnimationHidden = {
  duration: 1,
  ease: Power4.easeOut,
  autoAlpha: 0,
  yPercent: -20,
};

/* Swiper vertical */
const swiper = new Swiper(slider, {
  direction: 'vertical',
  speed: 1500,
  grabCursor: true,
  touchRatio: 2,
  threshold: 1,
  mousewheel: { forceToAxis: true },
  keyboard: { enabled: true },
  on: {
    init: () => {
      gsap.to(slider, { duration: 1, ease: Power4.easeOut, autoAlpha: 1 });
      gsap.to(title, innerAnimationActive);

      /* loop infinito de texto */
      title.forEach(function (e, i) {
        let row_width = e.getBoundingClientRect().width;
        let row_item_width = e.children[0].getBoundingClientRect().width;
        let offset = ((2 * row_item_width) / row_width) * 100 * -1;
        let duration = 20 * (i + 1);

        gsap.set(e, { xPercent: 0 });
        gsap.to(e, { duration: duration, ease: "none", xPercent: offset, repeat: -1 });
      });
    }
  },
});

/* Animaciones al cambiar slide */
swiper.on('slideChange', function () {
  // Animación del título y slide 1
  if (swiper.activeIndex === 0) {
    gsap.to(inner1, innerAnimationActive);
    gsap.to(title, innerAnimationActive);
  } else {
    gsap.to(inner1, innerAnimationHidden);
    gsap.to(title, innerAnimationHidden);
  }

  // Animación del cuadro rojo en slide 2
  if (swiper.activeIndex === 1) {
    gsap.to(inner2, innerAnimationActive);
  } else {
    gsap.to(inner2, innerAnimationHidden);
  }

  // 🚚 Animación del camión en slide 3
  const camion = document.querySelector('.img-camion');
  if (swiper.activeIndex === 2) {
    camion.style.animationPlayState = 'running';   // ▶️ arranca
  } else {
    camion.style.animation = 'none';               // 🔄 resetear
    void camion.offsetWidth;                       // ⚡ hack para reiniciar
    camion.style.animation = 'entrarCamion 3s ease-out forwards';
    camion.style.animationPlayState = 'paused';    // ⏸ vuelve a quedar pausado
  }
});


/* ============================
   CAMIÓN + HUMO (grupo 1)
============================ */
let smokeGenerator = function (context, color) {
  color = color || [120, 120, 120]; // gris por defecto
  let polyfillAnimFrame = window.requestAnimationFrame;
  let lastframe;
  let currentparticles = [];
  let pendingparticles = [];
  let buffer = document.createElement('canvas'), bctx = buffer.getContext('2d');

  // 🔧 más resolución en el "pincel"
  buffer.width = 100;
  buffer.height = 100;

  // 🎨 gradiente radial para suavizar el humo
  let grad = bctx.createRadialGradient(
    buffer.width / 2, buffer.height / 2, 0,
    buffer.width / 2, buffer.height / 2, buffer.width / 2
  );
  grad.addColorStop(0, "rgba(100,100,100,0.8)"); // centro más oscuro
  grad.addColorStop(1, "rgba(100,100,100,0)");   // bordes transparentes

  bctx.fillStyle = grad;
  bctx.fillRect(0, 0, buffer.width, buffer.height);

  // tamaño en pantalla de cada partícula
  let imagewidth = buffer.width;
  let imageheight = buffer.height;

  // ✅ activar suavizado global
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  function particle(x, y, l) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.vx = (Math.random() * 8 - 4) / 100;
    this.startvy = -(Math.random() * 30 + 10) / 100;
    this.vy = this.startvy;
    this.scale = Math.random() * 0.5;
    this.lifetime = Math.random() * 1 + l / 2;
    this.finalscale = 3 + this.scale + Math.random();
    this.update = function (deltatime) {
      this.x += this.vx * deltatime;
      this.y += this.vy * deltatime;
      let frac = Math.pow((this.age) / this.lifetime, 0.5);
      this.vy = (1 - frac) * this.startvy;
      this.age += deltatime;
      this.scale = frac * this.finalscale;
    }
    this.draw = function () {
      context.globalAlpha = (1 - Math.abs(1 - 2 * (this.age) / this.lifetime)) / 4;
      let off = this.scale * imagewidth / 2;
      context.drawImage(buffer, this.x - off, this.y - off, this.scale * imagewidth, this.scale * imageheight);
    }
  }

  function addparticles(x, y, n, lifetime) {
    lifetime = lifetime || 4000;
    n = n || 10;
    for (let i = 0; i < n; i++) {
      pendingparticles.push(new particle(x, y, lifetime));
    }
  }

  function updateanddrawparticles(deltatime) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    deltatime = deltatime || 90;
    let newparticles = [];
    currentparticles = currentparticles.concat(pendingparticles);
    pendingparticles = [];
    currentparticles.forEach(function (p) {
      p.update(deltatime);
      if (p.age < p.lifetime) {
        p.draw();
        newparticles.push(p);
      }
    });
    currentparticles = newparticles;
  }

  function frame(time) {
    if (running) {
      let deltat = time - lastframe;
      lastframe = time;
      updateanddrawparticles(deltat);
      polyfillAnimFrame(frame);
    }
  }

  let running = false;
  function start() {
    running = true;
    polyfillAnimFrame(function (time) {
      lastframe = time;
      polyfillAnimFrame(frame);
    });
  }

  return { start: start, addsmoke: addparticles }
};

/* Elementos del camión */
const car_block = document.getElementById('car-block');
const whell1    = document.getElementById('wheel1');
const whell2    = document.getElementById('wheel2');
const whell3    = document.getElementById('wheel3');
const whell4    = document.getElementById('wheel4');
const whell5    = document.getElementById('wheel5');
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');

canvas.width = 2000;
canvas.height = 1000;
let smoke = smokeGenerator(ctx, [101, 101, 101]);
smoke.start();

// humo constante
setInterval(function () {
  smoke.addsmoke(840, 550, .9)
}, 100);

// 🚚 Animación automática del camión + ruedas
gsap.to(car_block, {
  x: window.innerWidth + 500, // avanza hacia la derecha
  duration: 9,               // tiempo del recorrido
  repeat: -1,                 // infinito
  ease: "linear",
  onUpdate: function() {
    // rotar las llantas según avance
    let progress = this.progress() * 3600; // multiplica para dar efecto rápido
    [whell1, whell2, whell3, whell4, whell5].forEach(w => {
      w.style.transform = "rotate(" + progress + "deg)";
    });
  }
});
