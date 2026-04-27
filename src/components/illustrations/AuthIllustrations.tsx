import type { FC } from 'react';

interface TwinkleProps {
  cx: number;
  cy: number;
  r?: number;
  color?: string;
  delay?: number;
}

const Twinkle: FC<TwinkleProps> = ({ cx, cy, r = 1, color = 'var(--wake-color)', delay = 0 }) => (
  <circle cx={cx} cy={cy} r={r} fill={color}>
    <animate
      attributeName="opacity"
      values="0.3;1;0.3"
      dur="2.5s"
      begin={`${delay}s`}
      repeatCount="indefinite"
    />
  </circle>
);

interface SoftGlowProps {
  cx: number;
  cy: number;
  r: number;
  color: string;
}

const SoftGlow: FC<SoftGlowProps> = ({ cx, cy, r, color }) => (
  <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.18" filter="blur(4px)" />
);

const SVG_CLASS = 'w-full h-full block';

export const LoginIllustration: FC = () => (
  <svg viewBox="0 0 200 140" fill="none" className={SVG_CLASS}>
    <Twinkle cx={35} cy={40} r={1.2} />
    <Twinkle cx={170} cy={35} r={1} delay={0.7} />
    <Twinkle cx={155} cy={70} r={0.8} delay={1.2} />
    <SoftGlow cx={100} cy={80} r={50} color="var(--night-color)" />
    <circle cx="50" cy="35" r="14" fill="var(--wake-color)" opacity="0.9" />
    <circle cx="56" cy="32" r="11" fill="var(--bg-deep)" />
    <path d="M60 115 V80 L100 55 L140 80 V115 Z" fill="var(--nap-color)" opacity="0.85" />
    <path
      d="M55 80 L100 50 L145 80"
      stroke="var(--night-color)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect x="88" y="86" width="24" height="20" rx="3" fill="var(--wake-color)">
      <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
    </rect>
    <ellipse cx="100" cy="120" rx="80" ry="4" fill="var(--night-color)" opacity="0.2" />
  </svg>
);

export const EntryIllustration: FC = () => (
  <svg viewBox="0 0 200 140" fill="none" className={SVG_CLASS}>
    <Twinkle cx={25} cy={30} r={1.4} />
    <Twinkle cx={175} cy={40} r={1.2} delay={0.5} />
    <Twinkle cx={35} cy={100} r={1} delay={1} />
    <Twinkle cx={170} cy={105} r={1} delay={1.6} />
    <g>
      <circle cx="100" cy="80" r="42" fill="var(--wake-color)" opacity="0.85" />
      <circle cx="118" cy="72" r="38" fill="var(--bg-deep)" />
    </g>
    <ellipse cx="84" cy="70" rx="14" ry="8" fill="var(--nap-color)" />
    <circle cx="78" cy="62" r="7" fill="var(--nap-color)" />
    <text
      x="60"
      y="40"
      fontSize="11"
      fontFamily="var(--font-display)"
      fontWeight="700"
      fill="var(--night-color)"
      opacity="0.7"
    >
      z
      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" />
    </text>
    <text
      x="50"
      y="55"
      fontSize="8"
      fontFamily="var(--font-display)"
      fontWeight="700"
      fill="var(--night-color)"
      opacity="0.5"
    >
      z
    </text>
  </svg>
);

export const ForgotPasswordIllustration: FC = () => (
  <svg viewBox="0 0 200 140" fill="none" className={SVG_CLASS}>
    <SoftGlow cx={100} cy={70} r={50} color="var(--wake-color)" />
    <rect x="55" y="50" width="90" height="55" rx="6" fill="var(--nap-color)" opacity="0.9" />
    <path
      d="M55 56 L100 85 L145 56"
      stroke="var(--bg-deep)"
      strokeWidth="2"
      fill="none"
      strokeLinejoin="round"
    />
    <circle cx="100" cy="92" r="8" fill="var(--wake-color)">
      <animate attributeName="r" values="7.5;8.5;7.5" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <Twinkle cx={35} cy={40} r={1} />
    <Twinkle cx={170} cy={110} r={1} delay={0.6} />
  </svg>
);

export const Step1Illustration: FC = () => (
  <svg viewBox="0 0 200 140" fill="none" className={SVG_CLASS}>
    <SoftGlow cx={100} cy={75} r={50} color="var(--night-color)" />
    <Twinkle cx={30} cy={35} r={1.2} />
    <Twinkle cx={170} cy={40} r={1} delay={0.7} />
    <circle cx="160" cy="40" r="14" fill="var(--wake-color)" opacity="0.85" />
    <circle cx="78" cy="65" r="12" fill="var(--nap-color)" />
    <path d="M62 78 q16 -6 32 0 v35 h-32 z" fill="var(--nap-color)" opacity="0.9" />
    <ellipse cx="100" cy="86" rx="11" ry="8" fill="var(--night-color)" opacity="0.85" />
    <circle cx="106" cy="80" r="5" fill="var(--night-color)" />
  </svg>
);

export const Step2Illustration: FC = () => (
  <svg viewBox="0 0 200 140" fill="none" className={SVG_CLASS}>
    <path
      d="M70 50 h20 q5 -8 20 -8 t20 8 h20 v18 l-12 6 v40 q0 8 -8 8 h-40 q-8 0 -8 -8 v-40 l-12 -6 z"
      stroke="var(--nap-color)"
      strokeWidth="2.2"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="100" cy="78" r="3" fill="var(--wake-color)" />
    <circle cx="100" cy="92" r="3" fill="var(--wake-color)" />
    <path d="M30 30 Q100 50 170 30" stroke="var(--night-color)" strokeWidth="1.2" fill="none" />
    <path d="M55 33 l5 8 l5 -8 z" fill="var(--wake-color)" opacity="0.9" />
    <path d="M95 38 l5 8 l5 -8 z" fill="var(--nap-color)" opacity="0.9" />
    <path d="M135 33 l5 8 l5 -8 z" fill="var(--night-color)" opacity="0.85" />
  </svg>
);

export const Step3Illustration: FC = () => (
  <svg viewBox="0 0 200 140" fill="none" className={SVG_CLASS}>
    <Twinkle cx={30} cy={30} r={1} />
    <Twinkle cx={170} cy={35} r={1} delay={0.5} />
    <path d="M70 110 V90 q15 -6 30 0 t30 0 V110 z" fill="var(--nap-color)" />
    <path d="M70 90 q15 -6 30 0 t30 0" stroke="var(--nap-soft)" strokeWidth="1.5" fill="none" />
    <rect x="70" y="78" width="60" height="14" rx="2" fill="var(--wake-color)" opacity="0.9" />
    <rect x="98" y="64" width="4" height="14" fill="var(--night-color)" />
    <ellipse cx="100" cy="62" rx="3" ry="5" fill="var(--wake-color)">
      <animate attributeName="ry" values="5;6;5" dur="1.2s" repeatCount="indefinite" />
    </ellipse>
    <line
      x1="60"
      y1="110"
      x2="140"
      y2="110"
      stroke="var(--nap-soft)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="50" cy="55" r="2" fill="var(--wake-color)" />
    <circle cx="155" cy="60" r="2" fill="var(--night-color)" />
    <rect x="40" y="70" width="3" height="3" fill="var(--nap-color)" transform="rotate(45 41 71)" />
  </svg>
);

export const Step4Illustration: FC = () => (
  <svg viewBox="0 0 200 140" fill="none" className={SVG_CLASS}>
    <SoftGlow cx={100} cy={75} r={45} color="var(--wake-color)" />
    <ellipse cx="100" cy="120" rx="40" ry="6" fill="var(--night-color)" opacity="0.3" />
    <path d="M75 115 q0 -45 25 -45 t25 45 z" fill="var(--nap-color)" />
    <circle cx="100" cy="62" r="13" fill="var(--nap-color)" />
    <ellipse cx="100" cy="92" rx="14" ry="9" fill="var(--wake-color)" opacity="0.92" />
    <circle cx="106" cy="86" r="5" fill="var(--night-color)" />
  </svg>
);

export const Step5Illustration: FC = () => (
  <svg viewBox="0 0 200 140" fill="none" className={SVG_CLASS}>
    <Twinkle cx={30} cy={30} r={1} />
    <Twinkle cx={170} cy={35} r={1} delay={0.7} />
    <ellipse
      cx="100"
      cy="78"
      rx="60"
      ry="22"
      stroke="var(--night-color)"
      strokeWidth="1"
      fill="none"
      opacity="0.5"
      strokeDasharray="3 4"
    />
    <circle cx="48" cy="78" r="12" fill="var(--nap-color)" />
    <circle cx="100" cy="58" r="14" fill="var(--wake-color)" opacity="0.9" />
    <circle cx="152" cy="78" r="12" fill="var(--night-color)" opacity="0.9" />
    <circle cx="100" cy="100" r="8" fill="var(--nap-soft)" />
  </svg>
);

export const Step6Illustration: FC = () => (
  <svg viewBox="0 0 200 140" fill="none" className={SVG_CLASS}>
    <SoftGlow cx={100} cy={80} r={55} color="var(--wake-color)" />
    <path d="M60 35 h45 l15 6 v85 h-60 z" fill="var(--nap-color)" />
    <path d="M105 41 v85" stroke="var(--nap-soft)" strokeWidth="1.5" />
    <path d="M105 41 l15 6 v85 l-15 -6 z" fill="var(--wake-color)" opacity="0.85" />
    <circle cx="100" cy="82" r="2.2" fill="var(--bg-deep)" />
    <circle cx="115" cy="86" r="2.2" fill="var(--bg-deep)" />
  </svg>
);
