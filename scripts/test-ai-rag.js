

async function testRAG() {
  console.log("=== Testing AI Coach RAG Integration ===");

  const query = "Show me chest exercises using dumbbells.";
  console.log(`Sending query: "${query}"`);

  const payload = {
    query: query,
    context: {
      biometrics: "Gender: male, Age: 25, Weight: 70kg, Height: 175cm",
      bmi: "22.9",
      targets: "Calories: 2000 kcal, Protein: 120g, Carbs: 200g, Fat: 60g",
      consumed: "Calories: 1500 kcal, Protein: 90g, Carbs: 150g, Fat: 45g",
      water: "1500 ml",
      foodListStr: "- Apple: 95 kcal\n- Chicken Breast: 300 kcal",
      workoutListStr: "No workouts logged yet today.",
      goal: "lose",
      consumedCalories: 1500,
      targetCalories: 2000,
      workoutCount: 0
    },
    trainingLogs: [],
    personality: "motivational",
    memory: {
      loginStreak: 5,
      workoutStreak: 3,
      nutritionStreak: 2,
      waterStreak: 4
    }
  };

  try {
    const res = await fetch('http://localhost:3002/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API returned status ${res.status}: ${text}`);
    }

    const data = await res.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log("\n--- AI Response ---");
    console.log(answer);
    console.log("-------------------");

    if (answer && answer.toLowerCase().includes("dumbbell")) {
      console.log("\n✅ Success! Gemini recommended exercises from the local library.");
    } else {
      console.log("\n❌ Failed: Response did not include relevant chest exercises.");
    }

  } catch (err) {
    console.error("Test failed", err);
  }
}

testRAG();
