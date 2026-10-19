import { runDiagnostics } from '../../lib/diagnostic';

// Page /diagnostic : constats d'installation, sans aucune clé ni donnée.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const result = await runDiagnostics(process.env);
  res.status(200).json(result);
}
