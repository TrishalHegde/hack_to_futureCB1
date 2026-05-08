import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export const InputSection = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <div className="glass-panel p-6 md:p-8 w-full max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify Suspicious Claims</h2>
      <p className="text-white/80 mb-6 text-center text-sm md:text-base">
        Paste a WhatsApp forward, tweet, or any suspicious text in English, Hindi, or Romanized languages.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your claim here..."
          className="glass-input min-h-[150px] resize-y"
        />
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="glass-button flex items-center gap-2 text-lg font-semibold px-8 py-3 w-full md:w-auto justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Search /> Verify Now
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
