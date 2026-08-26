type Props = {
  values: number[];
  className?: string;
  stroke?: string;
};

export default function Sparkline({
  values,
  className,
  stroke = "hsl(var(--primary))",
}: Props) {
  if (values.length < 2) return null;

  const width = 300;
  const height = 40;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");
  const fill = `${line} L${width},${height} L0,${height} Z`;
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: "100%", height: 40, display: "block" }}
    >
      <path d={fill} fill={stroke} opacity={0.15} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={3} fill={stroke} />
    </svg>
  );
}
