import * as JimpModule from 'jimp';
import fs from 'fs';
import path from 'path';

// Handle Jimp ESM import difference
const Jimp = JimpModule.default || JimpModule.Jimp || JimpModule;

const dir = './public/pictures';
const files = fs.readdirSync(dir);

console.log('Starting conversion of PNGs to JPEGs...');

for (const file of files) {
  if (file.toLowerCase().endsWith('.png')) {
    const pngPath = path.join(dir, file);
    const jpgName = file.substring(0, file.length - 4) + '.jpg';
    const jpgPath = path.join(dir, jpgName);
    
    console.log(`Converting ${file} -> ${jpgName}...`);
    try {
      const image = await Jimp.read(pngPath);
      
      // Resize to max 800px width if needed
      if (image.bitmap.width > 800) {
        image.resize({ w: 800 });
      }
      
      // Write as JPEG with quality 75
      await image.write(jpgPath, { quality: 75 });
      
      // Verify JPG was written successfully and has a valid size
      if (fs.existsSync(jpgPath)) {
        const pngStat = fs.statSync(pngPath);
        const jpgStat = fs.statSync(jpgPath);
        console.log(`Success: ${(pngStat.size / 1024 / 1024).toFixed(2)} MB PNG -> ${(jpgStat.size / 1024).toFixed(1)} KB JPG`);
        
        // Delete the original PNG file
        fs.unlinkSync(pngPath);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

console.log('Image compression and conversion complete!');
