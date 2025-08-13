"use client";

import React, { useCallback } from "react";

type VoiceButtonProps = {
	className?: string;
};

const VoiceButton: React.FC<VoiceButtonProps> = ({ className }) => {
	const handleMicClick = useCallback(() => {
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
		} catch {
			// ignore
		}
	}, []);

	return (
		<button
			onClick={handleMicClick}
			className={
				className ||
					"inline-flex items-center gap-2 rounded-full bg-cyan-500/80 hover:bg-cyan-400 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-300 focus:ring-offset-black/40"
			}
			aria-label="Start or stop voice conversation"
			aria-pressed={false}
		>
			<span className="i-mdi-microphone" aria-hidden />
			<span className="text-sm font-medium">Voice</span>
		</button>
	);
};

export default VoiceButton;

