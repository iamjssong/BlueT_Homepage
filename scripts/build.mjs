import fs from 'node:fs';
import path from 'node:path';
const files=['index.html','admin.html','style.css','admin.css','script.js','news.js','admin.js','assets/favicon.svg','assets/bluet-three-row-cart.png','assets/vision.jpg'];
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const assets=Object.fromEntries(files.map(file=>['/'+file,{type:types[path.extname(file)],data:fs.readFileSync(file).toString('base64')}]));
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js',fs.readFileSync('worker.mjs','utf8').replace("import { assets } from './generated-assets.mjs';",`const assets=${JSON.stringify(assets)};`));
console.log(`Built ${files.length} public assets and Worker API; private files excluded.`);
