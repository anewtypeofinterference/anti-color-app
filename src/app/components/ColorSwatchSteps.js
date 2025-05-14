"use client";
import React from "react";
import ColorSwatch from "./ColorSwatch";

const clamp = v => (v < 0 ? 0 : v > 100 ? 100 : v);
const pick  = (c,m,y,k,ch) => ({ c,m,y,k }[ch]);
const deltaArray = ({ numMinusSteps:nm, numPlusSteps:np, stepInterval:si }) =>
  Array.from({ length: nm + np + 1 }, (_, i) => (i - nm) * si);

export default function ColorSwatchSteps({ c,m,y,k, stepConfigs=[] }) {
  const MAX_COLS = 7, MAX_ROWS = 8;

  const H = stepConfigs.find(s=>s.axis==="X");
  const V = stepConfigs.find(s=>s.axis==="Y");

  const baseCol = H ? H.numMinusSteps : 0;
  const baseRow = V ? V.numMinusSteps : 0;

  const hD = H ? deltaArray(H) : [0];
  const vD = V ? deltaArray(V) : [0];

  const grid = Array.from({length:MAX_ROWS}, () =>
    Array.from({length:MAX_COLS}, () => ({
      cc:c, mm:m, yy:y, kk:k, label:"", active:false,
    }))
  );

  /* Cartesian loop */
  vD.forEach((dV, vi) => {
    hD.forEach((dH, hi) => {
      const row = baseRow + vi - (V ? V.numMinusSteps : 0);
      const col = baseCol + hi - (H ? H.numMinusSteps : 0);
      if (row<0||row>=MAX_ROWS||col<0||col>=MAX_COLS) return;

      const cell = grid[row][col];

      /* horizontal */
      if (H) {
        const base = pick(cell.cc,cell.mm,cell.yy,cell.kk,H.varyChannel);
        const stepped = clamp(Number(base) + dH);
        if (H.varyChannel==="c") cell.cc = stepped;
        if (H.varyChannel==="m") cell.mm = stepped;
        if (H.varyChannel==="y") cell.yy = stepped;
        if (H.varyChannel==="k") cell.kk = stepped;
      }

      /* vertical */
      if (V) {
        const base = pick(cell.cc,cell.mm,cell.yy,cell.kk,V.varyChannel);
        const stepped = clamp(Number(base) + dV);
        if (V.varyChannel==="c") cell.cc = stepped;
        if (V.varyChannel==="m") cell.mm = stepped;
        if (V.varyChannel==="y") cell.yy = stepped;
        if (V.varyChannel==="k") cell.kk = stepped;
      }

      /* label */
      let lbl="";
      const hLbl = H&&dH!==0?`${H.varyChannel.toUpperCase()}${dH>0?" +":" "}${dH}`:"";
      const vLbl = V&&dV!==0?`${V.varyChannel.toUpperCase()}${dV>0?" +":" "}${dV}`:"";
      if(dH===0&&dV===0) lbl="Base";
      else if(hLbl&&vLbl){
        if(H&&V&&H.varyChannel===V.varyChannel){
          const sum=dH+dV; lbl=`${H.varyChannel.toUpperCase()}${sum>0?"+":" "}${sum}`;
        }else lbl=`${hLbl} ${vLbl}`;
      }else lbl=hLbl||vLbl;

      cell.label=lbl; cell.active=true;
    });
  });

  grid[baseRow][baseCol]={cc:c,mm:m,yy:y,kk:k,label:"Base",active:true};

  return(
    <div style={{
      display:"grid",
      gridTemplateColumns:`repeat(${MAX_COLS},1fr)`,
      gridTemplateRows:`repeat(${MAX_ROWS},1fr)`,
      gap:"0.75rem",
      width:"100%", height:"100%",
    }}>
      {grid.flatMap((row,r)=>
        row.map((cell,cIdx)=>
          cell.active
            ?<ColorSwatch key={`sw-${r}-${cIdx}`} c={cell.cc} m={cell.mm} y={cell.yy} k={cell.kk} label={cell.label}/>
            :<div key={`ph-${r}-${cIdx}`} className="w-full h-full bg-black/0 rounded"/>
        )
      )}
    </div>
  );
}