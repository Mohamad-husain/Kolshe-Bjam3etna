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
  text: string;
};

const suggestedQuestions: SuggestedQuestion[] = [
  { icon: 'help-circle-outline', text: 'كيف أضيف إعلان جديد؟', color: '#007aff' },
  { icon: 'book-outline', text: 'ما هي الفعاليات القادمة؟', color: '#34c759' },
  { icon: 'chatbubble-ellipses-outline', text: 'كيف أتواصل مع البائع؟', color: '#ff9500' },
  { icon: 'bulb-outline', text: 'نصائح للدراسة الفعالة', color: '#5ac8fa' },
];

function buildAssistantReply(question: string) {
  const normalized = question.trim().toLowerCase();

  if (normalized.includes('إعلان') || normalized.includes('اعلان')) {
    return 'لإضافة إعلان جديد افتح قسم المتجر أو الخدمات، ثم اختَر خيار الإضافة وأدخل العنوان والوصف والسعر والصور قبل النشر.';
  }

  if (normalized.includes('فعال') || normalized.includes('event')) {
    return 'يمكنك متابعة الفعاليات من تبويب استكشف ثم قسم الفعاليات. إذا أردت، أقدر أوجّهك أيضاً لأقرب فعالية مناسبة.';
  }

  if (normalized.includes('بائع') || normalized.includes('تواصل') || normalized.includes('رسالة')) {
    return 'للتواصل مع البائع افتح الإعلان المطلوب ثم استخدم المحادثة أو انتقل إلى تبويب الرسائل لمتابعة جميع المحادثات في مكان واحد.';
  }

  if (normalized.includes('دراسة') || normalized.includes('مذاكرة') || normalized.includes('تعلم')) {
    return 'ابدأ بخطة قصيرة وواضحة: حدّد هدفاً واحداً لكل جلسة، ادرس 25 إلى 40 دقيقة، ثم خذ استراحة قصيرة وراجع أهم النقاط في نهاية الجلسة.';
  }

  return 'أنا جاهز لمساعدتك داخل التطبيق. اسألني عن الإعلانات، الخدمات، الفعاليات، أو طريقة استخدام أي جزء من المنصة.';
}

export default function AiAssistantScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIdRef = useRef(0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const nextMessageId = () => {
    messageIdRef.current += 1;
    return messageIdRef.current;
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/home');
  };

  const handleSend = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: nextMessageId(),
        role: 'user',
        text: trimmed,
      },
    ]);
    setInput('');
    setIsLoading(true);

    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
    }

    replyTimeoutRef.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId(),
          role: 'assistant',
          text: buildAssistantReply(trimmed),
        },
      ]);
      setIsLoading(false);
      replyTimeoutRef.current = null;
    }, 700);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <View style={styles.root}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="رجوع"
              onPress={handleBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.foreground} />
            </Pressable>

            <View style={styles.headerCenter}>
              <View style={styles.headerIconWrap}>
                <View style={styles.headerIcon}>
                  <Ionicons name="sparkles" size={25} color="#ffffff" />
                </View>
                <View style={styles.onlineDot} />
              </View>

              <Text style={styles.headerTitle}>المساعد الذكي</Text>
              <Text style={styles.headerSubtitle}>متصل الآن</Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.messagesContent,
              messages.length === 0 && styles.messagesContentEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.welcomeCard}>
                  <View style={styles.welcomeIconWrap}>
                    <Ionicons name="sparkles-outline" size={31} color="#007aff" />
                  </View>

                  <Text style={styles.welcomeTitle}>مرحباً بك!</Text>
                  <Text style={styles.welcomeText}>
                    أنا مساعدك الذكي في التطبيق. يمكنني مساعدتك في أي استفسار أو إرشادك لاستخدام المنصة بشكل أفضل.
                  </Text>
                </View>

                <Text style={styles.suggestionTitle}>جرّب أحد هذه الأسئلة</Text>

                <View style={styles.suggestionsGrid}>
                  {suggestedQuestions.map((question) => (
                    <Pressable
                      key={question.text}
                      onPress={() => handleSend(question.text)}
                      style={({ pressed }) => [styles.suggestionCard, pressed && styles.pressed]}
                    >
                      <View
                        style={[
                          styles.suggestionIconWrap,
                          { backgroundColor: `${question.color}15` },
                        ]}
                      >
                        <Ionicons name={question.icon} size={20} color={question.color} />
                      </View>
                      <Text style={styles.suggestionText}>{question.text}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.chatList}>
                {messages.map((message) => {
                  const isUser = message.role === 'user';

                  return (
                    <View
                      key={message.id}
                      style={[
                        styles.messageRow,
                        isUser ? styles.messageRowUser : styles.messageRowAssistant,
                      ]}
                    >
                      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
                        <Ionicons
                          name={isUser ? 'person-outline' : 'sparkles-outline'}
                          size={16}
                          color={isUser ? '#ffffff' : '#007aff'}
                        />
                      </View>

                      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                          {message.text}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {isLoading ? (
                  <View style={[styles.messageRow, styles.messageRowAssistant]}>
                    <View style={[styles.avatar, styles.assistantAvatar]}>
                      <Ionicons name="sparkles-outline" size={16} color="#007aff" />
                    </View>

                    <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                      <View style={styles.typingDots}>
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.inputArea,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <View style={styles.inputBar}>
              <Pressable
                accessibilityLabel="إرسال"
                disabled={!input.trim() || isLoading}
                onPress={() => handleSend(input)}
                style={({ pressed }) => [
                  styles.sendButton,
                  (!input.trim() || isLoading) && styles.sendButtonDisabled,
                  pressed && input.trim() && !isLoading && styles.pressed,
                ]}
              >
                {isLoading ? (
                  <View style={styles.sendLoading}>
                    <View style={styles.sendLoadingDot} />
                    <View style={styles.sendLoadingDot} />
                    <View style={styles.sendLoadingDot} />
                  </View>
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color={input.trim() ? '#ffffff' : Colors.mutedForeground}
                  />
                )}
              </Pressable>

              <TextInput
                blurOnSubmit={false}
                editable={!isLoading}
                onChangeText={setInput}
                onSubmitEditing={() => handleSend(input)}
                placeholder="اكتب رسالتك..."
                placeholderTextColor="rgba(142,142,147,0.7)"
                returnKeyType="send"
                style={styles.input}
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
    backgroundColor: '#f6f7fb',
  },
  keyboardView: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
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
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f7cff',
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
    borderColor: '#f6f7fb',
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
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
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
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '48.4%',
    minHeight: 102,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  suggestionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'flex-start',
    flexDirection: 'row-reverse',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: '#4f7cff',
  },
  assistantAvatar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
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
    backgroundColor: '#4f7cff',
    borderBottomRightRadius: 8,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    borderBottomLeftRadius: 8,
  },
  messageText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 15,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
    textAlign: 'right',
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
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
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f7cff',
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
