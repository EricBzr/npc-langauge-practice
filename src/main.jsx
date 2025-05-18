import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Settings, MessageSquare, User, Users, Coffee, Send, ChevronLeft, Mic, AlertCircle, CheckCircle, Info } from 'lucide-react';

// Mock initial NPCs - in a real app, this would come from a backend or local storage
const initialNpcs = [
  {
    id: '1',
    name: 'Barista Rui',
    avatar: '☕',
    language: 'European Portuguese',
    personality: 'Tolerant/Friendly', // 'Tolerant/Friendly', 'Strict/Perfectionist'
    errorSensitivity: 0.3, // Range 0 (less sensitive) to 1 (very sensitive)
    nudgeEnabled: true,
    dialogue: {
      objective: "Order a coffee.",
      greeting: "Olá! Bem-vindo à nossa cafetaria. O que deseja?",
      clarifications: ["Desculpe, não percebi bem. Pode repetir, por favor?", "Como disse?", "Não tenho a certeza do que quer dizer com isso. Pode explicar?"],
      responses: {
        "café": "Um café simples, claro! Já a seguir.",
        "cafe": "Um café simples, claro! Já a seguir.",
        "simples": "Um café simples, percebido!",
        "galão": "Um galão, muito bem. É uma boa escolha.",
        "galao": "Um galão, muito bem. É uma boa escolha.",
        "água": "Água? Temos sim. Natural ou com gás?",
        "agua": "Água? Temos sim. Natural ou com gás?",
        "obrigado": "De nada! Precisa de mais alguma coisa?",
        "obrigada": "De nada! Precisa de mais alguma coisa?",
        "adeus": "Adeus! Tenha um bom dia!",
      },
      defaultResponse: "Interessante. Gostaria de pedir algo ou fazer outra pergunta?",
      taskKeywords: ["café", "cafe", "galão", "galao"], // Keywords that indicate task completion
      successMessage: "Muito bem! Conseguiu pedir o seu café. Aqui está!",
      failMessage: "Parece que não nos entendemos desta vez. Quer tentar de novo mais tarde?"
    },
    taskCompleted: false,
    clarificationAttempts: 0,
    maxClarificationAttempts: 2,
  }
];

// Main Application Component
const App = () => {
  const [npcs, setNpcs] = useState(initialNpcs);
  const [currentNpcId, setCurrentNpcId] = useState(null);
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome', 'chat', 'configNpc', 'newNpc', 'feedback'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [narratorHint, setNarratorHint] = useState(null);
  const [lastInteractionSummary, setLastInteractionSummary] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (currentView === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView]);

  const selectedNpc = npcs.find(npc => npc.id === currentNpcId);

  // --- Navigation Handlers ---
  const handleSelectNpc = (npcId) => {
    setCurrentNpcId(npcId);
    setMessages([]); // Clear previous messages
    setNarratorHint(null);
    const npc = npcs.find(n => n.id === npcId);
    if (npc) {
      setNpcs(prevNpcs => prevNpcs.map(n => n.id === npcId ? {...n, taskCompleted: false, clarificationAttempts: 0} : n));
      // Initial greeting from NPC
      setMessages([{ id: Date.now(), sender: 'npc', text: npc.dialogue.greeting, avatar: npc.avatar }]);
    }
    setCurrentView('chat');
  };

  const handleAddNewNpc = () => {
    setCurrentView('newNpc');
  };

  const handleConfigureNpc = (npcId) => {
    setCurrentNpcId(npcId);
    setCurrentView('configNpc');
  };

  const handleBackToChat = () => {
    if (selectedNpc) {
       // Check if returning from feedback, if so, maybe go to welcome or reset NPC
      if (currentView === 'feedback' && selectedNpc.taskCompleted) {
        handleSelectNpc(selectedNpc.id); // Restart chat with same NPC
      } else {
        setCurrentView('chat');
      }
    } else {
      setCurrentView('welcome');
    }
  };

   const handleEndInteraction = (summary) => {
    setLastInteractionSummary(summary);
    setCurrentView('feedback');
  };


  // --- NPC and Chat Logic (Simulated) ---
  const createNpc = (newNpcData) => {
    const newId = String(Date.now());
    const npcWithDefaults = {
      ...newNpcData,
      id: newId,
      avatar: newNpcData.avatar || '👤',
      language: newNpcData.language || 'English',
      personality: newNpcData.personality || 'Tolerant/Friendly',
      dialogue: { // Basic dialogue structure
        objective: newNpcData.objective || "Have a simple conversation.",
        greeting: `Hello! I am ${newNpcData.name}. What can I do for you?`,
        clarifications: ["Sorry, I didn't quite get that. Could you rephrase?", "What do you mean by that?"],
        responses: {"hello": "Hello to you too!", "hi": "Hi there!"},
        defaultResponse: "That's interesting. Tell me more.",
        taskKeywords: [],
        successMessage: "Great conversation!",
        failMessage: "Let's try this again later."
      },
      taskCompleted: false,
      clarificationAttempts: 0,
      maxClarificationAttempts: 2,
    };
    setNpcs([...npcs, npcWithDefaults]);
    handleSelectNpc(newId); // Auto-select new NPC for chat
  };

  const updateNpcConfiguration = (npcId, updatedData) => {
    setNpcs(npcs.map(npc => npc.id === npcId ? { ...npc, ...updatedData } : npc));
    setCurrentView('chat'); // Go back to chat after saving
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedNpc) return;

    const newPlayerMessage = { id: Date.now(), sender: 'player', text: inputValue };
    setMessages(prevMessages => [...prevMessages, newPlayerMessage]);
    setInputValue('');
    setNarratorHint(null); // Clear previous hint

    let currentNpcState = {...selectedNpc};
    let interactionSummary = {
        npcName: currentNpcState.name,
        objective: currentNpcState.dialogue.objective,
        messagesExchanged: messages.length + 1, // +1 for current player message
        hintsUsed: 0, // This would be tracked if hints are interactive
        errors: [], // Store simulated errors
        finalOutcome: 'pending'
    };

    // 1. Narrator Check (Simulated)
    if (currentNpcState.nudgeEnabled && Math.random() < 0.4) { // 40% chance of narrator hint
      const hints = ["Hint: Try to use polite forms.", "Hint: Check your verb conjugation.", "Hint: Is that the most natural phrasing?"];
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      setNarratorHint(randomHint);
      interactionSummary.hintsUsed++;
      // In a real app, player might revise input. Here, it's just informational.
    }

    // 2. NPC Receives Input & Evaluates (Simulated)
    // Simulate understanding based on errorSensitivity and personality
    // Lower errorSensitivity = more tolerant (higher chance of understanding)
    // Stricter personality = less tolerant (lower chance of understanding for same sensitivity)
    let understandingConfidence = Math.random();
    let effectiveSensitivity = currentNpcState.errorSensitivity;
    if (currentNpcState.personality === 'Strict/Perfectionist') {
      effectiveSensitivity = Math.min(1, currentNpcState.errorSensitivity + 0.2); // Stricter NPCs are more sensitive
    }

    const npcUnderstood = understandingConfidence > effectiveSensitivity;

    setTimeout(() => {
      if (currentNpcState.taskCompleted) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'npc', text: "We've already completed our main task. Feel free to practice more or say goodbye!", avatar: currentNpcState.avatar }]);
        return;
      }

      if (!npcUnderstood && currentNpcState.clarificationAttempts < currentNpcState.maxClarificationAttempts) {
        currentNpcState.clarificationAttempts++;
        setNpcs(prevNpcs => prevNpcs.map(n => n.id === currentNpcState.id ? {...n, clarificationAttempts: currentNpcState.clarificationAttempts} : n));
        const clarificationMsg = currentNpcState.dialogue.clarifications[Math.floor(Math.random() * currentNpcState.dialogue.clarifications.length)];
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'npc', text: clarificationMsg, avatar: currentNpcState.avatar }]);
        interactionSummary.errors.push({ input: newPlayerMessage.text, issue: "NPC clarification needed." });

      } else if (!npcUnderstood && currentNpcState.clarificationAttempts >= currentNpcState.maxClarificationAttempts) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'npc', text: currentNpcState.dialogue.failMessage, avatar: currentNpcState.avatar }]);
        currentNpcState.taskCompleted = true; // Mark as completed (failed)
        setNpcs(prevNpcs => prevNpcs.map(n => n.id === currentNpcState.id ? {...n, taskCompleted: true} : n));
        interactionSummary.finalOutcome = 'failed';
        interactionSummary.errors.push({ input: newPlayerMessage.text, issue: "NPC gave up after multiple clarifications." });
        handleEndInteraction(interactionSummary);

      } else { // NPC Understood
        currentNpcState.clarificationAttempts = 0; // Reset attempts on understanding
        setNpcs(prevNpcs => prevNpcs.map(n => n.id === currentNpcState.id ? {...n, clarificationAttempts: 0} : n));
        
        let npcResponseText = currentNpcState.dialogue.defaultResponse;
        let taskNowCompleted = false;

        // Check for task completion keywords
        const playerInputLower = newPlayerMessage.text.toLowerCase();
        for (const keyword of currentNpcState.dialogue.taskKeywords) {
          if (playerInputLower.includes(keyword)) {
            npcResponseText = currentNpcState.dialogue.successMessage;
            taskNowCompleted = true;
            currentNpcState.taskCompleted = true;
             setNpcs(prevNpcs => prevNpcs.map(n => n.id === currentNpcState.id ? {...n, taskCompleted: true} : n));
            interactionSummary.finalOutcome = 'success';
            break;
          }
        }

        // Check for specific responses if task not yet completed by keyword
        if (!taskNowCompleted) {
            for (const key in currentNpcState.dialogue.responses) {
                if (playerInputLower.includes(key)) {
                    npcResponseText = currentNpcState.dialogue.responses[key];
                    break;
                }
            }
        }
        
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'npc', text: npcResponseText, avatar: currentNpcState.avatar }]);
        
        if (taskNowCompleted) {
          handleEndInteraction(interactionSummary);
        }
      }
    }, 1000); // Simulate NPC thinking time
  };


  // --- Render Logic ---
  let mainContent;
  if (currentView === 'chat' && selectedNpc) {
    mainContent = <ChatView npc={selectedNpc} messages={messages} inputValue={inputValue} setInputValue={setInputValue} handleSendMessage={handleSendMessage} narratorHint={narratorHint} chatEndRef={chatEndRef} onConfigureNpc={() => handleConfigureNpc(selectedNpc.id)} />;
  } else if (currentView === 'configNpc' && selectedNpc) {
    mainContent = <NpcConfigView npc={selectedNpc} onSave={updateNpcConfiguration} onBack={handleBackToChat} />;
  } else if (currentView === 'newNpc') {
    mainContent = <NewNpcView onCreate={createNpc} onBack={() => setCurrentView(currentNpcId ? 'chat' : 'welcome')} />;
  } else if (currentView === 'feedback' && lastInteractionSummary) {
    mainContent = <FeedbackView summary={lastInteractionSummary} onContinue={handleBackToChat} />;
  }
  else {
    mainContent = <WelcomeView onSelectNpc={handleSelectNpc} npcs={npcs} />;
  }

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      <Sidebar npcs={npcs} onSelectNpc={handleSelectNpc} onAddNewNpc={handleAddNewNpc} currentNpcId={currentNpcId} />
      <div className="flex-1 flex flex-col">
        {mainContent}
      </div>
    </div>
  );
};

// --- Components ---

const Sidebar = ({ npcs, onSelectNpc, onAddNewNpc, currentNpcId }) => {
  return (
    <div className="w-20 sm:w-64 bg-gray-800 text-white p-4 flex flex-col items-center sm:items-stretch">
      <div className="text-2xl font-bold mb-6 text-center hidden sm:block">NPCs</div>
      <div className="space-y-3 flex-grow">
        {npcs.map(npc => (
          <button
            key={npc.id}
            onClick={() => onSelectNpc(npc.id)}
            className={`w-full flex items-center p-2 rounded-lg transition-colors ${npc.id === currentNpcId ? 'bg-sky-600' : 'hover:bg-gray-700'}`}
            title={npc.name}
          >
            <span className="text-2xl sm:text-3xl mr-0 sm:mr-3">{npc.avatar}</span>
            <span className="hidden sm:inline">{npc.name}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onAddNewNpc}
        className="mt-auto w-12 h-12 sm:w-full flex items-center justify-center sm:p-3 bg-sky-500 hover:bg-sky-600 rounded-full sm:rounded-lg transition-colors"
        title="Add New NPC"
      >
        <PlusCircle size={28} className="text-white" />
        <span className="hidden sm:ml-2 sm:inline">New NPC</span>
      </button>
    </div>
  );
};

const WelcomeView = ({ onSelectNpc, npcs }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      <MessageSquare size={64} className="text-sky-500 mb-6" />
      <h1 className="text-3xl font-semibold text-gray-700 mb-4">Language Practice Chat</h1>
      <p className="text-gray-500 mb-8 text-center">Select an NPC from the sidebar to start a conversation, or create a new one!</p>
      {npcs.length === 0 && <p className="text-gray-500">No NPCs available. Click the '+' button in the sidebar to create one.</p>}
    </div>
  );
};

const ChatHeader = ({ npc, onConfigureNpc }) => {
  if (!npc) return null;
  return (
    <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-3xl mr-3">{npc.avatar}</span>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{npc.name}</h2>
          <p className="text-sm text-gray-500">{npc.language} - Objective: {npc.dialogue.objective}</p>
        </div>
      </div>
      <button onClick={onConfigureNpc} className="p-2 text-gray-500 hover:text-sky-500 transition-colors" title="Configure NPC">
        <Settings size={24} />
      </button>
    </div>
  );
};

const ChatView = ({ npc, messages, inputValue, setInputValue, handleSendMessage, narratorHint, chatEndRef, onConfigureNpc }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 max-h-screen">
      <ChatHeader npc={npc} onConfigureNpc={onConfigureNpc} />
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'npc' && <span className="text-2xl mr-2 self-end">{msg.avatar}</span>}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow ${
                msg.sender === 'player'
                  ? 'bg-sky-500 text-white rounded-br-none'
                  : 'bg-white text-gray-700 rounded-bl-none border border-gray-200'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {narratorHint && (
        <div className="p-3 bg-yellow-100 border-t border-b border-yellow-300 text-yellow-700 text-sm flex items-center">
          <Info size={18} className="mr-2" />
          {narratorHint}
        </div>
      )}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <textarea
            rows="1"
            className="flex-1 p-3 bg-transparent text-gray-700 focus:outline-none resize-none"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="p-3 text-gray-400 hover:text-sky-500 transition-colors" title="Record Voice (not implemented)">
            <Mic size={22} />
          </button>
          <button onClick={handleSendMessage} className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50" disabled={!inputValue.trim()}>
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

const NpcConfigView = ({ npc, onSave, onBack }) => {
  const [name, setName] = useState(npc.name);
  const [language, setLanguage] = useState(npc.language);
  const [avatar, setAvatar] = useState(npc.avatar);
  const [personality, setPersonality] = useState(npc.personality);
  const [errorSensitivity, setErrorSensitivity] = useState(npc.errorSensitivity);
  const [nudgeEnabled, setNudgeEnabled] = useState(npc.nudgeEnabled);
  const [objective, setObjective] = useState(npc.dialogue.objective);


  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(npc.id, { 
      name, 
      language,
      avatar,
      personality, 
      errorSensitivity: parseFloat(errorSensitivity), 
      nudgeEnabled,
      dialogue: {
        ...npc.dialogue, // preserve other dialogue parts
        objective
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      <button onClick={onBack} className="absolute top-5 left-5 p-2 text-gray-500 hover:text-sky-500">
        <ChevronLeft size={28} />
      </button>
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-gray-50 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <span className="text-6xl">{avatar}</span>
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">Configure {npc.name}</h2>
        </div>

        <div className="mb-4">
          <label htmlFor="npcName" className="block text-sm font-medium text-gray-700 mb-1">NPC Name</label>
          <input type="text" id="npcName" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
        </div>
        
        <div className="mb-4">
          <label htmlFor="npcAvatar" className="block text-sm font-medium text-gray-700 mb-1">Avatar (Emoji)</label>
          <input type="text" id="npcAvatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} maxLength="2" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
        </div>

        <div className="mb-4">
          <label htmlFor="npcLang" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <input type="text" id="npcLang" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
        </div>
        
        <div className="mb-4">
          <label htmlFor="npcObjective" className="block text-sm font-medium text-gray-700 mb-1">Conversation Objective</label>
          <input type="text" id="npcObjective" value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
        </div>

        <div className="mb-4">
          <label htmlFor="npcPersonality" className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
          <select id="npcPersonality" value={personality} onChange={(e) => setPersonality(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500">
            <option value="Tolerant/Friendly">Tolerant/Friendly</option>
            <option value="Strict/Perfectionist">Strict/Perfectionist</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="errorSensitivity" className="block text-sm font-medium text-gray-700 mb-1">Error Sensitivity: {Number(errorSensitivity).toFixed(1)}</label>
          <p className="text-xs text-gray-500 mb-1">Higher value means NPC is more sensitive to errors.</p>
          <input type="range" id="errorSensitivity" min="0" max="1" step="0.1" value={errorSensitivity} onChange={(e) => setErrorSensitivity(e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500" />
        </div>

        <div className="mb-8">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={nudgeEnabled} onChange={(e) => setNudgeEnabled(e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500" />
            <span className="text-sm font-medium text-gray-700">Enable Nudge System?</span>
          </label>
        </div>

        <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
          Save Configuration
        </button>
      </form>
    </div>
  );
};

const NewNpcView = ({ onCreate, onBack }) => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('European Portuguese');
  const [avatar, setAvatar] = useState('🤖');
  const [personality, setPersonality] = useState('Tolerant/Friendly');
  const [errorSensitivity, setErrorSensitivity] = useState(0.3);
  const [nudgeEnabled, setNudgeEnabled] = useState(true);
  const [objective, setObjective] = useState("Order a drink at a cafe.");


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a name for the NPC.");
      return;
    }
    onCreate({ name, language, avatar, personality, errorSensitivity: parseFloat(errorSensitivity), nudgeEnabled, objective });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
       <button onClick={onBack} className="absolute top-5 left-5 p-2 text-gray-500 hover:text-sky-500">
        <ChevronLeft size={28} />
      </button>
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-gray-50 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <span className="text-6xl">{avatar || '👤'}</span>
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">Create New NPC</h2>
        </div>

        <div className="mb-4">
          <label htmlFor="newNpcName" className="block text-sm font-medium text-gray-700 mb-1">NPC Name*</label>
          <input type="text" id="newNpcName" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="E.g., Shopkeeper Sofia" />
        </div>

        <div className="mb-4">
          <label htmlFor="newNpcAvatar" className="block text-sm font-medium text-gray-700 mb-1">Avatar (Emoji)</label>
          <input type="text" id="newNpcAvatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} maxLength="2" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="🤖" />
        </div>
        
        <div className="mb-4">
          <label htmlFor="newNpcLang" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <input type="text" id="newNpcLang" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="E.g., European Portuguese" />
        </div>

        <div className="mb-4">
          <label htmlFor="newNpcObjective" className="block text-sm font-medium text-gray-700 mb-1">Conversation Objective</label>
          <input type="text" id="newNpcObjective" value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="E.g., Order a specific item" />
        </div>

        <div className="mb-4">
          <label htmlFor="newNpcPersonality" className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
          <select id="newNpcPersonality" value={personality} onChange={(e) => setPersonality(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500">
            <option value="Tolerant/Friendly">Tolerant/Friendly</option>
            <option value="Strict/Perfectionist">Strict/Perfectionist</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="newErrorSensitivity" className="block text-sm font-medium text-gray-700 mb-1">Error Sensitivity: {Number(errorSensitivity).toFixed(1)}</label>
           <p className="text-xs text-gray-500 mb-1">Higher value means NPC is more sensitive to errors.</p>
          <input type="range" id="newErrorSensitivity" min="0" max="1" step="0.1" value={errorSensitivity} onChange={(e) => setErrorSensitivity(e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500" />
        </div>

        <div className="mb-8">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={nudgeEnabled} onChange={(e) => setNudgeEnabled(e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500" />
            <span className="text-sm font-medium text-gray-700">Enable Nudge System?</span>
          </label>
        </div>

        <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
          Create NPC
        </button>
      </form>
    </div>
  );
};

const FeedbackView = ({ summary, onContinue }) => {
  if (!summary) return null;
  const isSuccess = summary.finalOutcome === 'success';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      <div className="w-full max-w-lg bg-gray-50 p-8 rounded-xl shadow-lg text-center">
        {isSuccess ? <CheckCircle size={48} className="text-green-500 mx-auto mb-4" /> : <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />}
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Interaction Complete: {summary.npcName}
        </h2>
        <p className={`text-lg font-medium mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          Objective: {summary.objective} - {isSuccess ? 'Successfully Achieved!' : 'Not Achieved'}
        </p>

        <div className="text-left space-y-2 text-sm text-gray-600 mb-6">
          <p><strong>Messages Exchanged:</strong> {summary.messagesExchanged}</p>
          <p><strong>Narrator Hints Received:</strong> {summary.hintsUsed}</p>
          {summary.errors && summary.errors.length > 0 && (
            <div>
              <p><strong>Areas for Attention:</strong></p>
              <ul className="list-disc list-inside ml-4">
                {summary.errors.map((err, index) => (
                  <li key={index}>Input: "{err.input}" - Issue: {err.issue}</li>
                ))}
              </ul>
            </div>
          )}
          {!summary.errors || summary.errors.length === 0 && isSuccess && (
             <p className="text-green-500">No major issues detected in this interaction. Well done!</p>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mb-4">This is a simplified feedback. A real app would provide detailed corrections and suggestions.</p>

        <button 
          onClick={onContinue} 
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Continue (Chat Again)
        </button>
      </div>
    </div>
  );
};


export default App;

