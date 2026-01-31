
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Spread, CardPull, Interpretation } from "../types.ts";
import { SPREADS } from "../constants.ts";

const getAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export async function selectSpread(category: Category, question: string): Promise<Spread> {
  const ai = getAI();
  
  const systemInstruction = `
    You are an expert Tarot Spread Architect. Your goal is to design a unique and nuanced tarot spread of 2 to 4 cards that perfectly addresses the user's specific query.
    
    Guidelines:
    - Analyze the user's question for hidden themes, conflicts, or specific choices.
    - If the user is facing a choice, design a spread with comparative positions.
    - If the user is seeking self-reflection, focus on internal vs external archetypes.
    - If the question is vague, use a balanced structure like Past/Present/Future or Core/Tool/Outcome.
    - The spread must have between 2 and 4 positions.
    - Ensure position titles and descriptions are clear, modern, and grounded.
    - Avoid spiritual jargon; use practical, coaching-oriented language.
    
    Architectural Inspiration (Reference these structures but adapt them to the specific question):
    ${SPREADS.map(s => `- ${s.name}: ${s.description} (${s.positions.map(p => p.title).join(', ')})`).join('\n')}
  `;

  const userPrompt = `
    Focus Area: ${category}
    User's Inquiry: "${question || 'I am seeking general perspective and clarity on my current path.'}"
    
    Design a custom spread tailored to this inquiry.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A creative name for this custom spread." },
            description: { type: Type.STRING, description: "A brief explanation of why this spread structure fits the user's question." },
            positions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "The name of the position (e.g., 'The Hidden Block' or 'Option A')." },
                  description: { type: Type.STRING, description: "What this position represents in the context of the inquiry." }
                },
                required: ["title", "description"]
              },
              minItems: 2,
              maxItems: 4
            }
          },
          required: ["name", "description", "positions"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      id: "dynamic-spread-" + Date.now(),
      name: result.name || "Custom Reflection",
      description: result.description || "A spread tailored to your specific inquiry.",
      positions: result.positions || SPREADS[0].positions
    };
  } catch (error) {
    console.error("Spread Selection/Generation Error:", error);
    return SPREADS[0];
  }
}

export async function getDetailedInterpretation(
  category: Category,
  question: string,
  spread: Spread,
  pulls: CardPull[]
): Promise<Interpretation> {
  const ai = getAI();
  
  const systemInstruction = `
    You are a grounded, senior life coach using tarot symbolism for practical reflection.
    Interpret the following tarot spread in the context of the user's question.
    
    Rules:
    - NO future predictions, supernatural claims, or mention of 'destiny' or 'luck'.
    - Use a grounded, calm, and practical tone.
    - Focus on synergy: how the cards interact within this specific spread structure.
    - Provide actionable insights that empower the user's free will.
    - Keep language simple and accessible for beginners.
  `;

  const userPrompt = `
    Context: ${category}
    User Question: "${question || 'General Reflection'}"
    Spread Name: ${spread.name}
    Spread Intent: ${spread.description}
    
    Card Results:
    ${pulls.map(p => `- Position "${p.position.title}" (${p.position.description}): Received card "${p.card.name}" (${p.card.keyword})`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A cohesive, high-level overview of the entire reading's message." },
            details: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  positionTitle: { type: Type.STRING },
                  insight: { type: Type.STRING, description: "Detailed, practical reflection for this specific card in its position." }
                },
                required: ["positionTitle", "insight"]
              }
            },
            finalGuidance: { type: Type.STRING, description: "A concise, empowering mindset shift or practical next step." }
          },
          required: ["summary", "details", "finalGuidance"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Detailed Interpretation Error:", error);
    return {
      summary: "Your reading suggests a moment of transition and mindful attention.",
      details: pulls.map(p => ({ positionTitle: p.position.title, insight: `This card encourages you to look closely at your current ${category.toLowerCase()} environment.` })),
      finalGuidance: "Trust your clarity and take one intentional step today."
    };
  }
}
