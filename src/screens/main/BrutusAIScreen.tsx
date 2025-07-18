import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../../constants/theme';
import { BrutusAIService, ChatMessage } from '../../services/openai';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function BrutusAIScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m BrutusAI, your personal nutrition assistant! 🌰\n\nI can help you create meal plans, find healthy options, and answer nutrition questions. What would you like to know?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [brutusAI] = useState(new BrutusAIService());
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setIsApiConfigured(brutusAI.isConfigured());
    if (!brutusAI.isConfigured()) {
      // Add a message about API configuration
      const configMessage: Message = {
        id: 'config-notice',
        text: 'Note: I\'m currently running in demo mode. For full functionality, configure your OpenAI API key in the environment variables.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, configMessage]);
    }
  }, [brutusAI]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Convert messages to ChatMessage format for OpenAI
      const chatMessages: ChatMessage[] = messages
        .filter(msg => msg.id !== 'config-notice') // Exclude config notice
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text,
        }));

      // Add the current user message
      chatMessages.push({
        role: 'user',
        content: currentInput,
      });

      // Get AI response
      const aiResponseText = await brutusAI.getChatResponse(chatMessages);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback to local response if API fails
      const fallbackText = generateAIResponse(currentInput);
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackText,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('meal plan') || lowerMessage.includes('plan')) {
      return 'I\'d be happy to help you create a meal plan! 🍽️\n\nBased on your goals, I recommend:\n\n🥗 **Breakfast**: Greek Yogurt Parfait (250 cal)\n🍔 **Lunch**: Turkey Sandwich + Sweet Potato Fries (800 cal)\n🥙 **Dinner**: Mediterranean Wrap (465 cal)\n\nThis plan provides balanced nutrition with 1,515 calories, 72g protein, and costs about $19.50. Would you like me to adjust anything?';
    }
    
    if (lowerMessage.includes('protein') || lowerMessage.includes('muscle')) {
      return 'Great question about protein! 💪\n\nFor muscle building, I recommend:\n- Grilled Chicken Caesar Salad (35g protein)\n- Turkey Sandwich (32g protein)\n- Greek Yogurt Parfait (15g protein)\n\nAim for 1.6-2.2g protein per kg of body weight. These OSU dining options can help you reach your goals!';
    }
    
    if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight')) {
      return 'I can help with healthy weight loss! 🎯\n\nTry these lower-calorie, high-nutrition options:\n- Vegetarian Quinoa Bowl (420 cal, filling)\n- Fresh Fruit Smoothie (180 cal)\n- Grilled Chicken Caesar Salad (380 cal)\n\nFocus on high-protein, high-fiber foods to stay satisfied while in a calorie deficit.';
    }
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('money')) {
      return 'Let\'s find budget-friendly options! 💰\n\nBest value meals at OSU:\n- Greek Yogurt Parfait ($3.50)\n- Sweet Potato Fries ($4.25)\n- Fresh Fruit Smoothie ($4.50)\n- Vegetarian Quinoa Bowl ($6.75)\n\nYou can eat well for under $20/day with smart choices!';
    }
    
    return 'Thanks for your question! 🤔\n\nI\'m here to help with meal planning, nutrition advice, and finding the best dining options at OSU. Feel free to ask me about:\n\n• Creating personalized meal plans\n• Nutrition information\n• Budget-friendly options\n• Dietary restrictions\n• Fitness goals\n\nWhat specific area would you like help with?';
  };

  const MessageBubble = ({ message }: { message: Message }) => (
    <View style={[
      styles.messageBubble,
      message.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      {!message.isUser && (
        <View style={styles.aiHeader}>
          <Ionicons name="school" size={16} color={COLORS.primary} />
          <Text style={styles.aiName}>BrutusAI</Text>
        </View>
      )}
      <Text style={[
        styles.messageText,
        message.isUser ? styles.userMessageText : styles.aiMessageText
      ]}>
        {message.text}
      </Text>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
              {/* Chat Header with Brutus Buckeye */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <View style={styles.brutusHead}>
            <Text style={styles.brutusEmoji}>🌰</Text>
          </View>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>BrutusAI</Text>
          <Text style={styles.headerSubtitle}>Your Nutrition Assistant • Powered by Brutus Buckeye</Text>
        </View>
      </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <View style={[styles.messageBubble, styles.aiMessage]}>
              <View style={styles.aiHeader}>
                <Ionicons name="school" size={16} color={COLORS.primary} />
                <Text style={styles.aiName}>BrutusAI</Text>
              </View>
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>Typing...</Text>
                <View style={styles.typingDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
          )}
          
          {/* Conversation Starters */}
          {messages.length <= 2 && !isTyping && (
            <View style={styles.startersContainer}>
              <Text style={styles.startersTitle}>Try asking about:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {brutusAI.getConversationStarters().map((starter, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.starterButton}
                    onPress={() => {
                      setInputText(starter);
                      // Auto-send after a short delay
                      setTimeout(() => {
                        if (starter.trim()) {
                          setInputText(starter);
                          sendMessage();
                        }
                      }, 100);
                    }}
                  >
                    <Text style={styles.starterText}>{starter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Input Area - Always visible at bottom */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask BrutusAI about nutrition..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            placeholderTextColor={COLORS.textSecondary}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={!inputText.trim() ? COLORS.textSecondary : COLORS.background} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIcon: {
    marginRight: SPACING.md,
  },
  brutusHead: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  brutusEmoji: {
    fontSize: 24,
    textAlign: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  messagesContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  messagesContent: {
    paddingBottom: SPACING.lg,
    flexGrow: 1,
  },
  messageBubble: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    ...SHADOWS.light,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  aiName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.background,
  },
  aiMessageText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    position: 'relative',
    minHeight: 80,
    ...SHADOWS.light,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    maxHeight: 100,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  startersContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  startersTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  starterButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 200,
  },
  starterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
  },
}); 