'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function VoiceAssistantPage() {
  const { status } = useSession();
  const router = useRouter();

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [botResponse, setBotResponse] = useState('');

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Force browser to load voices early
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    
    // Initialize SpeechRecognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        setTranscript(prev => {
          const newText = currentTranscript.trim();
          return newText;
        });

        // Reset the timeout whenever they speak
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        // Don't send too quickly, wait 2 seconds after they stop talking
        timeoutRef.current = setTimeout(() => {
          if (currentTranscript.trim()) {
            recognition.stop();
            handleSend(currentTranscript.trim());
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = async (text: string) => {
    if (!text || isProcessing) return;
    setIsProcessing(true);
    setTranscript('');
    setBotResponse('');

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      
      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        setBotResponse(data.response);
        speakResponse(data.response);
      } else {
        setBotResponse('Maaf, ada kendala teknis. Coba lagi ya!');
      }
    } catch (error) {
      setBotResponse('Gagal terhubung ke server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string) => {
    // Formatting text agar ramah diucapkan oleh TTS
    let cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ');
    
    // Perbaikan pelafalan nominal dan uang
    cleanText = cleanText.replace(/(?<=\d)\.(?=\d)/g, '');
    cleanText = cleanText.replace(/Rp\.?\s*(\d+)/gi, '$1 rupiah ');
    cleanText = cleanText.replace(/(\d+)\s*k\b/gi, '$1 ribu ');
    cleanText = cleanText.replace(/(\d+)\s*rb\b/gi, '$1 ribu ');
    cleanText = cleanText.replace(/(\d+)\s*jt\b/gi, '$1 juta ');
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      
      const voices = window.speechSynthesis.getVoices();
      const idVoices = voices.filter(v => v.lang.startsWith('id'));
      
      // Cari suara pria (cowo) yang lebih clear dan tegas
      const maleVoice = idVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('ardi') ||
        v.name.toLowerCase().includes('andika') ||
        v.name.toLowerCase().includes('bimo')
      );
      
      // Jika ketemu suara pria spesifik, gunakan. Kalau tidak, pakai suara default ID pertama (seringkali pria).
      if (maleVoice) {
        utterance.voice = maleVoice;
      } else if (idVoices.length > 0) {
        // Fallback ke suara standar, hindari suara 'Gadis'/'Female' jika ada opsi lain
        const nonFemale = idVoices.find(v => !v.name.toLowerCase().includes('gadis') && !v.name.toLowerCase().includes('female'));
        if (nonFemale) utterance.voice = nonFemale;
      }
      
      // Pitch normal/agak rendah untuk suara cowo yang jernih, speed normal
      utterance.pitch = 0.95; 
      utterance.rate = 1.0;
      
      utterance.onend = () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log("Already started");
          }
        }
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        if (recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (e) {}
        }
      }, 3000);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      window.speechSynthesis.cancel(); // Stop any current bot speech
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setBotResponse('');
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.log(e);
      }
    }
  };

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #FFFDE7, #FEF3C7)',
      fontFamily: "'VT323', monospace",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Navbar */}
      <nav style={{
        padding: '20px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: '#FFFFFF',
          border: '4px solid #1C1917',
          boxShadow: '4px 4px 0px #1C1917',
          borderRadius: '4px',
          color: '#1C1917',
          textDecoration: 'none',
          fontFamily: "'Pixelify Sans', sans-serif",
          fontWeight: 700,
          fontSize: '14px'
        }}>
          ← KEMBALI
        </Link>
        <div style={{ fontFamily: "'Pixelify Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#1C1917' }}>
          VOICE ASSISTANT
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        
        {/* Mascot Container */}
        <div 
          onClick={toggleListening}
          style={{ 
            position: 'relative', 
            cursor: 'pointer',
            transition: 'transform 0.2s',
            transform: isListening ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          <style>{`
            @keyframes blinkMascot {
              0%, 100% { opacity: 1; filter: drop-shadow(0 0 15px rgba(250, 204, 21, 0.8)); transform: scale(1); }
              50% { opacity: 0.85; filter: drop-shadow(0 0 35px rgba(234, 88, 12, 0.9)); transform: scale(1.02); }
            }
            @keyframes pulseGlow {
              0% { transform: scale(0.9); opacity: 0.5; }
              50% { transform: scale(1.3); opacity: 0.8; }
              100% { transform: scale(0.9); opacity: 0.5; }
            }
            .mascot-speaking {
              animation: blinkMascot 1s infinite alternate ease-in-out;
            }
            .mascot-processing {
              animation: blinkMascot 0.4s infinite alternate ease-in-out;
            }
          `}</style>
          
          {/* Background Glow */}
          {isListening && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '180px',
              height: '180px',
              marginLeft: '-90px',
              marginTop: '-90px',
              background: 'radial-gradient(circle, rgba(234,88,12,0.4) 0%, rgba(250,204,21,0) 70%)',
              borderRadius: '50%',
              zIndex: 0,
              animation: 'pulseGlow 2s infinite ease-in-out',
              pointerEvents: 'none'
            }} />
          )}

          {/* Mascot Image */}
          <img 
            src="/img/robot-cat.png" 
            alt="MinoAI Voice Mascot" 
            className={(isListening && transcript) ? 'mascot-speaking' : isProcessing ? 'mascot-processing' : ''}
            style={{ 
              height: '240px', 
              width: 'auto', 
              imageRendering: 'pixelated', 
              filter: isListening ? 'drop-shadow(6px 6px 0px #EA580C)' : 'drop-shadow(6px 6px 0px #1C1917)',
              position: 'relative',
              zIndex: 1,
              transition: 'filter 0.3s'
            }} 
          />
        </div>

        {/* Status Text */}
        <div style={{ marginTop: '30px', textAlign: 'center', height: '100px' }}>
          {isProcessing ? (
            <div style={{ fontSize: '24px', color: '#EA580C', fontWeight: 'bold' }}>Sedang berpikir...</div>
          ) : isListening ? (
            <>
              <div style={{ fontSize: '20px', color: '#065F46', marginBottom: '8px', animation: 'pulseGlow 1.5s infinite' }}>
                🎙️ Mendengarkan...
              </div>
              <div style={{ fontSize: '24px', color: '#1C1917', maxWidth: '600px', margin: '0 auto', minHeight: '40px' }}>
                {transcript || "Katakan sesuatu..."}
              </div>
            </>
          ) : (
            <button 
              onClick={toggleListening}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: '4px solid #1C1917',
                boxShadow: '4px 4px 0px #1C1917',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '22px',
                fontFamily: "'VT323', monospace",
                cursor: 'pointer',
                transition: 'transform 0.1s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translate(2px, 2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translate(0px, 0px)'}
            >
              Mulai Bicara
            </button>
          )}
        </div>

        {/* Bot Response Box */}
        {botResponse && !isListening && !isProcessing && (
          <div style={{
            marginTop: '20px',
            background: 'rgba(255,255,255,0.8)',
            border: '4px solid #1C1917',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '8px 8px 0px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '-15px', 
              left: '20px', 
              background: '#FBBF24', 
              border: '3px solid #1C1917', 
              padding: '2px 10px', 
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              MinoAI merespon:
            </div>
            <div 
              style={{ fontSize: '22px', lineHeight: '1.4', color: '#1C1917' }}
              dangerouslySetInnerHTML={{ __html: botResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
