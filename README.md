# 🇮🇳 CivicSync: Indian Election Intelligence Portal

**CivicSync** is a specialized AI-powered platform designed to bridge the information gap in the Indian electoral process[cite: 8]. By combining real-time data with restricted AI logic, it provides a secure and highly accessible environment for citizens to learn about their voting rights and logistics[cite: 4, 5, 8].

---

## 🎯 Chosen Vertical
**Election Process Education**: A dedicated platform focused on empowering voters with accurate information regarding registration, polling schedules, and electoral rules[cite: 8].

## 🧠 Approach & Logic
The project follows a **"Safety-First" AI approach**[cite: 8]. Unlike general-purpose bots, CivicSync uses a custom-tuned system instruction set that forces the AI to stay within the bounds of Indian elections[cite: 8].

*   **Response Cleaning**: All AI outputs undergo a post-processing phase to strip Markdown characters (like `*` or `#`), ensuring maximum compatibility with low-end devices and screen readers[cite: 4, 8].
*   **Cascade & Local Reliability**: We utilize a hybrid response system[cite: 8]. The system first attempts to resolve queries locally via `QA_2.js`[cite: 7]. If unsuccessful, it initiates a "Cascade Logic" AI request across multiple models[cite: 4, 8].
*   **Interaction Analytics**: To improve response quality and track citizen concerns, every query is logged to **Google BigQuery**[cite: 8]. This allows for real-time trend analysis of election-related queries without compromising user privacy[cite: 8].

## ⚙️ How it Works
1.  **Query Input**: User asks a question via the accessible chat interface[cite: 5, 7, 8].
2.  **Local Check**: The system first checks `QA_2.js` (Keyword Matching) for instant, offline-capable answers[cite: 7, 8].
3.  **AI Processing**: If no local match is found, the query is sent to the Gemini/Gemma API with strict "Election Official" persona instructions[cite: 4, 8].
4.  **Logging**: The query, timestamp, and AI model used are asynchronously sent to **BigQuery** via the `analyticsService.js`[cite: 8].
5.  **Live Data Integration**: For date or location queries, the system pulls data from Google Calendar and Maps APIs to provide real-time accuracy[cite: 4, 6, 8].

## 🧪 Testing Summary
*   **Logic Validation**: Tested the fallback chain to ensure seamless transitions when API quotas are hit and verified that `QA_2.js` takes priority[cite: 4, 7, 8].
*   **Security Testing**: Confirmed that `helmet` and `express-rate-limit` correctly block excessive requests and protect API credits[cite: 8].
*   **UI/UX Testing**: Confirmed the "Skip-to-Content" links and ARIA labels function correctly for keyboard-only navigation[cite: 5, 7, 8].

## 📝 Assumptions Made
*   **Connectivity**: Assumes the user has at least a basic 2G/3G connection for AI features, while local QA works offline once the page is loaded[cite: 3, 7, 8].
*   **Data Source**: Assumes the Google Calendar provided contains the most recent updates from the Election Commission of India (ECI)[cite: 4, 8].
*   **User Language**: Currently optimized for English, with a focus on simple, jargon-free terminology[cite: 4, 5, 8].

## ⚡ Resource Efficiency
*   **Static Assets**: Uses Vanilla JS and CSS3 instead of heavy frameworks to reduce initial load time and memory usage.
*   **Non-Blocking Logging**: BigQuery analytics are handled as background tasks, ensuring data logging never slows down the user experience[cite: 8].
*   **Intelligent Caching**: Local QA module reduces unnecessary API calls for repetitive queries[cite: 3, 8].

## ♿ Comprehensive Accessibility
*   **Screen Reader Optimization**: Clean text output (no asterisks) prevents screen readers from stuttering over formatting symbols[cite: 4, 5, 8].
*   **Keyboard Navigation**: Built-in "Skip-Links" allow power users and those with motor impairments to bypass the header and menu[cite: 5, 8].
*   **Visual Clarity**: High-contrast Glassmorphism design ensures readability across different lighting conditions and screen qualities[cite: 7, 8].

---

## 🛠️ Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | Node.js / Express.js | API routing and server-side logic[cite: 1, 4, 8]. |
| **Analytics** | **Google BigQuery** | Securely logs interactions for trend monitoring[cite: 8]. |
| **Security** | Helmet / Rate-Limit | Protects against XSS and API abuse[cite: 8]. |
| **AI Engine** | Google Generative AI | Powers the specialized CivicSync Assistant[cite: 4, 8]. |
| **Data Layers** | Google Calendar & Maps | Fetches live election timelines and polling spots[cite: 4, 6, 8]. |
| **Frontend** | Vanilla JS / CSS3 | Fast, mobile-first, dependency-free UI[cite: 5, 7, 8]. |

---

## 🚀 Installation & Testing

### 1. Prerequisites
*   **Node.js**: v18.0.0 or higher[cite: 2, 5].
*   **Google Cloud Project**: Enabled APIs for BigQuery, Generative AI, and Maps[cite: 4, 8].

### 2. Environment Setup
Create a `.env` file in the root directory[cite: 8]:
```env
GEMINI_API_KEY=your_gemini_key_here
GOOGLE_API_KEY=your_google_calendar_key_here
MAPS_API_KEY=your_google_maps_key_here
BIGQUERY_DATASET=civicsync_logs
BIGQUERY_TABLE=interactions