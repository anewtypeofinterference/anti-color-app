import { coll } from "@/lib/firestore";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const snap = await coll.get();
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).json(list);
  }

  if (req.method === "POST") {
    const { id, name } = req.body;
    await coll.doc(id).set({ name, colors: [] });
    return res.status(201).json({ ok: true });
  }

  res.status(405).end();
}