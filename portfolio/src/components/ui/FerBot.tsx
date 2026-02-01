/**
 * FerBot - AI-powered alter ego chat component
 * Bilingual support (ES/EN) with RAG-powered responses
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import './FerBot.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const FerBot: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const chatRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: t('ferbot.welcome'),
                timestamp: new Date()
            }]);
        }
    }, [isOpen, messages.length, t]);

    // Listen for external open events (from "Hablemos" button)
    useEffect(() => {
        const handleOpenEvent = () => {
            setIsOpen(true);
        };

        window.addEventListener('openFerBot', handleOpenEvent);
        return () => window.removeEventListener('openFerBot', handleOpenEvent);
    }, []);

    // Animate chat open/close
    useEffect(() => {
        if (chatRef.current) {
            if (isOpen) {
                gsap.fromTo(chatRef.current,
                    {
                        scale: 0.8,
                        opacity: 0,
                        y: 20
                    },
                    {
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        ease: 'back.out(1.7)'
                    }
                );
            }
        }
    }, [isOpen]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Floating button pulse animation
    useEffect(() => {
        if (buttonRef.current && !isOpen) {
            gsap.to(buttonRef.current, {
                scale: 1.1,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ferbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userMessage.content,
                    language: i18n.language
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(t('ferbot.errors.rateLimit'));
                }
                throw new Error(t('ferbot.errors.serverError'));
            }

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.answer,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            // Show error in chat
            const errorMessage: Message = {
                role: 'assistant',
                content: err instanceof Error ? err.message : t('ferbot.errors.unknown'),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="ferbot">
            {/* Floating Button */}
            <button
                ref={buttonRef}
                className={`ferbot__button ${isOpen ? 'ferbot__button--open' : ''}`}
                onClick={toggleChat}
                aria-label={isOpen ? t('ferbot.closeChat') : t('ferbot.openChat')}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
            </button>

            {/* Chat Interface */}
            {isOpen && (
                <div ref={chatRef} className="ferbot__chat">
                    {/* Header */}
                    <div className="ferbot__header">
                        <div className="ferbot__header-info">
                            <div className="ferbot__avatar">
                                <span>FP</span>
                            </div>
                            <div>
                                <h3 className="ferbot__title">{t('ferbot.title')}</h3>
                                <p className="ferbot__subtitle">{t('ferbot.subtitle')}</p>
                            </div>
                        </div>
                        <div className="ferbot__status">
                            <span className="ferbot__status-dot"></span>
                            <span className="ferbot__status-text">{t('ferbot.online')}</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="ferbot__messages">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`ferbot__message ferbot__message--${message.role}`}
                            >
                                <div className="ferbot__message-content">
                                    {message.content}
                                </div>
                                <div className="ferbot__message-time">
                                    {message.timestamp.toLocaleTimeString(i18n.language, {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="ferbot__message ferbot__message--assistant">
                                <div className="ferbot__message-content">
                                    <div className="ferbot__typing">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="ferbot__input-container">
                        <textarea
                            className="ferbot__input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('ferbot.placeholder')}
                            rows={1}
                            maxLength={500}
                            disabled={isLoading}
                        />
                        <button
                            className="ferbot__send"
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            aria-label={t('ferbot.send')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="ferbot__footer">
                        <p>{t('ferbot.poweredBy')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
