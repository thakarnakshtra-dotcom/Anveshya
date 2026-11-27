import React from "react";

const WIDTH = 300;
const HEIGHT = 170;
const PAD = { left: 40, right: 10, top: 10, bottom: 30 };

// A small line chart.
// lines: [{ points: [[x, y]], label, dashed, color }], marks: [[x, y]].
export default function Chart({ title, lines, marks = [], xLabel, yLabel, xDomain, yDomain, format = (v) => v }) {
  const x = (value) => PAD.left + ((value - xDomain[0]) / (xDomain[1] - xDomain[0])) * (WIDTH - PAD.left - PAD.right);
  const y = (value) =>
    HEIGHT - PAD.bottom - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * (HEIGHT - PAD.top - PAD.bottom);
  const inside = ([px, py]) => px >= xDomain[0] && px <= xDomain[1] && py >= yDomain[0] && py <= yDomain[1];
  const colors = ["var(--anv-accent-text)", "var(--anv-text)", "var(--anv-text-muted)"];

  // Split each line where it leaves the plotted range.
  const path = (points) =>
    points
      .map((point, i) => {
        if (!inside(point)) return "";
        const start = i === 0 || !inside(points[i - 1]);
        return `${start ? "M" : "L"}${x(point[0]).toFixed(1)},${y(point[1]).toFixed(1)}`;
      })
      .join("");

  return (
    <figure className="lab-chart">
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title}>
        <path d={`M${PAD.left},${PAD.top}V${HEIGHT - PAD.bottom}H${WIDTH - PAD.right}`} className="lab-chart-axis" />
        {yDomain[0] < 0 && yDomain[1] > 0 ? (
          <path d={`M${PAD.left},${y(0)}H${WIDTH - PAD.right}`} className="lab-chart-axis" strokeDasharray="2 3" />
        ) : null}
        {lines.map((line, i) => (
          <path
            key={line.label}
            d={path(line.points)}
            fill="none"
            stroke={line.color || colors[i % colors.length]}
            strokeWidth="1.8"
            strokeDasharray={line.dashed ? "5 4" : undefined}
          />
        ))}
        {marks.filter(inside).map(([px, py]) => (
          <circle key={`${px}-${py}`} cx={x(px)} cy={y(py)} r="4" className="lab-chart-mark" />
        ))}
        {[0, 1].map((i) => (
          <React.Fragment key={i}>
            <text x={x(xDomain[i])} y={HEIGHT - PAD.bottom + 12} textAnchor={i ? "end" : "start"}>
              {format(xDomain[i])}
            </text>
            <text x={PAD.left - 5} y={y(yDomain[i]) + (i ? 8 : 0)} textAnchor="end">
              {format(yDomain[i])}
            </text>
          </React.Fragment>
        ))}
        <text x={(WIDTH + PAD.left) / 2} y={HEIGHT - 4} textAnchor="middle">
          {xLabel}
        </text>
        <text transform={`translate(10 ${(HEIGHT - PAD.bottom) / 2}) rotate(-90)`} textAnchor="middle">
          {yLabel}
        </text>
      </svg>
      <ul>
        {lines.map((line, i) => (
          <li key={line.label}>
            <span
              style={{
                borderTopColor: line.color || colors[i % colors.length],
                borderTopStyle: line.dashed ? "dashed" : "solid",
              }}
            />
            {line.label}
          </li>
        ))}
      </ul>
    </figure>
  );
}
