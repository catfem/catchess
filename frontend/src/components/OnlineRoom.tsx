import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function OnlineRoom() {
  const { onlineRoom, createOnlineRoom, joinOnlineRoom } = useGameStore();
  const [roomInput, setRoomInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = async () => {
    const roomId = await createOnlineRoom();
    console.log('Room created:', roomId);
  };

  const handleJoinRoom = async () => {
    if (roomInput.trim()) {
      await joinOnlineRoom(roomInput.trim());
    }
  };

  const copyRoomLink = () => {
    if (onlineRoom) {
      const link = `${window.location.origin}?room=${onlineRoom.roomId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!onlineRoom) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold dark:text-white">Online Multiplayer</h3>
        
        <div className="space-y-3">
          <button
            onClick={handleCreateRoom}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            🎮 Create New Room
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                OR
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Enter room code..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleJoinRoom}
              disabled={!roomInput.trim()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚪 Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold dark:text-white">Online Room</h3>
      
      <div className="space-y-3">
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Room Code:</p>
          <p className="text-xl font-mono font-bold dark:text-white">{onlineRoom.roomId}</p>
        </div>

        <button
          onClick={copyRoomLink}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {copied ? '✓ Copied!' : '📋 Copy Room Link'}
        </button>

        <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm dark:text-white">
            <span className="font-semibold">Your Color:</span>{' '}
            {onlineRoom.playerColor === 'white' ? '⚪ White' : '⚫ Black'}
          </p>
          <p className="text-sm dark:text-white mt-1">
            <span className="font-semibold">Opponent:</span>{' '}
            {onlineRoom.opponentConnected ? (
              <span className="text-green-600 dark:text-green-400">✓ Connected</span>
            ) : (
              <span className="text-yellow-600 dark:text-yellow-400">⏳ Waiting...</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
