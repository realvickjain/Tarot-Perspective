
import React, { useState, useEffect, useRef } from 'react';
import { Category, Interpretation, AppStep, Spread, CardPull, User } from './types.ts';
import { CATEGORIES, DECK } from './constants.ts';
import { selectSpread, getDetailedInterpretation } from './services/geminiService.ts';
import Card from './components/Card.tsx';

/**
 * 🛠️ GOOGLE AUTH SETUP GUIDE:
 * 1. Go to: https://console.cloud.google.com/apis/credentials
 * 2. Click your OAuth 2.0 Client ID (e.g., "Web client 1").
 * 3. Find "Authorized JavaScript origins" section.
 * 4. Add this EXACT URL: {window.location.origin}
 */
const GOOGLE_CLIENT_ID = "32307401126-1j9oqpbf9eg7gi9a9qqdak8kp9sgo2mn.apps.googleusercontent.com";

const EXAMPLES: Record<string, string[]> = {
  'Love': [
    "How can I improve communication in my current relationship?",
    "What should I focus on to attract a healthy partnership?",
    "How can I better balance my personal needs with my partner's?",
    "What energy is currently surrounding my romantic life?"
  ],
  'Career': [
    "I'm feeling stagnant at work, what should be my next move?",
    "What qualities should I bring to my new project?",
    "How can I navigate the upcoming changes in my team?",
    "What's the best approach for my next performance review?"
  ],
  'Money': [
    "What's a healthy way to approach my financial goals this month?",
    "How can I change my mindset regarding abundance and scarcity?",
    "What should I consider before making a large purchase?",
    "What is a practical way to manage my current financial stress?"
  ],
  'General Guidance': [
    "What energy should I focus on for the upcoming week?",
    "What's a constructive way to handle my current feeling of being 'stuck'?",
    "How can I find more peace in my daily routine?",
    "What part of my self-growth needs my attention right now?"
  ]
};

function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [category, setCategory] = useState<Category | null>(CATEGORIES[0]);
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [pulls, setPulls] = useState<CardPull[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const googleBtnContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('perspective_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    console.log("👉 ADD THIS TO AUTHORIZED ORIGINS IN GOOGLE CONSOLE:", window.location.origin);
  }, []);

  useEffect(() => {
    const g = (window as any).google;
    if (g && GOOGLE_CLIENT_ID) {
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });
    }
  }, []);

  useEffect(() => {
    const g = (window as any).google;
    if (showLoginOverlay && googleBtnContainer.current && g) {
      g.accounts.id.renderButton(
        googleBtnContainer.current,
        { theme: "outline", size: "large", width: "100%", shape: "pill" }
      );
    }
  }, [showLoginOverlay]);

  const handleGoogleCredentialResponse = (response: any) => {
    const payload = decodeJwt(response.credential);
    if (payload) {
      const realUser: User = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      };
      setUser(realUser);
      localStorage.setItem('perspective_user', JSON.stringify(realUser));
      setShowLoginOverlay(false);
      if (step === AppStep.SELECTION && flippedIndices.size === (selectedSpread?.positions.length || 0)) {
        handleGetInterpretation();
      }
    }
  };

  const handleCategorySelect = (cat: Category) => setCategory(cat);
  const handleTryExample = () => {
    if (!category) return;
    const options = EXAMPLES[category] || EXAMPLES['General Guidance'];
    setQuestion(options[Math.floor(Math.random() * options.length)]);
  };

  const handleAnalyzeSpread = async () => {
    if (!category) return;
    setStep(AppStep.ANALYZING_SPREAD);
    try {
      const spread = await selectSpread(category, question);
      const shuffled = [...DECK].sort(() => 0.5 - Math.random());
      const initialPulls = spread.positions.map((pos, idx) => ({ position: pos, card: shuffled[idx] }));
      setSelectedSpread(spread);
      setPulls(initialPulls);
      setStep(AppStep.SELECTION);
    } catch (error) {
      console.error(error);
      setStep(AppStep.LANDING);
    }
  };

  const toggleCard = (index: number) => {
    const newFlipped = new Set(flippedIndices);
    newFlipped.has(index) ? newFlipped.delete(index) : newFlipped.add(index);
    setFlippedIndices(newFlipped);
  };

  const allFlipped = selectedSpread ? flippedIndices.size === selectedSpread.positions.length : false;

  const initiateInterpretation = async () => {
    if (!user) {
      setShowLoginOverlay(true);
      return;
    }
    handleGetInterpretation();
  };

  const handleGetInterpretation = async () => {
    setStep(AppStep.LOADING_INTERPRETATION);
    setEmailStatus('sending');
    try {
      const result = await getDetailedInterpretation(category!, question, selectedSpread!, pulls);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setInterpretation(result);
      setEmailStatus('sent');
      setStep(AppStep.RESULT);
    } catch (error) {
      console.error(error);
      setStep(AppStep.SELECTION);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('perspective_user');
    reset();
  };

  const reset = () => {
    setStep(AppStep.LANDING);
    setCategory(CATEGORIES[0]);
    setQuestion('');
    setSelectedSpread(null);
    setPulls([]);
    setFlippedIndices(new Set());
    setInterpretation(null);
    setEmailStatus('idle');
  };

  return (
    <div className="relative min-h-screen py-6 px-4 md:px-12 flex flex-col items-center">
      <header className="w-full max-w-4xl flex justify-between items-center mb-12 py-4">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={reset}>
          <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
            <span className="text-indigo-600 text-2xl">✦</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-xl leading-none tracking-tight">Perspective</h1>
            <span className="text-white/70 text-[11px] uppercase tracking-[0.2em] font-bold mt-1.5">Intelligent Archetypes</span>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <button onClick={reset} className="hidden sm:block text-white/80 hover:text-white text-sm font-semibold transition-colors">Start New Reading</button>
          {user ? (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-1.5 pr-4 rounded-2xl border border-white/20">
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-xl shadow-lg" referrerPolicy="no-referrer" />
              <div className="flex flex-col">
                <span className="text-white text-[10px] font-bold leading-tight">{user.name}</span>
                <button onClick={handleLogout} className="text-white/50 text-[9px] font-bold uppercase hover:text-white text-left">Logout</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowLoginOverlay(true)} className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-5 rounded-xl border border-white/20 transition-all">Sign In</button>
          )}
        </nav>
      </header>

      <div className="w-full flex justify-center items-start">
        <main className="w-full max-w-[800px] bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-14 animate-fadeIn transition-all duration-500 min-h-[600px] flex flex-col relative overflow-hidden">
          {step === AppStep.LANDING ? (
            <div className="space-y-12 animate-fadeIn">
              <section>
                <div className="mb-10 text-center sm:text-left">
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Find your center.</h2>
                  <p className="text-slate-500 mt-3 text-lg font-medium leading-relaxed">A modern mirror for your thoughts, blending timeless symbolism with intelligent reflection.</p>
                </div>
                <label className="block text-slate-800 font-bold text-sm mb-5">Which area of your life should we explore?</label>
                <div className="flex flex-wrap gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => handleCategorySelect(cat)} className={`flex-1 min-w-[100px] py-4 px-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${category === cat ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                      <span className={`w-2 h-2 rounded-full transition-all ${category === cat ? 'bg-indigo-500 scale-100' : 'bg-transparent scale-0'}`}></span>
                      {cat}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <div className="flex justify-between items-end mb-4">
                  <label className="block text-slate-800 font-bold text-sm">Provide some context (Optional)</label>
                  <button onClick={handleTryExample} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Try example
                  </button>
                </div>
                <div className="relative">
                  <textarea value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 300))} placeholder="Briefly share what's on your mind right now..." className="w-full p-6 h-56 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 outline-none transition-all resize-none text-slate-700 placeholder:text-slate-300 font-medium leading-relaxed shadow-inner" />
                  <div className="absolute bottom-6 right-8 text-[10px] font-bold text-slate-300 tracking-widest uppercase">{question.length}/300</div>
                </div>
              </section>
              <button disabled={!category} onClick={handleAnalyzeSpread} className={`w-full py-6 rounded-2xl font-bold text-base transition-all shadow-xl flex items-center justify-center gap-2 group mt-4 ${category ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Generate Perspective</button>
            </div>
          ) : step === AppStep.ANALYZING_SPREAD ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 animate-fadeIn">
              <div className="w-16 h-16 border-[5px] border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
              <h3 className="text-xl font-bold text-slate-800">Reviewing patterns...</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs text-center font-medium">Selecting a spread structure that best suits your inquiry.</p>
            </div>
          ) : step === AppStep.SELECTION && selectedSpread ? (
            <div className="animate-fadeIn space-y-12 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button onClick={reset} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  Cancel
                </button>
                <div className="text-center">
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedSpread.name}</h3>
                  <p className="text-slate-400 text-sm mt-1 font-medium">{selectedSpread.description}</p>
                </div>
                <div className="hidden sm:block w-16"></div>
              </div>
              <div className="flex-1 flex flex-wrap justify-center items-center gap-6 md:gap-10 py-10">
                {pulls.map((pull, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500 mb-5 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm">{pull.position.title}</span>
                    <Card card={pull.card} isFlipped={flippedIndices.has(idx)} isDimmed={false} onSelect={() => toggleCard(idx)} disabled={false} />
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <button disabled={!allFlipped} onClick={initiateInterpretation} className={`w-full py-6 rounded-2xl font-bold text-base transition-all shadow-xl flex items-center justify-center gap-2 ${allFlipped ? 'bg-indigo-600 text-white hover:bg-indigo-700 animate-pulse shadow-indigo-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>Get Detailed Guidance</button>
                {!allFlipped && <p className="text-center text-slate-400 text-xs mt-4 italic font-bold tracking-wide">Please reveal all cards to proceed.</p>}
              </div>
            </div>
          ) : step === AppStep.LOADING_INTERPRETATION ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 animate-fadeIn">
              <div className="w-16 h-16 border-[5px] border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
              <h3 className="text-xl font-bold text-slate-800">Synthesizing Archetypes...</h3>
              <p className="text-slate-400 text-sm mt-2 font-medium">Crafting a grounded reflection based on your unique pull.</p>
              <div className="mt-12 flex items-center gap-2 px-6 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className={`w-2 h-2 rounded-full bg-indigo-500 ${emailStatus === 'sending' ? 'animate-pulse' : ''}`}></div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{emailStatus === 'sending' ? 'Delivering copy to your inbox...' : 'Email delivery prepared'}</span>
              </div>
            </div>
          ) : step === AppStep.RESULT && interpretation ? (
            <div className="animate-fadeIn space-y-10 flex-1 flex flex-col">
              <div className="flex justify-between items-start border-b border-slate-100 pb-12">
                <h2 className="text-4xl font-extrabold text-slate-900 leading-[1.15] italic tracking-tight flex-1">"{interpretation.summary}"</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {interpretation.details.map((detail, idx) => {
                  const pull = pulls.find(p => p.position.title === detail.positionTitle);
                  return (
                    <div key={idx} className="p-8 bg-slate-50/40 rounded-[2rem] border border-slate-100 flex gap-6 items-start transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-100 group">
                      <img src={pull?.card.image} className="w-20 h-32 object-cover rounded-2xl shadow-xl shrink-0 grayscale-[0.2] transition-all group-hover:grayscale-0" alt={pull?.card.name} />
                      <div>
                        <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-2">{detail.positionTitle}</h4>
                        <p className="text-slate-800 text-sm font-bold leading-relaxed mb-2 tracking-tight">{pull?.card.name}</p>
                        <p className="text-slate-500 text-[13px] font-medium leading-relaxed">{detail.insight}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mt-8">
                <div className="relative z-10">
                  <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-5">Primary Mindset Shift</h3>
                  <p className="text-2xl md:text-3xl font-light leading-snug tracking-tight">{interpretation.finalGuidance}</p>
                </div>
                <div className="absolute top-0 right-0 p-10 text-indigo-500 opacity-[0.03] text-[15rem] font-serif italic select-none">“</div>
              </div>
              <div className="mt-auto pt-12">
                <button onClick={reset} className="w-full py-6 border-2 border-slate-100 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:text-slate-600 hover:border-slate-200 transition-all">Clear and Start Fresh</button>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {showLoginOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/40 backdrop-blur-md p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-[440px] rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(30,27,75,0.4)] overflow-hidden">
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                <svg viewBox="0 0 24 24" className="w-8 h-8">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Save your perspective</h3>
              <p className="text-slate-500 mt-4 text-sm font-medium leading-relaxed">Sign in to archive this reading and receive a detailed breakdown in your inbox.</p>

              <div className="w-full mt-10">
                <div ref={googleBtnContainer}></div>
              </div>

              <button onClick={() => setShowLoginOverlay(false)} className="mt-6 text-slate-400 text-[11px] font-bold uppercase tracking-widest hover:text-indigo-600 transition-colors">Continue as Guest</button>
            </div>
            <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
              <p className="text-[10px] text-slate-400 leading-relaxed px-4">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          </div>
        </div>
      )}
      <footer className="mt-20 py-10 text-white/40 text-[11px] font-bold uppercase tracking-[0.25em] text-center w-full max-w-6xl">
        <p>&copy; 2025 Perspective • Grounded Archetypal Intelligence</p>
      </footer>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
