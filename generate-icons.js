// Script temporal para generar iconos PNG desde SVG
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public/icons/icon.svg');
const outputDir = path.join(__dirname, 'public/icons');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // Icon 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'icon-192.png'));
  console.log('✓ Generated icon-192.png');

  // Icon 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon-512.png'));
  console.log('✓ Generated icon-512.png');

  // Maskable icon 512x512 (con padding para safe zone)
  // Android requiere ~20% de padding para maskable icons
  const maskableSize = 512;
  const iconSize = Math.floor(maskableSize * 0.6); // 60% del espacio
  const padding = Math.floor((maskableSize - iconSize) / 2);

  await sharp(svgBuffer)
    .resize(iconSize, iconSize)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 124, g: 58, b: 237, alpha: 1 } // #7C3AED del theme_color
    })
    .png()
    .toFile(path.join(outputDir, 'icon-maskable-512.png'));
  console.log('✓ Generated icon-maskable-512.png');

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
