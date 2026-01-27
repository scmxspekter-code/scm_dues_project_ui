import { GoogleGenAI } from '@google/genai';

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error('API Key is missing. Ensure process.env.API_KEY is set.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateDuesReminder = async (
  memberName: string,
  amount: number,
  dueDate: string
): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Generate a friendly but firm WhatsApp reminder for a member named ${memberName} who owes ₦${amount.toLocaleString()} in annual dues to SCM Nigeria. The deadline is ${dueDate}. Keep it professional and include a call to action to pay via bank transfer.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || 'Could not generate message. Please try again.';
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'Error generating AI content.';
  }
};

export const analyzeDefaulterTrends = async (
  defaulterCount: number,
  totalMembers: number
): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Analyze this data for an organization: ${defaulterCount} defaulters out of ${totalMembers} total members. Provide a 2-sentence summary of the health of dues collection and one recommendation.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || 'Analysis unavailable.';
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'Analysis error.';
  }
};
