/**
 * Custom hook for mouse position tracking (glow effect)
 */

import { useState, useEffect, useCallback } from 'react';

interface MousePosition {
    x: number;
    y: number;
}

export function useMousePosition() {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    return mousePosition;
}

export function useRelativeMousePosition(elementRef: React.RefObject<HTMLElement>) {
    const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            setPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        };

        element.addEventListener('mousemove', handleMouseMove);
        return () => element.removeEventListener('mousemove', handleMouseMove);
    }, [elementRef]);

    return position;
}
