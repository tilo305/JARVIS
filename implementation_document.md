# Implementation Document: Iron Man Voice/Chatbot Website

## 1. Introduction

This document provides a detailed technical implementation plan for the Iron Man-themed voice/chatbot website, covering frontend development with React/Next.js, backend integration with n8n, and the use of ElevenLabs for voice functionalities. It also includes comprehensive debugging and testing guidelines to ensure a robust and reliable application.

## 2. Architecture Overview

The system architecture comprises three main components:

1.  **Frontend (React/Next.js):** The user-facing web application responsible for rendering the Iron Man background, the chatbot UI, and handling user interactions (text input, voice input via ElevenLabs widget).
2.  **ElevenLabs Widget/API:** Provides real-time speech-to-text (STT) for user input and text-to-speech (TTS) for chatbot responses. The widget simplifies integration for conversational AI.
3.  **Backend (n8n):** Orchestrates the conversational logic, integrates with the database (Airtable) for memory, and potentially uses OpenAI for AI agent capabilities and Tavily for internet search. It communicates with the frontend via webhooks.

```mermaid
graph TD
    A[User] -->|Voice/Text Input| B(Frontend: React/Next.js)
    B -->|ElevenLabs Widget (STT)| C[ElevenLabs API]
    C -->|Text to n8n Webhook| D(n8n Workflow)
    B -->|Text to n8n Webhook| D
    D -->|OpenAI API| E[OpenAI]
    D -->|Airtable API| F[Airtable Database]
    D -->|Tavily API| G[Tavily Search]
    D -->|Text Response| B
    D -->|Text to ElevenLabs API (TTS)| C
    C -->|Audio Stream| B
    B -->|Audio Output| A
```

## 3. Frontend Implementation (React/Next.js)

### 3.1. Project Setup

1.  **Initialize Next.js Project:**
    ```bash
    npx create-next-app@latest ironman-chatbot --typescript --eslint --tailwind --app --src-dir
    cd ironman-chatbot
    ```
2.  **Install Dependencies:** No specific additional dependencies are immediately required beyond the default Next.js setup for the core structure, but `axios` or `fetch` will be used for API calls.

### 3.2. Iron Man MP4 Integration

The provided `Ironmanmoving.mp4` needs to be optimized and integrated as a background video.

1.  **Video Conversion and Optimization:**
    *   **Format:** Convert `Ironmanmoving.mp4` to web-friendly formats like WebM and MP4 (H.264) for broader browser compatibility and smaller file sizes. Tools like `ffmpeg` can be used:
        ```bash
        ffmpeg -i Ironmanmoving.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -pass 1 -an -f webm /path/to/public/ironman_bg.webm
        ffmpeg -i Ironmanmoving.mp4 -c:v libx264 -crf 23 -preset medium -b:a 128k -pass 1 -an -f mp4 /path/to/public/ironman_bg.mp4
        ```
        *Note: The `-an` flag removes audio, as background videos typically don't need sound. Two-pass encoding is recommended for better quality and smaller file size.*
    *   **Placement:** Place the optimized video files in the `public` directory of the Next.js project (e.g., `public/videos/`).

2.  **Component Implementation:** Create a `VideoBackground` component.

    ```jsx
    // components/VideoBackground.tsx
    import React from 'react';

    const VideoBackground: React.FC = () => {
      return (
        <div className="video-background-container">
          <video autoPlay loop muted playsInline className="video-background">
            <source src="/videos/ironman_bg.webm" type="video/webm" />
            <source src="/videos/ironman_bg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="overlay"></div> {/* Optional: for dimming or effects */}
        </div>
      );
    };

    export default VideoBackground;
    ```

3.  **Styling (Tailwind CSS):** Apply styles to ensure the video covers the entire viewport and is positioned correctly.

    ```css
    /* globals.css or a dedicated CSS module */
    .video-background-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      z-index: -1; /* Ensures it's behind other content */
    }

    .video-background {
      width: 100%;
      height: 100%;
      object-fit: cover; /* Ensures the video covers the entire container */
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* Example: semi-transparent overlay */
    }
    ```

### 3.3. ElevenLabs Widget Integration

The user provided the ElevenLabs widget URL. This will be embedded directly into the React component.

1.  **Embedding the Widget:** The widget script should be loaded asynchronously. The `<elevenlabs-convai>` tag will render the widget.

    ```jsx
    // components/ChatbotWidget.tsx
    import React, { useEffect } from 'react';

    const ChatbotWidget: React.FC = () => {
      useEffect(() => {
        // Ensure the script is loaded only once
        const scriptId = 'elevenlabs-convai-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
          script.async = true;
          script.type = "text/javascript";
          document.body.appendChild(script);
        }
      }, []);

      return (
        <div className="chatbot-container">
          {/* The ElevenLabs widget will render here */}
          <elevenlabs-convai agent-id="agent_7601k23b460aeejb2pvyfcvw6atk"></elevenlabs-convai>
        </div>
      );
    };

    export default ChatbotWidget;
    ```

2.  **Custom Microphone Button:** The user specifically requested the microphone button to be the widget URL itself, instead of the image. This implies that the widget's default UI might need to be overridden or styled. The `elevenlabs-convai` widget typically renders its own UI. Customizing the microphone button's appearance directly might require inspecting the widget's shadow DOM or using CSS overrides if the widget exposes styling hooks. If direct customization is not feasible, a workaround would be to hide the default button and trigger the widget's functionality programmatically via a custom button.

    *   **Initial Approach (CSS Override):** Attempt to style the widget's microphone button using global CSS or by targeting its internal elements if accessible.
    *   **Alternative (Programmatic Trigger):** If CSS override is not sufficient, a custom button can be created that, when clicked, programmatically triggers the ElevenLabs widget's microphone functionality. This would require exploring the widget's JavaScript API, if available, to expose methods for starting/stopping recording.

### 3.4. Chatbot UI and Responsiveness

1.  **Layout:** The chatbot UI should be centered on the screen, as shown in `image.png`. Flexbox or CSS Grid can be used for layout.

    ```jsx
    // pages/index.tsx (or app/page.tsx in Next.js 13+)
    import VideoBackground from '../components/VideoBackground';
    import ChatbotWidget from '../components/ChatbotWidget';

    export default function Home() {
      return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-24">
          <VideoBackground />
          <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
            {/* Other UI elements like system status, data stream, etc. */}
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
            <ChatbotWidget />
          </div>
        </main>
      );
    }
    ```

2.  **Styling:** Use Tailwind CSS for responsive design. The chatbot container should have a maximum width to prevent it from covering too much of the Iron Man background.

    ```css
    /* Example styling for chatbot container */
    .chatbot-container {
      background-color: rgba(255, 255, 255, 0.1); /* Semi-transparent background */
      backdrop-filter: blur(10px); /* Frosted glass effect */
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      max-width: 600px; /* Adjust as needed */
      width: 90%; /* Responsive width */
      margin: auto; /* Center horizontally */
    }
    ```

### 3.5. Communication with n8n Webhook

The ElevenLabs widget is designed to communicate with a backend agent. The user's n8n webhook (`https://n8n.hempstarai.com/webhook/061f91ff-420a-4040-bff7-5f81fb9fb9cd`) will be the target for the widget's communication. For text input, a simple `fetch` or `axios` call can be made from the frontend.

```jsx
// Example for text input submission
const sendMessage = async (message: string) => {
  try {
    const response = await fetch('https://n8n.hempstarai.com/webhook/061f91ff-420a-4040-bff7-5f81fb9fb9cd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message }),
    });
    const data = await response.json();
    // Process response from n8n (e.g., display in chat, trigger ElevenLabs TTS)
    console.log(data);
  } catch (error) {
    console.error('Error sending message to n8n:', error);
  }
};
```

## 4. Backend Implementation (n8n)

### 4.1. Workflow Import and Configuration

1.  **Import Workflow:** Import the `Memory_Automation.json` file into your n8n instance. This can typically be done via the n8n UI (Workflows -> Import from JSON).
2.  **Webhook Node:** Verify that the Webhook node is configured with the correct path (`061f91ff-420a-4040-bff7-5f81fb9fb9cd`) and is set to listen for `POST` requests.
3.  **Credentials:** Ensure all credentials within the workflow are correctly set up:
    *   **OpenAI Chat Model:** Verify the `John's Open API` credential is valid and has access to `gpt-4o-mini`.
    *   **Airtable (Search Memory, Airtable nodes):** Verify the `John Airtable Personal Access Token account` credential is valid and has access to the specified base (`apppPOPBpARGiX5Nu`) and table (`tblOgfB75EdMMrDty`).
    *   **Tavily:** Verify the `Bearer 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` token is correct for the Tavily API.

### 4.2. ElevenLabs Integration in n8n

While the frontend widget handles direct voice input, n8n will be responsible for generating voice responses using ElevenLabs TTS.

1.  **ElevenLabs Node:** If not already present, add an ElevenLabs node (or an HTTP Request node configured for ElevenLabs API) to the n8n workflow after the AI Agent generates a text response.
    *   **API Endpoint:** `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
    *   **Method:** `POST`
    *   **Headers:** `xi-api-key: YOUR_ELEVENLABS_API_KEY`, `Content-Type: application/json`
    *   **Body:** `{"text": "{{ $json.response_from_ai_agent }}", "model_id": "eleven_multilingual_v2"}` (adjust `model_id` and `voice_id` as needed).
    *   **Response:** The ElevenLabs API returns an audio stream. This audio needs to be sent back to the frontend for playback.

2.  **Sending Audio to Frontend:**
    *   **Option A (Direct Audio Stream):** If the frontend can directly consume an audio stream from n8n, the n8n webhook response can be configured to send the audio data directly. This might require careful handling of content types and streaming.
    *   **Option B (Signed URL for Audio File):** A more common approach is for n8n to generate the audio, save it temporarily (e.g., to a cloud storage like S3), and then return a signed URL to the frontend. The frontend then fetches and plays the audio from this URL. This adds complexity but is more robust for larger audio files.
    *   **Option C (Text-only Response + Frontend TTS):** The simplest approach is for n8n to return only the text response, and the frontend then uses the ElevenLabs widget's TTS capabilities (if exposed) or a separate ElevenLabs API call from the frontend to convert the text to speech. Given the user's mention of 


the ElevenLabs widget, it's highly probable that the widget itself will handle the TTS for the chatbot's responses, simplifying the n8n side to just returning text.

    *   **Recommendation:** For initial implementation, assume the ElevenLabs widget handles TTS for chatbot responses. n8n should return the AI agent's text response, and the frontend will feed this text to the widget for speech generation.

### 4.3. Conversational Memory (Airtable)

The `Memory_Automation.json` workflow already includes Airtable nodes for `SearchMemory` and `CreateMemory`. Ensure these are correctly configured to interact with the specified Airtable base and table. The `AI Agent` node's system prompt emphasizes the importance of using `SearchMemory` before responding and `CreateMemory` for storing insights.

## 5. Debugging and Testing

### 5.1. Frontend Debugging

*   **Browser Developer Tools:** Use Chrome/Firefox Developer Tools to inspect:
    *   **Network Tab:** Verify API calls to n8n webhook and ElevenLabs are successful (status 200 OK) and inspect request/response payloads.
    *   **Console Tab:** Check for JavaScript errors related to React components, ElevenLabs widget, or API calls.
    *   **Elements Tab:** Inspect the DOM structure, especially for the ElevenLabs widget, to understand its rendering and identify potential styling conflicts.
    *   **Performance Tab:** Analyze video loading times and overall page performance.
*   **React Developer Tools:** Use the React DevTools browser extension to inspect component states, props, and component tree for debugging React-specific issues.
*   **Next.js Development Server:** Run the Next.js application in development mode (`npm run dev`) to leverage hot-reloading and detailed error messages.

### 5.2. n8n Workflow Debugging

*   **n8n Execution Logs:** Monitor the execution logs within the n8n UI for each workflow run. This provides detailed information on each node's input, output, and any errors encountered.
*   **Test Webhook:** Use tools like Postman or `curl` to manually send POST requests to the n8n webhook URL to test its responsiveness and data parsing.
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"message": "Hello n8n!"}' https://n8n.hempstarai.com/webhook/061f91ff-420a-4040-bff7-5f81fb9fb9cd
    ```
*   **Step-by-Step Execution:** In the n8n editor, use the 


Step-by-Step execution feature to trace the data flow through each node and identify where issues occur.
*   **Node-specific Debugging:** Each node in n8n provides options to view its input and output data. Utilize this to verify that data is being transformed and passed correctly between nodes.
*   **Error Handling Nodes:** Implement `Try/Catch` blocks or `Error Workflow` nodes in n8n to gracefully handle errors and prevent workflow failures. Log errors to a file or a monitoring service.

### 5.3. ElevenLabs Debugging

*   **ElevenLabs API Documentation:** Refer to the official ElevenLabs API documentation for error codes and troubleshooting guides. (Source: [ElevenLabs Documentation](https://elevenlabs.io/docs/overview))
*   **API Key Validation:** Ensure the ElevenLabs API key used in the n8n workflow (if direct API calls are made) or by the widget is valid and has the necessary permissions.
*   **Widget Console Logs:** The ElevenLabs Convai widget might output its own logs to the browser console. Monitor these for any widget-specific errors or warnings.
*   **Audio Playback Issues:** If TTS audio is not playing, check:
    *   Browser audio settings.
    *   Network connectivity to ElevenLabs servers.
    *   The audio format and codec compatibility.

### 5.4. Database (Airtable) Debugging

*   **Airtable Interface:** Directly inspect the Airtable base and table (`apppPOPBpARGiX5Nu`, `tblOgfB75EdMMrDty`) to verify that data is being written and read correctly by the n8n workflow.
*   **Airtable API Documentation:** Consult Airtable API documentation for any issues related to API requests or data formatting.
*   **Permissions:** Ensure the Airtable API token has the correct read/write permissions for the specified base and table.

### 5.5. Comprehensive Testing

#### 5.5.1. Unit Testing

*   **Frontend Components:** Use testing frameworks like Jest and React Testing Library to unit test individual React components (e.g., `VideoBackground`, `ChatbotWidget`).
*   **n8n Nodes:** While n8n doesn't have a built-in unit testing framework for individual nodes, test each node's functionality by manually providing input and verifying output within the n8n editor.

#### 5.5.2. Integration Testing

*   **Frontend to n8n Webhook:**
    *   Test sending text messages from the frontend to the n8n webhook and verify that the n8n workflow receives and processes them correctly.
    *   Verify that the ElevenLabs widget successfully sends voice input to the n8n webhook.
*   **n8n to ElevenLabs:**
    *   If n8n directly calls the ElevenLabs API for TTS, test that the generated text response from the AI agent is successfully converted to speech and returned to the frontend.
*   **n8n to Airtable:**
    *   Test that conversational memory is correctly stored and retrieved from Airtable by the n8n workflow.
*   **End-to-End Conversational Flow:** Simulate a full conversation with the chatbot, including both text and voice inputs, and verify that responses are accurate, timely, and delivered in the correct format (text and audio).

#### 5.5.3. Performance Testing

*   **Video Playback:** Test the Iron Man MP4 background for smooth playback across different devices and network conditions. Monitor CPU and memory usage.
*   **Chatbot Responsiveness:** Measure the latency between user input (text/voice) and chatbot response (text/audio). Identify and optimize any bottlenecks in the n8n workflow or API calls.
*   **Concurrent Users:** (Advanced) Simulate multiple concurrent users to assess the system's scalability and performance under load.

#### 5.5.4. User Acceptance Testing (UAT)

*   **Visual Fidelity:** Verify that the website's visual design, including the Iron Man background and chatbot UI, matches the provided `image.png` and overall aesthetic requirements.
*   **Conversational Quality:** Engage users to test the chatbot's conversational abilities, accuracy of responses, and naturalness of the ElevenLabs voice.
*   **Usability:** Gather feedback on the overall user experience, ease of interaction, and clarity of the interface.

## 6. Deployment

### 6.1. Frontend Deployment (Next.js)

Next.js applications can be deployed to various platforms. Vercel is a popular choice for Next.js due to its native support and ease of deployment.

1.  **Build the Project:**
    ```bash
    npm run build
    ```
2.  **Deployment:** Use `service_deploy_frontend` tool with `framework='react'` and `project_dir` pointing to the built output (e.g., `.next` or `out` directory depending on Next.js configuration).

### 6.2. n8n Workflow Deployment

The n8n workflow is already hosted on `n8n.hempstarai.com`. Ensure the workflow is activated and accessible via the provided webhook URL.

## 7. Future Enhancements

*   **Customizable ElevenLabs Voices:** Implement a feature in the frontend to allow users to select different ElevenLabs voices for the chatbot.
*   **Multi-language Support:** Extend the n8n workflow and frontend to support multiple languages for both input and output.
*   **Advanced Conversational Features:** Integrate more sophisticated AI capabilities such as sentiment analysis, proactive suggestions, or personalized user profiles.
*   **Monitoring and Logging:** Set up comprehensive monitoring and logging for both frontend and backend to track performance, errors, and user interactions.

---

**Author:** Manus AI
**Date:** 8/10/2025




## 8. References

[1] ElevenLabs. *ElevenLabs now live in n8n Cloud*. Available at: [https://elevenlabs.io/blog/elevenlabs-on-n8n-cloud](https://elevenlabs.io/blog/elevenlabs-on-n8n-cloud)
[2] n8n-ninja. *n8n-nodes-elevenlabs*. Available at: [https://github.com/n8n-ninja/n8n-nodes-elevenlabs](https://github.com/n8n-ninja/n8n-nodes-elevenlabs)
[3] n8n. *Generate Text-to-Speech Using Elevenlabs via API*. Available at: [https://n8n.io/workflows/2245-generate-text-to-speech-using-elevenlabs-via-api/](https://n8n.io/workflows/2245-generate-text-to-speech-using-elevenlabs-via-api/)
[4] ElevenLabs. *Create speech | ElevenLabs Documentation*. Available at: [https://elevenlabs.io/docs/api-reference/text-to-speech/convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
[5] n8n. *AI Voice Chatbot with ElevenLabs & OpenAI for Customer Service*. Available at: [https://n8n.io/workflows/2846-ai-voice-chatbot-with-elevenlabs-and-openai-for-customer-service-and-restaurants/](https://n8n.io/workflows/2846-ai-voice-chatbot-with-elevenlabs-and-openai-for-customer-service-and-restaurants/)
[6] n8n. *AI Voice Chat using Webhook, Memory Manager, OpenAI, Google Gemini and ElevenLabs*. Available at: [https://n8n.io/workflows/2405-ai-voice-chat-using-webhook-memory-manager-openai-google-gemini-and-elevenlabs/](https://n8n.io/workflows/2405-ai-voice-chat-using-webhook-memory-manager-openai-google-gemini-and-elevenlabs/)
[7] YouTube. *How to Integrate Eleven Labs Webhooks with n8n*. Available at: [https://www.youtube.com/watch?v=ixZmxVyn_ys&pp=0gcJCf8Ao7VqN5tD](https://www.youtube.com/watch?v=ixZmxVyn_ys&pp=0gcJCf8Ao7VqN5tD)
[8] n8n Community. *N8n Webhook Not Triggering When Called via ElevenLabs Agent*. Available at: [https://community.n8n.io/t/n8n-webhook-not-triggering-when-called-via-elevenlabs-agent/103364](https://community.n8n.io/t/n8n-webhook-not-triggering-when-called-via-elevenlabs-agent/103364)
[9] n8n Community. *N8n workflow with webhook and elevenlabs agent*. Available at: [https://community.n8n.io/t/n8n-workflow-with-webhook-and-elevenlabs-agent/95812](https://community.n8n.io/t/n8n-workflow-with-webhook-and-elevenlabs-agent/95812)
[10] ElevenLabs. *ElevenLabs Documentation*. Available at: [https://elevenlabs.io/docs/overview](https://elevenlabs.io/docs/overview)


