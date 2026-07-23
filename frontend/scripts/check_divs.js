const fs = require('fs');
const path = 'd:/Development/Events/EventSystem/frontend/app/admin/page.tsx';
const s = fs.readFileSync(path,'utf8').split('\n');
let stack = [];
for(let i=0;i<s.length;i++){
  const line = s[i];
  const opens = (line.match(/<div[\s>]/g)||[]).length;
  const closes = (line.match(/<\/div>/g)||[]).length;
  for(let j=0;j<opens;j++) stack.push({line:i+1,txt:line.trim().slice(0,200)});
  for(let j=0;j<closes;j++){
    if(stack.length) stack.pop(); else console.log('Extra closing </div> at line', i+1)
  }
}
if(stack.length){
  console.log('Unclosed divs count:', stack.length);
  stack.forEach(s=>console.log('Unclosed open at line', s.line, s.txt));
} else console.log('All divs matched');
