"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    className?: string;
    closeOnClick?: boolean;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    maxDropdownHeight?: number;
}

export function Dropdown({
    trigger,
    children,
    className = "",
    closeOnClick = true,
    isOpen: controlledIsOpen,
    onOpenChange,
    maxDropdownHeight = 320,
}: DropdownProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [position, setPosition] = useState<"bottom" | "top">("bottom");
    const [maxHeight, setMaxHeight] = useState<number>(maxDropdownHeight);
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const dropdownRef = useRef<HTMLDivElement>(null);

    const setIsOpen = (newIsOpen: boolean) => {
        setInternalIsOpen(newIsOpen);
        onOpenChange?.(newIsOpen);
    };

    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const threshold = maxDropdownHeight;
            if (spaceBelow < threshold && spaceAbove > spaceBelow) {
                setPosition("top");
                setMaxHeight(Math.min(maxDropdownHeight, Math.max(150, spaceAbove - 80)));
            } else {
                setPosition("bottom");
                setMaxHeight(Math.min(maxDropdownHeight, Math.max(150, spaceBelow - 20)));
            }
        }
    }, [isOpen, maxDropdownHeight]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left h-full" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="h-full">
                {trigger}
            </div>
            {isOpen && (
                <div
                    className={`absolute left-0 z-50 ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"} bg-white border border-[#ddd] rounded-xl shadow-lg focus:outline-none overflow-hidden flex flex-col ${className}`}
                    style={{ maxHeight: `${maxHeight}px` }}
                    onClick={(e) => {
                        if (!closeOnClick) e.stopPropagation();
                        else setIsOpen(false);
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

export function DropdownItem({ children, onClick }: { children: ReactNode; onClick?: () => void; closeOnClick?: boolean }) {
    return (
        <div className="cursor-pointer hover:bg-gray-50 px-3 py-2 transition-colors" onClick={onClick}>
            {children}
        </div>
    );
}
