'use client';

import { useState, useRef } from 'react';
import { Timer } from '@/components/auction/Timer';
import { TimerConfig, PlayerProfile, QueueItemWithPlayer } from '@/types/auction';

interface TimerHandle {
    reset: () => void;
    start: () => void;
    pause: () => void;
    resetForNextBid: () => void;
    skipToNextPhase: () => void;
}

export default function TestAuction() {
    // Timer configuration
    const [config, setConfig] = useState<TimerConfig>({
        initialCountdown: 30,
        subsequentBidTimer: 20,
        automatedCalls: {
            firstCall: 10,
            secondCall: 5,
            finalCall: 2
        },
        visualIndicators: true,
        soundEnabled: true
    });

    // Sample player data
    const [currentPlayer] = useState<PlayerProfile>({
        id: '66666666-6666-6666-6666-666666666666',
        name: 'John Doe',
        base_price: 100,
        player_position: 'P1_RIGHT_BACK',
        skill_level: 'RECREATIONAL_C',
        height: 175,
        status: 'AVAILABLE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        registration_data: {
            last_played_date: 'PLAYING_ACTIVELY'
        },
        tournament_history: [
            {
                name: 'Summer League 2023',
                year: 2023,
                role: 'Captain'
            }
        ],
        achievements: [
            {
                title: 'Best Player',
                description: 'Awarded best player in Summer League 2023',
                year: 2023
            }
        ]
    });

    // Sample queue data with state management
    const [queue, setQueue] = useState<QueueItemWithPlayer[]>([
        {
            id: '11111111-1111-1111-1111-111111111111',
            tournament_id: '99999999-9999-9999-9999-999999999999',
            player_id: '66666666-6666-6666-6666-666666666666',
            queue_position: 1,
            is_processed: false,
            player: currentPlayer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ]);

    // Event handlers
    const handlePhaseChange = (phase: string) => {
        console.log('Phase changed to:', phase);
    };

    const handleComplete = () => {
        console.log('Auction round complete');
        // Mark current player as processed
        setQueue(prevQueue => 
            prevQueue.map(item => 
                item.queue_position === 1 
                    ? { ...item, is_processed: true }
                    : item
            )
        );
        
        // Reset timer to initial state after a short delay
        setTimeout(() => {
            setConfig(prev => ({
                ...prev,
                initialCountdown: 30 // Ensure we reset to 30 seconds
            }));
            timerRef.current?.reset();
        }, 2000); // 2 second delay to show "SOLD!" message
    };

    // Create a ref to access timer methods
    const timerRef = useRef<TimerHandle>(null);

    // Toggle sound
    const toggleSound = () => {
        setConfig(prev => ({
            ...prev,
            soundEnabled: !prev.soundEnabled
        }));
    };

    // Queue management
    const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        const newQueue = [...queue];
        const temp = newQueue[index - 1].queue_position;
        newQueue[index - 1].queue_position = newQueue[index].queue_position;
        newQueue[index].queue_position = temp;
        setQueue(newQueue.sort((a, b) => a.queue_position - b.queue_position));
    };

    const handleMoveDown = (index: number) => {
        if (index >= queue.length - 1) return;
        const newQueue = [...queue];
        const temp = newQueue[index + 1].queue_position;
        newQueue[index + 1].queue_position = newQueue[index].queue_position;
        newQueue[index].queue_position = temp;
        setQueue(newQueue.sort((a, b) => a.queue_position - b.queue_position));
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white p-4">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Main Display Area */}
                    <div className="lg:col-span-9 bg-gray-800 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-3xl font-bold">Player Auction</h1>
                            <div className="space-x-2">
                                <button 
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                    onClick={toggleSound}
                                >
                                    {config.soundEnabled ? '🔊 Sound On' : '🔈 Sound Off'}
                                </button>
                            </div>
                        </div>
                        
                        {/* Player Display */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Current Player</h3>
                                {currentPlayer && (
                                    <div className="p-4 bg-gray-100 rounded">
                                        <p>Name: {currentPlayer.name}</p>
                                        <p>Last Played: {currentPlayer.registration_data?.last_played_date}</p>
                                        <p>Skill Level: {currentPlayer.skill_level}</p>
                                        <p>Base Price: {currentPlayer.base_price}</p>
                                        <div className="mt-2">
                                            <h4 className="font-semibold">Achievements</h4>
                                            {currentPlayer.achievements.map((achievement: { title: string; year: number }) => (
                                                <p key={`${achievement.title}-${achievement.year}`}>
                                                    {achievement.title} ({achievement.year})
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timer Display */}
                        <Timer 
                            ref={timerRef}
                            config={config}
                            onPhaseChange={handlePhaseChange}
                            onComplete={handleComplete}
                            className="mt-6"
                        />
                    </div>

                    {/* Queue Display */}
                    <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Queue</h2>
                        <div className="space-y-2">
                            {queue.map((item, index) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-100 mb-2 rounded">
                                    <div>
                                        <div className="font-medium">Position: {item.queue_position}</div>
                                        <div className="text-sm text-gray-600">
                                            Status: {item.is_processed ? 'Completed' : 'Pending'}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleMoveUp(index)}
                                            disabled={item.queue_position === 1}
                                            className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
                                        >
                                            Up
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(index)}
                                            disabled={item.queue_position === queue.length}
                                            className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
                                        >
                                            Down
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Debug Panel */}
                <div className="mt-8 bg-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Debug Panel</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium mb-2">Timer Config</h3>
                            <pre className="bg-gray-900 p-2 rounded overflow-auto">
                                {JSON.stringify(config, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Queue Status</h3>
                            <pre className="bg-gray-900 p-2 rounded overflow-auto">
                                {JSON.stringify(queue, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 