import { JSX, useState } from "react";
import { View, Pressable } from "react-native";
import { TextInput } from "../primitives/textInput";
import { Dialog_confirm } from "../../utils/dialog";
import { Translate_text } from "../../i18n/translate";
import { Text } from "../primitives/text";
import { ISettings, ICustomExercise, IMuscle, exerciseKinds, IExerciseKind } from "../../types";
import { Button } from "../button";
import { ILensDispatch } from "../../utils/useLensReducer";
import { lb } from "lens-shmens";
import { Tailwind_semantic } from "../../utils/tailwindConfig";
import { ExercisePickerOptionsMuscles } from "./exercisePickerOptionsMuscles";
import { IconArrowDown2 } from "../icons/iconArrowDown2";
import { ExercisePickerOptions, IFilterValue } from "./exercisePickerOptions";
import { StringUtils_capitalize } from "../../utils/string";
import { ObjectUtils_keys, ObjectUtils_clone, ObjectUtils_mapValues } from "../../utils/object";
import { Exercise_targetMuscles, Exercise_synergistMuscles, Exercise_nameError } from "../../models/exercise";
import { LinkButton } from "../linkButton";
import { MarkdownEditor } from "../markdownEditor";
import { BottomSheetExerciseCloneLibrary } from "./bottomSheetExerciseCloneLibrary";
import { ExerciseImageUtils_url } from "../../models/exerciseImage";
import { BottomSheetOrModal } from "../bottomSheetOrModal";
import { useModal } from "../../navigation/ModalStateContext";

interface IExercisePickerCustomExerciseContentProps {
  settings: ISettings;
  useInlineModals?: boolean;
  originalExercise?: ICustomExercise;
  showMuscles: boolean;
  exercise: ICustomExercise;
  isLoggedIn: boolean;
  hideDeleteButton: boolean;
  hideNotes: boolean;
  notes: string | undefined;
  setNotes: (notes: string) => void;
  dispatch: ILensDispatch<ICustomExercise>;
  onClose: () => void;
  onGoBack: (reason: string) => void;
  onDelete: () => void;
}

async function confirmAsync(message: string): Promise<boolean> {
  return Dialog_confirm(Translate_text(message));
}

export function ExercisePickerCustomExerciseContent(props: IExercisePickerCustomExerciseContentProps): JSX.Element {
  const editCustomExercise = props.exercise;
  const { notes, setNotes } = props;
  const nameError = Exercise_nameError(editCustomExercise.name);
  const [showCloneBottomSheet, setShowCloneBottomSheet] = useState<boolean>(false);

  const openCloneLibraryModal = useModal("exerciseCloneLibraryModal", (result) => {
    props.dispatch(
      [
        lb<ICustomExercise>().p("smallImageUrl").record(result.smallImageUrl),
        lb<ICustomExercise>().p("largeImageUrl").record(result.largeImageUrl),
        lb<ICustomExercise>().p("meta").p("targetMuscles").record(result.targetMuscles),
        lb<ICustomExercise>().p("meta").p("synergistMuscles").record(result.synergistMuscles),
        lb<ICustomExercise>().p("types").record(result.types),
      ],
      "Clone built-in exercise into custom exercise"
    );
  });

  const typeValues = exerciseKinds.reduce<Record<IExerciseKind, IFilterValue>>(
    (memo, type) => {
      memo[type] = {
        label: Translate_text(StringUtils_capitalize(type), "exerciseKind"),
        isSelected: !!editCustomExercise.types?.includes(type),
      };
      return memo;
    },
    {} as Record<IExerciseKind, IFilterValue>
  );

  const openCloneLibrary = (): void => {
    if (props.useInlineModals) {
      setShowCloneBottomSheet(true);
    } else {
      openCloneLibraryModal({});
    }
  };

  return (
    <View>
      <View>
        <View className="items-center pb-2">
          <LinkButton className="text-xs" name="clone-builtin-exercise" onPress={openCloneLibrary}>
            Clone from another exercise
          </LinkButton>
        </View>
        <View>
          <Text className="pb-1 text-sm">
            Name<Text className="text-text-error"> *</Text>
          </Text>
          <TextInput
            data-testid="custom-exercise-name-input"
            testID="custom-exercise-name-input"
            defaultValue={editCustomExercise.name}
            placeholder="Super Squat"
            placeholderTextColor={Tailwind_semantic().text.secondarysubtle}
            style={{ minHeight: 40 }}
            className="px-4 py-2 text-base border rounded-lg bg-background-default border-border-prominent text-text-primary"
            onChangeText={(text) => {
              props.dispatch(lb<ICustomExercise>().p("name").record(text), "Update custom exercise name");
            }}
          />
          {nameError != null && <Text className="mt-1 text-xs text-text-error">{nameError}</Text>}
        </View>
        {/* personal-fork: needs liftosaur.com server */}
        <View className="pt-2">
          <ExercisePickerCustomExerciseMuscles
            settings={props.settings}
            useInlineModals={props.useInlineModals}
            name="target-muscles"
            bottomSheetTitle="Target Muscles"
            muscleKey="targetMuscles"
            label="Target Muscles"
            selectedMuscles={editCustomExercise.meta.targetMuscles}
            onSelect={(muscle) => {
              const current = new Set(editCustomExercise.meta.targetMuscles);
              if (current.has(muscle)) {
                current.delete(muscle);
              } else {
                current.add(muscle);
              }
              props.dispatch(
                lb<ICustomExercise>().p("meta").p("targetMuscles").record(Array.from(current).sort()),
                "Update custom exercise target muscles"
              );
            }}
            onMusclesSelected={(muscles) => {
              props.dispatch(
                lb<ICustomExercise>().p("meta").p("targetMuscles").record(muscles),
                "Update custom exercise targetMuscles"
              );
            }}
          />
        </View>
        <View className="pt-2">
          <ExercisePickerCustomExerciseMuscles
            settings={props.settings}
            useInlineModals={props.useInlineModals}
            name="synergist-muscles"
            bottomSheetTitle="Synergist Muscles"
            muscleKey="synergistMuscles"
            label="Synergist Muscles"
            selectedMuscles={editCustomExercise.meta.synergistMuscles}
            onSelect={(muscle) => {
              const current = new Set(editCustomExercise.meta.synergistMuscles);
              if (current.has(muscle)) {
                current.delete(muscle);
              } else {
                current.add(muscle);
              }
              props.dispatch(
                lb<ICustomExercise>().p("meta").p("synergistMuscles").record(Array.from(current).sort()),
                "Update custom exercise synergist muscles"
              );
            }}
            onMusclesSelected={(muscles) => {
              props.dispatch(
                lb<ICustomExercise>().p("meta").p("synergistMuscles").record(muscles),
                "Update custom exercise synergistMuscles"
              );
            }}
          />
        </View>
        <View className="pt-2">
          <ExercisePickerCustomExerciseTypes
            useInlineModals={props.useInlineModals}
            types={typeValues}
            selectedTypes={editCustomExercise.types ?? []}
            onNewTypes={(types) => {
              const newTypes = ObjectUtils_keys(types).filter((k) => types[k].isSelected);
              props.dispatch(lb<ICustomExercise>().p("types").record(newTypes), "Update custom exercise types");
            }}
            onTypesSelected={(types) => {
              props.dispatch(lb<ICustomExercise>().p("types").record(types), "Update custom exercise types");
            }}
          />
        </View>
        {!props.hideNotes && (
          <View className="pt-2 pb-4">
            <Text className="pb-1 text-sm text-text-primary">
              <Text className="text-sm">Exercise Notes</Text>
              <Text className="text-xs text-text-secondary"> (optional)</Text>
            </Text>
            <MarkdownEditor
              value={notes ?? ""}
              onChange={(v) => {
                setNotes(v);
              }}
            />
          </View>
        )}
      </View>
      {props.originalExercise && !props.hideDeleteButton && (
        <View className="px-4 pb-4">
          <Button
            name="delete-custom-exercise"
            kind="red"
            data-testid="custom-exercise-delete"
            testID="custom-exercise-delete"
            buttonSize="md"
            className="w-full mt-4"
            onPress={async () => {
              const ok = await confirmAsync(
                "Are you sure you want to delete this exercise? This action cannot be undone."
              );
              if (ok) {
                props.onDelete();
              }
              props.onGoBack("Delete custom exercise");
            }}
          >
            Delete Exercise
          </Button>
        </View>
      )}
      {/* personal-fork: needs liftosaur.com server */}
      {props.useInlineModals && showCloneBottomSheet && (
        <BottomSheetExerciseCloneLibrary
          isHidden={!showCloneBottomSheet}
          showMuscles={props.showMuscles}
          settings={props.settings}
          onClose={() => setShowCloneBottomSheet(false)}
          onSelect={(exercise) => {
            const customExercise = props.settings.exercises[exercise.id];
            const smallImageUrl = customExercise
              ? customExercise.smallImageUrl
              : ExerciseImageUtils_url(exercise, "small");
            const largeImageUrl = customExercise
              ? customExercise.largeImageUrl
              : ExerciseImageUtils_url(exercise, "large");
            const targetMuscles = ObjectUtils_clone(Exercise_targetMuscles(exercise, props.settings));
            const synergistMuscles = ObjectUtils_clone(Exercise_synergistMuscles(exercise, props.settings));
            const types = ObjectUtils_clone(exercise.types);
            props.dispatch(
              [
                lb<ICustomExercise>().p("smallImageUrl").record(smallImageUrl),
                lb<ICustomExercise>().p("largeImageUrl").record(largeImageUrl),
                lb<ICustomExercise>().p("meta").p("targetMuscles").record(targetMuscles),
                lb<ICustomExercise>().p("meta").p("synergistMuscles").record(synergistMuscles),
                lb<ICustomExercise>().p("types").record(types),
              ],
              "Clone built-in exercise into custom exercise"
            );
            setShowCloneBottomSheet(false);
          }}
        />
      )}
    </View>
  );
}

interface IExercisePickerCustomExerciseTypesProps {
  useInlineModals?: boolean;
  types: Record<IExerciseKind, IFilterValue>;
  selectedTypes: IExerciseKind[];
  onNewTypes: (types: Record<IExerciseKind, IFilterValue>) => void;
  onTypesSelected: (types: IExerciseKind[]) => void;
}

function ExercisePickerCustomExerciseTypes(props: IExercisePickerCustomExerciseTypesProps): JSX.Element {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const selectedValues = ObjectUtils_keys(props.types).filter((k) => props.types[k].isSelected);

  const openTypesModal = useModal("exerciseTypesPickerModal", (types) => {
    props.onTypesSelected(types);
  });

  const openPicker = (): void => {
    if (props.useInlineModals) {
      setIsOpened(true);
    } else {
      openTypesModal({ selectedTypes: props.selectedTypes });
    }
  };

  return (
    <View className="w-full">
      <Text className="pb-1 text-sm text-text-primary">
        <Text className="text-sm">Types</Text>
        <Text className="text-xs text-text-secondary"> (optional)</Text>
      </Text>
      <Pressable onPress={openPicker}>
        <ExercisePickerCustomExercise2SelectInput selectedValues={selectedValues} />
      </Pressable>
      {props.useInlineModals && isOpened && (
        <BottomSheetOrModal
          shouldShowClose={true}
          onClose={() => {
            setIsOpened(false);
          }}
          isHidden={!isOpened}
        >
          <View className="flex-1 px-4" style={{ marginTop: -12 }}>
            <Text className="pt-6 pb-3 text-base font-semibold text-center">Types</Text>
            <View className="flex-1 pb-4">
              <ExercisePickerOptions
                values={props.types}
                onSelect={(key) => {
                  const newTypes = ObjectUtils_mapValues(props.types, (type: IFilterValue, k: IExerciseKind) => {
                    if (k === key) {
                      return { ...type, isSelected: !type.isSelected };
                    }
                    return type;
                  });
                  props.onNewTypes(newTypes);
                }}
              />
            </View>
            <View className="py-2 bg-background-default">
              <Button
                kind="purple"
                name="done-selecting-types"
                className="w-full"
                buttonSize="md"
                onPress={() => {
                  setIsOpened(false);
                }}
              >
                Done
              </Button>
            </View>
          </View>
        </BottomSheetOrModal>
      )}
    </View>
  );
}

interface IExercisePickerCustomExerciseMusclesProps {
  label: string;
  name: string;
  bottomSheetTitle: string;
  muscleKey: "targetMuscles" | "synergistMuscles";
  useInlineModals?: boolean;
  selectedMuscles: IMuscle[];
  settings: ISettings;
  onSelect: (muscle: IMuscle) => void;
  onMusclesSelected: (muscles: IMuscle[]) => void;
}

function ExercisePickerCustomExerciseMuscles(props: IExercisePickerCustomExerciseMusclesProps): JSX.Element {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const openMusclesModal = useModal("exerciseMusclesPickerModal", (muscles) => {
    props.onMusclesSelected(muscles);
  });

  const openPicker = (): void => {
    if (props.useInlineModals) {
      setIsOpened(true);
    } else {
      openMusclesModal({
        title: props.bottomSheetTitle,
        name: props.name,
        selectedMuscles: props.selectedMuscles,
      });
    }
  };

  return (
    <View className="w-full">
      <Text className="pb-1 text-sm text-text-primary">
        <Text className="text-sm">{props.label}</Text>
        <Text className="text-xs text-text-secondary"> (optional)</Text>
      </Text>
      <Pressable onPress={openPicker} data-testid={`select-${props.name}`} testID={`select-${props.name}`}>
        <ExercisePickerCustomExercise2SelectInput selectedValues={props.selectedMuscles} />
      </Pressable>
      {props.useInlineModals && isOpened && (
        <BottomSheetOrModal
          shouldShowClose={true}
          onClose={() => {
            setIsOpened(false);
          }}
          isHidden={!isOpened}
        >
          <View className="flex-1 px-4" style={{ marginTop: -12 }}>
            <Text className="pt-6 pb-3 text-base font-semibold text-center">{props.bottomSheetTitle}</Text>
            <View className="flex-1 pb-4">
              <ExercisePickerOptionsMuscles
                selectedValues={props.selectedMuscles}
                onSelect={props.onSelect}
                settings={props.settings}
              />
            </View>
            <View className="py-2 bg-background-default">
              <Button
                kind="purple"
                data-testid="done-selecting-muscles"
                testID="done-selecting-muscles"
                name="done-selecting-muscles"
                className="w-full"
                buttonSize="md"
                onPress={() => {
                  setIsOpened(false);
                }}
              >
                Done
              </Button>
            </View>
          </View>
        </BottomSheetOrModal>
      )}
    </View>
  );
}

interface IExercisePickerCustomExercise2SelectInputProps {
  selectedValues: string[];
}

function ExercisePickerCustomExercise2SelectInput(props: IExercisePickerCustomExercise2SelectInputProps): JSX.Element {
  return (
    <View
      className="flex-row items-center p-2 border rounded-md bg-background-default border-border-prominent"
      style={{ minHeight: 32 }}
    >
      <View className="flex-row flex-wrap flex-1" style={{ gap: 4 }}>
        {props.selectedValues.map((m) => (
          <View key={m} className="px-2 py-1 rounded-full bg-background-subtle">
            <Text className="text-xs text-text-secondary">{m}</Text>
          </View>
        ))}
      </View>
      <IconArrowDown2 />
    </View>
  );
}
