import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const testCases = [
    { name: "transaction (single)", text: "Beli makan siang nasi padang 25rb" },
    { name: "transaction (income)", text: "Alhamdulillah gajian bulan ini turun 4.5 juta" },
    { name: "transaction (mixed)", text: "Tadi abis beli token listrik 100 ribu trus minum kopi 20rb" },
    { name: "insight_category_spending", text: "Paling banyak duitku habis buat apa sih bulan ini?" },
    { name: "financial_health_check", text: "Gimana kondisi keuanganku sekarang? Sehat gak?" },
    { name: "spending_prediction", text: "Bulan depan aku paling boros di mana ya?" },
    { name: "comparison_period", text: "Minggu ini sama minggu kemaren boros mana?" },
    { name: "set_goal", text: "Bulan ini aku mau target nabung 1.5 juta" },
    { name: "deposit_saving", text: "Sisihin 100 ribu buat celengan" },
    { name: "goal_tracking", text: "Gimana progress tabunganku sekarang?" },
    { name: "anomaly_detection", text: "Coba cek ada lonjakan pengeluaran gak hari ini" },
    { name: "recommendation_engine", text: "Kasih saran keuangan buat aku dong bulan ini" },
    { name: "set_limit", text: "Tolong atur limit pengeluaran harianku jadi 100 ribu aja" },
    { name: "check_balance", text: "Cek saldo" },
    { name: "clear_today", text: "Tolong hapus semua catetan transaksi hari ini" },
    { name: "check_month", text: "Cek laporan bulan ini dong" },
    { name: "check_today", text: "Hari ini aku udah keluarin buat apa aja?" },
    { name: "check_history", text: "Cek riwayat transaksi terakhir" },
    { name: "check_date", text: "Kemarin tanggal 12 aku ngeluarin apa aja?" },
    { name: "check_range", text: "Pengeluaranku dari tanggal 1 sampe 10 kemaren berapa ya?" },
    { name: "set_balance", text: "Saldo awalku sekarang 5 juta ya" },
    { name: "knowledge", text: "Apa bedanya reksa dana sama saham?" },
];

async function parseWithGemini(userMessage) {
    const prompt = `
Kamu adalah WangkuAI, asisten keuangan jenius.
Tugasmu adalah membedah pesan user dan mengembalikan 100% RAW JSON tanpa markdown block/teks apapun.

Data Saldo User saat ini: Rp 1500000

Struktur JSON Wajib:
{
  "intent": "transaction" | "check_balance" | "check_month" | "check_today" | "check_history" | "check_date" | "check_range" | "set_limit" | "set_balance" | "clear_today" | "insight_category_spending" | "financial_health_check" | "spending_prediction" | "comparison_period" | "goal_tracking" | "recommendation_engine" | "anomaly_detection" | "set_goal" | "deposit_saving" | "knowledge",
  "replyText": "Respon singkat",
  "transactions": [
    {
      "type": "expense" | "income",
      "amount": <angka bulat murni>,
      "description": "Deskripsi singkat item",
      "category": "Kategori relevan"
    }
  ],
  "goalAmount": <angka bulat>,
  "depositAmount": <angka bulat>,
  "dateStr": "YYYY-MM-DD",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "limitAmount": <angka bulat murni>,
  "balanceAmount": <angka bulat murni>,
  "isMixed": boolean
}

ATURAN INTENT BARU:
- "check_date": user menanyakan pengeluaran tanggal spesifik -> isikan dateStr
- "check_range": user menanyakan rentang tanggal -> isikan startDate & endDate
- "set_limit": user set budget atau limit pengeluaran -> isikan limitAmount
- "set_balance": user menetapkan saldo dompet -> isikan balanceAmount
- "clear_today": user ingin menghapus/mereset transaksi hari ini
- "insight_category_spending": user tanya "paling boros di mana", "kategori terbanyak", "paling banyak habis di apa"
- "financial_health_check": user tanya "keuanganku sehat gak", "aku boros gak", "tipe spender apa aku"
- "spending_prediction": user tanya "bakal habis kapan", "bisa nabung gak bulan ini", "kalau terus kayak gini", "prediksi", "ramal"
- "comparison_period": user bandingkan minggu ini vs lalu, bulan ini vs lalu
- "goal_tracking": user tanya progress tabungan / goal
- "set_goal": user SET target nabung, misal "aku mau nabung 1 juta bulan ini" — isi goalAmount
- "deposit_saving": user MEMASUKKAN/MENABUNG/MENYIMPAN uang — isi depositAmount
- "recommendation_engine": user minta "kasih saran keuangan", "rekomendasi", "analisa keuanganku"
- "anomaly_detection": user tanya tentang pengeluaran tidak biasa / lonjakan hari ini
- "knowledge": pertanyaan umum finansial yang tidak termasuk kategori di atas

ATURAN SUPER KETAT:
1. Jika user mencatat banyak transaksi, masukkan SEMUANYA ke dalam array "transactions".
2. Jangan balasi menggunakan markdown \`\`\`json. Langsung start dengan { dan end dengan }.

Pesan dari user: "${userMessage}"
`;

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 }
        })
    });

    if (!res.ok) throw new Error("Failed: " + res.status);
    const data = await res.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    return JSON.parse(cleanJson);
}

async function runTests() {
    console.log("=== MEMULAI TESTING INTENT GEMINI WANGKU AI ===\n");
    for (const test of testCases) {
        process.stdout.write("Menguji [ " + test.name + " ] ... ");
        try {
            const result = await parseWithGemini(test.text);
            const status = result.intent === test.name.split(" ")[0] ? "✅ PASSED" : "❌ FAILED (Dapetnya: " + result.intent + ")";
            console.log(status);
            if (status.includes("FAILED")) {
                 console.log("   Prompt: " + test.text);
                 console.log("   Output JSON: " + JSON.stringify(result));
            }
        } catch (e) {
            console.log("❌ ERROR:", e.message);
        }
    }
}

runTests();
