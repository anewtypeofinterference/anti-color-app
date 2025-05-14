import Link from "next/link";
import { ArrowRight, Trash } from "phosphor-react";
import Button       from "../components/Button";
import { Plus }                 from "phosphor-react";

const rgb = (c,m,y,k) => ({
  r: Math.round(255*(1-c/100)*(1-k/100)),
  g: Math.round(255*(1-m/100)*(1-k/100)),
  b: Math.round(255*(1-y/100)*(1-k/100)),
});

const txtColor = ({r,g,b}) =>
  (0.299*r + 0.587*g + 0.114*b)/255 > 0.5 ? "text-black" : "text-white";

export default function ColorCard({ color, projectId, onDelete }) {
  const col = rgb(color.c,color.m,color.y,color.k);
  const tc  = txtColor(col);
  return (
    <div className="relative group">
      <button
        onClick={()=>onDelete(color.id)}
        className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full hover:bg-black/60 text-white z-10"
      >
        Slett
      </button>

      <Link href={`/${projectId}/${color.id}`} passHref>
        <div
          className="p-8 aspect-[4/3] rounded-2xl cursor-pointer"
          style={{backgroundColor:`rgb(${col.r},${col.g},${col.b})`}}
        >
          <h3 className={`text-xl mb-2 ${tc}`}>{color.name}</h3>
          <p className={tc==="text-white" ? "text-white/60" : "text-black/60"}>
            {color.c} {color.m} {color.y} {color.k}
          </p>
          <div className="absolute bottom-8 right-8 p-4 rounded-full bg-white/10 group-hover:bg-white/15">
            <ArrowRight size={16} className={tc}/>
          </div>
        </div>
      </Link>
    </div>
  );
}