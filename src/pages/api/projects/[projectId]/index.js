import { coll } from "@/lib/firestore";

export default async function handler(req, res) {
  const { projectId } = req.query;

  if (req.method === "GET") {
    const snap = await coll.doc(projectId).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Prosjekt ikke funnet" });
    }
    return res.status(200).json({ id: snap.id, ...snap.data() });
  }

  if (req.method === "PATCH") {
    const updates = req.body;
    const docRef = coll.doc(projectId);

    if (updates.id && updates.id !== projectId) {
      // Rename document (create new + delete old)
      const newDocRef = coll.doc(updates.id);
      const snap = await docRef.get();
      if (!snap.exists) return res.status(404).json({ error: "Prosjekt ikke funnet" });

      await newDocRef.set({ ...snap.data(), name: updates.name });
      await docRef.delete();
      return res.status(200).json({ ok: true, newId: updates.id });
    }

    console.log("PATCH request received for project:", projectId);
    console.log("Updates being applied:", JSON.stringify(updates, null, 2));
    
    if (updates.colors) {
      const colorWithSteps = updates.colors.find(c => c.stepConfigs);
      if (colorWithSteps) {
        console.log("Color with stepConfigs:", JSON.stringify(colorWithSteps, null, 2));
      }
    }

    await docRef.update(updates);
    
    // Verify what was saved
    const saved = await docRef.get();
    const savedData = saved.data();
    if (savedData.colors) {
      const savedColorWithSteps = savedData.colors.find(c => c.stepConfigs);
      if (savedColorWithSteps) {
        console.log("Saved color with stepConfigs:", JSON.stringify(savedColorWithSteps, null, 2));
      }
    }
    
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    await coll.doc(projectId).delete();
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}