// personal-fork: the picker search must not re-filter mid IME composition, a heavy re-render then breaks the iOS IME
export interface ISearchInputCommitState {
  isComposing: boolean;
  committed: string;
}

export type ISearchInputCommitEvent =
  | { type: "change"; text: string }
  | { type: "compositionStart" }
  | { type: "compositionEnd"; text: string };

export function SearchInputCommit_initial(committed: string = ""): ISearchInputCommitState {
  return { isComposing: false, committed };
}

export function SearchInputCommit_next(
  state: ISearchInputCommitState,
  event: ISearchInputCommitEvent
): { state: ISearchInputCommitState; commit?: string } {
  if (event.type === "compositionStart") {
    return { state: { ...state, isComposing: true } };
  }
  if (event.type === "change" && state.isComposing) {
    return { state };
  }
  if (event.text === state.committed) {
    return { state: { ...state, isComposing: false } };
  }
  return { state: { isComposing: false, committed: event.text }, commit: event.text };
}
