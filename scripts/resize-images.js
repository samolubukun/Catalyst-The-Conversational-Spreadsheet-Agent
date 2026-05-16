const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const targets = fs.readdirSync(publicDir).filter(f => /(jpg|jpeg|png)$/i.test(f));

(async () => {
  for (const file of targets) {
    const filePath = path.join(publicDir, file);
    try {
      const { size } = fs.statSync(filePath);
      // only process files bigger than 300KB
      if (size > 300 * 1024) {
        const outPath = filePath; // overwrite
        const image = sharp(filePath);
        const metadata = await image.metadata();
        const width = metadata.width || 1200;
        const targetWidth = Math.min(width, 1200);
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
          await image
            .resize({ width: targetWidth })
            .jpeg({ quality: 80 })
            .toFile(outPath + '.tmp');
        } else if (metadata.format === 'png') {
          await image
            .resize({ width: targetWidth })
            .png({ quality: 80, compressionLevel: 8 })
            .toFile(outPath + '.tmp');
        } else {
          continue;
        }
        fs.renameSync(outPath + '.tmp', outPath);
        console.log('Optimized', file);
      }
    } catch (e) {
      console.error('Error processing', file, e.message);
    }
  }
})();
