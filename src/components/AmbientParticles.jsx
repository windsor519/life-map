import { useEffect, useRef } from "react";

const seasonalPalettes = {
  spring: {
    symbols: ["petal", "leaf", "spark"],
    colors: ["rgba(244, 114, 182, 0.82)", "rgba(134, 239, 172, 0.74)", "rgba(255, 255, 255, 0.7)"]
  },
  summer: {
    symbols: ["firefly", "spark", "leaf"],
    colors: ["rgba(253, 224, 71, 0.8)", "rgba(125, 211, 252, 0.72)", "rgba(255, 255, 255, 0.68)"]
  },
  fall: {
    symbols: ["leaf", "leaf", "spark"],
    colors: ["rgba(251, 146, 60, 0.82)", "rgba(245, 158, 11, 0.74)", "rgba(254, 215, 170, 0.68)"]
  },
  winter: {
    symbols: ["snow", "snow", "spark"],
    colors: ["rgba(219, 234, 254, 0.86)", "rgba(186, 230, 253, 0.74)", "rgba(255, 255, 255, 0.7)"]
  }
};

const getSeason = () => document.body?.dataset?.season ?? "spring";

const createParticle = (width, height, season, index = 0) => {
  const palette = seasonalPalettes[season] ?? seasonalPalettes.spring;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    drift: -0.35 + Math.random() * 0.7,
    speed: 0.22 + Math.random() * 0.68,
    size: 2.5 + Math.random() * 6,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.008 + Math.random() * 0.018,
    spin: Math.random() * Math.PI * 2,
    spinSpeed: -0.02 + Math.random() * 0.04,
    color: palette.colors[index % palette.colors.length],
    kind: palette.symbols[index % palette.symbols.length]
  };
};

const drawParticle = (ctx, particle) => {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.spin);
  ctx.globalAlpha = 0.78;
  ctx.fillStyle = particle.color;
  ctx.strokeStyle = particle.color;
  ctx.lineWidth = Math.max(1, particle.size * 0.18);

  if (particle.kind === "leaf" || particle.kind === "petal") {
    ctx.beginPath();
    ctx.ellipse(0, 0, particle.size * 0.55, particle.size * 1.05, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -particle.size * 0.72);
    ctx.lineTo(0, particle.size * 0.72);
    ctx.stroke();
  } else if (particle.kind === "snow") {
    ctx.beginPath();
    ctx.arc(0, 0, particle.size * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.38;
    ctx.beginPath();
    ctx.moveTo(-particle.size * 0.8, 0);
    ctx.lineTo(particle.size * 0.8, 0);
    ctx.moveTo(0, -particle.size * 0.8);
    ctx.lineTo(0, particle.size * 0.8);
    ctx.stroke();
  } else {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 1.8);
    glow.addColorStop(0, particle.color);
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export default function AmbientParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      return undefined;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let activeSeason = getSeason();
    let particles = [];

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles = Array.from({ length: Math.min(72, Math.max(34, Math.round(width / 22))) }, (_, index) => createParticle(width, height, activeSeason, index));
    };

    const animate = () => {
      const season = getSeason();
      if (season !== activeSeason) {
        activeSeason = season;
        particles = particles.map((_, index) => createParticle(width, height, activeSeason, index));
      }

      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        particle.wobble += particle.wobbleSpeed;
        particle.spin += particle.spinSpeed;
        particle.x += particle.drift + Math.sin(particle.wobble) * 0.28;
        particle.y += particle.speed;

        if (particle.y > height + 24 || particle.x < -28 || particle.x > width + 28) {
          particles[index] = { ...createParticle(width, height, activeSeason, index), y: -20, x: Math.random() * width };
          return;
        }

        drawParticle(ctx, particle);
      });

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas className="ambient-particles" ref={canvasRef} aria-hidden="true" />;
}
