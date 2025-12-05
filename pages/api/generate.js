// This file is disabled/deprecated in favor of generate.ts
export default function handler(req, res) {
  res.status(404).json({ error: "Please use the TypeScript endpoint." });
}
