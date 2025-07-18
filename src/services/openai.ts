// OpenAI service for BrutusAI chatbot
// In a real app, you would use your actual OpenAI API key

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Mock OpenAI API responses for demo purposes
const mockResponses: Record<string, string> = {
  'meal plan': `I'd be happy to help you create a meal plan! 🍽️

Based on your goals, I recommend:

🥗 **Breakfast**: Greek Yogurt Parfait (250 cal)
🍔 **Lunch**: Turkey Sandwich + Sweet Potato Fries (800 cal)  
🥙 **Dinner**: Mediterranean Wrap (465 cal)

This plan provides balanced nutrition with 1,515 calories, 72g protein, and costs about $19.50. Would you like me to adjust anything?`,

  'protein': `Great question about protein! 💪

For muscle building, I recommend:
- Grilled Chicken Caesar Salad (35g protein)
- Turkey Sandwich (32g protein)
- Greek Yogurt Parfait (15g protein)

Aim for 1.6-2.2g protein per kg of body weight. These OSU dining options can help you reach your goals!`,

  'weight loss': `I can help with healthy weight loss! 🎯

Try these lower-calorie, high-nutrition options:
- Vegetarian Quinoa Bowl (420 cal, filling)
- Fresh Fruit Smoothie (180 cal)
- Grilled Chicken Caesar Salad (380 cal)

Focus on high-protein, high-fiber foods to stay satisfied while in a calorie deficit.`,

  'budget': `Let's find budget-friendly options! 💰

Best value meals at OSU:
- Greek Yogurt Parfait ($3.50)
- Sweet Potato Fries ($4.25)
- Fresh Fruit Smoothie ($4.50)
- Vegetarian Quinoa Bowl ($6.75)

You can eat well for under $20/day with smart choices!`,

  'default': `Thanks for your question! 🤔

I'm here to help with meal planning, nutrition advice, and finding the best dining options at OSU. Feel free to ask me about:

• Creating personalized meal plans
• Nutrition information  
• Budget-friendly options
• Dietary restrictions
• Fitness goals

What specific area would you like help with?`
};

export const generateChatResponse = async (
  messages: ChatMessage[],
  apiKey?: string
): Promise<{ response: string; error?: string }> => {
  try {
    // For demo purposes, use mock responses
    if (!apiKey || apiKey === 'demo') {
      return await generateMockResponse(messages);
    }

    // Real OpenAI API call would go here
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are BrutusAI, a friendly nutrition assistant for Ohio State University students. 
            You help students plan healthy, budget-friendly meals using OSU dining options. 
            You know about campus dining locations like Scott Dining, Traditions at Scott Commons, and Kennedy Commons.
            Always be encouraging, use emojis, and focus on practical nutrition advice for college students.`
          },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    return { 
      response: data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.',
      error: undefined 
    };

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Fallback to mock response
    return await generateMockResponse(messages);
  }
};

const generateMockResponse = async (messages: ChatMessage[]): Promise<{ response: string; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return { response: mockResponses.default };
  }

  const userMessage = lastMessage.content.toLowerCase();
  
  // Find matching response based on keywords
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (keyword !== 'default' && userMessage.includes(keyword)) {
      return { response };
    }
  }

  return { response: mockResponses.default };
};

// Helper function to create a chat message
export const createChatMessage = (role: 'user' | 'assistant', content: string): ChatMessage => ({
  role,
  content,
});

// Initialize with system message for context
export const getInitialMessages = (): ChatMessage[] => [
  {
    role: 'system',
    content: `You are BrutusAI, a friendly nutrition assistant for Ohio State University students. 
    You help students plan healthy, budget-friendly meals using OSU dining options. 
    You know about campus dining locations like Scott Dining, Traditions at Scott Commons, and Kennedy Commons.
    Always be encouraging, use emojis, and focus on practical nutrition advice for college students.`
  }
];

export default {
  generateChatResponse,
  createChatMessage,
  getInitialMessages,
}; 