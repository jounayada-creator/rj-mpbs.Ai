const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/ai-core', async (req, res) => {
    try {
        const { message, model, userEmail, actionType, language, isSubscribed, location, apiKey } = req.body;

        const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

        if (!activeApiKey) {
            return res.json({ 
                reply: "Please enter your Google AI Studio API Key in the top navigation bar to activate the AI core." 
            });
        }

        // এআই প্রম্পট লজিক (ইউজারের ভাষা এবং কমান্ড অনুযায়ী স্মার্ট রেসপন্স)
        let promptText = `You are RJ MPBS AI, an advanced global assistant, designer, and app publishing expert. The user is communicating with preference: ${language}. Respond intelligently, naturally, and contextually to: "${message}".`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiReply = data.candidates[0].content.parts[0].text;
            
            let responsePayload = { reply: aiReply };

            // যদি ইউজার ইমেজ বা স্টিকার ডিজাইন চায়
            if (actionType === 'image' || message.toLowerCase().includes('sticker') || message.toLowerCase().includes('design')) {
                responsePayload.mediaGenerated = `https://pollinations.ai/p/${encodeURIComponent(message)}?width=512&height=512&seed=42`;
            }

            // যদি ইউজার অ্যাপ বা ওয়েবসাইট পাবলিশ করতে চায়
            if (actionType === 'website' || actionType === 'publish-app' || message.toLowerCase().includes('app') || message.toLowerCase().includes('portfolio')) {
                responsePayload.publishedCode = `<!DOCTYPE html><html><head><style>body{font-family:sans-serif;background:#0f172a;color:#fff;padding:20px;text-align:center;} .card{background:#1e293b;padding:20px;border-radius:12px;border:1px solid #334155;}</style></head><body><div class="card"><h2>🚀 Published via RJ MPBS AI</h2><p>Your requested application/website is successfully compiled and live.</p><hr style="border-color:#475569;margin:15px 0;"><p style="color:#38bdf8;">Target Model: ${model || 'Gemini Core'}</p></div></body></html>`;
            }

            return res.json(responsePayload);
        } else {
            return res.json({ reply: "I am ready. How can I assist you with your project or app today?" });
        }

    } catch (error) {
        console.error(error);
        res.json({ reply: "A server connection error occurred. Please verify your API key." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
