import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useMobileStore } from '../store/useMobileStore';
import { geminiMobileService } from '../services/geminiMobileService';

export default function AICoachScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const profile = useMobileStore((state) => state.profile);
  const todayMetrics = useMobileStore((state) => state.todayMetrics);
  const aiChatMessages = useMobileStore((state) => state.aiChatMessages);
  const addAIChatMessage = useMobileStore((state) => state.addAIChatMessage);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    setInput('');

    // Add user message
    addAIChatMessage({
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setLoading(true);

    // Call Gemini API
    const aiResponse = await geminiMobileService.askCoach(userMessageText, {
      user: profile,
      metrics: todayMetrics,
    });

    addAIChatMessage({
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: aiResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setLoading(false);
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <HeaderBar title="Calyxo AI Coach" subtitle="Powered by Gemini AI" onProfilePress={() => navigation.navigate('Profile')} />

      {/* Suggested Quick Prompts */}
      <View style={styles.quickPromptsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <TouchableOpacity style={styles.chip} onPress={() => handleQuickPrompt("Suggest a high protein post-workout snack")}>
            <Text style={styles.chipText}>🥗 High Protein Snack</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleQuickPrompt("Give me a 30-minute chest workout routine")}>
            <Text style={styles.chipText}>🏋️‍♂️ Chest Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleQuickPrompt("How do I stay hydrated during heavy lifting?")}>
            <Text style={styles.chipText}>💧 Hydration Tips</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {aiChatMessages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageBubble, 
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble
            ]}
          >
            <Text style={styles.senderLabel}>
              {msg.sender === 'user' ? 'YOU' : 'CALYXO AI'}
            </Text>
            <Text style={styles.messageText}>{msg.text}</Text>
            <Text style={styles.timestamp}>{msg.timestamp}</Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <ActivityIndicator color="#00F0FF" />
            <Text style={styles.thinkingText}>Calyxo AI Coach is analyzing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Row */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask AI Coach anything about fitness..."
          placeholderTextColor="#607085"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} 
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  quickPromptsRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  chip: {
    backgroundColor: '#182032',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  chipText: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    maxWidth: '88%',
  },
  userBubble: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  aiBubble: {
    backgroundColor: '#121826',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    marginBottom: 4,
    letterSpacing: 1,
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: '#8A99AD',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  thinkingText: {
    color: '#8A99AD',
    fontSize: 12,
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#121826',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    backgroundColor: '#182032',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#00F0FF',
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#2A364F',
  },
  sendBtnText: {
    color: '#090d16',
    fontWeight: '800',
    fontSize: 13,
  },
});
