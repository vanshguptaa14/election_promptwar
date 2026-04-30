# 🇮🇳 CivicSync: Indian Election Intelligence Portal

**CivicSync** is a specialized AI-powered platform designed to bridge the information gap in the Indian electoral process. By combining real-time data with restricted AI logic, it provides a secure and highly accessible environment for citizens to learn about their voting rights and logistics[cite: 4, 5].

---

## 🎯 Chosen Vertical
**Election Process Education**: A dedicated platform focused on empowering voters with accurate information regarding registration, polling schedules, and electoral rules.

## 🧠 Approach & Logic
The project follows a **"Safety-First" AI approach**. Unlike general-purpose bots, CivicSync uses a custom-tuned system instruction set that forces the AI to stay within the bounds of Indian elections.
*   **Response Cleaning**: All AI outputs undergo a post-processing phase to strip Markdown characters (like `*` or `#`), ensuring maximum compatibility with low-end devices and screen readers[cite: 4].
*   **Fallback Reliability**: We utilize a "Cascade Logic" for AI requests. If the primary high-performance model fails, the system automatically tries three alternative models in descending order of complexity to ensure the user always gets an answer[cite: 4].

## ⚙️ How it Works
1.  **Query Input**: User asks a question via the accessible chat interface[cite: 5, 7].
2.  **Local Check**: The system first checks `logic.js` (Keyword Matching) for instant, offline-capable answers[cite: 3].
3.  **AI Processing**: If no local match is found, the query is sent to the Gemini/Gemma API with strict "Election Official" persona instructions[cite: 4].
4.  **Live Data Integration**: For date or location queries, the system pulls data from Google Calendar and Maps APIs to provide real-time accuracy[cite: 4, 6].

## 🧪 Testing Summary
*   **Logic Validation**: Tested the fallback chain to ensure seamless transitions when API quotas are hit[cite: 4].
*   **Keyword Accuracy**: Verified that common terms like "Voter ID" or "Register" trigger immediate local responses[cite: 3].
*   **UI/UX Testing**: Confirmed the "Skip-to-Content" links and ARIA labels function correctly for keyboard-only navigation[cite: 5, 7].

## 📝 Assumptions Made
*   **Connectivity**: Assumes the user has at least a basic 2G/3G connection for AI features, while local QA works offline once the page is loaded[cite: 3, 7].
*   **Data Source**: Assumes the Google Calendar provided contains the most recent updates from the Election Commission of India (ECI)[cite: 4].
*   **User Language**: Currently optimized for English, with a focus on simple, jargon-free terminology[cite: 4, 5].

## ⚡ Resource Efficiency
*   **Static Assets**: Uses Vanilla JS and CSS3 instead of heavy frameworks (like React or Angular) to reduce initial load time and memory usage[cite: 5].
*   **Intelligent Caching**: Local QA module reduces unnecessary API calls for repetitive queries[cite: 3].

## ♿ Comprehensive Accessibility
*   **Screen Reader Optimization**: Clean text output (no asterisks) prevents screen readers from stuttering over formatting symbols[cite: 4, 5].
*   **Keyboard Navigation**: Built-in "Skip-Links" allow power users and those with motor impairments to bypass the header and menu[cite: 5].
*   **Visual Clarity**: High-contrast Glassmorphism design ensures readability across different lighting conditions and screen qualities[cite: 7].

---

## 🛠️ Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | Node.js / Express.js | API routing and server-side logic[cite: 1, 4]. |
| **AI Engine** | Google Generative AI | Powers the specialized CivicSync Assistant[cite: 4]. |
| **Data Layers** | Google Calendar & Maps | Fetches live election timelines and polling spots[cite: 4, 6]. |
| **Frontend** | Vanilla JS / CSS3 | Fast, mobile-first, dependency-free UI[cite: 5, 7]. |

---

## 🚀 Installation & Testing

### 1. Prerequisites
*   **Node.js**: v18.0.0 or higher[cite: 2].
*   **API Keys**: You will need keys for Gemini AI, Google Calendar, and Google Maps[cite: 4].

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_key_here
GOOGLE_API_KEY=your_google_calendar_key_here
MAPS_API_KEY=your_google_maps_key_here