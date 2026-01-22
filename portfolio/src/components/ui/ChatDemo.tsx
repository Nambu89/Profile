/**
 * ChatDemo - Interactive chat interface for demo apps
 */

import React, { useState, useRef, useEffect } from 'react';
import './ChatDemo.css';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    sources?: Array<{ title: string; page?: number }>;
    timestamp: Date;
}

interface ChatResponse {
    response: string;
    sources?: Array<{ title: string; page?: number }>;
    demo: boolean;
    remaining_requests: number;
    processing_time: number;
}

interface ChatDemoProps {
    appId: string;
    appName: string;
    appIcon: string;
    appTagline: string;
    appUrl: string;
    apiUrl: string;
    exampleQuestions: string[];
    welcomeMessage: string;
}

export const ChatDemo: React.FC<ChatDemoProps> = ({
    appId,
    appName,
    appIcon,
    appTagline,
    appUrl,
    apiUrl,
    exampleQuestions,
    welcomeMessage,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mensaje inicial de bienvenida
    useEffect(() => {
        setMessages([{
            id: 'welcome',
            type: 'assistant',
            content: welcomeMessage,
            timestamp: new Date(),
        }]);
    }, [welcomeMessage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userMessage.content,
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('⏱️ Límite alcanzado. Espera 1 minuto o accede a la versión completa.');
                }
                throw new Error('Error al procesar tu pregunta. Intenta de nuevo.');
            }

            const data: ChatResponse = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: data.response,
                sources: data.sources,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
            setRemainingRequests(data.remaining_requests);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: `❌ ${err instanceof Error ? err.message : 'Error desconocido'}`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleExampleClick = (question: string) => {
        setInput(question);
        inputRef.current?.focus();
    };

    return (
        <div className="chat-demo">
            {/* Header */}
            <div className="chat-demo__header">
                <div className="chat-demo__header-content">
                    <div className="chat-demo__icon">{appIcon}</div>
                    <div>
                        <h3 className="chat-demo__title">{appName}</h3>
                        <p className="chat-demo__subtitle">{appTagline}</p>
                    </div>
                </div>
                {remainingRequests !== null && (
                    <div className="chat-demo__counter">
                        <span className="chat-demo__counter-badge">
                            {remainingRequests} preguntas restantes
                        </span>
                    </div>
                )}
            </div>

            {/* Messages Container */}
            <div className="chat-demo__messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`chat-demo__message chat-demo__message--${message.type}`}
                    >
                        <div className="chat-demo__message-avatar">
                            {message.type === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="chat-demo__message-content">
                            <div className="chat-demo__message-text">
                                {message.content.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                            {message.sources && message.sources.length > 0 && (
                                <div className="chat-demo__sources">
                                    <strong>📚 Fuentes:</strong>
                                    <ul>
                                        {message.sources.map((source, idx) => (
                                            <li key={idx}>
                                                {source.title}
                                                {source.page && ` (pág. ${source.page})`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="chat-demo__message chat-demo__message--assistant">
                        <div className="chat-demo__message-avatar">🤖</div>
                        <div className="chat-demo__message-content">
                            <div className="chat-demo__typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Example Questions */}
            {messages.length === 1 && !isLoading && exampleQuestions.length > 0 && (
                <div className="chat-demo__examples">
                    <p className="chat-demo__examples-label">💡 Prueba preguntando:</p>
                    <div className="chat-demo__examples-buttons">
                        {exampleQuestions.map((question, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleExampleClick(question)}
                                className="chat-demo__example-button"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="chat-demo__input-form">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta sobre impuestos..."
                    className="chat-demo__input"
                    maxLength={500}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="chat-demo__send-button"
                >
                    {isLoading ? (
                        <span className="chat-demo__send-loading">⏳</span>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    )}
                </button>
            </form>

            {/* Footer */}
            <div className="chat-demo__footer">
                <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-demo__footer-link"
                >
                    🚀 Accede a la versión completa →
                </a>
            </div>
        </div>
    );
};
