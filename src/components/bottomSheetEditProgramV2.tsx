import type { JSX } from "react";

import { BottomSheetItem } from "./bottomSheetItem";
import { IconPicture } from "./icons/iconPicture";

interface IProps {
  isHidden: boolean;
  onGenerateProgramImage: () => void;
  onClose: () => void;
}

export type IBottomSheetEditProgramV2ContentProps = Omit<IProps, "isHidden">;

export function BottomSheetEditProgramV2Content(props: IBottomSheetEditProgramV2ContentProps): JSX.Element {
  return (
    <>
      {/* personal-fork: needs liftosaur.com server */}
      <BottomSheetItem
        isFirst={true}
        name="generate-image"
        className="ls-generate-image"
        title="Generate program image"
        icon={<IconPicture />}
        description="To share it with somebody."
        onClick={props.onGenerateProgramImage}
      />
    </>
  );
}
