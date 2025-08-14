"use client";

import React from "react";
import Script from "next/script";
import { useEffect } from "react";

const ELEVENLABS_SCRIPT_ID = "elevenlabs-convai-script";
const DEFAULT_WIDGET_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

const resolveWidgetSrc = (raw: string | undefined): string => {
  if (!raw || raw === "your_widget_src_here") return DEFAULT_WIDGET_SRC;
  // If a full snippet was pasted, extract the script src
  if (raw.includes("<")) {
    const match = raw.match(/<script[^>]*src=["']([^"']+)["']/i);
    return match?.[1] || DEFAULT_WIDGET_SRC;
  }
  // If it's not an absolute URL, ignore and use default
  if (!/^https?:\/\//i.test(raw)) return DEFAULT_WIDGET_SRC;
  return raw;
};

const ELEVENLABS_SCRIPT_SRC = resolveWidgetSrc(process.env.NEXT_PUBLIC_ELEVENLABS_WIDGET_SRC);

const ConvaiLoader: React.FC = () => {
	useEffect(() => {
		const unlock = () => {
			try {
				const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
				if (!Ctx) return;
				const ctx = new Ctx();
				if (ctx.state === "suspended") {
					ctx.resume().finally(() => {
						try { ctx.close(); } catch {}
					});
				} else {
					try { ctx.close(); } catch {}
				}
			} catch {}
		};
		window.addEventListener("pointerdown", unlock, { once: true, passive: true } as any);
		window.addEventListener("keydown", unlock, { once: true } as any);
		return () => {
			window.removeEventListener("pointerdown", unlock as any);
			window.removeEventListener("keydown", unlock as any);
		};
	}, []);

	return (
		<Script
			id={ELEVENLABS_SCRIPT_ID}
			src={ELEVENLABS_SCRIPT_SRC}
			strategy="afterInteractive"
			async
			onLoad={() => {
				try {
					console.log("ConvaiLoader: ElevenLabs widget script loaded");
					const defined = typeof (window as any).customElements?.get === "function" &&
						typeof (window as any).customElements.get("elevenlabs-convai") !== "undefined";
					if (!defined) {
						console.warn("ConvaiLoader: custom element not defined yet; it may register shortly");
					}
				} catch {}
			}}
			onError={(e) => {
				console.error("ConvaiLoader: failed to load ElevenLabs widget script", e);
			}}
		/>
	);
};

export default ConvaiLoader;

