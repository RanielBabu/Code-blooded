import { TrialResult, StimulusType } from "@/types/participant";
import { MOCK_PARTICIPANTS } from "./mock-participants";

// Helper to synthesize realistic trials for mock participants
function generateParticipantTrials(): TrialResult[] {
  const allTrials: TrialResult[] = [];

  const STIMULI_CONFIGS: { type: StimulusType; prompt: string; text: string; color: string; congruent: boolean }[] = [
    { type: "text", prompt: "Identify the word", text: "TARGET", color: "#FFFFFF", congruent: true },
    { type: "color", prompt: "Identify ink color", text: "BLUE", color: "#3B82F6", congruent: true },
    { type: "mixed", prompt: "Identify ink color (Ignore text)", text: "RED", color: "#22C55E", congruent: false },
    { type: "image", prompt: "Identify visual icon", text: "LIGHTNING", color: "#F59E0B", congruent: true },
    { type: "text", prompt: "Identify the word", text: "SYNAPSE", color: "#FFFFFF", congruent: true },
    { type: "color", prompt: "Identify ink color", text: "YELLOW", color: "#F59E0B", congruent: true },
    { type: "mixed", prompt: "Identify ink color (Ignore text)", text: "GREEN", color: "#EF4444", congruent: false },
    { type: "image", prompt: "Identify visual icon", text: "DIAMOND", color: "#3B82F6", congruent: true },
    { type: "color", prompt: "Identify ink color", text: "RED", color: "#EF4444", congruent: true },
    { type: "mixed", prompt: "Final interference trial", text: "BLUE", color: "#F59E0B", congruent: false },
  ];

  MOCK_PARTICIPANTS.forEach((p) => {
    const baseRt = p.avgReactionTimeMs;
    const trialCount = 10; // 10 representative trials per participant for full matrix coverage

    STIMULI_CONFIGS.slice(0, trialCount).forEach((stim, idx) => {
      // Add subtle modality variance
      let typeDelta = 0;
      if (stim.type === "text") typeDelta = -20;
      if (stim.type === "color") typeDelta = 10;
      if (stim.type === "image") typeDelta = 25;
      if (stim.type === "mixed") typeDelta = 45;

      const randomJitter = (Math.sin(idx * 7 + p.age!) * 18);
      const rt = Math.round(baseRt + typeDelta + randomJitter);

      // Determine correctness based on participant accuracy
      const isCorrect = idx !== 6 || p.accuracyPercent >= 94;

      allTrials.push({
        id: `trial-${p.id}-${idx + 1}`,
        participantId: p.id,
        participantName: p.displayName,
        ageGroup: p.ageGroup,
        sex: p.sex,
        experimentId: "exp-color-response",
        trialNumber: idx + 1,
        stimulusType: stim.type,
        stimulus: {
          prompt: stim.prompt,
          text: stim.text,
          color: stim.color,
          congruent: stim.congruent,
        },
        response: {
          selectedAnswer: isCorrect ? stim.text : "YELLOW",
          inputMethod: idx % 2 === 0 ? "keyboard" : "button",
        },
        correct: isCorrect,
        reactionTimeMs: Math.max(220, rt),
        startedAt: `2026-03-24T10:14:${String(idx * 3).padStart(2, "0")}.000Z`,
        respondedAt: `2026-03-24T10:14:${String(idx * 3).padStart(2, "0")}.${rt}Z`,
      });
    });
  });

  return allTrials;
}

export const MOCK_TRIALS: TrialResult[] = generateParticipantTrials();
