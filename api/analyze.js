export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Grab the messages your frontend sent
    const { messages } = req.body;

    // 2. Call OpenAI's super fast, cheap GPT-4o-mini model securely
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Vercel injects this safely!
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages, // Pass the messages along
        temperature: 0.2
      })
    });

    const openAiData = await response.json();

    // 3. Trick the frontend into thinking this is still Anthropic so your parsing code doesn't break!
    return res.status(200).json({
      content: [
        { type: "text", text: openAiData.choices[0].message.content }
      ]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to scan website' });
  }
}
