import { coll } from "@/lib/firestore";

export default async function handler(req, res) {
  const { projectId, colorId } = req.query;

  if (req.method === "GET") {
    const snap = await coll.doc(projectId).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Prosjekt ikke funnet" });
    }

    const color = (snap.data().colors || []).find((c) => c.id === colorId);
    return color
      ? res.status(200).json(color)
      : res.status(404).json({ error: "Farge ikke funnet" });
  }

  if (req.method === "DELETE") {
    const ref = coll.doc(projectId);
    const snap = await ref.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Prosjekt ikke funnet" });
    }

    const remaining = (snap.data().colors || []).filter((c) => c.id !== colorId);
    await ref.update({ colors: remaining });

    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}