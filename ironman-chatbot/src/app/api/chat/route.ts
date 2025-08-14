import { NextResponse } from "next/server";

const DEFAULT_N8N_URL = "https://n8n.example.com/webhook/replace_me";

export async function POST(request: Request) {
	const targetUrl = process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_URL;
	const contentType = request.headers.get("content-type") || "";

	// Check if we're using the default URL (not configured)
	if (targetUrl === DEFAULT_N8N_URL) {
		console.warn("⚠️  N8N_WEBHOOK_URL not configured, using placeholder");
		return NextResponse.json({ 
			error: "n8n webhook not configured", 
			message: "Please set N8N_WEBHOOK_URL in your .env.local file" 
		}, { status: 500 });
	}

	// Avoid logging full webhook URL for security
	console.log("API Route - Using configured n8n webhook URL");
	console.log("API Route - Content Type:", contentType);

	try {
		// Multipart: forward FormData directly (audio uploads)
		if (contentType.startsWith("multipart/form-data")) {
			const form = await request.formData();
			const upstream = await fetch(targetUrl, {
				method: "POST",
				body: form,
			});
			const ct = upstream.headers.get("content-type") || "";
			if (ct.startsWith("audio/") || ct.includes("octet-stream")) {
				return new Response(upstream.body, {
					status: upstream.status,
					headers: { "Content-Type": ct },
				});
			}
			// Fallback: return text/JSON
			const text = await upstream.text();
			try {
				return NextResponse.json(JSON.parse(text), { status: upstream.status });
			} catch {
				return new Response(text, { status: upstream.status, headers: { "Content-Type": ct || "text/plain" } });
			}
		}

		// JSON: forward as-is
		const payload = await request.json().catch(() => ({}));
		const upstream = await fetch(targetUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		const ct = upstream.headers.get("content-type") || "";
		if (ct.startsWith("audio/") || ct.includes("octet-stream")) {
			return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": ct } });
		}
		const text = await upstream.text();
		try {
			return NextResponse.json(JSON.parse(text), { status: upstream.status });
		} catch {
			return new Response(text, { status: upstream.status, headers: { "Content-Type": ct || "text/plain" } });
		}
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

