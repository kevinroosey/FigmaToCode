"use client";

import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useCodeContext } from "@/hooks/use-code";
import { IconArrowBackUp } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


type ChatHistory = {
    user: 'user' | 'claude';
    message: string;
    codeBeforeChange?: string;
}

export default function Chat() {

    const { code, setCode } = useCodeContext();
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

    const [isClaudeTyping, setIsClaudeTyping] = useState(false);

    const sendMessage = async () => {
        try {
            setIsClaudeTyping(true);
            const data = await fetch('/api/tweak-design', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, code }),
            });

            const response = await data.json();
            if (response.error) {
                throw new Error(response.error);
            }

            setCode(response.completion);
            setChatHistory([...chatHistory, { user: 'user', message, codeBeforeChange: code }]);
            setMessage("");
            setIsClaudeTyping(false);

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Anthropic API Error: ${error.message}`);
            }
            setIsClaudeTyping(false);
            setMessage("");  
        } 
    }

    return (
        <div className="h-screen flex flex-col justify-end p-16">
            <div className="flex flex-col gap-4 pb-6">
                {chatHistory.map((chat, index) => (
                    <div key={index} className={`flex ${chat.user === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`flex justify-between items-center gap-3 bg-neutral-800 rounded-xl p-6 ring-2 ring-transparent ${chat.user === 'user' ? 'mr-auto' : 'ml-auto'}`}>
                            <span className="text-neutral-200">{chat.message}</span>
                            <div className="flex justify-center items-center h-8 w-8 bg-neutral-800 hover:bg-neutral-700 rounded-lg">
                                <TooltipProvider>

                                    <Tooltip>
                                        <TooltipTrigger>
                                            <IconArrowBackUp className={`h-5 w-5 text-neutral-300`} /> 
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-neutral-700 ml-2" side="right">
                                        <p>Revert code to previous state</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="group bg-neutral-800 h-32 rounded-xl p-6 ring-2 ring-transparent focus-within:ring-blue-500">
                <textarea
                className="bg-neutral-800 w-full rounded-xl resize-none placeholder-neutral-300 text-neutral-100 focus:outline-none"
                placeholder="Tweak the design with Polymet"
                rows={2}
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                ></textarea>
                <div className="w-full flex justify-end items-end">
                    <button
                        className="rounded-full h-8 w-8 bg-neutral-100 hover:bg-neutral-300 flex disabled:bg-neutral-500"
                        onClick={sendMessage}
                        disabled={!message || isClaudeTyping}
                    >
                        {isClaudeTyping ? (
                            <svg
                                className="animate-spin h-5 w-5 text-neutral-950"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                ></circle>
                                <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <ArrowUpIcon className="h-4 w-4 text-neutral-950 m-auto" strokeWidth={2.5} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
