import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const text=await readFile('src/scripts/ui/viewport-tool.ts','utf8');
const js=ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {availableToolRoom,availableVoicesStage,settledToolTop}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('live view reserves its recovery and navigation space',()=>assert.equal(availableToolRoom(757,340,108),309));
test('community category region stays inside a narrow scene',()=>assert.equal(availableToolRoom(606,325,92),189));
test('bounds stay useful on tall and extremely short windows',()=>{assert.equal(availableToolRoom(1600,200,92),680);assert.equal(availableToolRoom(300,250,92),80)});

test('landscape voices reserve their complete category row before fitting the display',()=>{
 assert.equal(availableVoicesStage(399,90),299);
 assert.equal(availableVoicesStage(560,90),460);
});
test('extremely short windows keep a readable display with explicit internal scrolling',()=>{
 assert.equal(availableVoicesStage(200,90),240);
});

test('settled tool position ignores where the page is scrolled',()=>{
 // header 77px, tool sits 217px inside its section: same answer wherever the section is on screen.
 assert.equal(settledToolTop(77,0,217),294);
 assert.equal(settledToolTop(77,-300,-83),294);
 assert.equal(settledToolTop(77,740,957),294);
 assert.equal(availableToolRoom(900,settledToolTop(77,740,957),92),514);
});
