"use client";

import React, { useEffect } from "react";

const ELEVENLABS_SCRIPT_ID = "elevenlabs-convai-script";
const ELEVENLABS_SCRIPT_SRC = process.env.NEXT_PUBLIC_ELEVENLABS_WIDGET_SRC || "https://unpkg.com/@elevenlabs/convai-widget-embed";
const ELEVENLABS_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

const ConvaiLoader: React.FC = () => {
	useEffect(() => {
		if (!document.getElementById(ELEVENLABS_SCRIPT_ID)) {
			const script = document.createElement("script");
			script.id = ELEVENLABS_SCRIPT_ID;
			script.src = ELEVENLABS_SCRIPT_SRC;
			script.async = true;
			script.type = "text/javascript";
			document.body.appendChild(script);
		}

		if (ELEVENLABS_AGENT_ID && !document.querySelector("elevenlabs-convai")) {
			const widget = document.createElement("elevenlabs-convai");
			widget.setAttribute("agent-id", ELEVENLABS_AGENT_ID);
			document.body.appendChild(widget);
		}
	}, []);

	return null;
};

export default ConvaiLoader;

