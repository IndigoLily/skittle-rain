const sin   = Math.sin,
      cos   = Math.cos,
      abs   = Math.abs,
      sqrt  = Math.sqrt,
      min   = Math.min,
      max   = Math.max,
      PI    = Math.PI,
      TAU   = PI * 2,
      PHI   = (1+sqrt(5))/2,
      RT2   = sqrt(2);

const cnv  = document.getElementById('cnv'),
      c    = cnv.getContext('2d');

let   w    = cnv.width  = innerWidth,
      h    = cnv.height = innerHeight,
      diag = Math.hypot(w, h);

c.translate(w/2, h/2);
c.strokeStyle = '#fff';
c.lineWidth = diag/400;

const wind = new Vector(0, diag/4000);

window.addEventListener('resize', () => {
    const lastDiag = diag;
    w    = cnv.width  = innerWidth;
    h    = cnv.height = innerHeight;
    diag = Math.hypot(w, h);
    for (let i = 0; i < repulsors.length; i++) {
        repulsors[i].radius *= diag/lastDiag;
    }

    c.translate(w/2, h/2);
    c.strokeStyle = '#fff';
    c.lineWidth = diag/400;
    wind.mag = diag/4000;
});

let count = 0;
let degrees = 0;

class Particle {
    constructor() {
        this.pos = new Vector(Math.random()*diag - diag/2, -diag/2);
        this.pos.deg += degrees - 90;
        this.vel = new Vector();
        this.acc = new Vector();

        this.colour = `hsl(${count++ / (Math.random() < 0.5 ? 60 : 70)}, 100%, ${30 + Math.random()*40}%)`;
        this.radius = diag/400;
        this.radius *= Math.random()*2 + 1;
    }

    push(force) {
        this.acc.add(force);
    }

    move() {
        this.push(wind);

        this.vel.add(this.acc);
        this.vel.mult(0.95);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    draw() {
        c.fillStyle = this.colour;
        c.beginPath();
        c.arc(this.pos.x, this.pos.y, this.radius, 0, TAU);
        c.fill();
    }
}

class Repulsor {
    constructor() {
        this.radius = diag/40;
        this.radius *= Math.random() + 1;
        this.pos = new Vector(
            Math.random() * w - w/2,
            Math.random() * h - h/2
        );
        this.vel = new Vector();
        this.acc = new Vector();
    }

    move() {
        function push(amount) {
            return (amount/100)**2;
        }
        const right = this.pos.x + this.radius + c.lineWidth - w/2;
        if (right > 0) {
            this.acc.x -= push(right);
        }
        const left = -this.pos.x + this.radius + c.lineWidth - w/2;
        if (left > 0) {
            this.acc.x += push(left);
        }
        const down = this.pos.y + this.radius + c.lineWidth - h/2;
        if (down > 0) {
            this.acc.y -= push(down);
        }
        const up = -this.pos.y + this.radius + c.lineWidth - h/2;
        if (up > 0) {
            this.acc.y += push(up);
        }
        for (let i = 0; i < repulsors.length; i++) {
            let that = repulsors[i];
            if (this == that) continue;
            const dif = Vector.sub(this.pos, that.pos);
            const apart = (this.radius + that.radius + c.lineWidth*2) - dif.mag;
            if (apart > 0) {
                dif.mag = push(apart);
                this.acc.add(dif);
                that.acc.add(dif.mult(-1));
            }
        }
        this.acc.add(Vector.div(wind, 1000));

        this.acc.add(Vector.rand(0, diag/100000));
        this.vel.add(this.acc);
        this.vel.mult(0.99);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    draw() {
        c.fillStyle = '#000';

        c.beginPath();
        c.arc(this.pos.x, this.pos.y, this.radius, 0, TAU);
        c.fill();
        c.stroke();
    }

    push(part) {
        let force = Vector.sub(part.pos, this.pos);
        force.mag = this.radius**2 / (force.mag)**2 * diag / 1000;
        part.push(force);
    }
}

let particles = [];
let repulsors = [];
for (let i = 0; i < 2 ? true : Math.random() < 1/i; i++) {
    repulsors.push(new Repulsor());
}

let frame = 0;
function draw() {
    c.clearRect(-w/2, -h/2, w, h);

    degrees = 90 + frame / 60;
    wind.deg = degrees;

    while (Math.random() < 0.75) {
        particles.push(new Particle());
    }

    for (let i = 0, parts = particles.length, reps = repulsors.length; i < parts; ++i) {
        for (let j = 0; j < reps; ++j) {
            repulsors[j].push(particles[i]);
        }
        particles[i].move();
        particles[i].draw();
    }

    for (let i = 0; i < repulsors.length; ++i) {
        repulsors[i].move();
        repulsors[i].draw();
    }

    particles = particles.filter(p => p.pos.magSq < diag*diag);

    frame += 1;
    requestAnimationFrame(draw);
}

draw();
