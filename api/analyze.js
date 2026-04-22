export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    let prompt = messages[0].content;

    // 1. Check if this is the "Scraping" request from the frontend
    const urlMatch = prompt.match(/Fetch and analyse (https?:\/\/[^\s]+)\./);

    if (urlMatch) {
      const targetUrl = urlMatch[1];
      try {
        // 2. Vercel physically visits the website and copies the raw code
        const siteResponse = await fetch(targetUrl);
        const html = await siteResponse.text();

        // 3. We clean it up slightly and hand the real HTML to the AI
        const safeHtml = html.substring(0, 90000); // Protect against insanely huge websites
        prompt = `Here is the raw HTML code for the website ${targetUrl}:\n\n${safeHtml}\n\nBased ONLY on this HTML code, answer the following request:\n${prompt.replace(`Fetch and analyse ${targetUrl}.`, 'Analyse the website.')}`;
        
        messages[0].content = prompt;
      } catch (e) {
        console.error("Vercel couldn't scrape the site:", e);
      }
    }

    // 4. Send the data (and the HTML) securely to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.1 // Kept low so it stays factual and doesn't hallucinate
      })
    });

    const openAiData = await response.json();

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
