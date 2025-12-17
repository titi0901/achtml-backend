// api/generate.js - À mettre sur Vercel
export default async function handler(req, res) {
  // Active CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, apiKey, model } = req.body;

  if (!prompt || !apiKey || !model) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'user',
          content: `Tu es un expert HTML/CSS/JS. Génère du HTML complet et fonctionnel basé sur cette description: "${prompt}". 
          
          IMPORTANT:
          - Inclus le DOCTYPE, html, head, body
          - CSS interne dans des balises <style>
          - JS interne dans des balises <script>
          - Rends-le visuellement attrayant
          - Fais attention aux fermetures de balises
          - Utilise des animations modernes
          
          Retourne UNIQUEMENT le code HTML valide, rien d'autre.`
        }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'OpenAI API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}