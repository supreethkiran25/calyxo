const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyC_kwCmfgILI3UirtKpyxnhTNDhXMHvsZ4';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const geminiMobileService = {
  async askCoach(userPrompt, context = {}) {
    try {
      const systemInstruction = `You are Calyxo AI Coach, an elite, encouraging fitness and nutrition expert for the Calyxo mobile app. 
Provide concise, direct, actionable, and structured advice tailored to user's goals (Weight loss, muscle gain, energy, performance). Keep responses formatted neatly with bullet points or short paragraphs for mobile screens.`;

      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemInstruction}\n\nUser Profile & State: ${JSON.stringify(context)}\n\nUser Question: ${userPrompt}` }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        return "I'm currently unable to access AI advice right now. Please check your network connection and try again!";
      }
    } catch (error) {
      console.error('Gemini Mobile Service error:', error);
      return "An unexpected error occurred while communicating with Calyxo AI Coach.";
    }
  }
};
