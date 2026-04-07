import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "TARUH_API_KEY_DISINI_ATAU_GUNAKAN_ENV";

async function parseWithGemini(userMessage, balance) {
  const prompt = `
Kamu adalah MinoAI, asisten keuangan jenius.
Tugasmu adalah membedah pesan user dan mengembalikan 100% RAW JSON tanpa markdown block/teks apapun.

Data Saldo User saat ini: Rp ${balance}

Struktur JSON Wajib:
{
  "intent": "transaction" | "check_balance" | "check_month" | "check_today" | "check_history" | "check_date" | "check_range" | "set_limit" | "set_balance" | "clear_today" | "insight_category_spending" | "financial_health_check" | "spending_prediction" | "comparison_period" | "goal_tracking" | "recommendation_engine" | "anomaly_detection" | "set_goal" | "deposit_saving" | "knowledge",
  "replyText": "Respon singkat bergaya gaul dan penyemangat khas asisten AI (MinoAI)",
  "transactions": [
    {
      "type": "expense" | "income",
      "amount": <angka bulat murni, misal 1.5 juta = 1500000>,
      "description": "Deskripsi singkat item",
      "category": "Kategori relevan"
    }
  ],
  "goalAmount": <angka bulat jika user menyebut goal tabungan, misal 1000000>,
  "depositAmount": <angka bulat jika user menabung/menyimpan uang, misal 50000>,
  "dateStr": "YYYY-MM-DD jika user menanyakan tanggal spesifik (isikan untuk intent check_date)",
  "startDate": "YYYY-MM-DD (isikan untuk intent check_range)",
  "endDate": "YYYY-MM-DD (isikan untuk intent check_range)",
  "limitAmount": <angka bulat murni, jika user mengatur budget harian. isikan untuk intent set_limit>,
  "balanceAmount": <angka bulat murni, jika user mengatur saldo awal dompet. isikan untuk intent set_balance>,
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
- "spending_prediction": user tanya "bakal habis kapan", "bisa nabung gak bulan ini", "kalau terus kayak gini"
- "comparison_period": user bandingkan minggu ini vs lalu, bulan ini vs lalu
- "goal_tracking": user tanya progress tabungan / goal
- "set_goal": user SET target nabung, misal "aku mau nabung 1 juta bulan ini" — isi goalAmount
- "deposit_saving": user MEMASUKKAN/MENABUNG/MENYIMPAN uang, misal "simpan 50rb untuk tabungan", "menabung 50rb hari ini" — isi depositAmount
- "recommendation_engine": user minta "kasih saran keuangan", "rekomendasi", "analisa keuanganku"
- "anomaly_detection": user tanya tentang pengeluaran tidak biasa / lonjakan hari ini
- "knowledge": pertanyaan umum finansial yang tidak termasuk kategori di atas

ATURAN SUPER KETAT:
1. Jika user mencatat banyak transaksi, masukkan SEMUANYA ke dalam array "transactions".
2. Bisa jadi dalam satu kalimat ada pemasukan (income) dan pengeluaran (expense). Pisahkan dengan tepat di "type".
3. Perhatikan singkatan: 5.5 juta = 5500000, 450 ribu = 450000.
4. Jangan balasi menggunakan markdown \`\`\`json. Langsung start dengan { dan end dengan }.

Pesan dari user: "${userMessage}"
`;

  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });

    if (!res.ok) {
      throw new Error('API Error: ' + await res.text());
    }

    const data = await res.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    return { error: err.message };
  }
}

async function runTests() {
  const content = fs.readFileSync(path.join(__dirname, 'testing-prompts.md'), 'utf8');
  const lines = content.split('\n');

  let currentIntent = null;
  const tests = [];
  const intentCounts = {};

  for (const line of lines) {
    const intentMatch = line.match(/###.*`([a-z_]+)`/);
    if (intentMatch) {
      currentIntent = intentMatch[1];
    }
    
    let expected = currentIntent;
    if (expected && expected.toLowerCase() === 'mixed') expected = 'transaction';
    if (expected && expected.toLowerCase() === 'edge_cases') continue;

    if (currentIntent && line.startsWith('|') && !line.includes('---') && !line.includes('Prompt')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        let promptText = parts[2];
        const promptMatch = promptText.match(/`(.+?)`/);
        if (promptMatch) {
          // Hanya ambil 1 test per intent biar tidak kena limit API (15/menit)
          if (!intentCounts[expected]) {
            tests.push({
              id: parts[1],
              prompt: promptMatch[1],
              expected: expected
            });
            intentCounts[expected] = 1;
          }
        }
      }
    }
  }

  console.log('Running ' + tests.length + ' tests (1 per intent)...');
  
  const score = { total: 0, passed: 0, failed: [] };

  for (const test of tests) {
    let expected = test.expected;
    console.log('[Testing] ' + test.id + ': "' + test.prompt + '" -> Expecting: ' + expected);
    
    await new Promise(r => setTimeout(r, 4000)); // Delay 4 detik untuk API rate limit (15 RPM)

    const result = await parseWithGemini(test.prompt, 1500000);
    
    if (result.error) {
      console.error('  ❌ Error: ' + result.error);
      score.failed.push({ test, result: 'ERROR' });
    } else {
      let gotIntent = result.intent;
      
      if (gotIntent === expected) {
        console.log('  ✅ Pass (got: ' + gotIntent + ')');
        score.passed++;
      } else {
        console.log('  ❌ FAIL (Expected ' + expected + ', Got ' + gotIntent + ')');
        score.failed.push({ test, result: gotIntent, full: result });
      }
    }
    score.total++;
  }

  console.log('\n========= TEST RESULTS =========');
  console.log('Score: ' + score.passed + '/' + score.total + ' (' + Math.round(score.passed/score.total*100) + '%)');
  
  if (score.failed.length > 0) {
    console.log('\nFailed Tests:');
    for (const f of score.failed) {
      console.log('- ' + f.test.id + ': "' + f.test.prompt + '" => Expected: ' + f.test.expected + ', Got: ' + f.result);
      if (f.full && f.full.transactions && f.full.transactions.length > 0) {
          console.log('  => transactions: ', JSON.stringify(f.full.transactions));
      }
    }
  }
}

runTests().catch(console.error);
