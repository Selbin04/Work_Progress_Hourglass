import { useEffect, useRef, useState } from "react";
import "./Hourglass.css";

const CX = 110;
const TOP_Y = 58;
const NECK_TOP = 196;
const NECK_BOT = 216;
const BOT_Y = 354;
const MAX_HALF = 62;
const MIN_HALF = 4.5;

function topSandPath(progress) {
  const p = Math.min(1, Math.max(0, progress));
  if (p >= 0.995) return "";
  const t = p;
  const y = TOP_Y + t * (NECK_TOP - TOP_Y);
  const half = MAX_HALF * (1 - t) + MIN_HALF * t;
  return `M ${CX - half} ${y} L ${CX + half} ${y} L ${CX + MIN_HALF} ${NECK_TOP} L ${CX - MIN_HALF} ${NECK_TOP} Z`;
}

function bottomSandPath(progress) {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0.008) return "";
  const peakY = BOT_Y - p * (BOT_Y - NECK_BOT);
  const baseHalf = MAX_HALF * Math.min(1, 0.18 + p * 0.82);
  return `M ${CX} ${peakY} L ${CX + baseHalf} ${BOT_Y} L ${CX - baseHalf} ${BOT_Y} Z`;
}

function spawnGrain() {
  return {
    id: Math.random().toString(36).slice(2),
    x: CX + (Math.random() - 0.5) * 6,
    y: NECK_TOP - 2,
    vy: 1.4 + Math.random() * 0.8,
    r: 1.1 + Math.random() * 1.1,
  };
}

export default function Hourglass({ progress, pouring, finished }) {
  const [grains, setGrains] = useState([]);
  const grainsRef = useRef([]);
  const pouringRef = useRef(pouring);
  const progressRef = useRef(progress);

  pouringRef.current = pouring;
  progressRef.current = progress;

  useEffect(() => {
    let raf;
    let acc = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(32, now - last);
      last = now;
      let next = grainsRef.current;

      if (pouringRef.current && progressRef.current < 1) {
        acc += dt;
        while (acc > 42) {
          acc -= 42;
          next = [...next, spawnGrain(), spawnGrain()];
        }
      } else {
        acc = 0;
      }

      next = next
        .map((g) => ({ ...g, y: g.y + g.vy * (dt / 16), vy: g.vy + 0.08 }))
        .filter((g) => g.y < BOT_Y - 8);

      if (next.length > 40) next = next.slice(next.length - 40);

      grainsRef.current = next;
      setGrains(next);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const topPath = topSandPath(progress);
  const botPath = bottomSandPath(progress);
  const remaining = Math.max(0, 1 - progress);

  return (
    <svg
      className={`hourglass-svg ${finished ? "is-done" : ""} ${pouring ? "is-pouring" : ""}`}
      viewBox="0 0 220 420"
      role="img"
      aria-label="Hourglass"
    >
      <defs>
        <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d48a" />
          <stop offset="45%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#7a5a12" />
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a2e18" />
          <stop offset="50%" stopColor="#7a4a24" />
          <stop offset="100%" stopColor="#3d2414" />
        </linearGradient>
        <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3d089" />
          <stop offset="55%" stopColor="#d4a017" />
          <stop offset="100%" stopColor="#a56b0a" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(210,230,245,0.22)" />
          <stop offset="50%" stopColor="rgba(160,190,210,0.06)" />
          <stop offset="100%" stopColor="rgba(200,220,235,0.16)" />
        </linearGradient>
        <clipPath id="top-bulb">
          <path d="M48 52 L172 52 L114 196 L106 196 Z" />
        </clipPath>
        <clipPath id="bot-bulb">
          <path d="M106 216 L114 216 L172 360 L48 360 Z" />
        </clipPath>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      <rect x="28" y="18" width="164" height="26" rx="5" fill="url(#wood)" filter="url(#soft)" />
      <rect x="28" y="18" width="164" height="10" rx="5" fill="url(#brass)" opacity="0.85" />
      <rect x="36" y="40" width="10" height="340" rx="3" fill="url(#wood)" />
      <rect x="174" y="40" width="10" height="340" rx="3" fill="url(#wood)" />
      <rect x="28" y="376" width="164" height="26" rx="5" fill="url(#wood)" />
      <rect x="28" y="388" width="164" height="14" rx="5" fill="url(#brass)" opacity="0.7" />

      <path
        d="M50 50 L170 50 L116 200 L104 200 Z"
        fill="url(#glass)"
        stroke="#cbb07a"
        strokeWidth="2.2"
      />
      <path
        d="M104 212 L116 212 L170 362 L50 362 Z"
        fill="url(#glass)"
        stroke="#cbb07a"
        strokeWidth="2.2"
      />

      <g clipPath="url(#top-bulb)">
        {topPath && <path d={topPath} fill="url(#sand)" />}
        {remaining > 0.02 && (
          <ellipse
            cx={CX}
            cy={TOP_Y + progress * (NECK_TOP - TOP_Y) + 3}
            rx={MAX_HALF * remaining + MIN_HALF}
            ry={5 + remaining * 4}
            fill="#e8c56a"
            opacity="0.55"
          />
        )}
      </g>

      <g clipPath="url(#bot-bulb)">
        {botPath && <path d={botPath} fill="url(#sand)" />}
      </g>

      {pouring && progress < 1 && (
        <rect
          className="sand-stream"
          x={CX - 2.2}
          y={NECK_TOP - 4}
          width="4.4"
          height={NECK_BOT - NECK_TOP + 18}
          rx="2"
          fill="#e0b84a"
        />
      )}

      {grains.map((g) => (
        <circle key={g.id} cx={g.x} cy={g.y} r={g.r} fill="#e8c56a" opacity="0.95" />
      ))}

      <path
        d="M58 58 C70 90, 88 140, 104 196"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M62 330 C78 300, 92 250, 106 218"
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <rect x="96" y="198" width="28" height="16" rx="3" fill="url(#brass)" />
      <rect x="102" y="201" width="16" height="10" rx="2" fill="#3a2a10" opacity="0.5" />

      {finished && (
        <g className="done-stamp">
          <rect x="48" y="188" width="124" height="36" rx="4" fill="rgba(28, 58, 24, 0.86)" />
          <text
            x="110"
            y="212"
            textAnchor="middle"
            fill="#d7e7c8"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="16"
            fontWeight="600"
            letterSpacing="2"
          >
            DONE
          </text>
        </g>
      )}
    </svg>
  );
}
