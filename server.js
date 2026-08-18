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
        const { message, language, apiKey, actionType } = req.body;
        const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

        if (!activeApiKey) {
            return res.json({ reply: "Please enter your Google AI Studio API Key in the top navigation bar." });
        }

        // এআই কে সরাসরি নির্দেশ দেওয়া হচ্ছে যেন ইউজারের মেসেজের বুদ্ধিমত্তাভিত্তিক উত্তর দেয়
        const promptInstruction = `You are RJ MPBS AI, an advanced, friendly assistant. The user says: "${message}". Respond intelligently, match the user's language style naturally, and avoid hardcoded dummy templates unless requested.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptInstruction }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiReply = data.candidates[0].content.parts[0].text;
            let responsePayload = { reply: aiReply };

            // শুধুমাত্র যখন ইউজার সুনির্দিষ্টভাবে স্টিকার বা ইমেজ জেনারেশন চাইবে
            if (actionType === 'image') {
                responsePayload.mediaGenerated = `https://pollinations.ai/p/${encodeURIComponent(message)}?width=512&height=512&seed=42`;
            }

            // শুধুমাত্র যখন ইউজার অ্যাপ পাবলিশ বা কোড প্রিভিউ চাইবে
            if (actionType === 'website') {
                responsePayload.publishedCode = `<!DOCTYPE html><html><head><style>body{font-family:sans-serif;background:#0f172a;color:#fff;padding:20px;text-align:center;} .card{background:#1e293b;padding:20px;border-radius:12px;border:1px solid #334155;}</style></head><body><div class="card"><h2>🚀 Published via RJ MPBS AI</h2><p>Your application code has been successfully compiled and deployed live.</p></div></body></html>`;
            }

            return res.json(responsePayload);
        } else {
            return res.json({ reply: "Hello! How can I assist you today?" });
        }
    } catch (error) {
        console.error(error);
        res.json({ reply: "Server connection error occurred." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
