'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function PredictPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d')!;

    // Dummy data: Past 7 days (Actual) + Next 7 days (Predicted)
    const labels = [
      'H-7', 'H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'Hari Ini',
      'H+1', 'H+2', 'H+3', 'H+4', 'H+5', 'H+6', 'H+7'
    ];

    const actualData = [150000, 200000, 120000, 180000, 300000, 140000, 210000, null, null, null, null, null, null, null];
    // Connecting line from today to tomorrow
    const predictData = [null, null, null, null, null, null, 210000, 190000, 240000, 160000, 130000, 280000, 170000, 200000];

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Aktual',
            data: actualData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#1C1917',
            pointBorderWidth: 2,
            pointRadius: 4,
          },
          {
            label: 'Prediksi LSTM (Dummy)',
            data: predictData,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            borderDash: [5, 5],
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#1C1917',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(28, 25, 23, 0.1)' },
            ticks: { color: '#1C1917', font: { family: "'VT323', monospace", size: 16 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#1C1917', font: { family: "'VT323', monospace", size: 16 } }
          }
        },
        plugins: {
          legend: { position: 'top', labels: { font: { family: "'Pixelify Sans', sans-serif", size: 14 }, color: '#1C1917' } },
        }
      }
    });

    return () => chartRef.current?.destroy();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&family=VT323&family=Inter:wght@400;500;600;700&display=swap');
        html, body { 
          overflow-y: auto !important; 
          background: #FFFDE7; 
          margin: 0; 
          padding: 0; 
          font-family: 'Inter', system-ui, sans-serif; 
        }
        
        /* Transparent Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15); 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3); 
        }

        .pred-card {
          background: #FFFFFF;
          border: 4px solid #1C1917;
          border-radius: 8px;
          box-shadow: 6px 6px 0px #1C1917;
          padding: 24px;
          transition: transform 0.1s;
        }
        .pred-card:hover { transform: translate(2px, 2px); box-shadow: 4px 4px 0px #1C1917; }
        
        .header-box {
          background: #8b5cf6;
          border: 4px solid #1C1917;
          border-radius: 8px;
          box-shadow: 8px 8px 0px #1C1917;
          padding: 28px;
          margin-bottom: 32px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .glass-tag {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          border: 2px solid white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 12px;
          font-family: 'VT323', monospace;
          letter-spacing: 1px;
        }
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #1C1917;
          color: #FFFDE7;
          text-decoration: none;
          border: 3px solid #1C1917;
          border-radius: 4px;
          box-shadow: 4px 4px 0 #FF8F00;
          font-weight: bold;
          font-family: 'Inter', system-ui, sans-serif;
          transition: all 0.1s ease;
        }
        .btn-back:hover {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #FF8F00;
        }
        h1, h2, h3 { font-family: 'Pixelify Sans', sans-serif; }
      `}</style>

      <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#1C1917' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <Link href="/" className="btn-back">
              ← Kembali ke WangkuAI Chat
            </Link>
          </div>
          
          <div className="header-box">
            <div className="glass-tag">FITUR DUMMY</div>
            <h1 style={{ margin: 0, fontSize: '32px', filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.5))' }}>Prediksi AI berbasis LSTM</h1>
            <p style={{ marginTop: '12px', fontSize: '16px', fontWeight: 500, lineHeight: '1.6', filter: 'drop-shadow(1px 1px 0 rgba(0,0,0,0.3))' }}>
              Halaman ini mengilustrasikan hasil integrasi model Machine Learning Time-Series (LSTM). AI mempelajari pola historik belanja kamu, lalu memperkirakan fluktuasi pengeluaran dan pos mana saja yang terindikasi bocor 7 hari ke depan.
            </p>
          </div>

          <div className="pred-card" style={{ marginBottom: '32px' }}>
            <h2 style={{ marginBottom: '6px', color: '#1C1917', fontSize: '22px' }}>Tren Pengeluaran 7 Hari Kedepan</h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', letterSpacing: '0.5px' }}>Prediksi fluktuasi harian menggunakan data seminggu terakhir. (Data Sintetis/Buatan)</p>
            <div style={{ height: '360px', position: 'relative' }}>
              <canvas ref={canvasRef}></canvas>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            <div className="pred-card" style={{ background: '#FFCA28' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
                Analisis AI LSTM
              </h3>
              <p style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 500 }}>
                Berdasarkan pola historik (seasonal mingguan), diprediksi akan ada <strong style={{ color: '#dc2626' }}>lonjakan sebesar Rp280.000 pada H+5</strong> yang kemungkinan besar ada hubungannya dengan akhir pekan. Sebaiknya Anda mengerem pengeluaran di H+4.
              </p>
            </div>

            <div className="pred-card" style={{ background: '#f472b6' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
                Estimasi Pos Terbesar
              </h3>
              <ul style={{ fontSize: '15px', lineHeight: '1.8', listStyle: 'none', padding: 0, fontWeight: 500 }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed rgba(28,25,23,0.3)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span>Makan & Minum</span> <strong style={{ color: '#1C1917', fontFamily: "'VT323', monospace", fontSize:'18px' }}>Rp 450.000</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed rgba(28,25,23,0.3)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span>Belanja</span> <strong style={{ color: '#1C1917', fontFamily: "'VT323', monospace", fontSize:'18px' }}>Rp 320.000</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                  <span>Hiburan</span> <strong style={{ color: '#1C1917', fontFamily: "'VT323', monospace", fontSize:'18px' }}>Rp 200.000</strong>
                </li>
              </ul>
            </div>
            
          </div>

        </div>
      </div>
    </>
  );
}
