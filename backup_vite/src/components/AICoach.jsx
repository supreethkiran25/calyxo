import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Sparkles, Settings, Key, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { getUserProfile, getWaterIntake } from '../dbService';

function AICoach({ userId, foodLogs, workoutLogs }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Yo! I'm Calyxo, your AI Fitness & Diet Coach. ⚡ I have scanned your biometric logs and intake metrics. Drop any questions about recipes, customized training adjustments, or recovery!",
      timestamp: Date.now()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  
  // API Key & Demo settings
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('calyxo_gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(!import.meta.env.VITE_GEMINI_API_KEY && !localStorage.getItem('calyxo_gemini_api_key'));
  const [profile, setProfile] = useState(null);
  const [waterIntake, setWaterIntake] = useState(0);

  const messagesEndRef = useRef(null);

  // Load User profile and metrics context
  useEffect(() => {
    const loadContextData = async () => {
      if (!userId) return;
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
      
      const water = await getWaterIntake(userId);
      setWaterIntake(water || 0);
    };
    loadContextData();
  }, [userId, foodLogs, workoutLogs]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Save API Key
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    if (cleanKey) {
      localStorage.setItem('calyxo_gemini_api_key', cleanKey);
      setApiKey(cleanKey);
      setIsDemoMode(false);
      setShowSettings(false);
      
      // Notify user inside chat
      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: 'system',
          text: "Gemini API Key activated successfully. Personalized live coaching enabled! 🚀",
          timestamp: Date.now()
        }
      ]);
    } else {
      localStorage.removeItem('calyxo_gemini_api_key');
      setApiKey('');
      setIsDemoMode(true);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('calyxo_gemini_api_key');
    setApiKey('');
    setIsDemoMode(true);
    setShowSettings(false);
    setMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'system',
        text: "API Key removed. Reverted to Demo Simulation Mode.",
        timestamp: Date.now()
      }
    ]);
  };

  // Compile prompt context from logs
  const compileContext = () => {
    // 1. Gather nutrition aggregates
    const totalCal = foodLogs.reduce((sum, x) => sum + x.calories, 0);
    const totalProt = foodLogs.reduce((sum, x) => sum + x.protein, 0);
    const totalCarb = foodLogs.reduce((sum, x) => sum + x.carbs, 0);
    const totalFat = foodLogs.reduce((sum, x) => sum + x.fat, 0);

    // 2. Gather profile details
    const gender = profile?.gender || 'male';
    const age = profile?.age || 25;
    const units = profile?.units || 'metric';
    const weightVal = profile?.weight || 70;
    const heightVal = profile?.height || 175;
    const goal = profile?.goal || 'lose';

    // 3. Estimate calorie & macro goals
    const isImperial = units === 'imperial';
    let weightKg = weightVal;
    let heightCm = heightVal;
    if (isImperial) {
      weightKg = weightVal / 2.20462;
      heightCm = heightVal * 2.54;
    }
    const heightMeters = heightCm / 100;
    const bmi = (weightKg / (heightMeters * heightMeters)).toFixed(1);
    
    let bmr = 0;
    if (gender === 'male') {
      bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5);
    } else {
      bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
    }
    const activity = profile?.activity || 1.55;
    const tdee = Math.round(bmr * activity);
    let calorieGoal = tdee;
    if (goal === 'lose') calorieGoal = tdee - 500;
    else if (goal === 'gains') calorieGoal = tdee + 350;
    calorieGoal = Math.max(calorieGoal, gender === 'male' ? 1500 : 1200);

    let proteinTarget = Math.round(weightKg * 2.0);
    proteinTarget = Math.min(Math.max(proteinTarget, 80), 220);
    let fatTarget = Math.round((calorieGoal * 0.25) / 9);
    let carbsTarget = Math.round((calorieGoal - (proteinTarget * 4) - (fatTarget * 9)) / 4);

    // 4. Formulate food details
    const foodListStr = foodLogs.length > 0
      ? foodLogs.map(f => `- ${f.name}: ${f.calories} kcal (Portion: ${f.portionWeight}g, P: ${f.protein}g, C: ${f.carbs}g, F: ${f.fat}g)`).join('\n')
      : 'No foods logged yet today.';

    // 5. Formulate workout details
    const workoutListStr = workoutLogs.length > 0
      ? workoutLogs.map(w => `- ${w.name} (${w.category}): ${w.category === 'Cardio' ? `${w.duration} mins` : `${w.sets} sets x ${w.reps} reps @ ${w.weight}kg`}`).join('\n')
      : 'No workouts logged yet today.';

    return {
      biometrics: `Gender: ${gender}, Age: ${age}, Weight: ${weightVal} ${isImperial ? 'lbs' : 'kg'}, Height: ${heightVal} ${isImperial ? 'in' : 'cm'}, Goal: ${goal === 'lose' ? 'Caloric Deficit (Weight Loss)' : goal === 'gains' ? 'Lean Gains (Muscle Building)' : 'Maintenance'}`,
      targets: `Calories: ${calorieGoal} kcal, Protein: ${proteinTarget}g, Carbs: ${carbsTarget}g, Fat: ${fatTarget}g`,
      consumed: `Calories: ${totalCal} kcal, Protein: ${totalProt.toFixed(1)}g, Carbs: ${totalCarb.toFixed(1)}g, Fat: ${totalFat.toFixed(1)}g`,
      water: `${waterIntake} ml`,
      bmi: `${bmi}`,
      foodListStr,
      workoutListStr
    };
  };

  // Pre-compiled simulated response fallback for Demo Mode
  const getSimulatedResponse = (userQuery) => {
    const q = userQuery.toLowerCase();
    const stats = compileContext();
    
    if (q.includes('recipe') || q.includes('eat') || q.includes('food') || q.includes('diet') || q.includes('protein')) {
      return `### Calyxo Diet Suggestion (Demo Mode) 🍳
Based on your goal of **${profile?.goal === 'lose' ? 'Fat Loss' : 'Muscle Gain'}** and your biological profile, here is a premium recipe:

**High-Protein Moong Dal Cheela (Lentil Pancake)**
* **Calories:** ~340 kcal
* **Macros:** Protein: 22g | Carbs: 45g | Fat: 6g
* **Ingredients:** Sprouted moong dal, ginger, green chili, spinach, and a filling of low-fat paneer (50g).
* **Why it fits:** It contains structural protein to support lean retention while keeping calories moderate.

*Your Stats Today:* You have consumed **${stats.consumed}** out of target **${stats.targets}**. Adding this Cheela fits perfectly! Try log it under custom food.`;
    }

    if (q.includes('workout') || q.includes('exercise') || q.includes('routine') || q.includes('training') || q.includes('leg') || q.includes('push') || q.includes('pull')) {
      return `### Calyxo Training Routine (Demo Mode) 🏋️
Here is a target adjustment for your training split matching your active metrics:

**Progressive Overload Set Booster**
1. **Focus Compound Lift:** Perform 4 sets of compound movement (e.g. Squat or Bench) using a weight that limits you to 8 reps.
2. **Tempo Work:** Spend 3 seconds lowering the weight, hold for 1 second at the bottom stretch, then push explosively.
3. **Finish with Isometric Holds:** End sets with a 10-second contraction hold.

*Coach Advice:* Make sure to log this routine in the **Workout Logger** to track your progressive overload logs.`;
    }

    if (q.includes('recovery') || q.includes('water') || q.includes('sore') || q.includes('sleep')) {
      return `### Recovery & Hydration Coach (Demo Mode) 💧
Your logged hydration status is **${stats.water}** today.
* **Target:** Minimum 3,000 ml.
* **Hydration Tip:** Drink 500ml water immediately upon waking, and 250ml during workouts to avoid lactic acid accumulation.
* **Soreness Fix:** Perform active static stretches (15 mins) focusing on the lower back and hamstrings. Take a warm shower with Epsom salts to relax muscle fibers.`;
    }

    return `### Calyxo Fitness Coach (Demo Mode) 🤖
I'm running in offline simulator mode since no Gemini API Key is saved.
* **My biometrics scan of you:** BMI: **${stats.bmi}** | Goal: **${profile?.goal || 'Lose weight'}**.
* **Logged Nutrition:** ${stats.consumed}.
* **Advice:** To get live, hyper-customized coaching responses, add your Gemini API Key by clicking the **Settings icon** (⚙️) on the top right.
* **Try asking:** "Suggest an Indian recipe" or "What exercises should I do on Push day?" to test other simulated answers!`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMessageText = inputVal.trim();
    setInputVal('');
    
    // Add user message to state
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userMessageText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Context details to inject
    const stats = compileContext();

    if (isDemoMode) {
      // Simulate delay for realism
      setTimeout(() => {
        const botMsg = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: getSimulatedResponse(userMessageText),
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
      }, 1000);
      return;
    }

    // Call live Gemini API
    try {
      const activeKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
      if (!activeKey) throw new Error("No Gemini API Key available.");

      const systemInstruction = `You are Calyxo, a smart, encouraging, and knowledgeable AI fitness & nutrition coach.
You speak in a modern, encouraging, and direct tone (frequently utilizing clean formatting, markdown headings, bullet points, and highlighting key terms).
Here is the user's current physical biometrics and daily activity context:
- Biometrics: ${stats.biometrics}
- Calculated BMI: ${stats.bmi}
- Daily Target Targets: ${stats.targets}
- Today's Consumed Nutrition: ${stats.consumed}
- Today's Water Intake: ${stats.water}
- Today's Logged Foods:
${stats.foodListStr}
- Today's Logged Workouts:
${stats.workoutListStr}

When answering questions:
1. Address the user's specific query.
2. Directly reference their current daily aggregates (e.g. remaining calories, logged workouts, or weight logs) when helpful to give tailored advice.
3. Keep answers structured (use Markdown headings, bold text, lists). Avoid very long dumps of text. Keep it concise.
4. Recommend concrete, practical fitness or nutrition steps. Do not mention API keys or system logs.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessageText }]
            }
          ],
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error?.message || "Gemini API error.");
      }

      const resData = await response.json();
      const textResponse = resData.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate a response. Please try again.";

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: textResponse,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.error("Gemini API calling error", err);
      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Calyxo Connection Error:** ${err.message || "Unable to contact Gemini AI services."}\n\nFalling back to simulated response:\n\n${getSimulatedResponse(userMessageText)}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text) => {
    setInputVal(text);
  };

  const formatMessageText = (text) => {
    // Basic Markdown formatting helper for rendering headings, list items, bold text safely
    return text.split('\n').map((line, idx) => {
      let content = line;
      let className = "text-xs font-normal leading-relaxed text-gray-200";

      // Headings
      if (content.startsWith('### ')) {
        content = content.replace('### ', '');
        className = "text-sm font-bold text-white mt-3 mb-1.5 block";
      } else if (content.startsWith('## ')) {
        content = content.replace('## ', '');
        className = "text-md font-extrabold text-neon-green mt-4 mb-2 block uppercase tracking-wider";
      } else if (content.startsWith('# ')) {
        content = content.replace('# ', '');
        className = "text-lg font-black text-neon-green mt-4 mb-2 block uppercase";
      }

      // Bullet points
      let isBullet = false;
      if (content.trim().startsWith('* ') || content.trim().startsWith('- ')) {
        content = content.trim().replace(/^[\*\-]\s+/, '');
        isBullet = true;
      }

      // Bold replacements (e.g. **text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIdx) {
          parts.push(content.substring(lastIdx, match.index));
        }
        parts.push(<strong key={match.index} className="text-white font-bold">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < content.length) {
        parts.push(content.substring(lastIdx));
      }

      const finalContent = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={idx} className="text-xs text-gray-300 ml-4 list-disc mt-1">
            {finalContent}
          </li>
        );
      }

      return (
        <span key={idx} className={`${className} block`}>
          {finalContent}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] glass rounded-2xl overflow-hidden">
      
      {/* 1. Header Area with Settings toggle */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 bg-white/2 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-neon-green" />
            <div className="absolute w-2.5 h-2.5 bg-neon-green border-2 border-black rounded-full bottom-0 right-0 animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Calyxo Assistant
              <Sparkles className="w-3.5 h-3.5 text-neon-green fill-neon-green/20" />
            </h3>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
              {isDemoMode ? "Demo Mode (Offline Simulator)" : "Live AI Coaching Active"}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${showSettings ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Key Settings Drawer */}
      {showSettings && (
        <div className="px-5 py-4 bg-white/5 border-b border-white/5 space-y-3 relative z-10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neon-green uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Gemini API Key configuration
            </h4>
            <a 
              href="https://aistudio.google.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[10px] text-gray-400 hover:text-white underline"
            >
              Get Free Key
            </a>
          </div>
          <form onSubmit={handleSaveApiKey} className="flex gap-2">
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste AI Studio API Key..."
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-green"
            />
            <button 
              type="submit" 
              className="bg-neon-green text-black font-bold text-[10px] uppercase px-4 py-2 rounded-xl hover:shadow-[0_0_10px_#39ff14] cursor-pointer"
            >
              Save Key
            </button>
          </form>
          {localStorage.getItem('calyxo_gemini_api_key') && (
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Key Stored Locally
              </span>
              <button 
                type="button" 
                onClick={handleClearApiKey}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase"
              >
                Delete Key
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Demo Mode Alert banner */}
      {isDemoMode && !showSettings && (
        <div className="bg-neon-green/5 border-b border-neon-green/10 px-5 py-2 flex items-center justify-between text-[10.5px]">
          <span className="text-gray-300 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-neon-green" />
            Running in simulator fallback. Enter your API key in Settings to link Gemini.
          </span>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-neon-green hover:underline font-bold uppercase text-[9px] tracking-wider"
          >
            Configure
          </button>
        </div>
      )}

      {/* 4. Chat Messages Pane */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[10px] font-semibold tracking-wider text-gray-400 bg-white/5 border border-white/5 rounded-full px-3 py-1 uppercase">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isBot = msg.role === 'assistant';
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                isBot 
                  ? 'bg-neon-green/10 border-neon-green/20 text-neon-green' 
                  : 'bg-white/10 border-white/10 text-white'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs flex flex-col space-y-1 shadow-md border ${
                isBot 
                  ? 'bg-white/3 border-white/5 text-gray-100 rounded-tl-none' 
                  : 'bg-neon-green text-black border-neon-green/20 rounded-tr-none font-medium'
              }`}>
                <div className={isBot ? 'space-y-1' : ''}>
                  {isBot ? formatMessageText(msg.text) : msg.text}
                </div>
                <span className={`text-[8px] mt-2 block text-right font-medium opacity-60 ${isBot ? 'text-gray-500' : 'text-black/60'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white/3 border border-white/5 rounded-tl-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 5. Quick suggestion chips */}
      {messages.length === 1 && !loading && (
        <div className="px-5 py-2.5 flex gap-2 overflow-x-auto border-t border-white/5 bg-white/1 scrollbar-none">
          <button 
            onClick={() => handleSuggestionClick("Suggest an Indian lunch recipe that matches my macros")}
            className="px-3.5 py-2 rounded-full border border-white/10 hover:border-neon-green hover:bg-neon-green/5 text-[10px] text-gray-400 hover:text-neon-green font-semibold whitespace-nowrap cursor-pointer transition-all"
          >
            🍳 Suggest Indian Lunch Recipe
          </button>
          <button 
            onClick={() => handleSuggestionClick("What training edits do you suggest for my physical goal?")}
            className="px-3.5 py-2 rounded-full border border-white/10 hover:border-neon-green hover:bg-neon-green/5 text-[10px] text-gray-400 hover:text-neon-green font-semibold whitespace-nowrap cursor-pointer transition-all"
          >
            🏋️ Target Training Tips
          </button>
          <button 
            onClick={() => handleSuggestionClick("How can I recover faster from my leg soreness?")}
            className="px-3.5 py-2 rounded-full border border-white/10 hover:border-neon-green hover:bg-neon-green/5 text-[10px] text-gray-400 hover:text-neon-green font-semibold whitespace-nowrap cursor-pointer transition-all"
          >
            💧 Leg Soreness & Recovery
          </button>
        </div>
      )}

      {/* 6. Input Tray */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/2 flex gap-3">
        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask coach Calyxo about nutrition or training..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-xs text-white focus:outline-none focus:border-neon-green focus:bg-white/10 transition-colors"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !inputVal.trim()}
          className="w-10 h-10 rounded-full bg-neon-green text-black flex items-center justify-center shadow-[0_0_12px_rgba(57,255,20,0.4)] disabled:opacity-50 hover:shadow-[0_0_18px_rgba(57,255,20,0.6)] cursor-pointer shrink-0 transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}

export default AICoach;
