import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemePreference } from '@/contexts/theme-preference-context';
import { sendAiChatMessage } from '@/services/ai-api';
import { Colors, FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type SuggestedQuestion = {
  color: string;
  icon: IoniconName;
  text: string;
};

type ChatMessage = {
  id: number;
  role: 'assistant' | 'user';
  state?: 'error';
  text: string;
};

const HOME_ROUTE = '/(tabs)/home';
const FALLBACK_ERROR = 'تعذر التواصل مع المساعد الذكي';
const LOADING_DOTS = [0, 1, 2];
const screenBackground = '#f6f7fb';
const primaryColor = '#4f7cff';
const borderColor = 'rgba(60,60,67,0.08)';
const surfaceBorder = { borderWidth: 1, borderColor } as const;
const centered = { alignItems: 'center', justifyContent: 'center' } as const;

const suggestedQuestions: SuggestedQuestion[] = [
  { icon: 'help-circle-outline', text: 'كيف أضيف إعلان جديد؟', color: '#007aff' },
  { icon: 'book-outline', text: 'ما هي الفعاليات القادمة؟', color: '#34c759' },
  { icon: 'chatbubble-ellipses-outline', text: 'كيف أتواصل مع البائع؟', color: '#ff9500' },
  { icon: 'bulb-outline', text: 'نصائح للدراسة الفعالة', color: '#5ac8fa' },
];

export default function AiAssistantScreen() {
  const { bottom } = useSafeAreaInsets();
  const { colors, effectiveTheme } = useThemePreference();
  const scrollRef = useRef<ScrollView>(null);
  const messageIdRef = useRef(0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const hasMessages = messages.length > 0;
  const trimmedInput = input.trim();
  const canSend = Boolean(trimmedInput) && !isLoading;

  const addMessage = (role: ChatMessage['role'], text: string, state?: ChatMessage['state']) => {
    messageIdRef.current += 1;
    setMessages((current) => [...current, { id: messageIdRef.current, role, state, text }]);
  };

  const submitInput = () => {
    void handleSend(input);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages, isLoading]);

  const handleSend = async (value: string) => {
    const trimmed = value.trim();

    if (!trimmed || isLoading) {
      return;
    }

    addMessage('user', trimmed);
    setInput('');
    setIsLoading(true);

    try {
      addMessage('assistant', await sendAiChatMessage(trimmed));
    } catch (error) {
      addMessage('assistant', error instanceof Error ? error.message : FALLBACK_ERROR, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <View style={[styles.root, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="رجوع"
              onPress={() => (router.canGoBack() ? router.back() : router.replace(HOME_ROUTE))}
              style={({ pressed }) => [
                styles.backButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </Pressable>

            <View style={styles.headerCenter}>
              <View style={styles.headerIconWrap}>
                <View style={styles.headerIcon}>
                  <Ionicons name="sparkles" size={25} color="#ffffff" />
                </View>
                <View style={[styles.onlineDot, { borderColor: colors.background }]} />
              </View>

              <Text style={[styles.headerTitle, { color: colors.foreground }]}>المساعد الذكي</Text>
              <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>متصل الآن</Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.messagesContent,
              !hasMessages && styles.messagesContentEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!hasMessages ? (
              <View style={styles.emptyState}>
                <View style={[styles.welcomeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.welcomeIconWrap}>
                    <Ionicons name="sparkles-outline" size={31} color="#007aff" />
                  </View>

                  <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>مرحباً بك!</Text>
                  <Text style={[styles.welcomeText, { color: colors.mutedForeground }]}>
                    أنا مساعدك الذكي في التطبيق. يمكنني مساعدتك في أي استفسار أو إرشادك لاستخدام المنصة بشكل أفضل.
                  </Text>
                </View>

                <Text style={[styles.suggestionTitle, { color: colors.mutedForeground }]}>جرّب أحد هذه الأسئلة</Text>

                <View style={styles.suggestionsGrid}>
                  {suggestedQuestions.map((question) => (
                    <Pressable
                      key={question.text}
                      onPress={() => {
                        void handleSend(question.text);
                      }}
                      style={({ pressed }) => [
                        styles.suggestionCard,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.suggestionIconWrap,
                          { backgroundColor: `${question.color}15` },
                        ]}
                      >
                        <Ionicons name={question.icon} size={20} color={question.color} />
                      </View>
                      <Text style={[styles.suggestionText, { color: colors.foreground }]}>{question.text}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.chatList}>
                {messages.map(({ id, role, state, text }) => {
                  const isUser = role === 'user';
                  const isError = state === 'error';

                  return (
                    <View key={id} style={[styles.messageRow, isUser && styles.messageRowUser]}>
                      <View
                        style={[
                          styles.avatar,
                          isUser ? styles.userAvatar : styles.assistantAvatar,
                          !isUser && { backgroundColor: colors.card, borderColor: colors.border },
                        ]}
                      >
                        <Ionicons
                          name={isUser ? 'person-outline' : 'sparkles-outline'}
                          size={16}
                          color={isUser ? '#ffffff' : '#007aff'}
                        />
                      </View>

                      <View
                        style={[
                          styles.messageBubble,
                          isUser ? styles.userBubble : styles.assistantBubble,
                          !isUser && { backgroundColor: colors.card, borderColor: colors.border },
                          isError && styles.errorBubble,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            { color: colors.foreground },
                            isUser && styles.userMessageText,
                            isError && styles.errorMessageText,
                          ]}
                        >
                          {text}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {isLoading ? (
                  <View style={styles.messageRow}>
                    <View style={[styles.avatar, styles.assistantAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Ionicons name="sparkles-outline" size={16} color="#007aff" />
                    </View>

                    <View
                      style={[
                        styles.messageBubble,
                        styles.assistantBubble,
                        styles.typingBubble,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.typingDots}>
                        {LOADING_DOTS.map((dot) => (
                          <View key={dot} style={styles.typingDot} />
                        ))}
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputArea, { backgroundColor: colors.background, paddingBottom: Math.max(bottom, 12) }]}>
            <View style={[styles.inputBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable
                accessibilityLabel="إرسال"
                disabled={!canSend}
                onPress={submitInput}
                style={({ pressed }) => [
                  styles.sendButton,
                  !canSend && [styles.sendButtonDisabled, { backgroundColor: colors.secondary }],
                  pressed && canSend && styles.pressed,
                ]}
              >
                {isLoading ? (
                  <View style={styles.sendLoading}>
                    {LOADING_DOTS.map((dot) => (
                      <View key={dot} style={styles.sendLoadingDot} />
                    ))}
                  </View>
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color={trimmedInput ? '#ffffff' : colors.mutedForeground}
                  />
                )}
              </Pressable>

              <TextInput
                blurOnSubmit={false}
                editable={!isLoading}
                onChangeText={setInput}
                onSubmitEditing={submitInput}
                placeholder="اكتب رسالتك..."
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="send"
                style={[styles.input, { color: colors.foreground }]}
                textAlign="right"
                value={input}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  keyboardView: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    ...centered,
    ...surfaceBorder,
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  headerIconWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  headerIcon: {
    ...centered,
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: primaryColor,
    shadowColor: '#2563eb',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -1,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: SemanticColors.green,
    borderWidth: 2,
    borderColor: screenBackground,
  },
  headerTitle: {
    color: '#1c1c1e',
    fontFamily: FontFamily.cairo,
    fontSize: 28,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 2,
    color: '#9ca3af',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  messagesContentEmpty: {
    justifyContent: 'center',
    paddingBottom: 24,
  },
  emptyState: {
    gap: 20,
  },
  welcomeCard: {
    ...surfaceBorder,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.07,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  welcomeIconWrap: {
    ...centered,
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: 'rgba(0,122,255,0.14)',
    marginBottom: 16,
  },
  welcomeTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 26,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  welcomeText: {
    marginTop: 8,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.medium,
    lineHeight: 30,
    textAlign: 'center',
  },
  suggestionTitle: {
    color: '#a1a1aa',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  suggestionsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  suggestionCard: {
    ...centered,
    ...surfaceBorder,
    width: '48.4%',
    minHeight: 102,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  suggestionIconWrap: {
    ...centered,
    width: 44,
    height: 44,
    borderRadius: 16,
    marginBottom: 10,
  },
  suggestionText: {
    color: '#27272a',
    fontFamily: FontFamily.cairo,
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    lineHeight: 20,
  },
  chatList: {
    gap: 14,
    paddingBottom: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    ...centered,
    width: 36,
    height: 36,
    borderRadius: 14,
  },
  userAvatar: {
    backgroundColor: primaryColor,
  },
  assistantAvatar: {
    ...surfaceBorder,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  messageBubble: {
    maxWidth: '79%',
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 13,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  userBubble: {
    backgroundColor: primaryColor,
    borderBottomRightRadius: 8,
  },
  assistantBubble: {
    ...surfaceBorder,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderBottomLeftRadius: 8,
  },
  errorBubble: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  messageText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 15,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
    textAlign: 'right',
  },
  errorMessageText: {
    color: '#b91c1c',
  },
  userMessageText: {
    color: '#ffffff',
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(0,122,255,0.55)',
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(246,247,251,0.98)',
  },
  inputBar: {
    ...surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.96)',
    padding: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  input: {
    flex: 1,
    minHeight: 46,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x15,
    fontWeight: FontWeight.medium,
    paddingHorizontal: 12,
    writingDirection: 'rtl',
  },
  sendButton: {
    ...centered,
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: primaryColor,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  sendLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sendLoadingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
