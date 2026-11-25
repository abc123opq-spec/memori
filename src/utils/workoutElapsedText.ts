import { TimeUtils_formatMMSS } from "./time";

export function WorkoutElapsedText_format(ms: number): string {
  const hours = Math.floor(ms / 1000 / 60 / 60);
  return hours > 0 ? `${hours}:${TimeUtils_formatMMSS(ms)}` : TimeUtils_formatMMSS(ms);
}
