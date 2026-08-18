const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// تفعيل CORS لجميع النطاقات
app.use(cors());

// السماح بقراءة البيانات الواردة بصيغة JSON
app.use(express.json());

// التعامل التلقائي مع طلبات OPTIONS
app.options(/(.*)/, cors());

app.post('/api/chat', async (req, res) => {
    // استقبال الرسالة من المستخدم أو استخدام قيمة افتراضية
    const userMessage = req.body.message || "مرحبا";

    const targetUrl = "https://api.rewind.ai/v1/chat/completions";

    const headers = {
        "accept": "*/ *",
        "accept-language": "en-US,en;q=0.9,ar;q=0.8",
        "content-type": "application/json",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "referer": "https://shocked-aqua-6kjblhrg.edgeone.dev/"
    };

    const payload = {
        "model": "google/gemini-embedding-001",
        "messages": [
            {
                "role": "user",
                "content": userMessage
            }
        ],
        "temperature": 0.7,
        "max_tokens": 16000,
        "stream": false // <--- تم إلغاء الستريم وجعله false
    };

    try {
        // طلب البيانات بالطريقة العادية (ليس Stream)
        const response = await axios.post(targetUrl, payload, {
            headers: headers
        });

        // استخراج النص الكامل مباشرة من استجابة الذكاء الاصطناعي
        const replyText = response.data.choices[0]?.message?.content || "";

        // إرسال النتيجة كـ JSON عادي متصل ومستقر
        return res.json({
            success: true,
            message: replyText
        });

    } catch (error) {
        console.error("Error connecting to external API:", error.message);
        return res.status(500).json({ 
            error: 'فشل الاتصال بالخدمة الخارجية', 
            details: error.message 
        });
    }
});

// تصدير الـ app لـ Vercel أو المنصات السحابية
module.exports = app;

// التشغيل المحلي فقط إذا تم تشغيل الملف مباشرة
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 API Proxy running on http://localhost:${PORT}`);
    });
}
