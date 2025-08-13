"use client";

import React, { useCallback, useEffect } from "react";

const ELEVENLABS_SCRIPT_ID = "elevenlabs-convai-script";
const ELEVENLABS_SCRIPT_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

const ChatbotWidget: React.FC = () => {
	useEffect(() => {
		if (!document.getElementById(ELEVENLABS_SCRIPT_ID)) {
			const script = document.createElement("script");
			script.id = ELEVENLABS_SCRIPT_ID;
			script.src = ELEVENLABS_SCRIPT_SRC;
			script.async = true;
			script.type = "text/javascript";
			document.body.appendChild(script);
		}
	}, []);

	const handleMicClick = useCallback(() => {
		// Best-effort: attempt to find a button inside any shadow DOM (Convai widget uses shadow DOM)
		try {
			const allElements = Array.from(document.querySelectorAll("*") as any);
			for (const element of allElements) {
				const shadowRoot = (element as Element & { shadowRoot?: ShadowRoot }).shadowRoot;
				if (!shadowRoot) continue;
				const micBtn = shadowRoot.querySelector("button");
				if (micBtn instanceof HTMLButtonElement) {
					micBtn.click();
					return;
				}
			}
		} catch (err) {
			// noop: widget may not be mounted yet
		}
	}, []);

	return (
		<div className="flex items-center justify-center">
			<button
				onClick={handleMicClick}
				className="inline-flex items-center gap-2 rounded-full bg-cyan-500/80 hover:bg-cyan-400 text-white px-5 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-300 focus:ring-offset-black/40"
				aria-label="Start or stop voice conversation"
			>
				<span className="i-mdi-microphone" aria-hidden />
				<span className="text-sm font-medium">Voice</span>
			</button>
		</div>
	);
};

export default ChatbotWidget;

