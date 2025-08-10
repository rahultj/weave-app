'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, X, Check, Square, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceRecordProps } from '@/lib/types/chat';

export default function VoiceRecord({ onRecord, onCancel }: VoiceRecordProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  // Stop timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Initialize media recorder
  const initializeRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks to free up the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access microphone. Please check permissions.');
      return false;
    }
  }, []);

  // Start recording
  const startRecording = async () => {
    const initialized = await initializeRecorder();
    if (!initialized || !mediaRecorderRef.current) return;

    setError(null);
    setRecordingTime(0);
    setIsRecording(true);
    setIsPaused(false);
    
    mediaRecorderRef.current.start(100); // Collect data every 100ms
    startTimer();
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  // Play/pause audio
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);

  // Send recording
  const handleSend = () => {
    if (audioBlob) {
      // Convert blob to file
      const file = new File([audioBlob], `voice-message-${Date.now()}.webm`, {
        type: 'audio/webm;codecs=opus'
      });
      onRecord(file, caption.trim() || undefined);
    }
  };

  // Start over
  const handleStartOver = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setCaption('');
    setRecordingTime(0);
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-neutral-bg-main"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-border safe-top">
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-bg-hover transition-colors"
            aria-label="Cancel"
          >
            <X size={20} className="text-neutral-text-primary" />
          </button>
          <h1 className="text-h3 font-semibold text-neutral-text-primary">Voice Message</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {!audioBlob ? (
            // Recording interface
            <div className="flex flex-col items-center">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-colors ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-brand-primary'
              }`}>
                <Mic size={48} className="text-white" />
              </div>

              <h2 className="text-h2 font-semibold text-neutral-text-primary mb-2 text-center">
                {isRecording ? 'Recording...' : 'Record Voice Message'}
              </h2>

              <p className="text-body text-neutral-text-secondary text-center mb-6 max-w-sm">
                {isRecording 
                  ? `Recording: ${formatTime(recordingTime)}`
                  : 'Tap to start recording your voice message for Bobbin'
                }
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 max-w-sm">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="bg-brand-primary text-white px-8 py-4 rounded-full text-body font-medium hover:bg-brand-hover transition-colors flex items-center gap-2"
                  >
                    <Mic size={18} />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-red-500 text-white px-8 py-4 rounded-full text-body font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Square size={18} />
                    Stop Recording
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Playback and send interface
            <div className="flex flex-col items-center w-full max-w-sm">
              <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center mb-6">
                <Mic size={32} className="text-white" />
              </div>

              <h2 className="text-h2 font-semibold text-neutral-text-primary mb-2 text-center">
                Voice Message Ready
              </h2>

              <p className="text-body text-neutral-text-secondary text-center mb-6">
                Duration: {formatTime(recordingTime)}
              </p>

              {/* Audio player */}
              <div className="w-full bg-neutral-bg-card rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayback}
                    className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center hover:bg-brand-hover transition-colors"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <div className="flex-1 h-2 bg-neutral-border rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary w-1/3"></div>
                  </div>
                </div>
              </div>

              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  className="hidden"
                />
              )}

              {/* Caption input */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a note (optional)..."
                className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg resize-none text-body placeholder:text-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent mb-4"
                rows={2}
                maxLength={200}
              />

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleStartOver}
                  className="flex-1 py-3 px-4 border border-neutral-border rounded-lg text-neutral-text-secondary hover:bg-neutral-bg-hover transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 py-3 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}