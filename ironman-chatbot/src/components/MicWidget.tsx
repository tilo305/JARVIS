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
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaStreamRef.current = stream;
			const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
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
					const ct = res.headers.get("content-type") || "";
					if (ct.startsWith("audio/") || ct.includes("octet-stream")) {
						const audioBlob = await res.blob();
						const url = URL.createObjectURL(audioBlob);
						const audio = new Audio(url);
						setIsProcessing(false);
						setIsPlaying(true);
						setStatus("Speaking...");
						audio.onended = () => {
							setIsPlaying(false);
							setStatus("Ready");
							URL.revokeObjectURL(url);
						};
						audio.play().catch(() => {
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
				<button
					type="button"
					onClick={handleToggleRecording}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") handleToggleRecording();
					}}
					className={`h-14 w-14 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
						isRecording
							? "bg-red-600/90 border-red-400 shadow animate-pulse"
							: "bg-white/10 border-white/30 hover:bg-white/20"
					}`}
					aria-label={ariaLabel}
					aria-pressed={isRecording}
					tabIndex={0}
				>
					<span className="text-white text-xl" aria-hidden>
						{isRecording ? "■" : "🎤"}
					</span>
				</button>
				<div className="min-w-[120px] text-xs text-white/90" aria-live="polite">{status}</div>
			</div>
			{isProcessing && (
				<div className="mt-2 text-center text-[11px] text-white/70">Uploading and processing audio...</div>
			)}
		</div>
	);
};

export default MicWidget;

