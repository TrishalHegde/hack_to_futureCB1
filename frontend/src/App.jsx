import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { VerdictDashboard } from './components/VerdictDashboard';
import { verifyClaim } from './api';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (text) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await verifyClaim(text);
      setResult(data);
    } catch (err) {
      setError("Failed to verify the claim. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <header className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-lg">
          <ShieldCheck className="w-10 h-10 text-blue-300" />
          <h1 className="text-3xl font-bold tracking-wide">Anveshak AI</h1>
        </div>
        <p className="mt-4 text-white/80 max-w-xl text-center">
          Global Semantic Probe for verifying viral claims and suspicious media.
        </p>
      </header>

      <main className="flex flex-col items-center w-full">
        <InputSection onSubmit={handleVerify} isLoading={isLoading} />
        
        {error && (
          <div className="mt-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {result && <VerdictDashboard result={result} />}
      </main>
    </div>
  );
}

export default App;
