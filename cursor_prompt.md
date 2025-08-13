# Cursor Prompt: Iron Man Voice/Chatbot Website Development

## Project Overview

Your task is to develop a full-stack Iron Man-themed voice/chatbot website. This project involves frontend development using React/Next.js, integration with ElevenLabs for voice functionalities, and a backend powered by n8n workflows for conversational logic and data management. The website's core visual element will be a looping video of Iron Man, with a chatbot interface seamlessly integrated into the design.

## Goal

To create an immersive, interactive, and functional Iron Man-themed voice/chatbot website that provides a seamless conversational experience, leveraging AI capabilities for natural interaction and a visually engaging interface.

## Key Requirements

### 1. Frontend (React/Next.js)

*   **Framework:** React/Next.js.
*   **Visuals:**
    *   **Iron Man Moving Background:** Implement a looping video of Iron Man as the website's background. The provided `Ironmanmoving.mp4` needs to be converted to web-friendly formats (e.g., WebM, MP4 with H.264 codec) and optimized for efficient streaming. The chatbot interface should not obscure the Iron Man visual significantly.
    *   **Responsive Design:** The website must be fully responsive, adapting seamlessly to desktop, tablet, and mobile screen sizes.
    *   **Thematic Design:** The overall design, including colors, fonts, and UI elements, should align with the Iron Man/JARVIS aesthetic, as depicted in the provided `image.png`.
*   **Chatbot UI:**
    *   **Placement:** The chatbot interface must be positioned in the middle of the screen, ensuring visibility without dominating the Iron Man background.
    *   **ElevenLabs Widget Integration:** Embed the ElevenLabs Convai widget for voice input. The provided widget URL is: `<elevenlabs-convai agent-id="agent_7601k23b460aeejb2pvyfcvw6atk"></elevenlabs-convai><script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>`. The microphone button within the chatbot interface should be the widget URL itself, replacing the default ElevenLabs widget image. This might require inspecting the widget's shadow DOM or using CSS overrides/programmatic triggering if direct customization is not feasible.
    *   **Text Input:** Provide a text input field for users to interact with the chatbot via typing.
    *   **Chat Display:** Display conversational turns (user input and chatbot responses) in a clear and intuitive manner.

### 2. Backend (n8n)

*   **Workflow Management:** All backend logic, including processing user input, generating responses, and managing conversational memory, will be handled by n8n workflows. The provided `Memory_Automation.json` file is the foundation for this. You will need to import and configure this workflow in an n8n instance.
*   **Webhook Integration:** The n8n workflow will communicate with the frontend via a webhook. The webhook URL is `https://n8n.hempstarai.com/webhook/061f91ff-420a-4040-bff7-5f81fb9fb9cd`. The frontend will send user input to this webhook.
*   **Conversational Memory:** The n8n workflow will leverage Airtable (as indicated in `Memory_Automation.json`) for storing chat messages and voice data, enabling persistent memory for the chatbot.
*   **ElevenLabs TTS:** The n8n workflow should be configured to receive text responses from the AI agent and, if necessary, trigger ElevenLabs Text-to-Speech (TTS) to generate audio. However, for simplicity, assume the ElevenLabs widget on the frontend will handle the TTS for chatbot responses, meaning n8n primarily returns text.
*   **AI Agent:** The `Memory_Automation.json` indicates the use of OpenAI for the AI Agent and Tavily for internet search. Ensure these integrations are correctly configured within the n8n workflow.

### 3. ElevenLabs Integration

*   **Voice Input (STT):** Handled by the ElevenLabs Convai widget embedded in the frontend.
*   **Voice Output (TTS):** Primarily handled by the ElevenLabs Convai widget on the frontend, which will convert text responses from n8n into speech.
*   **Custom Microphone Button:** As specified in the frontend requirements, the microphone button should be the widget URL itself.

## Implementation Details and Steps

### Step 1: Project Setup

1.  Initialize a new Next.js project:
    ```bash
    npx create-next-app@latest ironman-chatbot --typescript --eslint --tailwind --app --src-dir
    cd ironman-chatbot
    ```

### Step 2: Video Background Integration

1.  **Video Conversion:** Convert `Ironmanmoving.mp4` to `ironman_bg.webm` and `ironman_bg.mp4` (H.264) using `ffmpeg`. Ensure audio is removed (`-an` flag) and optimize for web streaming. Place these files in `public/videos/`.
    *   Example `ffmpeg` commands:
        ```bash
        ffmpeg -i Ironmanmoving.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -pass 1 -an -f webm public/videos/ironman_bg.webm
        ffmpeg -i Ironmanmoving.mp4 -c:v libx264 -crf 23 -preset medium -b:a 128k -pass 1 -an -f mp4 public/videos/ironman_bg.mp4
        ```
2.  **Create `VideoBackground` Component:** Implement a React component (`components/VideoBackground.tsx`) to display the looping background video. Use `autoPlay`, `loop`, `muted`, and `playsInline` attributes. Apply CSS (e.g., Tailwind CSS) to ensure it covers the full viewport and is positioned behind other content (`z-index: -1`). Consider an optional semi-transparent overlay.

### Step 3: ElevenLabs Widget Integration

1.  **Create `ChatbotWidget` Component:** Implement a React component (`components/ChatbotWidget.tsx`) to embed the ElevenLabs Convai widget. Ensure the script is loaded asynchronously and only once.
    ```jsx
    // components/ChatbotWidget.tsx
    import React, { useEffect } from 'react';

    const ChatbotWidget: React.FC = () => {
      useEffect(() => {
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
          <elevenlabs-convai agent-id="agent_7601k23b460aeejb2pvyfcvw6atk"></elevenlabs-convai>
        </div>
      );
    };

    export default ChatbotWidget;
    ```
2.  **Custom Microphone Button:** Investigate how to replace the default ElevenLabs microphone button image with the widget URL itself. This might involve:
    *   **CSS Overrides:** Attempt to style the widget's internal elements if accessible via global CSS.
    *   **Programmatic Triggering:** If CSS is insufficient, hide the default button and create a custom button that programmatically triggers the widget's microphone functionality (requires exploring the widget's JavaScript API).

### Step 4: Chatbot UI and Responsiveness

1.  **Layout:** Center the chatbot UI on the screen. Use Flexbox or CSS Grid for layout. Integrate `VideoBackground` and `ChatbotWidget` into the main page component (e.g., `app/page.tsx`).
2.  **Styling:** Apply Tailwind CSS for responsive design. The chatbot container should have a semi-transparent background, frosted glass effect, rounded corners, and a `max-width` to prevent it from covering too much of the Iron Man background. Ensure it's responsive across devices.

### Step 5: Frontend-Backend Communication

1.  **Text Input Submission:** Implement a function in the frontend to send text messages to the n8n webhook (`https://n8n.hempstarai.com/webhook/061f91ff-420a-4040-bff7-5f81fb9fb9cd`) using `fetch` or `axios`. The request should be a `POST` with `Content-Type: application/json` and a JSON body containing the user's message.
    ```jsx
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
        // Process response from n8n (e.g., display in chat)
        console.log(data);
      } catch (error) {
        console.error('Error sending message to n8n:', error);
      }
    };
    ```
2.  **Handling n8n Responses:** The frontend should be prepared to receive text responses from the n8n webhook. These text responses will then be fed to the ElevenLabs widget for TTS playback.

### Step 6: n8n Workflow Configuration

1.  **Import Workflow:** Import the `Memory_Automation.json` file into your n8n instance.
2.  **Verify Webhook:** Confirm the Webhook node is configured with the correct path (`061f91ff-420a-4040-bff7-5f81fb9fb9cd`) and listens for `POST` requests.
3.  **Configure Credentials:** Ensure all credentials within the workflow are correctly set up and valid:
    *   OpenAI API Key (`John's Open API`)
    *   Airtable Personal Access Token (`John Airtable Personal Access Token account`)
    *   Tavily API Key (`Bearer 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`)
4.  **ElevenLabs TTS in n8n (Optional/Conditional):** If the ElevenLabs widget on the frontend cannot handle TTS for chatbot responses, you will need to add an ElevenLabs node (or HTTP Request node) in n8n to convert the AI agent's text response to audio and return it to the frontend. However, the primary assumption is that the frontend widget handles this.

## Debugging and Testing Guidelines

### Frontend Debugging

*   **Browser Developer Tools:** Use the Network tab to verify API calls, Console tab for JavaScript errors, and Elements tab to inspect DOM and widget rendering.
*   **React Developer Tools:** Inspect component states and props.
*   **Next.js Development Server:** Utilize `npm run dev` for hot-reloading and error messages.

### n8n Workflow Debugging

*   **Execution Logs:** Monitor n8n's execution logs for each workflow run.
*   **Test Webhook:** Manually send POST requests to the n8n webhook using Postman or `curl`.
*   **Step-by-Step Execution:** Use n8n's step-by-step execution feature to trace data flow.
*   **Node-specific Debugging:** Inspect input/output of individual nodes.
*   **Error Handling:** Implement `Try/Catch` blocks in n8n workflows.

### ElevenLabs Debugging

*   **API Key Validation:** Ensure correct ElevenLabs API key is used.
*   **Widget Console Logs:** Monitor browser console for widget-specific errors.
*   **Audio Playback:** Check browser audio settings, network, and audio format compatibility.

### Database (Airtable) Debugging

*   **Airtable Interface:** Directly inspect Airtable base/table for data correctness.
*   **Permissions:** Verify Airtable API token has correct read/write permissions.

### Comprehensive Testing

*   **Unit Testing:** Use Jest and React Testing Library for frontend components.
*   **Integration Testing:** Test frontend to n8n webhook communication, n8n to Airtable, and end-to-end conversational flow (text and voice).
*   **Performance Testing:** Assess video playback, chatbot responsiveness, and scalability.
*   **User Acceptance Testing (UAT):** Verify visual fidelity against `image.png`, conversational quality, and overall usability.

## Provided Files

*   `Ironmanmoving.mp4`: The source video for the background.
*   `Memory_Automation.json`: The n8n workflow definition.
*   `image.png`: Reference image for the website's desired look and feel.

## Important Notes

*   The `Ironmanmoving.mp4` needs to be processed externally (e.g., using `ffmpeg`) before being placed in the Next.js `public` directory.
*   The n8n workflow (`Memory_Automation.json`) assumes you have an n8n instance running and accessible, and that the necessary credentials (OpenAI, Airtable, Tavily) are configured within that instance.
*   The ElevenLabs Convai widget is expected to handle the primary voice input and output on the frontend. Customization of its microphone button might require advanced CSS or JavaScript manipulation.

---

**Author:** Manus AI
**Date:** 8/10/2025


