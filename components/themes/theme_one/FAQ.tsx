"use client";

import { useState } from "react";

export interface FAQItem {
    question: string;
    answer: string;
    initiallyOpen?: boolean;
}

interface FAQProps {
    faqs: FAQItem[];
    title?: string;
}

export default function FAQ({ faqs, title = "Frequently Asked Questions" }: FAQProps) {
    const [openItems, setOpenItems] = useState<Set<number>>(
        new Set(faqs.map((faq, index) => (faq.initiallyOpen ? index : -1)).filter((i) => i !== -1))
    );

    const toggleItem = (index: number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            newOpenItems.add(index);
        }
        setOpenItems(newOpenItems);
    };

    return (
        <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-12">{title}</h2>
                <div className="flex flex-col gap-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-black/10">
                            <button
                                className="flex w-full cursor-pointer items-center justify-between py-4 list-none"
                                onClick={() => toggleItem(index)}
                            >
                                <h3 className="font-bold text-lg text-left">{faq.question}</h3>
                                <span
                                    className={`material-symbols-outlined transition-transform duration-300 ${
                                        openItems.has(index) ? "rotate-180" : ""
                                    }`}
                                >
                                    expand_more
                                </span>
                            </button>
                            {openItems.has(index) && <p className="pb-4 text-black/60">{faq.answer}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
