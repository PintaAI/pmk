import type { SVGProps } from "react";

export function PempekLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      {...props}
    >
      <rect width="512" height="512" rx={96} fill="url(#pmk-bg)" />
      <g transform="translate(256,256)">
        <ellipse
          cx={0}
          cy={0}
          rx={110}
          ry={80}
          fill="url(#pmk-body)"
          transform="rotate(-15)"
        />
        <ellipse
          cx={-30}
          cy={-20}
          rx={40}
          ry={25}
          fill="#450a0a"
          opacity={0.7}
          transform="rotate(-15)"
        />
        <ellipse
          cx={20}
          cy={-30}
          rx={30}
          ry={12}
          fill="#fde68a"
          opacity={0.3}
          transform="rotate(-15)"
        />
        <text
          x={0}
          y={15}
          fontFamily="system-ui,-apple-system,sans-serif"
          fontSize={140}
          fontWeight={700}
          fill="#f8fafc"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          P
        </text>
      </g>
      <defs>
        <linearGradient id="pmk-bg" x1={0} y1={0} x2={1} y2={1}>
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="pmk-body" x1={0} y1={0} x2={0} y2={1}>
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
