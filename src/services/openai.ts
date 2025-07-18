import OpenAI from 'openai';

// Note: In production, use environment variables
// For development, you'll need to add your API key
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your_api_key_here';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for development/demo
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class BrutusAIService {
  private systemPrompt = `You are BrutusAI, the official nutrition assistant for Ohio State University students. You help students at OSU make informed decisions about dining options across campus.

Your personality:
- Friendly, knowledgeable, and enthusiastic about OSU
- Use "Buckeye" and OSU references naturally but don't overdo it
- Focus on practical, helpful nutrition advice
- Be encouraging and supportive

Your knowledge includes:
- OSU dining locations (Union Market, Traditions at Scott, Courtside Cafe, etc.)
- Campus dining plans (Scarlet 14, Gray 10, Traditions, Carmen 1, Carmen 2)
- Nutritional guidance for college students
- Budget-friendly meal options
- Dietary restrictions and allergen awareness

Guidelines:
- Keep responses concise but helpful (2-3 sentences usually)
- Ask follow-up questions when needed
- Suggest specific OSU dining locations when relevant
- Consider the student's dining plan and budget
- Be aware of common dietary restrictions

Remember: You're here to make campus dining easier and healthier for Buckeyes!`;

  async getChatResponse(messages: ChatMessage[]): Promise<string> {
    try {
      // Add system prompt to the beginning if not present
      const messagesWithSystem = [
        { role: 'system' as const, content: this.systemPrompt },
        ...messages
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messagesWithSystem,
        max_tokens: 200,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      return completion.choices[0]?.message?.content || 'Sorry, I had trouble understanding that. Could you try asking again?';
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Fallback responses for common scenarios
      const userMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
      
      if (userMessage.includes('budget') || userMessage.includes('cheap') || userMessage.includes('affordable')) {
        return "For budget-friendly options, I'd recommend checking out the Union Market for their daily specials, or consider using your dining plan swipes at Traditions for unlimited meals. The Carmen plans also offer great value for commuter students!";
      }
      
      if (userMessage.includes('healthy') || userMessage.includes('nutrition')) {
        return "Great question about healthy eating! Look for grilled proteins, fresh vegetables, and whole grains at locations like Courtside Cafe. Many OSU dining locations offer nutritional information - just ask the staff or check the digital menus!";
      }
      
      if (userMessage.includes('dining plan') || userMessage.includes('meal plan')) {
        return "OSU offers several dining plans: Scarlet 14 (14 meals/week), Gray 10 (10 meals/week), Traditions (unlimited), and Carmen plans for commuters. Which one are you considering or currently have?";
      }
      
      return "I'm having some technical difficulties right now, but I'm here to help with your OSU dining questions! Try asking about meal plans, healthy options, or budget-friendly choices around campus.";
    }
  }

  // Get conversation starters for the UI
  getConversationStarters(): string[] {
    return [
      "What's the healthiest option at Union Market?",
      "Help me stick to my dining plan budget",
      "I'm vegetarian - where should I eat on campus?",
      "What's good at Traditions today?",
      "Compare the OSU dining plans for me",
      "I have a nut allergy - what's safe to eat?"
    ];
  }

  // Validate if the API key is configured
  isConfigured(): boolean {
    return OPENAI_API_KEY !== 'your_api_key_here' && OPENAI_API_KEY.length > 0;
  }
} 