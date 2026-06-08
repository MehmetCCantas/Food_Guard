'use client';

import { useState, useEffect, useRef, KeyboardEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './chat.module.css';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/types';

const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

function getOtherParticipant(conv: Conversation, myId?: string) {
    return conv.participants?.find((p) => p.id !== myId) ?? conv.participants?.[0];
}

function cleanChatName(name: string) {
    if (!name) return 'User';
    const cleaned = name.replace(/\b(Donor User|Partner User|Donor|Recipient|Owner|Admin)\b/gi, '').trim();
    return cleaned || 'User';
}

function ChatPageContent() {
    const { user } = useAuth();
    const {
        conversations,
        activeConversationId,
        messages,
        totalUnread,
        loadingMessages,
        setActiveConversation,
        sendMessage,
        refreshConversations,
    } = useChat();

    const [inputValue, setInputValue] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Auto-select conversation from URL param
    useEffect(() => {
        const convId = searchParams.get('conversationId');
        if (convId) setActiveConversation(convId);
    }, [searchParams, setActiveConversation]);

    useEffect(() => {
        refreshConversations();
    }, [refreshConversations]);

    // Scroll to latest messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || sending) return;
        setSending(true);
        const val = inputValue;
        setInputValue('');
        await sendMessage(val);
        setSending(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const activeConversation = conversations.find((c) => c.id === activeConversationId);
    const otherUser = activeConversation ? getOtherParticipant(activeConversation, user?.id) : null;

    return (
        <div className={styles.chatContainer}>
            {/* ---- Sol Panel: Konuşmalar ---- */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.sidebarTitle}>💬 Messages</h2>
                    {totalUnread > 0 && (
                        <span className={styles.totalBadge}>{totalUnread}</span>
                    )}
                </div>

                <div className={styles.convList}>
                    {conversations.length === 0 ? (
                        <div className={styles.emptyConvs}>
                            <div className={styles.emptyIcon}>💬</div>
                            <p>No conversations yet</p>
                            <p className={styles.emptyHint}>
                                You can start a conversation by messaging a donor from a listing card.
                            </p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const other = getOtherParticipant(conv, user?.id);
                            const isActive = conv.id === activeConversationId;
                            return (
                                <button
                                    key={conv.id}
                                    className={`${styles.convItem} ${isActive ? styles.convItemActive : ''}`}
                                    onClick={() => setActiveConversation(conv.id)}
                                >
                                    <div className={styles.convAvatar}>
                                        {cleanChatName(other?.fullName || `${other?.firstName} ${other?.lastName}`).charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.convInfo}>
                                        <div className={styles.convName}>
                                            {cleanChatName(other?.fullName || `${other?.firstName} ${other?.lastName}`)}
                                        </div>
                                        {conv.product && (
                                            <div className={styles.convProduct}>
                                                📦 {conv.product.title}
                                            </div>
                                        )}
                                        {conv.lastMessage && (
                                            <div className={styles.convLastMsg}>
                                                {conv.lastMessage.content.slice(0, 40)}
                                                {conv.lastMessage.content.length > 40 ? '...' : ''}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.convMeta}>
                                        {conv.lastMessage && (
                                            <span className={styles.convTime}>
                                                {formatTime(conv.lastMessage.createdAt)}
                                            </span>
                                        )}
                                        {(conv.unreadCount ?? 0) > 0 && (
                                            <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* ---- Sağ Panel: Mesajlar ---- */}
            <main className={styles.chatMain}>
                {!activeConversationId ? (
                    <div className={styles.noChatSelected}>
                        <div className={styles.noChatIcon}>💬</div>
                        <h3>Select a Conversation</h3>
                        <p>Click a conversation on the left panel or use the "Message" button on a listing.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className={styles.chatHeader}>
                            <div className={styles.chatHeaderAvatar}>
                                {cleanChatName(otherUser?.fullName || `${otherUser?.firstName} ${otherUser?.lastName}`).charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.chatHeaderInfo}>
                                <div className={styles.chatHeaderName}>
                                    {cleanChatName(otherUser?.fullName || `${otherUser?.firstName} ${otherUser?.lastName}`)}
                                </div>
                                {activeConversation?.product && (
                                    <div className={styles.chatHeaderProduct}>
                                        📦 {activeConversation.product.title}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className={styles.messagesArea}>
                            {loadingMessages ? (
                                <div className={styles.loadingMessages}>
                                    <div className={styles.spinner} />
                                    <span>Loading messages...</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className={styles.noMessages}>
                                    <span>No messages yet. Send the first one! 👋</span>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, idx) => {
                                        const isMine = msg.senderId === user?.id;
                                        const prevMsg = messages[idx - 1];
                                        const showDate =
                                            !prevMsg ||
                                            new Date(msg.createdAt).toDateString() !==
                                                new Date(prevMsg.createdAt).toDateString();

                                        return (
                                            <div key={msg.id}>
                                                {showDate && (
                                                    <div className={styles.dateSeparator}>
                                                        {formatDate(msg.createdAt)}
                                                    </div>
                                                )}
                                                <div
                                                    className={`${styles.message} ${
                                                        isMine ? styles.messageMine : styles.messageTheirs
                                                    }`}
                                                >
                                                    <div className={styles.messageBubble}>
                                                        {msg.content}
                                                    </div>
                                                    <div className={styles.messageTime}>
                                                        {formatTime(msg.createdAt)}
                                                        {isMine && (
                                                            <span className={styles.readTick}>
                                                                {msg.isRead ? ' ✓✓' : ' ✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className={styles.inputArea}>
                            <textarea
                                className={styles.messageInput}
                                placeholder="Type a message... (Enter to send)"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                disabled={sending}
                            />
                            <button
                                className={styles.sendBtn}
                                onClick={handleSend}
                                disabled={!inputValue.trim() || sending}
                            >
                                {sending ? (
                                    <span className={styles.sendSpinner} />
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>⏳ Loading...</div>}>
            <ChatPageContent />
        </Suspense>
    );
}
