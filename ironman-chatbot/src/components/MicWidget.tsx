"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type MicWidgetProps = {
	className?: string;
	onAssistantText?: (text: string) => void;
};

const INTERNAL_CHAT_API = "/api/chat";

const MicWidget: React.FC<MicWidgetProps> = ({ className, onAssistantText }) => {
	const [isRecording, setIsRecording] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [status, setStatus] = useState<string>("Ready");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const stopTimeoutRef = useRef<number | null>(null);
    const playbackRef = useRef<HTMLAudioElement | null>(null);

	const cleanupStream = useCallback(() => {
		try {
			mediaRecorderRef.current = null;
			if (mediaStreamRef.current) {
				mediaStreamRef.current.getTracks().forEach((t) => t.stop());
				mediaStreamRef.current = null;
			}
		} catch {}
	}, []);

	useEffect(() => () => cleanupStream(), [cleanupStream]);

    const handleStopRecording = useCallback(() => {
        if (!isRecording) return;
        try {
            mediaRecorderRef.current?.stop();
        } catch {}
    }, [isRecording]);

    const handleToggleRecording = useCallback(async () => {
		if (isRecording) {
			handleStopRecording();
			return;
		}

		try {
			setStatus("Listening...");
			chunksRef.current = [];
            if (!navigator.mediaDevices?.getUserMedia) {
                console.error("[MicWidget] mediaDevices.getUserMedia not available");
                setStatus("Mic unsupported");
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaStreamRef.current = stream;
            const preferred = [
                "audio/webm;codecs=opus",
                "audio/webm",
                "audio/ogg;codecs=opus",
            ];
            const supported = preferred.find((t) => (window as any).MediaRecorder?.isTypeSupported?.(t));
            const mime = supported || undefined;
            const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
            console.debug("[MicWidget] Using mime:", mime || "default");
			mediaRecorderRef.current = recorder;

			recorder.ondataavailable = (e) => {
				if (e.data) chunksRef.current.push(e.data);
			};

            recorder.onstop = async () => {
				setIsRecording(false);
				cleanupStream();
				setIsProcessing(true);
				setStatus("Processing...");
                try {
					const blob = new Blob(chunksRef.current, { type: "audio/webm" });
					const form = new FormData();
					form.append("data", blob, "input.webm");
					const res = await fetch(INTERNAL_CHAT_API, {
						method: "POST",
						body: form,
					});
                    const ct = (res.headers.get("content-type") || "").toLowerCase();
                    if (ct.startsWith("audio/") || ct.includes("octet-stream")) {
						const audioBlob = await res.blob();
						const url = URL.createObjectURL(audioBlob);
                        if (playbackRef.current) {
                            try { playbackRef.current.pause(); } catch {}
                        }
                        const audio = new Audio(url);
                        playbackRef.current = audio;
						setIsProcessing(false);
						setIsPlaying(true);
						setStatus("Speaking...");
						audio.onended = () => {
							setIsPlaying(false);
							setStatus("Ready");
							URL.revokeObjectURL(url);
						};
                        audio.play().catch((e) => {
                            console.error("[MicWidget] audio play failed", e);
							setIsPlaying(false);
							setStatus("Ready");
						});
					} else {
						// Fallback to text
                        const dataText = await res.text();
						let text = "";
						try {
							const json = JSON.parse(dataText);
							text = (json?.reply as string) || (json?.message as string) || (json?.data?.reply as string) || dataText;
						} catch {
							text = dataText;
						}
						setIsProcessing(false);
						setStatus("Ready");
						onAssistantText?.(text);
					}
                } catch (err) {
                    console.error("[MicWidget] request failed", err);
                    setIsProcessing(false);
                    setStatus("Error");
				}
			};

			recorder.start();
			setIsRecording(true);
			// Auto stop after 6 seconds
			stopTimeoutRef.current = window.setTimeout(() => {
				if (recorder.state === "recording") recorder.stop();
			}, 6000);
        } catch (error) {
            console.error("[MicWidget] getUserMedia failed", error);
            setStatus("Mic error");
		}
	}, [cleanupStream, handleStopRecording, onAssistantText]);

	useEffect(() => () => {
		if (stopTimeoutRef.current !== null) window.clearTimeout(stopTimeoutRef.current);
	}, []);

    const ariaLabel = isRecording ? "Stop recording" : "Start recording";

	return (
        <div className={className}>
            <div className="flex items-center justify-center gap-3">
                <div className="relative">
                    {isRecording && (
                        <span className="pointer-events-none absolute inset-0 rounded-full animate-ping bg-red-500/40" aria-hidden />
                    )}
                    <button
                        type="button"
                        onClick={handleToggleRecording}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") handleToggleRecording();
                        }}
                        disabled={isProcessing}
                        className={`group h-16 w-16 rounded-full transition focus:outline-none focus:ring-2 will-change-transform ${
                            isRecording
                                ? "bg-gradient-to-b from-red-500 to-red-700 shadow-lg focus:ring-red-300"
                                : "bg-white/10 backdrop-blur border border-white/30 hover:bg-white/20 focus:ring-cyan-400"
                        } flex items-center justify-center`}
                        aria-label={ariaLabel}
                        aria-pressed={isRecording}
                        tabIndex={0}
                    >
                        {isRecording ? (
                            <span className="h-3 w-3 rounded-[4px] bg-white shadow-inner" aria-hidden />
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                className="h-7 w-7 text-white/95"
                                aria-hidden
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0m5 5v3m0 0h3m-3 0H9" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="min-w-[120px] text-xs text-white/90" aria-live="polite">{status}</div>
            </div>
            {isProcessing && (
                <div className="mt-2 text-center text-[11px] text-white/70">Uploading and processing audio...</div>
            )}
        </div>
	);
};

export default MicWidget;

