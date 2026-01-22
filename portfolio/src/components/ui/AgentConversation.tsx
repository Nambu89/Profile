/**
 * Agent Conversation Flow - Multi-Agent System Visualization
 * Shows real-time conversation between user and AI agents
 * Demonstrates RAG + Multi-Agent orchestration
 */

import React, { useEffect, useReducer, useRef } from 'react';
import gsap from 'gsap';
import './AgentConversation.css';

// Conversation scenarios (real Impuestify examples)
const conversations = [
    {
        id: 1,
        messages: [
            { role: 'user', content: '¿Cuánto pagaré de IRPF con un salario de 35.000€ anuales?', delay: 0 },
            { role: 'coordinator', content: 'Derivando consulta a TaxAgent especializado en IRPF...', delay: 1.5 },
            {
                role: 'rag',
                content: 'RAG Retrieval:',
                docs: ['📄 BOE 2024 - Art. 56 IRPF', '📄 Real Decreto 439/2024'],
                delay: 3
            },
            { role: 'agent', content: 'Según normativa vigente, con 35.000€ anuales pagarías ~5.950€ en IRPF (tipo efectivo 17%). Esto considera deducciones estándar.', delay: 5.5 },
        ]
    },
    {
        id: 2,
        messages: [
            { role: 'user', content: '¿Qué gastos puedo deducir siendo autónomo?', delay: 0 },
            { role: 'coordinator', content: 'Conectando con TaxAgent para consulta fiscal autónomos...', delay: 1.5 },
            {
                role: 'rag',
                content: 'RAG Retrieval:',
                docs: ['📄 Ley 35/2006 Art. 28-30', '📄 Gastos Deducibles AEAT'],
                delay: 3
            },
            { role: 'agent', content: 'Puedes deducir: suministros (30% si trabajas en casa), material de oficina, formación, seguros profesionales, cuotas de autónomo, software y herramientas necesarias para tu actividad.', delay: 5.5 },
        ]
    },
    {
        id: 3,
        messages: [
            { role: 'user', content: 'Explícame cómo calcular mi retención de IRPF en nómina', delay: 0 },
            { role: 'coordinator', content: 'Redirigiendo a PayslipAgent para cálculo de retención...', delay: 1.5 },
            {
                role: 'rag',
                content: 'RAG Retrieval:',
                docs: ['📄 Tablas retención 2024', '📄 RD 439/2024 Anexo I'],
                delay: 3
            },
            { role: 'agent', content: 'La retención se calcula: (Base regularizada × Tipo retención) / 12 meses. La base considera tu salario bruto anual, circunstancias personales (hijos, discapacidad) y situación familiar.', delay: 5.5 },
        ]
    }
];

// Agent avatars and colors
const agentStyles = {
    user: { icon: '👤', color: '#61dafb', name: 'Usuario' },
    coordinator: { icon: '🎯', color: '#ff6b6b', name: 'Coordinator' },
    agent: { icon: '🤖', color: '#D2FF00', name: 'TaxAgent' },
    rag: { icon: '📚', color: '#2d8a5e', name: 'RAG System' }
};

// State machine types
type MessageRole = 'user' | 'coordinator' | 'agent' | 'rag';

interface Message {
    role: MessageRole;
    content: string;
    docs?: string[];
    delay: number;
}

interface State {
    currentConversationIndex: number;
    currentMessageIndex: number;
    isTyping: boolean;
    isVisible: boolean;
}

type Action =
    | { type: 'NEXT_MESSAGE' }
    | { type: 'START_TYPING' }
    | { type: 'NEXT_CONVERSATION' }
    | { type: 'RESET' };

const initialState: State = {
    currentConversationIndex: 0,
    currentMessageIndex: -1,
    isTyping: false,
    isVisible: true
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'START_TYPING':
            return { ...state, isTyping: true };
        case 'NEXT_MESSAGE':
            const currentConversation = conversations[state.currentConversationIndex];
            if (state.currentMessageIndex < currentConversation.messages.length - 1) {
                return {
                    ...state,
                    currentMessageIndex: state.currentMessageIndex + 1,
                    isTyping: false
                };
            }
            return state;
        case 'NEXT_CONVERSATION':
            const nextIndex = (state.currentConversationIndex + 1) % conversations.length;
            return {
                ...initialState,
                currentConversationIndex: nextIndex,
                isVisible: false
            };
        case 'RESET':
            return { ...state, isVisible: true, currentMessageIndex: -1 };
        default:
            return state;
    }
}

export const AgentConversation: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const currentConversation = conversations[state.currentConversationIndex];
    const visibleMessages = currentConversation.messages.slice(0, state.currentMessageIndex + 1);

    useEffect(() => {
        // Auto-advance messages
        if (state.currentMessageIndex < currentConversation.messages.length - 1) {
            const nextMessage = currentConversation.messages[state.currentMessageIndex + 1];
            timeoutRef.current = setTimeout(() => {
                dispatch({ type: 'NEXT_MESSAGE' });
            }, nextMessage.delay * 1000);
        } else {
            // Conversation finished - wait 4s then start new one
            timeoutRef.current = setTimeout(() => {
                dispatch({ type: 'NEXT_CONVERSATION' });
                setTimeout(() => {
                    dispatch({ type: 'RESET' });
                }, 500);
            }, 4000);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [state.currentMessageIndex, currentConversation.messages]);

    // Animate new messages
    useEffect(() => {
        if (containerRef.current && state.currentMessageIndex >= 0) {
            const lastMessage = containerRef.current.lastElementChild;
            if (lastMessage) {
                gsap.fromTo(
                    lastMessage,
                    { opacity: 0, y: 20, scale: 0.9 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)' }
                );
            }
        }
    }, [state.currentMessageIndex]);

    // Fade in/out conversation
    useEffect(() => {
        if (containerRef.current) {
            gsap.to(containerRef.current, {
                opacity: state.isVisible ? 1 : 0,
                duration: 0.5
            });
        }
    }, [state.isVisible]);

    return (
        <div className="agent-conversation" ref={containerRef}>
            <div className="agent-conversation__header">
                <div className="agent-conversation__title">
                    <span className="agent-conversation__icon">💬</span>
                    <span>Multi-Agent System</span>
                </div>
                <div className="agent-conversation__badge">Live Demo</div>
            </div>

            <div className="agent-conversation__messages">
                {visibleMessages.map((message, index) => (
                    <div key={index} className={`message message--${message.role}`}>
                        <div className="message__avatar">
                            <span className="message__avatar-icon">
                                {agentStyles[message.role].icon}
                            </span>
                        </div>
                        <div className="message__content">
                            <div className="message__header">
                                <span className="message__name" style={{ color: agentStyles[message.role].color }}>
                                    {agentStyles[message.role].name}
                                </span>
                            </div>
                            <div className="message__bubble">
                                <p className="message__text">{message.content}</p>
                                {message.docs && message.docs.length > 0 && (
                                    <div className="message__docs">
                                        {message.docs.map((doc, i) => (
                                            <div key={i} className="message__doc">
                                                {doc}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {state.isTyping && (
                    <div className="message message--typing">
                        <div className="message__avatar">
                            <span className="message__avatar-icon">🤖</span>
                        </div>
                        <div className="message__bubble message__bubble--typing">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="agent-conversation__footer">
                <div className="agent-conversation__info">
                    Powered by RAG + Multi-Agent Architecture
                </div>
            </div>
        </div>
    );
};
