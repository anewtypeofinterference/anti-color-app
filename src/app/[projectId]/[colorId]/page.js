"use client";
import { useState, useEffect } from "react";
import useSWR                  from "swr";
import { useParams, useRouter} from "next/navigation";
import { ArrowLeft }          from "phosphor-react";
import ColorSwatchSteps       from "../../components/ColorSwatchSteps";
import Button                 from "../../components/Button";
import Toast                  from "../../components/Toast";

const fetcher = u=>fetch(u).then(r=>r.json());
const blankStep = axis => ({
  axis, varyChannel:"y", stepInterval:2, numMinusSteps:0, numPlusSteps:0
});
const isEmpty = s=>!s||(s.numMinusSteps===0&&s.numPlusSteps===0);
const axisName = a=>a==="X"?"Horisontal":"Vertikal";

export default function ColorPage() {
  const { projectId, colorId } = useParams();
  const router = useRouter();
  const { data: project, error, isLoading } = useSWR(`/api/projects/${projectId}`, fetcher);

  const [base,setBase]   = useState(null);
  const [steps,setSteps] = useState({});
  const [modal,setModal] = useState(blankStep("X"));
  const [show,setShow]   = useState(false);
  const [toast,setToast] = useState("");

  useEffect(()=>{
    if(!project) return;
    const c = project.colors.find(c=>c.id===colorId);
    if(!c){ setToast("Farge ikke funnet"); return; }
    setBase({ name:c.name, c:c.c, m:c.m, y:c.y, k:c.k });
    setSteps(c.stepConfigs||{});
  },[project,colorId]);

  useEffect(()=>{
    if(!toast) return;
    const t = setTimeout(()=>setToast(""),3000);
    return ()=>clearTimeout(t);
  },[toast]);

  const onBaseChange = e=>{
    const { name,value } = e.target;
    setBase(b=>({
      ...b,
      [name]: ["c","m","y","k"].includes(name) ? Number(value) : value
    }));
  };

  const openCfg = axis=>{
    setModal(steps[axis] ? {...steps[axis]} : blankStep(axis));
    setShow(true);
  };
  const saveCfg = ()=>{
    setSteps(s=>({...s,[modal.axis]:modal}));
    setShow(false);
    setToast(`${axisName(modal.axis)} lagret`);
  };
  const delAxis = axis=>setSteps(s=>{
    const o={...s}; delete o[axis]; return o;
  });

  const saveAll = async ()=>{
    const updated = project.colors.map(c=>
      c.id===colorId ? {...c,...base,stepConfigs:steps} : c
    );
    await fetch(`/api/projects/${projectId}`,{
      method:"PATCH",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({colors:updated})
    });
    setToast("Lagring OK");
  };

  if(error)     return <div className="p-10 text-red-600">Feil ved lasting</div>;
  if(isLoading || !base) return <div className="p-10">Laster…</div>;

  const { r,g,b } = {
    r:Math.round(255*(1-base.c/100)*(1-base.k/100)),
    g:Math.round(255*(1-base.m/100)*(1-base.k/100)),
    b:Math.round(255*(1-base.y/100)*(1-base.k/100))
  };

  const preview = [
    ...(steps.X && !isEmpty(steps.X) ? [steps.X] : []),
    ...(steps.Y && !isEmpty(steps.Y) ? [steps.Y] : []),
    ...(show && !isEmpty(modal) ? [modal] : [])
  ];

  return (
    <div className="flex h-screen">
      <div className="w-[30%] p-10 space-y-10 bg-black/5">
        <div className="flex gap-2">
          <Button onClick={()=>router.back()} className="bg-black/10">
            <ArrowLeft size={16}/> Tilbake
          </Button>
          <Button onClick={saveAll} className="bg-black text-white">
            Lagre
          </Button>
        </div>

        <div className="aspect-video p-6 rounded-2xl flex flex-col justify-between"
             style={{backgroundColor:`rgb(${r},${g},${b})`}}>
          <h1 className="text-xl text-white">{base.name}</h1>
          <div className="text-white/80 text-sm">
            {base.c} {base.m} {base.y} {base.k}
          </div>
        </div>

        <div className="space-y-4">
          <input
            name="name"
            value={base.name}
            onChange={onBaseChange}
            className="w-full rounded-lg py-3 px-4 bg-black/5"
          />
          <div className="flex gap-2">
            {["c","m","y","k"].map(ch=>(
              <div key={ch} className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25">
                  {ch.toUpperCase()}
                </span>
                <input
                  type="number"
                  name={ch}
                  min="0"
                  max="100"
                  value={base[ch]}
                  onChange={onBaseChange}
                  className="w-full pl-9 py-3 pr-4 bg-black/5 rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-1">
            {!steps.X && <Button onClick={()=>openCfg("X")} className="bg-black/10 text-xs">+ X</Button>}
            {!steps.Y && <Button onClick={()=>openCfg("Y")} className="bg-black/10 text-xs">+ Y</Button>}
          </div>
          {["X","Y"].map(axis=>(
            steps[axis] && (
              <div key={axis} className="p-3 bg-black/5 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">{axisName(axis)}</div>
                  <div className="text-black/50 text-sm">
                    –{steps[axis].numMinusSteps} … +{steps[axis].numPlusSteps} Δ{steps[axis].stepInterval} / {steps[axis].varyChannel.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={()=>openCfg(axis)} className="text-xs bg-black/10">Rediger</Button>
                  <Trash size={14} className="text-red-500 cursor-pointer" onClick={()=>delAxis(axis)}/>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="fixed top-0 right-0 bottom-0 w-[70%] p-10 bg-white overflow-auto">
        <ColorSwatchSteps {...base} stepConfigs={preview} />
      </div>

      {show && (
        <Modal title={`Konfigurer ${axisName(modal.axis)}`} onClose={()=>setShow(false)}>
          {["numMinusSteps","numPlusSteps","stepInterval"].map(f=>(
            <label key={f} className="flex flex-col">
              {{
                numMinusSteps: "Minus steg",
                numPlusSteps: "Plus steg",
                stepInterval: "Intervall"
              }[f]}
              <input
                type="number" min="0" max="6"
                value={modal[f]}
                onChange={e=>setModal(m=>({...m,[f]:Number(e.target.value)}))}
                className="mt-1 p-2 bg-black/5 rounded"
              />
            </label>
          ))}
          <label className="flex flex-col">
            Kanal
            <select
              value={modal.varyChannel}
              onChange={e=>setModal(m=>({...m,varyChannel:e.target.value}))}
              className="mt-1 p-2 bg-black/5 rounded"
            >
              {["c","m","y","k"].map(ch=>(
                <option key={ch} value={ch}>{ch.toUpperCase()}</option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={saveCfg} className={isEmpty(modal)?"bg-gray-400":"bg-blue-600 text-white"} disabled={isEmpty(modal)}>
              Lagre
            </Button>
          </div>
        </Modal>
      )}

      <Toast msg={toast} />
    </div>
  );
}