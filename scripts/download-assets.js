const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  'phone.svg',
  'icon1.svg',
  'icon2.svg',
  'icon3.svg',
  'icon4.svg',
  'icon5.svg',
  'banner_pic.svg'
];

const baseUrl = 'https://fama24horas.com/assets/images/';
const outputDir = path.join(__dirname, '..', 'public', 'assets', 'images');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

images.forEach(image => {
  const url = baseUrl + image;
  const outputPath = path.join(outputDir, image);

  https.get(url, (response) => {
    const fileStream = fs.createWriteStream(outputPath);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded: ${image}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${image}:`, err.message);
  });
});
