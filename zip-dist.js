const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const sourceDir = path.resolve(__dirname, 'heightLight-plug');
const outputZip = path.resolve(__dirname, 'heightLight-plug.zip');

// 如果已存在旧的zip，先删除
if (fs.existsSync(outputZip)) {
  fs.unlinkSync(outputZip);
}

const zip = new AdmZip();
zip.addLocalFolder(sourceDir);
zip.writeZip(outputZip);

console.log(`已打包为: ${outputZip}`);