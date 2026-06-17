"use client";

import { useCallback, useRef, useState } from "react";

export type RecorderMode = "idle" | "recording" | "analyzing";

interface UseRecorderOptions {
  onError?: (message: string) => void;
  onStart?: () => void;
  onStop?: (samples: Float32Array, sampleRate: number) => void;
}

export function useRecorder(options: UseRecorderOptions) {
  const [mode, setMode] = useState<RecorderMode>("idle");
  const [samples, setSamples] = useState<Float32Array>(new Float32Array(0));

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const maxRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupAudio = useCallback(() => {
    processorNodeRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();
    silentGainRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();
    processorNodeRef.current = null;
    sourceNodeRef.current = null;
    silentGainRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });

      const audioContext = new AudioContext();
      await audioContext.resume();
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const processorNode = audioContext.createScriptProcessor(4096, 1, 1);
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceNodeRef.current = sourceNode;
      processorNodeRef.current = processorNode;
      silentGainRef.current = silentGain;
      chunksRef.current = [];

      processorNode.onaudioprocess = (event) => {
        const channel = event.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(channel));
        setSamples(new Float32Array(channel));
      };

      sourceNode.connect(processorNode);
      processorNode.connect(silentGain);
      silentGain.connect(audioContext.destination);

      setMode("recording");
      options.onStart?.();
      maxRecordTimerRef.current = setTimeout(() => stopRecording(), 6500);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      options.onError?.(message.includes("Permission") ? "麦克风权限未打开" : message);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (mode !== "recording") return;
    if (maxRecordTimerRef.current) clearTimeout(maxRecordTimerRef.current);

    const audioContext = audioContextRef.current;
    const merged = mergeChunks(chunksRef.current);
    cleanupAudio();
    setMode("analyzing");

    if (audioContext) {
      options.onStop?.(merged, audioContext.sampleRate);
    }
  }, [mode, options, cleanupAudio]);

  return { mode, samples, startRecording, stopRecording };
}

function mergeChunks(parts: Float32Array[]): Float32Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const merged = new Float32Array(length);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }
  return merged;
}
