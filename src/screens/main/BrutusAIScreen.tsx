import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

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
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Chat Header */}
      <View style={styles.header}>
        <Ionicons name="school" size={24} color={COLORS.primary} />
        <Text style={styles.headerTitle}>BrutusAI</Text>
        <Text style={styles.headerSubtitle}>Your Nutrition Assistant</Text>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
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
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask BrutusAI about nutrition..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          placeholderTextColor={COLORS.textSecondary}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
}); 