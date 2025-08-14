"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import VoiceButton from "./VoiceButton";
import MicWidget from "./MicWidget";

type Message = {
	role: "user" | "assistant" | "system";
	text: string;
};

// Use internal API route to keep the n8n webhook URL server-side
const INTERNAL_CHAT_API = "/api/chat";

const ChatUI: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const listRef = useRef<HTMLDivElement | null>(null);

	const scrollToBottom = useCallback(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
	}, []);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = input.trim();
		if (!trimmed || isSending) return;

		const userMsg: Message = { role: "user", text: trimmed };
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsSending(true);

		try {
			const response = await fetch(INTERNAL_CHAT_API, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: trimmed }),
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage = errorData?.message || errorData?.error || `HTTP ${response.status}: ${response.statusText}`;
				throw new Error(errorMessage);
			}
			
			const data = await response.json().catch(() => ({}));
			const assistantText =
				(data?.reply as string) ||
				(data?.message as string) ||
				(data?.data?.reply as string) ||
				JSON.stringify(data ?? { error: "No response received" });

			const assistantMsg: Message = { role: "assistant", text: assistantText };
			setMessages((prev) => [...prev, assistantMsg]);
			setTimeout(scrollToBottom, 50);
		} catch (error: unknown) {
			const errText = error instanceof Error ? error.message : "Unknown error";
			const errorMessage = errText.includes("n8n webhook not configured") 
				? "⚠️ Please configure your n8n webhook URL in .env.local to enable chat functionality"
				: `❌ Error: ${errText}`;
			
			setMessages((prev) => [
				...prev,
				{ role: "assistant", text: errorMessage },
			]);
		} finally {
			setIsSending(false);
		}
	}, [input, isSending, scrollToBottom]);

	const placeholder = useMemo(
		() => "Type a message to JARVIS...",
		[]
	);



		const containerClassName = isExpanded
			? "w-[90vw] max-w-5xl rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-3 sm:p-4 text-white"
			: "w-[60vw] max-w-2xl rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-2 sm:p-3 text-white";


		const listClassName = isExpanded
			? "max-h-[60vh] overflow-y-auto space-y-3 pr-1"
			: "max-h-[25vh] overflow-y-auto space-y-2 pr-1";

		const handleToggleExpand = useCallback(() => {
			setIsExpanded((prev) => !prev);
		}, []);

		return (
			<div className={containerClassName}>
				<div className="flex items-center justify-end">
					<button
						onClick={handleToggleExpand}
						className="rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 text-xs"
						aria-label={isExpanded ? "Collapse chat window" : "Expand chat window"}
						aria-pressed={isExpanded}
						type="button"
					>
						{isExpanded ? "Collapse" : "Expand"}
					</button>
				</div>
			<div
				ref={listRef}
				className={listClassName}
				aria-live="polite"
				role="log"
			>
				{messages.length === 0 ? (
					<div className="flex flex-col items-center gap-3 py-3">
						<VoiceButton />
						<MicWidget
							className="mt-1"
							onAssistantText={(text) =>
								setMessages((prev) => [...prev, { role: "assistant", text }])
							}
						/>
					</div>
				) : (
					messages.map((m, idx) => (
						<div
							key={idx}
							className={
								m.role === "user"
									? "self-end ml-12 rounded-xl bg-cyan-500/80 px-3 py-2"
									: "self-start mr-12 rounded-xl bg-black/40 px-3 py-2"
							}
							aria-label={m.role === "user" ? "User message" : "Assistant message"}
						>
							<p className="whitespace-pre-wrap text-sm">{m.text}</p>
						</div>
					))
				)}
			</div>

			<form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
				<label htmlFor="chat-input" className="sr-only">Chat input</label>
				<input
					id="chat-input"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder={isSending ? "Processing..." : placeholder}
					className="flex-1 rounded-md bg-black/40 border border-white/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
					aria-label="Type a message"
					aria-busy={isSending}
					autoComplete="off"
				/>
				<button
					type="submit"
					disabled={isSending}
					className="rounded-md bg-cyan-500/80 hover:bg-cyan-400 disabled:opacity-50 px-3 py-1 text-xs font-medium"
					aria-disabled={isSending}
				>
					Send
				</button>
			</form>
		</div>
	);
};

export default ChatUI;

