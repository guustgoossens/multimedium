/**
 * ElevenLabs Text-to-Speech
 *
 * Internal action that generates audio from narration text,
 * stores it in Convex file storage, and patches the explanation record.
 */

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const generateAudio = internalAction({
  args: {
    narration: v.string(),
    explanationId: v.id("explanations"),
  },
  handler: async (ctx, { narration, explanationId }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey || !voiceId) {
      console.warn("[TTS] Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID, skipping audio generation");
      return;
    }

    // Call ElevenLabs with-timestamps endpoint for audio + word timing
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: narration,
          model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TTS] ElevenLabs API error ${response.status}: ${errorText}`);
      return;
    }

    const data = await response.json();

    // data.audio_base64 contains the MP3 audio
    // data.alignment contains character-level timing
    const audioBase64: string = data.audio_base64;
    const alignment = data.alignment as {
      characters: string[];
      character_start_times_seconds: number[];
      character_end_times_seconds: number[];
    };

    // Convert base64 audio to Blob and store in Convex
    const audioBytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
    const audioBlob = new Blob([audioBytes], { type: "audio/mpeg" });
    const storageId = await ctx.storage.store(audioBlob);

    // Convert character-level timings to word-level timings for lip-sync
    const timings = characterTimingsToWords(alignment);

    // Patch the explanation with audio data
    await ctx.runMutation(internal.explanations.patchAudio, {
      explanationId,
      audioStorageId: storageId,
      audioTimings: JSON.stringify(timings),
    });
  },
});

/**
 * Convert ElevenLabs character-level alignment to word-level timing arrays
 * compatible with TalkingHead's speakAudio({ words, wtimes, wdurations }).
 */
function characterTimingsToWords(alignment: {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}): { words: string[]; wtimes: number[]; wdurations: number[] } {
  const words: string[] = [];
  const wtimes: number[] = [];
  const wdurations: number[] = [];

  let currentWord = "";
  let wordStart = 0;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const startTime = alignment.character_start_times_seconds[i];
    const endTime = alignment.character_end_times_seconds[i];

    if (char === " " || char === "\n" || char === "\t") {
      // Whitespace — finalize current word
      if (currentWord) {
        words.push(currentWord);
        wtimes.push(Math.round(wordStart * 1000));
        wdurations.push(Math.round((endTime - wordStart) * 1000));
        currentWord = "";
      }
    } else {
      if (!currentWord) {
        wordStart = startTime;
      }
      currentWord += char;
    }
  }

  // Finalize last word
  if (currentWord) {
    const lastEnd =
      alignment.character_end_times_seconds[alignment.characters.length - 1];
    words.push(currentWord);
    wtimes.push(Math.round(wordStart * 1000));
    wdurations.push(Math.round((lastEnd - wordStart) * 1000));
  }

  return { words, wtimes, wdurations };
}
