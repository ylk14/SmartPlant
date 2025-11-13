import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { postChatMessage } from '../../../services/api'; // <--- IMPORT YOUR API

export default function AdminAgentChatScreen() {
  const [messages, setMessages] = useState([]); // <--- Start with empty array
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingAnim = useRef(new Animated.Value(0)).current;
  const typingLoopRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const reversed = useMemo(() => [...messages].reverse(), [messages]);

  // ⬇️ *** THIS FUNCTION IS NOW ASYNC AND CALLS THE API *** ⬇️
  const handleSend = async (preset) => {
    const text = (preset ?? input).trim();
    if (!text || isTyping) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add the user's message immediately
    const userMessage = {
      id: `msg-${messages.length + 1}`,
      sender: 'admin',
      content: text,
      timestamp,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // --- Start typing animation ---
    if (typingLoopRef.current) typingLoopRef.current.stop();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(typingAnim, { toValue: 2, duration: 260, useNativeDriver: true }),
        Animated.timing(typingAnim, { toValue: 3, duration: 260, useNativeDriver: true }),
        Animated.timing(typingAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ])
    );
    
    typingAnim.setValue(0);
    typingLoopRef.current.start();
    // -----------------------------

    try {
      // 2. Call the backend API
      const { reply } = await postChatMessage(text);
      
      // 3. Add the AI's response
      const agentMessage = {
        id: `msg-${messages.length + 2}`,
        sender: 'agent',
        content: reply || "Sorry, I couldn't process that.",
        timestamp,
      };
      setMessages((prev) => [...prev, agentMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      // Add an error message to the chat
      const errorMessage = {
        id: `msg-${messages.length + 2}`,
        sender: 'agent',
        content: `Error: ${error.message}`,
        timestamp,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      // 4. Stop typing animation
      setIsTyping(false);
      typingLoopRef.current?.stop();
      typingLoopRef.current = null;
      typingAnim.setValue(0);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  useEffect(() => {
    // Add an initial greeting message from the agent
    setMessages([
      {
        id: 'msg-001',
        sender: 'agent',
        content: 'Hi Flora Admin! I can help triage alerts or summarize reports. Ask me about the current sensor status.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Cleanup logic
    return () => {
      typingLoopRef.current?.stop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []); // <-- Empty array means this runs only once on mount

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Ionicons name="sparkles-outline" size={20} color="#2563EB" />
            <View>
              <Text style={styles.agentTitle}>SmartPlant Agent</Text>
              <Text style={styles.agentSubtitle}>Enterprise AI assistant for conservation teams</Text>
            </View>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <FlatList
          style={styles.messages}
          data={reversed}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContent}
          renderItem={({ item }) => {
            const isAgent = item.sender === 'agent';
            return (
              <View
                style={[
                  styles.messageRow,
                  isAgent ? styles.agentMessageRow : styles.adminMessageRow,
                ]}
              >
                {isAgent && (
                  <View style={styles.avatarAgent}>
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isAgent ? styles.agentBubble : styles.adminBubble,
                  ]}
                >
                  <Text style={isAgent ? styles.agentMessageText : styles.adminMessageText}>{item.content}</Text>
                  <Text style={isAgent ? styles.agentTimestamp : styles.adminTimestamp}>{item.timestamp}</Text>
                </View>
                {!isAgent && (
                  <View style={styles.avatarAdmin}>
                    <Ionicons name="person-outline" size={18} color="#2563EB" />
                  </View>
                )}
              </View>
            );
          }}
          ListFooterComponent={
            isTyping ? (
              <View style={[styles.messageRow, styles.agentMessageRow]}>
                <View style={styles.avatarAgent}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                </View>
                <View style={[styles.messageBubble, styles.agentBubble, styles.typingBubble]}>
                  <View style={styles.typingDots}>
                    {[0, 1, 2].map((index) => (
                      <Animated.View
                        key={`typing-dot-${index}`}
                        style={[
                          styles.dot,
                          {
                            opacity: typingAnim.interpolate({
                              inputRange: [index, index + 1],
                              outputRange: [0.25, 1],
                              extrapolate: 'clamp',
                            }),
                            transform: [
                              {
                                translateY: typingAnim.interpolate({
                                  inputRange: [index, index + 1],
                                  outputRange: [6, -2],
                                  extrapolate: 'clamp',
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            ) : null
          }
        />


        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask the agent..."
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            activeOpacity={0.8}
            onPress={() => handleSend()}
            disabled={isTyping} // <-- Optional: disable send button while typing
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ⬇️ *** STYLES (with minor fixes for text color) *** ⬇️
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  agentSubtitle: {
    fontSize: 12,
    color: '#475467',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E0F2FE',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  messages: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingBottom: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 10,
  },
  agentMessageRow: {
    justifyContent: 'flex-start',
  },
  adminMessageRow: {
    justifyContent: 'flex-end',
  },
  avatarAgent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAdmin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  agentBubble: {
    backgroundColor: '#E0EAFF',
    borderBottomLeftRadius: 4,
  },
  adminBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  typingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 64,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D4ED8',
  },
  agentMessageText: { // <--- Fix: agent text
    fontSize: 13.5,
    color: '#0F172A',
  },
  adminMessageText: { // <--- Fix: admin text
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  agentTimestamp: { // <--- Fix: agent timestamp
    marginTop: 6,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'left',
  },
  adminTimestamp: { // <--- Fix: admin timestamp
    marginTop: 6,
    fontSize: 11,
    color: '#BFDBFE',
    textAlign: 'right',
  },
  suggestionsRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    fontSize: 13.5,
    color: '#0F172A',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
  },
});