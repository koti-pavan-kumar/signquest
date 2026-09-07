// generate-icons.js — Run once to create PNG icons from SVG
// Usage: node generate-icons.js

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const sizes = [192, 512];

sizes.forEach((size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#7c3aed");
  gradient.addColorStop(1, "#a855f7");

  // Rounded rect
  const radius = size * 0.21;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Hand emoji
  ctx.font = `${size * 0.5}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🤟", size / 2, size * 0.42);

  // Text
  ctx.font = `bold ${size * 0.09}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("SignQuest", size / 2, size * 0.78);

  // Save
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(__dirname, "public", `icon-${size}.png`));
  console.log(`Created icon-${size}.png`);
});
