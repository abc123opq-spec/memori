import { JSX, useRef, useState } from "react";
import { View } from "react-native";
import { GroupHeader } from "./groupHeader";
import { Input, IInputHandle, IValidationError } from "./input";
import { Button } from "./button";
import { IEither } from "../utils/types";
import type { ITextInputModalData } from "../navigation/ModalStateContext";
import { Translate_format, Translate_text } from "../i18n/translate";

interface ITextInputModalContentProps {
  data: ITextInputModalData;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

export function TextInputModalContent(props: ITextInputModalContentProps): JSX.Element {
  const { data } = props;
  const [result, setResult] = useState<IEither<string, Set<IValidationError>>>();
  const inputHandle = useRef<IInputHandle>(null);

  const onSubmit = (): void => {
    if (result?.success) {
      const value = result.data.trim();
      if (!value) {
        inputHandle.current?.touch();
        return;
      }
      props.onSubmit(value);
    } else {
      inputHandle.current?.touch();
    }
  };

  return (
    <>
      <GroupHeader size="large" name={data.title} />
      <Input
        identifier={data.dataCyPrefix}
        label={data.inputLabel}
        required
        requiredMessage={Translate_format("{name} cannot be empty", { name: Translate_text(data.inputLabel) })}
        type="text"
        placeholder={data.placeholder}
        maxLength={data.maxLength}
        pattern={data.pattern}
        patternMessage={data.patternMessage}
        changeType="oninput"
        changeHandler={setResult}
        handleRef={inputHandle}
      />
      <View className="flex-row items-center justify-between gap-4 mt-4">
        <Button
          name={`${data.dataCyPrefix}-cancel`}
          data-testid={`${data.dataCyPrefix}-cancel`}
          testID={`${data.dataCyPrefix}-cancel`}
          type="button"
          kind="grayv2"
          className="mr-3"
          onClick={props.onClose}
        >
          Cancel
        </Button>
        <Button
          kind="purple"
          name={`${data.dataCyPrefix}-submit`}
          data-testid={`${data.dataCyPrefix}-submit`}
          testID={`${data.dataCyPrefix}-submit`}
          type="submit"
          onClick={onSubmit}
        >
          {data.submitLabel}
        </Button>
      </View>
    </>
  );
}
