const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/weave-icon.svg');
  const publicPath = path.join(__dirname, '../public');
  
  const sizes = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 16, name: 'favicon-16x16.png' }
  ];

  for (const { size, name } of sizes) {
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(publicPath, name));
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error);
    }
  }

  // Generate favicon.ico
  try {
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicPath, 'favicon.ico'));
    
    console.log('✅ Generated favicon.ico');
  } catch (error) {
    console.error('❌ Failed to generate favicon.ico:', error);
  }

  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error); 