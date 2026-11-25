export const PersonalAppWidth_breakpoint = 720;
export const PersonalAppWidth_max = 640;

export function PersonalAppWidth_get(windowWidth: number): number {
  return windowWidth >= PersonalAppWidth_breakpoint ? PersonalAppWidth_max : windowWidth;
}
