import { coll } from "@/lib/firestore";

export default async function handler(req, res) {
  const { projectId } = req.query;

  if (req.method === "POST") {
    const { id, name, c, m, y, k } = req.body;
    const ref = coll.doc(projectId);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Prosjekt ikke funnet" });
    }

    const colors = snap.data().colors || [];
    const newColor = { id, name, c, m, y, k, stepConfigs: [] };
    await ref.update({ colors: [...colors, newColor] });

    return res.status(201).json(newColor);
  }

  res.status(405).end();
}