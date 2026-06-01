import { Send, Shield, UserRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Participant, PrivateChatMessage } from '../../types/classroom';

interface PrivateChatPanelProps {
  participants: Participant[];
  currentUserId: string;
  selectedPeerId: string | null;
  onSelectPeer: (peerId: string) => void;
  messages: PrivateChatMessage[];
  onSendMessage: (targetUserId: string, message: string) => void;
}

const PrivateChatPanel = ({
  participants,
  currentUserId,
  selectedPeerId,
  onSelectPeer,
  messages,
  onSendMessage,
}: PrivateChatPanelProps) => {
  const [messageInput, setMessageInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const peers = useMemo(
    () => participants.filter((participant) => participant.id !== currentUserId),
    [currentUserId, participants]
  );

  const selectedPeer = peers.find((participant) => participant.id === selectedPeerId) || null;

  const conversationMessages = useMemo(() => {
    if (!selectedPeerId) return [];

    return messages.filter(
      (message) =>
        (message.senderId === currentUserId && message.recipientId === selectedPeerId) ||
        (message.senderId === selectedPeerId && message.recipientId === currentUserId)
    );
  }, [currentUserId, messages, selectedPeerId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length, selectedPeerId]);

  const handleSend = () => {
    if (!selectedPeerId || !messageInput.trim()) return;
    onSendMessage(selectedPeerId, messageInput.trim());
    setMessageInput('');
  };

  return (
    <div className="flex h-full flex-col bg-gray-800 text-white">
      <div className="border-b border-gray-700 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-blue-400" />
          Private Chat
        </div>

        {peers.length === 0 ? (
          <div className="rounded-lg bg-gray-700 p-3 text-center text-sm text-gray-400">
            No other participants yet.
          </div>
        ) : (
          <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
            {peers.map((peer) => {
              const unreadCount = messages.filter(
                (message) =>
                  message.senderId === peer.id &&
                  message.recipientId === currentUserId &&
                  peer.id !== selectedPeerId
              ).length;

              return (
                <button
                  key={peer.id}
                  type="button"
                  onClick={() => onSelectPeer(peer.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                    selectedPeerId === peer.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{peer.name}</span>
                      <span className="block text-xs capitalize text-gray-300">{peer.role}</span>
                    </span>
                  </span>

                  {unreadCount > 0 && (
                    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!selectedPeer ? (
          <div className="mt-10 text-center text-gray-500">
            <Shield className="mx-auto mb-3 h-10 w-10 text-gray-600" />
            <p>Select a participant to start a private conversation.</p>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="mt-10 text-center text-gray-500">
            <p>No private messages with {selectedPeer.name} yet.</p>
            <p className="text-sm">Say hello 👋</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversationMessages.map((message) => {
              const isMine = message.senderId === currentUserId;

              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      isMine ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold opacity-90">{isMine ? 'You' : message.senderName}</span>
                      <span className="text-[10px] opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 p-4">
        <div className="mb-2 text-xs text-gray-400">
          {selectedPeer ? `Private message to ${selectedPeer.name}` : 'Select someone to message'}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            disabled={!selectedPeer}
            onChange={(event) => setMessageInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSend();
            }}
            placeholder="Type a private message..."
            className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white outline-none ring-blue-500 placeholder:text-gray-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            disabled={!selectedPeer || !messageInput.trim()}
            onClick={handleSend}
            className="rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateChatPanel;
