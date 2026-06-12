import { useEffect, useMemo, useRef, useState } from "react";
import { getSeasonAnimation } from "../seasonAnimations/index.js";

const winterPalette = {
  skyTop: "#1a2634",
  skyBot: "#3b4d61",
  ground: "#e2e8f0",
  grass: "#cbd5e1"
};

const clampProgress = (value) => Math.max(0, Math.min(1, value));
const randomInRange = ([min, max]) => Math.random() * (max - min) + min;
const blendRgb = (from, to, progress) => from.map((channel, index) => Math.round(channel + (to[index] - channel) * progress));
const rgba = (rgb, alpha) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
const hexToRgb = (hex) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
const blendColors = (from, to, progress) => rgba(blendRgb(hexToRgb(from), hexToRgb(to), progress), 1);

function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 3 + 1,
    speedY: Math.random() * 1.5 + 0.8,
    speedX: Math.random() * 1 - 0.5,
    angle: Math.random() * Math.PI * 2
  };
}

function createFlora(animation, width, height) {
  return Array.from({ length: animation.flora.count }, () => ({
    x: Math.random() * width,
    y: height - (Math.random() * 62 + 24),
    maxHeight: randomInRange(animation.flora.maxHeight),
    currentHeight: 0,
    petalColor: animation.flora.petals[Math.floor(Math.random() * animation.flora.petals.length)],
    bloomScale: 0,
    delay: Math.random() * 0.42
  }));
}

function drawParticle(ctx, particle, particleStyle, alpha) {
  ctx.beginPath();
  ctx.fillStyle = rgba(particleStyle.color, alpha);

  if (particleStyle.shape === "petal") {
    ctx.ellipse(particle.x, particle.y, particle.radius * 1.7, particle.radius * 0.85, particle.angle, 0, Math.PI * 2);
  } else if (particleStyle.shape === "leaf") {
    ctx.ellipse(particle.x, particle.y, particle.radius * 2.2, particle.radius, particle.angle, 0, Math.PI * 2);
    ctx.moveTo(particle.x - particle.radius, particle.y);
    ctx.lineTo(particle.x + particle.radius, particle.y);
    ctx.strokeStyle = rgba([120, 53, 15], alpha * 0.45);
    ctx.stroke();
  } else if (particleStyle.shape === "firefly") {
    const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 5);
    glow.addColorStop(0, rgba(particleStyle.color, alpha));
    glow.addColorStop(1, rgba(particleStyle.color, 0));
    ctx.fillStyle = glow;
    ctx.arc(particle.x, particle.y, particle.radius * 5, 0, Math.PI * 2);
  } else {
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  }

  ctx.fill();
}

function renderSeasonScene(ctx, canvas, animation, sourcePalette, progress, particles, flora, motionScale = 1, particleAlphaScale = 1) {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, blendColors(sourcePalette.skyTop, animation.palette.skyTop, progress));
  skyGradient.addColorStop(1, blendColors(sourcePalette.skyBot, animation.palette.skyBot, progress));
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = blendColors(sourcePalette.ground, animation.palette.ground, progress);
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height + 100, canvas.width * 0.82, 250, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = blendColors(sourcePalette.grass, animation.palette.grass, progress);
  ctx.fillRect(0, canvas.height - 26, canvas.width, 26);

  drawFlora(ctx, flora, animation, progress);

  particles.forEach((particle) => {
    particle.y += (particle.speedY + progress * 0.6) * motionScale;
    particle.angle += (0.025 + progress * 0.02) * motionScale;
    particle.x += (particle.speedX + Math.sin(particle.angle) * (progress * 0.7)) * motionScale;

    if (particle.y > canvas.height + 12) {
      particle.y = -12;
      particle.x = Math.random() * canvas.width;
    }
    if (particle.x > canvas.width + 12) particle.x = -12;
    if (particle.x < -12) particle.x = canvas.width + 12;

    if (progress < 0.58) {
      drawParticle(ctx, particle, animation.particles.from, ((0.58 - progress) / 0.58) * particleAlphaScale);
    }
    if (progress > 0.25) {
      drawParticle(ctx, particle, animation.particles.to, clampProgress((progress - 0.25) / 0.75) * particleAlphaScale);
    }
  });
}

function drawFlora(ctx, flora, animation, progress) {
  flora.forEach((plant) => {
    if (progress <= plant.delay) {
      plant.currentHeight = 0;
      plant.bloomScale = 0;
      return;
    }

    const growthRatio = clampProgress((progress - plant.delay) / (1 - plant.delay));
    plant.currentHeight = plant.maxHeight * clampProgress(growthRatio * 1.55);
    plant.bloomScale = plant.currentHeight > plant.maxHeight * 0.5 ? clampProgress(plant.currentHeight / plant.maxHeight) : 0;

    if (plant.currentHeight <= 0) {
      return;
    }

    ctx.strokeStyle = animation.flora.stem;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(plant.x, plant.y);
    ctx.quadraticCurveTo(plant.x - 6, plant.y - plant.currentHeight / 2, plant.x, plant.y - plant.currentHeight);
    ctx.stroke();

    if (plant.bloomScale <= 0) {
      return;
    }

    const topY = plant.y - plant.currentHeight;
    const size = 6.5 * plant.bloomScale;
    ctx.fillStyle = plant.petalColor;
    ctx.beginPath();
    ctx.arc(plant.x - size / 2, topY, size, 0, Math.PI * 2);
    ctx.arc(plant.x + size / 2, topY, size, 0, Math.PI * 2);
    ctx.arc(plant.x, topY - size / 2, size, 0, Math.PI * 2);
    ctx.arc(plant.x, topY + size / 2, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = animation.flora.core;
    ctx.beginPath();
    ctx.arc(plant.x, topY, size * 0.42, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function SeasonBackground({ seasonId }) {
  const canvasRef = useRef(null);
  const animation = useMemo(() => getSeasonAnimation(seasonId), [seasonId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      return undefined;
    }

    let frameId;
    let startedAt;
    let particles = [];
    let flora = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 96 }, () => createParticle(canvas.width, canvas.height));
      flora = createFlora(animation, canvas.width, canvas.height);
    };

    const render = (timestamp) => {
      startedAt ??= timestamp;
      const calmProgress = clampProgress((timestamp - startedAt - 10000) / 6000);
      const easedCalm = 1 - Math.pow(1 - calmProgress, 3);
      const motionScale = 1 - easedCalm * 0.72;
      const particleAlphaScale = 1 - easedCalm * 0.46;

      renderSeasonScene(ctx, canvas, animation, animation.palette, 1, particles, flora, motionScale, particleAlphaScale);
      frameId = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [animation]);

  return (
    <div className="season-background" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function SeasonTransition({ previousSeasonId, targetSeasonId, wisdom, onComplete }) {
  const canvasRef = useRef(null);
  const [animationDone, setAnimationDone] = useState(false);
  const animation = useMemo(() => getSeasonAnimation(targetSeasonId), [targetSeasonId]);
  const previousAnimation = useMemo(() => getSeasonAnimation(previousSeasonId), [previousSeasonId]);

  useEffect(() => {
    setAnimationDone(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      return undefined;
    }

    let frameId;
    let startedAt;
    let particles = [];
    let flora = [];
    const duration = 4600;
    const sourcePalette = previousSeasonId ? previousAnimation.palette : winterPalette;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 120 }, () => createParticle(canvas.width, canvas.height));
      flora = createFlora(animation, canvas.width, canvas.height);
    };

    const render = (timestamp) => {
      startedAt ??= timestamp;
      const rawProgress = clampProgress((timestamp - startedAt) / duration);
      const progress = 1 - Math.pow(1 - rawProgress, 3);

      renderSeasonScene(ctx, canvas, animation, sourcePalette, progress, particles, flora);

      if (rawProgress < 1) {
        frameId = window.requestAnimationFrame(render);
      } else {
        setAnimationDone(true);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [animation, previousAnimation.palette, previousSeasonId, targetSeasonId]);

  return (
    <div className="season-transition" role="status" aria-live="polite">
      <canvas ref={canvasRef} />
      <div className="season-transition-copy">
        <div className="season-transition-icons" aria-hidden="true">
          {animation.accents.map((accent) => <span key={accent}>{accent}</span>)}
        </div>
        <p className="eyebrow">Season changed</p>
        <h2>{animation.headline}</h2>
        <p>{animation.subheadline}</p>
        {wisdom ? (
          <section className="season-transition-wisdom" aria-label="Family wisdom for the next season">
            <div className="season-transition-wisdom-header">
              <span aria-hidden="true">{wisdom.statIcon}</span>
              <div>
                <p className="eyebrow">{wisdom.kicker}</p>
                <h3>{wisdom.title}</h3>
              </div>
            </div>
            <p className="season-transition-wisdom-context">{wisdom.context}</p>
            <p>{wisdom.summary}</p>
            <p>{wisdom.ageSummary}</p>
            <div className="season-transition-wisdom-grid">
              <span><strong>{wisdom.ageRangeLabel}</strong><small>{wisdom.ageTitle}</small></span>
              <span><strong>{wisdom.statValue}</strong><small>{wisdom.statLabel} · {wisdom.statDeltaLabel}</small></span>
            </div>
            <div className="season-transition-wisdom-note">
              <span>Expect</span>
              <strong>{wisdom.expect}</strong>
            </div>
            <small>{wisdom.focus}</small>
          </section>
        ) : null}
        <p className="season-transition-next-copy">Read the family wisdom, then press Next to continue.</p>
        <button className="secondary" type="button" onClick={onComplete}>{animationDone ? "Next" : "Skip to wisdom / Next"}</button>
      </div>
    </div>
  );
}
