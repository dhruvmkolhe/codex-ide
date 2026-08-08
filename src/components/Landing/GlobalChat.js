import React, { useState, useEffect, useRef } from 'react';

const GlobalChat = ({ user, supabase, setShowAuthModal }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [channel, setChannel] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!supabase) return;

    // Fetch message history on mount
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('global_chat_messages')
        .select('*')
        .order('id', { ascending: false })
        .limit(50);

      if (data && !error) {
        // Reverse so chronological order is oldest at top, newest at bottom
        setMessages(data.reverse());
      }
    };
    fetchHistory();

    // Listen to real-time inserts directly from the database table
    const chatChannel = supabase.channel('global-chat-realtime');

    chatChannel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'global_chat_messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Joined global chat!');
        }
      });

    setChannel(chatChannel);

    return () => {
      chatChannel.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !channel) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const messagePayload = {
      text: newMessage,
      sender: user.user_metadata?.full_name || user.email.split('@')[0],
      avatar: user.user_metadata?.avatar_url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user_id: user.id,
    };

    // Store in database, will emit via postgres_changes to everyone including self
    supabase
      .from('global_chat_messages')
      .insert([messagePayload])
      .then(({ error }) => {
        if (error) console.error('Error sending message:', error);
      });

    setNewMessage('');
  };

  return (
    <div className="reveal bg-surface-container-low border border-outline-variant rounded-2xl flex flex-col h-[600px] overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="p-xl border-b border-outline-variant bg-surface-container-high flex items-center justify-between">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">public</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-on-surface">Global Chat</h3>
            <p className="text-body-xs text-on-surface-variant flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Community Board
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-xl space-y-lg flex flex-col scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-md">
            <span className="material-symbols-outlined text-6xl">chat_bubble</span>
            <p className="text-body-md">No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-sm mb-xs">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {msg.sender}
                </span>
                <span className="text-[10px] text-on-surface-variant">{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[80%] p-md rounded-2xl text-sm ${
                  msg.user_id === user?.id
                    ? 'bg-primary text-on-primary rounded-tr-none'
                    : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-lg bg-surface-container-high border-t border-outline-variant"
      >
        <div className="flex gap-md items-center bg-surface-container-lowest p-xs rounded-xl border border-outline-variant focus-within:border-primary transition-all">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={user ? 'Share your thoughts...' : 'Sign in to join the conversation'}
            readOnly={!user}
            className="flex-1 bg-transparent border-none outline-none px-md text-sm text-on-surface placeholder:text-on-surface-variant/50"
            onClick={() => !user && setShowAuthModal(true)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !user}
            className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all shadow-md"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GlobalChat;
