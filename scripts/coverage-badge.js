#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { makeBadge } = require("badge-maker");

const summaryPath = path.resolve(
  process.cwd(),
  "coverage",
  "coverage-summary.json"
);
if (!fs.existsSync(summaryPath)) {
  console.error("coverage-summary.json not found at", summaryPath);
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
// pick lines coverage as primary
const pct = summary.total.lines.pct || 0;
const color =
  pct >= 95
    ? "brightgreen"
    : pct >= 90
    ? "green"
    : pct >= 80
    ? "yellowgreen"
    : pct >= 70
    ? "yellow"
    : "orange";

const formatPct = (n) => `${n.toFixed(1)}%`;
const badge = makeBadge({
  label: "coverage",
  message: formatPct(pct),
  color,
});

const outDir = path.resolve(process.cwd(), "coverage");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "badge.svg");
fs.writeFileSync(outPath, badge);
console.log("Wrote coverage badge to", outPath);
