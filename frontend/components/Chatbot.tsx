"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { getStoredLanguage, LanguageCode } from "@/lib/language";
import {
  ChatMessage,
  findChatbotResponse,
  QUICK_PROMPTS,
  QuickPrompt,
} from "@/lib/chatbotKnowledge";
import styles from "./chatbot.module.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "mr" | "hi">("en");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "🌾 **Namaste! I am Kisan Sathi (शेतकरी मित्र AI).**\nHow can I help you today? You can ask me about **Government Schemes (PM-KUSUM 90% Solar Subsidy, PM-KISAN)**, **Pest & Disease Solutions**, or **Today's Mandi Market Rates**!",
      category: "general",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getStoredLanguage() as "en" | "mr" | "hi";
    if (stored === "mr" || stored === "hi" || stored === "en") {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const resp = findChatbotResponse(query, lang);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: resp.text,
        category: resp.category,
        actionLink: resp.actionLink,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  }

  function handleQuickPrompt(prompt: QuickPrompt) {
    const query = prompt.query;
    handleSend(query);
  }

  function toggleSpeech(msg: ChatMessage) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingId(msg.id);

    // Clean markdown tokens for clear speech
    const cleanText = msg.text
      .replace(/\*\*/g, "")
      .replace(/[*_~`#]/g, "")
      .replace(/https?:\/\/\S+/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (lang === "mr") {
      utterance.lang = "mr-IN";
    } else if (lang === "hi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  }

  function toggleVoiceInput() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate speech query for browsers without native Web Speech API
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const sampleVoiceQuery =
          lang === "mr"
            ? "पीएम कुसुम सौर पंप योजनेसाठी अर्ज कसा करावा?"
            : lang === "hi"
            ? "पीएम कुसुम सोलर पंप सब्सिडी के लिए क्या पात्रता है?"
            : "How to apply for PM-KUSUM 90% solar pump subsidy?";
        setInput(sampleVoiceQuery);
      }, 1400);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.lang = lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN";
      recognition.interimResults = false;

      setIsListening(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  }

  function switchLanguage(target: "en" | "mr" | "hi") {
    setLang(target);
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className={styles.floatingTrigger}
          onClick={() => setIsOpen(true)}
          aria-label="Open Kisan Sathi AI Chatbot"
        >
          <div className={styles.triggerAvatarWrapper}>
            <span>🌾</span>
            <span className={styles.onlinePulse} />
          </div>
          <div className={styles.triggerText}>
            <span className={styles.triggerTitle}>Kisan Sathi AI</span>
            <span className={styles.triggerSubtitle}>
              {lang === "mr" ? "शेतकरी मित्र AI" : lang === "hi" ? "किसान सहायक AI" : "Smart Agri Assistant"}
            </span>
          </div>
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow} role="dialog" aria-label="Kisan Sathi AI Assistant">
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerAvatar}>🌾</div>
              <div className={styles.headerInfo}>
                <h3>Kisan Sathi AI</h3>
                <span className={styles.headerBadge}>
                  <span className={styles.headerBadgeDot} />
                  Online · Shetkari Assistant
                </span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.langPill}
                onClick={() =>
                  switchLanguage(lang === "en" ? "mr" : lang === "mr" ? "hi" : "en")
                }
                title="Switch Language"
              >
                {lang === "en" ? "English" : lang === "mr" ? "मराठी" : "हिंदी"}
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setMessages([messages[0]])}
                title="Clear Chat"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => {
                  if (speakingId) {
                    window.speechSynthesis?.cancel();
                    setSpeakingId(null);
                  }
                  setIsOpen(false);
                }}
                title="Close Chat"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className={styles.promptsScroll}>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                className={styles.promptChip}
                onClick={() => handleQuickPrompt(prompt)}
              >
                <span>{prompt.icon}</span>
                <span>
                  {lang === "mr"
                    ? prompt.labelMr
                    : lang === "hi"
                    ? prompt.labelHi
                    : prompt.label}
                </span>
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className={styles.messagesContainer}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${
                  msg.sender === "user" ? styles.messageRowUser : styles.messageRowBot
                }`}
              >
                <div
                  className={`${styles.msgAvatar} ${
                    msg.sender === "user" ? styles.msgAvatarUser : styles.msgAvatarBot
                  }`}
                >
                  {msg.sender === "user" ? "👨‍🌾" : "🌾"}
                </div>
                <div
                  className={`${styles.msgBubble} ${
                    msg.sender === "user" ? styles.msgBubbleUser : styles.msgBubbleBot
                  }`}
                >
                  <div className={styles.botContent}>{msg.text}</div>

                  {msg.actionLink && (
                    <Link
                      href={msg.actionLink.url}
                      className={styles.actionCard}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>🚀 {msg.actionLink.label}</span>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}

                  {msg.sender === "bot" && (
                    <div className={styles.msgFooter}>
                      <span>{msg.timestamp}</span>
                      <button
                        type="button"
                        className={styles.speakBtn}
                        onClick={() => toggleSpeech(msg)}
                        title="Read aloud"
                      >
                        {speakingId === msg.id ? (
                          <>
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                            </svg>
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.messageRow} ${styles.messageRowBot}`}>
                <div className={`${styles.msgAvatar} ${styles.msgAvatarBot}`}>🌾</div>
                <div className={`${styles.msgBubble} ${styles.msgBubbleBot}`}>
                  <div className={styles.typingIndicator}>
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            className={styles.chatInputForm}
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.chatInput}
                placeholder={
                  lang === "mr"
                    ? "सौर पंप, कीड नियंत्रण किंवा बाजारभाव विचारा..."
                    : lang === "hi"
                    ? "सोलर पंप, कीट उपाय या मंडी भाव पूछें..."
                    : "Ask about Solar pump subsidy, pests, mandi rates..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="button"
                className={`${styles.voiceBtn} ${isListening ? styles.voiceListening : ""}`}
                onClick={toggleVoiceInput}
                title={isListening ? "Listening..." : "Speak query"}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
            </div>
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
