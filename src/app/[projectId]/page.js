"use client";
import { useState }        from "react";
import useSWR              from "swr";
import { useParams }       from "next/navigation";
import slugify             from "slugify";
import { ArrowLeft, Plus } from "phosphor-react";

import Button     from "../components/Button";
import Input      from "../components/Input";
import Modal      from "../components/Modal";
import ColorCard  from "../components/ColorCard";
import Toast      from "../components/Toast";
import EmptyState from "../components/EmptyState";

const fetcher  = (url) => fetch(url).then((r) => r.json());
const makeSlug = (t) =>
  slugify(t, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

export default function ProjectPage() {
  const { projectId } = useParams();
  const { data: project, error, isLoading, mutate } =
    useSWR(`/api/projects/${projectId}`, fetcher);

  const [toast, setToast] = useState("");
  const [open, setOpen]   = useState(false);
  const [name, setName]   = useState("");
  const [C, setC] = useState(0),
        [M, setM] = useState(0),
        [Y, setY] = useState(0),
        [K, setK] = useState(0);
  const pop = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const createColor = async () => {
    const nm = name.trim();
    if (!nm) return pop("Navn mangler");
    const id = makeSlug(nm);
    if ((project.colors || []).some((c) => c.id === id)) return pop("Finnes allerede");
    const res = await fetch(`/api/projects/${projectId}/colors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: nm, c: C, m: M, y: Y, k: K }),
    });
    if (!res.ok) return pop("Feil ved oppretting");
    mutate();
    setOpen(false);
    setName("");
    pop("Farge lagt til");
  };

  const deleteColor = async (cid) => {
    if (!confirm("Slette farge?")) return;
    const res = await fetch(`/api/projects/${projectId}/colors/${cid}`, {
      method: "DELETE"
    });
    if (!res.ok) return pop("Feil ved sletting");
    mutate();
    pop("Farge slettet");
  };

  if (error)     return <div className="p-10 text-red-600">Feil ved lasting</div>;
  if (isLoading) return <div className="p-10">Laster…</div>;

  const colors = Array.isArray(project.colors) ? project.colors : [];

  return (
    <div className="p-12">
      <div className="flex items-center gap-6 mb-12">
        <Button
          variant="rounded"
          startIcon={ArrowLeft}
          onClick={() => history.back()}
        />
        <h1 className="text-2xl flex-1">{project.name}</h1>
        {colors.length > 0 && (
          <Button variant="primary" startIcon={Plus} onClick={() => setOpen(true)}>
            Ny farge
          </Button>
        )}
      </div>

      {colors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {colors.map((c) => (
            <ColorCard
              key={c.id}
              color={c}
              projectId={projectId}
              onDelete={deleteColor}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Ingen farger enda"
          description="Legg til din første farge for dette prosjektet"
        >
          <Button variant="primary" startIcon={Plus} onClick={() => setOpen(true)}>
            Ny farge
          </Button>
        </EmptyState>
      )}

      {open && (
        <Modal title="Ny farge" onClose={() => setOpen(false)}>
          <Input
            placeholder="Navn"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["C","M","Y","K"].map((ch) => (
              <Input
                key={ch}
                type="number"
                min="0"
                max="100"
                placeholder={ch}
                value={{C,M,Y,K}[ch]}
                onChange={(e) => ({C:setC,M:setM,Y:setY,K:setK})[ch](+e.target.value)}
              />
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={createColor}>
              Opprett
            </Button>
          </div>
        </Modal>
      )}

      <Toast msg={toast} />
    </div>
  );
}