const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const brands={
  baidu:'data:image/x-icon;base64,'+fs.readFileSync(path.join(root,'assets/brands/baidu-pan.ico')).toString('base64'),
  quark:'data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/brands/quark-pan-icon.png')).toString('base64')
};
fs.writeFileSync(path.join(root,'brands-data.js'),'window.PREVIEW_BRANDS='+JSON.stringify(brands)+';\n');
fs.writeFileSync(path.join(root,'assets/brands/SOURCES.md'),'# Brand assets\n\nBaidu Netdisk: official homepage favicon, https://nd-static.bdstatic.com/m-static/wp-brand/favicon.ico (linked by https://pan.baidu.com/).\n\nQuark Drive: official square logo embedded in .qrcode-container .qrcode-logo from https://g.alicdn.com/quark-cloud-drive/quark-cloud-drive-static-page/0.1.78/css/index.css (linked by https://pan.quark.cn/).\n\nDownloaded 2026-10-30. Logos identify the services and remain the property of their respective owners.\n');
console.log('Prepared two official service logos for the local prototype.');
