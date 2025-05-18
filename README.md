# Language Learning Chat App

## Description

This application is a frontend prototype for an AI-powered language learning game. It allows users to practice speaking a new language by interacting with configurable Non-Player Characters (NPCs) in scenario-based conversations. The dialogue system includes features like narrator hints, NPC clarification based on error sensitivity, and end-of-interaction feedback, all designed to create an adaptive and effective learning experience.

This prototype simulates the LLM (Large Language Model) interactions and focuses on the user interface and client-side logic as outlined in the provided system design and UI mockups.

## Key Features

* **NPC Customization:** Create and configure NPCs, including their name, avatar, language, personality (Tolerant/Friendly or Strict/Perfectionist), error sensitivity, and whether a "nudge" (hint) system is active.
* **Scenario-Based Conversations:** Engage in text-based chats with NPCs to achieve specific objectives (e.g., "Order a coffee").
* **Simulated Adaptive Dialogue System:**
    * **Narrator/Nudge System:** Receive occasional hints before your message is sent to the NPC (if enabled).
    * **NPC Clarification:** NPCs may ask for clarification if they "don't understand" your input, based on their configured error sensitivity and personality.
    * **Objective Tracking:** Conversations progress towards a defined goal.
* **End-of-Interaction Feedback:** Receive a summary after completing (or failing) a conversation task, including simulated performance insights.
* **User-Friendly Interface:** UI designed to be intuitive, based on provided sketches, featuring a sidebar for NPC management and a main area for chat or configuration.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Node.js:** Version 18.x or higher is recommended. (Includes npm).
    * You can check your version by running: `node -v` and `npm -v` in your terminal.
* **npm (Node Package Manager):** Comes with Node.js.
* Alternatively, you can use **yarn** as your package manager.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Create a New React Project (using Vite)

If you are starting from scratch and want to integrate the provided `App.js` code into a new project:

```bash
# Using npm
npm create vite@latest my-language-app -- --template react
cd my-language-app
# Vite will guide you. If it doesn't run `npm install` automatically,
# or if you skip that step, you'll need to run it:
# npm install

# Using yarn
yarn create vite my-language-app --template react
cd my-language-app
yarn
```

### 2. Add the Application Code
Navigate to the src folder within your newly created project (e.g., my-language-app/src/).Replace the contents of the existing App.jsx (or App.js) file with the code provided for the "Language Learning Chat App".If the provided code was in a file named App.js and your Vite project created App.jsx, you can either rename the file or ensure JSX syntax is correctly handled.

### 3. Install Dependencies
The application relies on lucide-react for icons and tailwindcss for styling. After creating the project and navigating into its directory:# Navigate to your project root directory (e.g., my-language-app) if you're not already there.

```bash
# Using npm
# If you haven't run `npm install` after `npm create vite...`, run it first:
npm install

# Install specific dependencies:
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind CSS (creates tailwind.config.js and postcss.config.js)
npx tailwindcss init -p

# Using yarn
# If you haven't run `yarn` after `yarn create vite...`, run it first:
yarn

# Install specific dependencies:
yarn add lucide-react
yarn add -D tailwindcss postcss autoprefixer

# Initialize Tailwind CSS
yarn tailwindcss init -p
```

### 4. Configure Tailwind CSS
#### 1. Configure template paths:
Open your tailwind.config.js file (created in the previous step) and modify the content array to include paths to all of your component files. This tells Tailwind where to look for class names.

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure this line covers your React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
#### 2. Add Tailwind directives to your CSS:
Open your main CSS file (usually src/index.css for Vite projects) and add the following lines at the very top. Replace any existing content if this is your primary styling method.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Ensure this CSS file is imported into your main JavaScript entry point (e.g., src/main.jsx or src/main.js). Vite's React template usually handles this by default.

### 5. Run the Application
Once all dependencies are installed and configurations are set, you can start the development server:

```javascript
# Using npm
npm run dev

# Using yarn
# yarn dev
```

This will typically start the development server and open the application in your default web browser at http://localhost:5173 (this port may vary if 5173 is in use). The terminal will display the correct address.

### Project Structure (Simplified Vite Structure)
```text
my-language-app/
├── public/               # Static assets (e.g., favicon.ico)
├── src/
│   ├── assets/           # Default assets from Vite (e.g., react.svg). Can be removed if not used.
│   ├── App.jsx           # Main application component code
│   ├── main.jsx          # Entry point, renders App component
│   └── index.css         # Global styles with Tailwind directives
├── .eslintrc.cjs         # ESLint configuration (filename may vary)
├── index.html            # Main HTML file (entry point for Vite)
├── package.json          # Project dependencies and scripts
├── postcss.config.js     # PostCSS configuration (for Tailwind)
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite configuration
```

### How to Use
1. Launch the app: Follow the "Run the Application" steps.

2. Create an NPC: Click the "+" (New NPC) button in the sidebar. Fill in the details like name, language, personality, error sensitivity, and conversation objective.

3. Select an NPC: Click on an NPC from the sidebar to start a chat.

4. Chat: Type your messages in the input field and press Enter or click the send button. Observe narrator hints (if enabled and triggered) and how the NPC responds based on its configuration.

5. Configure an NPC: During a chat, click the settings (gear) icon in the chat header to modify the current NPC's settings.

6. View Feedback: After a conversation task is deemed complete (or failed due to too many clarification attempts), a feedback screen will appear.