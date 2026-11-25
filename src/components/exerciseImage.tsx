import { ExerciseDisplayName_name, ExerciseDisplayName_withEquipment } from "../i18n/exerciseDisplayName";
import { JSX, ReactNode, memo, useState } from "react";
import { View, Image } from "react-native";
import { Text } from "./primitives/text";
import { IconSpinner } from "./icons/iconSpinner";
import { IExerciseType, ISettings } from "../types";
import {
  ExerciseImageUtils_url,
  ExerciseImageUtils_isShown,
} from "../models/exerciseImage";
import { Exercise_get } from "../models/exercise";
import { HostConfig_resolveUrl } from "../utils/hostConfig";
import { ImageCache_initialUri, ImageCache_markMissing, ImageCache_download } from "../utils/imageCache";
import { useRemScale } from "../utils/useRem";

interface IProps {
  exerciseType: IExerciseType;
  size: "large" | "small";
  useTextForCustomExercise?: boolean;
  useBorderForCustomExercise?: boolean;
  suppressCustom?: boolean;
  settings?: ISettings;
  className?: string;
  customClassName?: string;
  width?: number;
}

function areExerciseImagePropsEqual(prev: IProps, next: IProps): boolean {
  return (
    prev.size === next.size &&
    prev.useTextForCustomExercise === next.useTextForCustomExercise &&
    prev.useBorderForCustomExercise === next.useBorderForCustomExercise &&
    prev.suppressCustom === next.suppressCustom &&
    prev.className === next.className &&
    prev.customClassName === next.customClassName &&
    prev.width === next.width &&
    prev.exerciseType.id === next.exerciseType.id &&
    prev.exerciseType.equipment === next.exerciseType.equipment &&
    prev.settings?.exercises === next.settings?.exercises
  );
}

export const ExerciseImage = memo(function ExerciseImage(props: IProps): JSX.Element | null {
  const { size } = props;
  const remScale = useRemScale();
  const exercise = Exercise_get(props.exerciseType, props.settings?.exercises || {});
  const exerciseType = {
    id: props.exerciseType.id,
    equipment: props.exerciseType.equipment || exercise.defaultEquipment,
  };

  const rawSrc = ExerciseImageUtils_url(exerciseType, size, props.settings);
  const remoteSrc = rawSrc ? HostConfig_resolveUrl(rawSrc) : undefined;
  const initialUri = remoteSrc ? ImageCache_initialUri(remoteSrc) : undefined;

  const [prevRemote, setPrevRemote] = useState<string | undefined>(remoteSrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);
  const [src, setSrc] = useState<string | undefined>(initialUri);
  const [usingRemote, setUsingRemote] = useState<boolean>(initialUri === remoteSrc);

  if (prevRemote !== remoteSrc) {
    setPrevRemote(remoteSrc);
    setSrc(initialUri);
    setUsingRemote(initialUri === remoteSrc);
    setIsLoading(true);
    setIsError(false);
    setAspectRatio(4 / 3);
  }

  const doesExist = ExerciseImageUtils_isShown(exerciseType, size, props.settings, !!props.suppressCustom);

  const onCachedError = (): void => {
    if (!usingRemote && remoteSrc) {
      ImageCache_markMissing(remoteSrc);
      setUsingRemote(true);
      setSrc(remoteSrc);
    } else {
      setIsError(true);
    }
  };

  const onCachedLoad = (): void => {
    setIsLoading(false);
    if (usingRemote && remoteSrc) {
      ImageCache_download(remoteSrc);
    }
  };

  if (size === "small") {
    const w = Math.round((props.width || 32) * remScale);
    const imgStyle = { width: w, height: Math.round(w * 1.5) };
    return (
      <>
        {!isError && doesExist && (
          <Image
            data-testid="exercise-image-small"
            testID="exercise-image-small"
            className={props.className}
            source={{ uri: src }}
            style={imgStyle}
            onLoad={onCachedLoad}
            onError={onCachedError}
            accessibilityLabel={ExerciseDisplayName_withEquipment(exercise, props.settings)}
          />
        )}
        {(isError || !doesExist) &&
          (props.useTextForCustomExercise ? (
            <View
              className={`items-start justify-start overflow-hidden bg-background-neutral ${props.className ?? ""} ${props.customClassName ?? ""}`}
              style={{ width: "100%", height: imgStyle.height, padding: 2 * remScale }}
            >
              <Text
                className="text-xs text-text-secondary"
                numberOfLines={3}
                ellipsizeMode="tail"
                style={{ fontSize: 9 * remScale, lineHeight: 11 * remScale }}
              >
                {ExerciseDisplayName_name(exercise)}
              </Text>
            </View>
          ) : null)}
      </>
    );
  } else {
    return doesExist ? (
      <>
        <Image
          data-testid="exercise-image-large"
          testID="exercise-image-large"
          className={props.className}
          source={{ uri: src }}
          resizeMode="contain"
          style={{ width: "100%", aspectRatio }}
          onLoad={(e) => {
            onCachedLoad();
            const source = (e?.nativeEvent as { source?: { width?: number; height?: number } } | undefined)?.source;
            if (source?.width && source?.height) {
              setAspectRatio(source.width / source.height);
            }
          }}
          onError={onCachedError}
          accessibilityLabel={ExerciseDisplayName_withEquipment(exercise, props.settings)}
        />
        <ExerciseImageAuxiliary size={props.size} isError={isError} isLoading={isLoading} />
      </>
    ) : null;
  }
}, areExerciseImagePropsEqual);

function ExerciseImageAuxiliary(props: {
  size: "large" | "small";
  isError: boolean;
  isLoading: boolean;
}): JSX.Element | null {
  if (props.isError) {
    return (
      <ExerciseNoImage size={props.size}>
        <Text className="text-xs leading-normal text-center text-red-700">Error fetching the exercise image</Text>
      </ExerciseNoImage>
    );
  } else if (props.isLoading) {
    return (
      <ExerciseNoImage size={props.size}>
        <View className="items-center w-full">
          <IconSpinner width={20} height={20} />
        </View>
      </ExerciseNoImage>
    );
  } else {
    return null;
  }
}

interface INoImageProps {
  children: ReactNode;
  size: "large" | "small";
}

function ExerciseNoImage(props: INoImageProps): JSX.Element | null {
  return (
    <View className="items-center justify-center px-4 py-10 my-4 border border-dotted rounded-lg border-border-neutral bg-background-neutral">
      {props.children}
    </View>
  );
}
