"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";

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
			const data = await response.json().catch(() => ({}));
			const assistantText =
				(data?.reply as string) ||
				(data?.message as string) ||
				(data?.data?.reply as string) ||
				JSON.stringify(data ?? { error: "No response" });

			const assistantMsg: Message = { role: "assistant", text: assistantText };
			setMessages((prev) => [...prev, assistantMsg]);
			setTimeout(scrollToBottom, 50);
		} catch (error: unknown) {
			const errText = error instanceof Error ? error.message : "Unknown error";
			setMessages((prev) => [
				...prev,
				{ role: "assistant", text: `Error sending message to n8n: ${errText}` },
			]);
		} finally {
			setIsSending(false);
		}
	}, [input, isSending, scrollToBottom]);

	const placeholder = useMemo(
		() => "Type a message to JARVIS (mic voice only)...",
		[]
	);

	return (
		<div className="w-full max-w-xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-4 sm:p-6 text-white">
			<div
				ref={listRef}
				className="max-h-[46vh] overflow-y-auto space-y-3 pr-1"
				aria-live="polite"
				role="log"
			>
				{messages.length === 0 ? (
					<p className="text-white/80 text-sm">Start by typing below or use the Voice button.</p>
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
					className="flex-1 rounded-lg bg-black/40 border border-white/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
					aria-label="Type a message"
					aria-busy={isSending}
					autoComplete="off"
				/>
				<button
					type="submit"
					disabled={isSending}
					className="rounded-lg bg-cyan-500/80 hover:bg-cyan-400 disabled:opacity-50 px-4 py-2 text-sm font-medium"
					aria-disabled={isSending}
				>
					Send
				</button>
			</form>
		</div>
	);
};

export default ChatUI;

