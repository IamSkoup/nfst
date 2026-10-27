import {build} from 'esbuild';
import fs from 'node:fs';
const model=fs.readFileSync('assets/models/fuli.glb').toString('base64');
fs.writeFileSync('js/model-data.js',`export default '${model}';`);
await build({entryPoints:['js/main.js'],bundle:true,minify:true,format:'iife',outfile:'js/game.bundle.js',target:['chrome110'],legalComments:'eof'});
console.log('Offline bundle ready');
