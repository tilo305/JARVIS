"use client";

import React from "react";

const VideoBackground: React.FC = () => {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden">
			<video
				className="h-full w-full object-cover"
				autoPlay
				loop
				muted
				playsInline
				aria-label="Iron Man animated background"
			>
				<source src="/videos/ironman_bg.webm" type="video/webm" />
				<source src="/videos/ironman_bg.mp4" type="video/mp4" />
			</video>
			<div className="absolute inset-0 bg-black/40" aria-hidden />
		</div>
	);
};

export default VideoBackground;

