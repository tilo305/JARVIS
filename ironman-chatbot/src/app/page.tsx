import VideoBackground from "@/components/VideoBackground";
import ChatUI from "@/components/ChatUI";
import ConvaiLoader from "@/components/ConvaiLoader";
import VoiceButton from "@/components/VoiceButton";

export default function Home() {
	return (
		<div className="relative min-h-screen font-sans">
			<VideoBackground />
			<div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
				<div className="flex flex-col items-center gap-4">
					<ConvaiLoader />
					<h1 className="text-2xl sm:text-3xl font-semibold text-cyan-300 drop-shadow">JARVIS</h1>
					<ChatUI />
				</div>
			</div>
            {/* Render the widget near mic area with low opacity; we'll duplicate in-chat positioning */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 opacity-40 hover:opacity-80 transition pointer-events-auto">
                <VoiceButton />
            </div>
		</div>
	);
}
