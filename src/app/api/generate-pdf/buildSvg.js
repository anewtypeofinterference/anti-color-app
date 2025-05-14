export default function buildSvg(colors, projectName) {
  const today = new Date().toLocaleDateString('nb-NO',{
    day:'2-digit', month:'2-digit', year:'2-digit'
  });

  const COLS = 7, ROWS = 8, GAP = 10;
  const SW = 160, SH = 90;
  const W  = COLS*(SW+GAP)+GAP;
  const H  = ROWS*(SH+GAP)+60;

  // helper to turn CMYK → device-cmyk() string
  const toCmyk = (c,m,y,k) =>
    `device-cmyk(${(c/100).toFixed(3)},${(m/100).toFixed(3)},${(y/100).toFixed(3)},${(k/100).toFixed(3)})`;

  // build all pages
  return `<?xml version="1.0"?>\n` +
    colors.map(group=>{
      // flatten steps into a 7×8 array
      const steps = generateSwatchSteps(group);
      let rects = '';
      steps.forEach((s,i)=>{
        const col = i % COLS, row = Math.floor(i/COLS);
        const x = GAP + col*(SW+GAP);
        const y = GAP + row*(SH+GAP);
        if (!s) {
          rects += `<rect x="${x}" y="${y}" width="${SW}" height="${SH}"
                          fill="white" stroke="none"/>`;
        } else {
          const {c,m,y:yel,k,label} = s;
          const fill   = toCmyk(c,m,yel,k);
          const lum    = 0.299*(1-c/100)*(1-k/100)
                       +0.587*(1-m/100)*(1-k/100)
                       +0.114*(1-yel/100)*(1-k/100);
          const txtcol = lum>0.5 ? 'device-cmyk(0,0,0,1)' : 'device-cmyk(0,0,0,0)';
          rects += `
            <g>
              <rect x="${x}" y="${y}" width="${SW}" height="${SH}"
                    rx="6" ry="6" fill="${fill}" stroke="none"/>
              <text x="${x+8}" y="${y+16}" font-size="10"
                    fill="${txtcol}">${label}</text>
              <text x="${x+8}" y="${y+SH-6}" font-size="10"
                    fill="${txtcol}">${c} ${m} ${yel} ${k}</text>
            </g>`;
        }
      });

      return `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
           xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="${H-10}" font-size="14" fill="device-cmyk(0,0,0,1)">
          ${group.name} – ${today}
        </text>
        ${rects}
      </svg>`;
    }).join('\n');
}

// buildSwatchSteps exactly as before:
function generateSwatchSteps({c,m,y,k,stepConfigs={}}) {
  const COLS=7, ROWS=8;
  const grid = Array(COLS*ROWS).fill(null);
  const H = stepConfigs.X||{numMinusSteps:0,numPlusSteps:0,stepInterval:0,varyChannel:null};
  const V = stepConfigs.Y||{numMinusSteps:0,numPlusSteps:0,stepInterval:0,varyChannel:null};
  const baseRow = V.numMinusSteps, baseCol = H.numMinusSteps;

  for(let r=0;r< V.numMinusSteps+V.numPlusSteps+1;r++){
    for(let cidx=0;cidx< H.numMinusSteps+H.numPlusSteps+1;cidx++){
      const idx = r*COLS + cidx;
      const dH = (cidx-baseCol)*H.stepInterval;
      const dV = (r-baseRow)*V.stepInterval;
      const cc = clamp(c + (H.varyChannel==='c'?dH:0) + (V.varyChannel==='c'?dV:0));
      const mm = clamp(m + (H.varyChannel==='m'?dH:0) + (V.varyChannel==='m'?dV:0));
      const yy = clamp(y + (H.varyChannel==='y'?dH:0) + (V.varyChannel==='y'?dV:0));
      const kk = clamp(k + (H.varyChannel==='k'?dH:0) + (V.varyChannel==='k'?dV:0));
      const label = (dH===0&&dV===0)
        ? 'Base'
        : (()=> {
            const hL = H.varyChannel?`${H.varyChannel.toUpperCase()}${dH>0?'+':''}${dH}`:'';
            const vL = V.varyChannel?`${V.varyChannel.toUpperCase()}${dV>0?'+':''}${dV}`:'';
            if (hL&&vL&&H.varyChannel===V.varyChannel){
              const sum=dH+dV; return `${H.varyChannel.toUpperCase()}${sum>0?'+':''}${sum}`;
            }
            return [hL,vL].filter(Boolean).join(' ');
          })();
      grid[idx] = {c:cc,m:mm,y:yy,k:kk,label};
    }
  }
  return grid;
}

function clamp(v){ return Math.max(0,Math.min(100,Math.round(v))); }