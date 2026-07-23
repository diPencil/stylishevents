const fs=require('fs');
const p='d:/Development/Events/EventSystem/frontend/app/admin/page.tsx';
const s=fs.readFileSync(p,'utf8').split('\n');
let count=0;
for(let i=0;i<s.length;i++){
  const line=s[i];
  const opens=(line.match(/<div[\s>]/g)||[]).length;
  const closes=(line.match(/<\/div>/g)||[]).length;
  count += opens - closes;
  if(count<0) console.log('NEGATIVE at',i+1,'line:',line.trim());
  if(opens||closes) console.log((i+1).toString().padStart(4),'opens',opens,'closes',closes,'cum',count,'->',line.trim());
}
console.log('FINAL COUNT',count);
