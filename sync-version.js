const fs = require('fs');
const path = require('path');

// 根目录 package.json 路径
const pkgPath = path.resolve(__dirname, 'package.json');
// manifest.json 路径
const manifestPath = path.resolve(__dirname, 'heightLight-plug/manifest.json');

// 读取 package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const version = pkg.version;

// 读取 manifest.json
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// 更新版本号
manifest.version = version;

// 写回 manifest.json
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log(`manifest.json 版本号已同步为：${version}`);