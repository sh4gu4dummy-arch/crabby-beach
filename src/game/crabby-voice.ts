import { assetUrl } from "@/lib/asset";

/** Locked Crabby voice. Bake new lines with scripts/make-crabby-voice.py */
export const CRABBY_VOICE_ID = "crabby-canon-v1";

export const CRABBY_CLIPS = {
  intro: assetUrl("voice/crabby/intro.mp3?v=046"),
} as const;
