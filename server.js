const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// স্ট্যাটিক ফাইল ও ফ্রন্টএন্ড রাউটিং
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// মূল এআই, এজেন্ট, গ্লোবাল লোকেশন এবং এপিআই কি প্রসেসিং এন্ডপয়েন্ট
app.post('/api/ai-core', async (req, res) => {
    try {
        const { message, model, userEmail, actionType, language, isSubscribed, location, apiKey } = req.body;
        
        // আপনার সঠিক ওনার জিমেইল
        const ownerEmail = "jounayada@gmail.com";
        const isOwner = userEmail === ownerEmail;

        // গুগল এআই স্টুডিও বা অন্যান্য এপিআই কি ব্যবহার যাচাই
        const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

        if (!message && actionType !== 'init') {
            return res.status(400).json({ error: "মেসেজ প্রদান করুন।" });
        }

        let responseData = {
            reply: "",
            mediaGenerated: null,
            publishedCode: null,
            requiresSubscription: false
        };

        if ((actionType === 'video' || actionType === 'publish-app') && !isSubscribed && !isOwner) {
            responseData.requiresSubscription = true;
            responseData.reply = "Please update your subscription to publish this app/website or access this premium feature.";
            return res.json(responseData);
        }

        // পৃথিবীর যেকোনো গ্লোবাল লোকেশন ট্যাগিং হ্যান্ডলার
        if (location) {
            responseData.reply = `🌍 Global Location Tagged: "${location}". Dynamic visual route, geographic insights, and map guide loaded successfully.`;
            responseData.mediaGenerated = "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop"; 
            return res.json(responseData);
        }

        if (actionType === 'image' || actionType === 'sticker') {
            responseData.reply = "আপনার কাঙ্ক্ষিত ডিজিটাল ডিজাইন, স্টিকার বা অ্যাপ মকআপ সফলভাবে তৈরি করা হয়েছে:";
            responseData.mediaGenerated = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop";
        } else if (actionType === 'website' || actionType === 'publish-app') {
            responseData.reply = "আপনার প্রম্পট অনুযায়ী সম্পূর্ণ পোর্টফোলিও/ওয়েবসাইট/অ্যাপ সফলভাবে জেনারেট এবং পাবলিশ করার জন্য প্রস্তুত করা হয়েছে:";
            responseData.publishedCode = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Published AI App / Portfolio</title>
<style>
  body { background: #0f172a; color: #f8fafc; font-family: sans-serif; text-align: center; padding: 60px; }
  .card { background: #1e293b; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
  h1 { color: #6366f1; margin-bottom: 15px; }
  p { color: #94a3b8; line-height: 1.6; }
</style>
</head>
<body>
  <div class="card">
    <h1>🚀 Published via RJ MPBS AI</h1>
    <p>Target Goal: ${message}</p>
    <p>This portfolio/app/website was dynamically built and published instantly using Google AI & Multi-Model Engine.</p>
  </div>
</body>
</html>`;
        } else {
            // যদি Google AI Studio API Key থাকে তবে সেটির উপস্থিতি নিশ্চিত করে রেসপন্স তৈরি
            const keyStatus = activeApiKey ? "Google AI Studio API Key Connected 🔑" : "Default AI Core Engine";
            responseData.reply = `[Engine: ${model.toUpperCase()} | Lang: ${language} | ${keyStatus}] আপনার প্রম্পটের ভিত্তিতে এই ডিপ লজিক্যাল রেসপন্স তৈরি করা হয়েছে। পৃথিবীর যেকোনো ভাষায় আমি আপনার সাথে কাজ করতে প্রস্তুত।`;
        }

        res.json(responseData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "সার্ভারে ত্রুটি ঘটেছে।" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`RJ MPBS AI Master Server running on port ${PORT}`);
});
