import { assetUrl } from "@/lib/asset";

/** Crabby kid voice. Bake lines with scripts/make-crabby-voice.py */
export const CRABBY_VOICE_ID = "crabby-canon-v1";

export const CRABBY_CLIPS = {
  intro: assetUrl("voice/crabby/intro.mp3?v=064"),
  one: assetUrl("voice/crabby/one.mp3?v=062"),
  two: assetUrl("voice/crabby/two.mp3?v=062"),
  three: assetUrl("voice/crabby/three.mp3?v=062"),
  four: assetUrl("voice/crabby/four.mp3?v=062"),
  five: assetUrl("voice/crabby/five.mp3?v=062"),
  six: assetUrl("voice/crabby/six.mp3?v=062"),
  seven: assetUrl("voice/crabby/seven.mp3?v=062"),
  eight: assetUrl("voice/crabby/eight.mp3?v=062"),
  nine: assetUrl("voice/crabby/nine.mp3?v=062"),
  ten: assetUrl("voice/crabby/ten.mp3?v=062"),
  eleven: assetUrl("voice/crabby/eleven.mp3?v=062"),
  twelve: assetUrl("voice/crabby/twelve.mp3?v=062"),
} as const;
