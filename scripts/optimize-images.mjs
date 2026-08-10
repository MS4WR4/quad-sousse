import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const jobs = [
  {
    input: "public/images/agency/agency-collage.png",
    output: "public/images/agency/agency-circuit-2x.png",
    scale: 2,
    enhancePhoto: true,
  },
  {
    input: "public/images/agency/adventure-collage.png",
    output: "public/images/agency/agency-adventure-2x.png",
    scale: 2,
    enhancePhoto: true,
  },
  {
    input: "public/images/crimson-quad-preview.png",
    output: "public/images/crimson-quad-preview-2x.png",
    scale: 2,
    enhancePhoto: false,
  },
  {
    input: "public/brand/quad-sousse-logo.png",
    output: "public/brand/quad-sousse-logo-4x.png",
    scale: 4,
    enhancePhoto: false,
  },
];

async function upscale({ input, output, scale, enhancePhoto }) {
  const inputPath = path.join(projectRoot, input);
  const outputPath = path.join(projectRoot, output);
  const metadata = await sharp(inputPath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${input}`);
  }

  let pipeline = sharp(inputPath)
    .rotate()
    .resize({
      width: metadata.width * scale,
      height: metadata.height * scale,
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    });

  if (enhancePhoto) {
    pipeline = pipeline
      .modulate({ brightness: 1.01, saturation: 1.035 })
      .linear(1.025, -2.2)
      .sharpen({ sigma: 0.62, m1: 0.8, m2: 1.25 });
  } else {
    pipeline = pipeline.sharpen({ sigma: 0.52, m1: 0.7, m2: 1.05 });
  }

  await pipeline
    .png({
      adaptiveFiltering: true,
      compressionLevel: 9,
      palette: false,
    })
    .toFile(outputPath);

  const result = await sharp(outputPath).metadata();
  console.log(`${output} ${result.width}x${result.height}`);
}

await Promise.all(jobs.map(upscale));
