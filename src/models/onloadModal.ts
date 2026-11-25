import { IState } from "./state";
import { WhatsNew_doesHaveNewUpdates } from "./whatsnew";
import { ThanksgivingPromo_shouldShowModal } from "./thanksgivingPromo";

export type IOnloadModal = "whatsnew" | "thanksgiving" | "hearaboutus";

export function OnloadModal_shouldShowWhatsNew(state: IState): boolean {
  return state.storage.whatsNew != null && WhatsNew_doesHaveNewUpdates(state.storage.whatsNew);
}

// personal-fork: the survey answer goes to the author
export function OnloadModal_shouldShowHearAboutUs(_state: IState): boolean {
  return false;
}

export function OnloadModal_getNext(state: IState, isThanksgivingPromo: boolean): IOnloadModal | undefined {
  if (OnloadModal_shouldShowWhatsNew(state)) {
    return "whatsnew";
  }
  if (ThanksgivingPromo_shouldShowModal(isThanksgivingPromo, state.storage.helps)) {
    return "thanksgiving";
  }
  if (OnloadModal_shouldShowHearAboutUs(state)) {
    return "hearaboutus";
  }
  return undefined;
}
