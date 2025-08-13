import VideoBackground from "@/components/VideoBackground";
import ChatUI from "@/components/ChatUI";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function Home() {
	return (
		<div className="relative min-h-screen font-sans">
			<VideoBackground />
			<div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
				<div className="flex flex-col items-center gap-4">
					<h1 className="text-2xl sm:text-3xl font-semibold text-cyan-300 drop-shadow">JARVIS</h1>
					<ChatUI />
					<ChatbotWidget />
				</div>
			</div>
		</div>
	);
}
