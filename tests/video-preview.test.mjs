import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile('src/scripts/ui/video-preview.ts', 'utf8');
const js = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {enhanceVideoPoster,mountVideoFrame} = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
function poster(complete=false,width=0){
 const classes=new Set(), handlers=new Map();
 const stage={classList:{toggle(name,on){on?classes.add(name):classes.delete(name)}}};
 const image={complete,naturalWidth:width,hidden:false,closest:()=>stage,addEventListener:(type,fn)=>handlers.set(type,fn)};
 return {image,classes,emit:type=>handlers.get(type)()};
}
test('a pending or failed remote poster leaves the truthful play fallback visible',()=>{
 const p=poster();enhanceVideoPoster(p.image);assert.equal(p.image.hidden,true);assert.equal(p.classes.has('has-poster'),false);
 p.emit('error');assert.equal(p.image.hidden,true);assert.equal(p.classes.has('has-poster'),false);
});
test('only a decoded real poster replaces the play fallback',()=>{
 const p=poster();enhanceVideoPoster(p.image);p.image.naturalWidth=480;p.emit('load');
 assert.equal(p.image.hidden,false);assert.equal(p.classes.has('has-poster'),true);
 p.emit('error');assert.equal(p.image.hidden,true);assert.equal(p.classes.has('has-poster'),false);
});
test('cached decoded posters appear immediately without a fade',()=>{
 const p=poster(true,480);enhanceVideoPoster(p.image);assert.equal(p.image.hidden,false);assert.equal(p.classes.has('has-poster'),true);
});
test('loading a card video preserves its title, description and recovery link',()=>{
 const frame={tagName:'IFRAME'}, caption={text:'Original title and description',href:'https://www.youtube.com/watch?v=YSXFKSvN75o'};
 const box={classList:{contains:()=>true},children:[],querySelector:()=>preview,ownerDocument:{createElement:()=>({className:'',children:[],appendChild(node){this.children.push(node)}})}};
 const preview={replaceWith(node){box.children[0]=node}};box.children=[preview,caption];
 mountVideoFrame(box,frame);
 assert.equal(box.children[1],caption);assert.equal(box.children.length,2);
 assert.equal(box.children[0].className,'rs-vid-th is-playing');assert.deepEqual(box.children[0].children,[frame]);
});
test('the large film container swaps media while retaining its outside source action',()=>{
 const frame={},classes=new Set();const box={classList:{contains:()=>false,add:name=>classes.add(name)},replaceChildren(...children){this.children=children}};
 mountVideoFrame(box,frame);assert.deepEqual(box.children,[frame]);assert.ok(classes.has('is-playing'));
});
