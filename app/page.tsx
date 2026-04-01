'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const startConversation = async () => {
    setStarted(true);
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages([{ role: 'assistant', content: 'エラーが発生しました: ' + data.error }]);
      } else {
        setMessages([{ role: 'assistant', content: data.content }]);
      }
    } catch {
      setMessages([{ role: 'assistant', content: '接続エラーが発生しました。ページをリロードしてください。' }]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: 'エラーが発生しました: ' + data.error }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: '接続エラーが発生しました。' }]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-lg animate-fade-in">
          <h1 className="text-5xl font-bold tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
            SOKURA
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            ソクラ
          </p>
          <p className="text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
            あなたの成功と失敗の体験から、
          </p>
          <p className="text-lg mb-10" style={{ color: 'var(--text-primary)' }}>
            「自分取説」を作ります。
          </p>
          <button
            onClick={startConversation}
            className="px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
            }}
          >
            対話を始める
          </button>
          <p className="mt-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
            所要時間：約10〜15分
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="p-4 text-center border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-lg font-bold tracking-wider" style={{ color: 'var(--accent)' }}>
          SOKURA
        </h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`animate-fade-in ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
            {msg.role === 'assistant' ? (
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
                >
                  S
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ backgroundColor: 'var(--bg-chat)' }}
                >
                  {msg.content}
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
                style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--text-primary)' }}
              >
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              S
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1"
              style={{ backgroundColor: 'var(--bg-chat)' }}
            >
              <span className="typing-dot w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--text-secondary)' }} />
              <span className="typing-dot w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--text-secondary)' }} />
              <span className="typing-dot w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--text-secondary)' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ここに入力..."
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-chat)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-30"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
            }}
          >
            送信
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
          Shift+Enterで改行
        </p>
      </div>
    </div>
  );
}
