import React from 'react';
import ChatbotInterface from './components/Chatbotinterface';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>TEST CHATBOT</h1>
      <p>Pose ta question et regarde la réponse du backend :</p>

      {/* Chatbot directement visible pour test */}
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <ChatbotInterface />
      </div>
    </div>
  );
}

export default App;
