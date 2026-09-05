// Original vector architecture remains visible while WebGL loads and in reading mode.
export default function CityBackdrop() {
  return (
    <svg
      className="mission-backdrop"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mission-sky" x2="0" y2="1">
          <stop stopColor="#102742" />
          <stop offset=".56" stopColor="#6288ac" />
          <stop offset="1" stopColor="#b0c9d8" />
        </linearGradient>
        <linearGradient id="mission-facade">
          <stop stopColor="#6b91b1" />
          <stop offset="1" stopColor="#244860" />
        </linearGradient>
        <linearGradient id="mission-water" x2="0" y2="1">
          <stop stopColor="#6a90b0" />
          <stop offset="1" stopColor="#142e46" />
        </linearGradient>
        <pattern
          id="mission-windows"
          width="12"
          height="13"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0H12M0 0V13"
            fill="none"
            stroke="#c3d7e7"
            strokeWidth=".7"
            opacity=".5"
          />
        </pattern>
      </defs>
      <path fill="url(#mission-sky)" d="M0 0H1600V1000H0z" />
      <path
        fill="#7895ae"
        opacity=".4"
        d="M0 590L170 407 250 472 355 325 440 457 590 380 710 510 860 373 955 470 1120 325 1220 430 1380 350 1600 500V900H0z"
      />
      <path fill="url(#mission-water)" d="M0 680H1600V1000H0z" />
      <ellipse cx="1050" cy="828" rx="535" ry="115" fill="#54778e" />
      <ellipse cx="1050" cy="810" rx="535" ry="115" fill="#a5bdcc" />
      {[
        [680, 540, 84, 230],
        [803, 610, 118, 185],
        [943, 305, 90, 455],
        [1045, 387, 69, 356],
        [1150, 554, 112, 211],
        [1290, 620, 80, 163],
        [1430, 599, 65, 151],
      ].map(([x, y, w, h]) => (
        <g key={x}>
          <path d={`M${x} ${y}l${w} -22 35 18 -${w} 22z`} fill="#d0dce2" />
          <path d={`M${x} ${y}h${w}v${h}h-${w}z`} fill="url(#mission-facade)" />
          <path
            d={`M${x} ${y}h${w}v${h}h-${w}z`}
            fill="url(#mission-windows)"
          />
          <path d={`M${x + w} ${y}l35 -4v${h}l-35 4z`} fill="#23465f" />
          <path d={`M${x} ${y + 4}h${w}`} stroke="#78c8ff" strokeWidth="2" />
        </g>
      ))}
      <path
        d="M600 818Q830 724 1000 800T1530 817"
        fill="none"
        stroke="#d4e0e6"
        strokeWidth="10"
      />
      <path
        d="M600 812Q830 718 1000 794T1530 811"
        fill="none"
        stroke="#86c4ef"
        strokeWidth="2"
      />
      {Array.from({ length: 16 }, (_, i) => (
        <g
          key={i}
          transform={`translate(${630 + i * 55},${846 + Math.sin(i) * 24})`}
        >
          <path d="M0 0V-16" stroke="#486963" strokeWidth="3" />
          <ellipse cy="-23" rx="11" ry="15" fill="#587f78" />
        </g>
      ))}
    </svg>
  );
}
