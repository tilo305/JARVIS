"use client";

import React from "react";

type VoiceButtonProps = {
	className?: string;
};

// Replace button with direct ElevenLabs widget embed
const VoiceButton: React.FC<VoiceButtonProps> = ({ className }) => {
	const raw = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "";

	const extractAgentId = (value: string): string | null => {
		if (!value || value === "your_agent_id_here") return null;
		const htmlMatch = value.match(/agent-id=["']([^"']+)["']/i);
		if (htmlMatch?.[1]) return htmlMatch[1];
		const idMatch = value.match(/agent_[a-z0-9]+/i);
		return idMatch?.[0] || null;
	};

	const agentId = extractAgentId(raw);
	
	if (!agentId) {
		return (
			<div className={className}>
				<div className="rounded-lg bg-yellow-500/20 border border-yellow-500/30 p-4 text-center">
					<div className="text-yellow-300 text-sm">
						🎤 Voice Chat Unavailable
					</div>
					<div className="text-yellow-200/80 text-xs mt-1">
						Configure NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env.local
					</div>
				</div>
			</div>
		);
	}

    return (
        <div className={className}>
            <elevenlabs-convai agent-id={agentId as any} variant="compact"></elevenlabs-convai>
        </div>
    );
};

export default VoiceButton;

