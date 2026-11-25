---
id: pzerofullbody
name: P-Zero全身
author: Cody Lefever
url: "https://www.amazon.com/P-Zero-Revisiting-Method-Cody-Lefever-ebook/dp/B0FB43HYVJ"
shortDescription: "GZCLの最新プログラム。GZCLP 2.0にあたる位置づけです"
isMultiweek: false
tags: []
frequency: 4
age: "3_to_12_months"
duration: "60-90"
goal: "strength_and_hypertrophy"
---

Codyの最新の著書にあるプログラムです。[GZCLP](/programs/gzclp)と比べてボリュームが多く、種目のバリエーションも豊富です。パワーリフティングとボディビルの中間で、レップ数の多い設定が中心なので、ややボディビル寄りです。

プログラムを始める前に、必ず書籍を読んでください。進め方が詳しく説明されています。

<!-- faq -->

### P-Zero全身とは？

P-Zero全身は、Cody Lefever（GZCLの考案者）の最新プログラムです。[GZCLP](/programs/gzclp) 2.0にあたるプログラムで、GZCLのティア分けは同じですが、元の[GZCLP](/programs/gzclp)よりボリュームが多く、種目のバリエーションが豊富で、レップ数も多めです。

### P-Zeroは初心者に向いていますか？

P-Zeroは、トレーニング歴が数か月ある人向けに作られています。位置づけとしては、[GZCLP](/programs/gzclp)（完全な初心者向け）と、[The Rippler](/programs/gzcl-the-rippler)のような中級者向けのGZCLプログラムの中間です。基本的な初心者向けプログラムを卒業したものの、上級者向けのピリオダイゼーションにはまだ早い場合に合います。

### P-Zeroは週に何日ですか？

P-Zeroは週4日のプログラムです。どの日も全身のワークアウトで、GZCLのティア分けに従い、T1で重いコンパウンド種目、T2で補助的な種目、T3でアイソレーション種目を行います。

### GZCLPとはどこが違いますか？

P-Zeroは[GZCLP](/programs/gzclp)よりボリュームが多く、種目のバリエーションも豊富です。レップ数が多く、ボディビル寄りです。[GZCLP](/programs/gzclp)はパワーリフティング寄りです。トレーニング日数も、GZCLPの週3日に対して週4日です。

### P-Zeroを行うのに書籍は必要ですか？

プログレッションや種目の選び方は、書籍で詳しく説明されています。アプリがプログラムを自動で組むので書籍なしでも進められますが、読んでおくとプログラムの狙いがわかり、種目を入れ替えるときの判断にも役立ちます。

```liftoscript
# Week 1
## Workout A1
// ...T1
T1: Deadlift / ...T1

// ...T2
T2: Bench Press / ...T2

// ...T3
T3: T Bar Row / ...T3

// ...T3
T3: Leg Press / ...T3

// ...T3
T3: Chest Dip / ...T3

// ...T3
T3: Cable Crunch / ...T3

## Workout B1
// ...T1
T1: Overhead Press / ...T1

// ...T2
T2: Squat / ...T2

// ...T3
T3: Pull Up / ...T3

// ...T3
T3: Incline Bench Press, Dumbbell / ...T3

// ...T3
T3: Seated Leg Curl / ...T3

// ...T3
T3: Bicep Curl / ...T3

## Workout A2
// ...T1
T1: Bench Press / ...T1

// ...T2
T2: Deadlift / ...T2

// ...T3
T3: Seated Row / ...T3

// ...T3
T3: Shoulder Press / ...T3

// ...T3
T3: Leg Extension / ...T3

// ...T3
T3: Side Crunch, Cable / ...T3

## Workout B2
// ...T1
T1: Squat / ...T1

// ...T2
T2: Overhead Press / ...T2

// ...T3
T3: Romanian Deadlift, Barbell / ...T3

// ...T3
T3: Bench Press, Dumbbell / ...T3

// ...T3
T3: Lateral Raise, Cable / ...T3

// ...T3
T3: Flat Leg Raise / ...T3



// **T1**. Set your 1RM before start.

// **T1**.
T1 / used: none / 3x4, 1x5+ / 3x3, 1x4+ / 3x2, 1x3+ / 72% / progress: custom(increase: 5lb, stage1weight: 0lb) {~
  if (descriptionIndex == 1) {
    descriptionIndex = 2
  }
  if (setVariationIndex == 1) {
    state.stage1weight = weights[ns]
  }
  weights += state.increase
  if (completedReps[ns] < reps[ns]) {
    if (setVariationIndex == 3) {
      setVariationIndex = 1
      weights = state.stage1weight + state.increase
    } else {
      setVariationIndex += 1
    }
  }
~}


// **T2**. Set your 1RM before start.

// **T2**.
T2 / used: none / 4x12 / 4x10 / 4x8 / 52% 120s / progress: custom(increase: 5lb, stage1weight: 0lb) {~
  if (descriptionIndex == 1) {
    descriptionIndex = 2
  }
  if (setVariationIndex == 1) {
    state.stage1weight = weights[ns]
  }
  weights += state.increase
  if (!(completedReps >= reps)) {
    if (setVariationIndex == 3) {
      setVariationIndex = 1
      weights = state.stage1weight + state.increase
    } else {
      setVariationIndex += 1
    }
  }
~}


// **T3**. You need to get total reps indicated by max reps in range in
// as few sets as possible. Complete a set with some reps, then add another
// set and complete again. If you do all required reps in <= 4 sets, weight goes up.
// If more than 4 sets - it goes to the next stage (dropping the goal reps)
T3 / used: none / 1x1-60+ / 50% 90s / progress: custom(increase: 5lb, initialReps: 60, diff: 15, stage1weight: 0lb) {~
  if (reps[ns] == state.initialReps) {
    state.stage1weight = weights[ns]
  }
  if (sum(completedReps) >= reps[ns]) {
    if (completedNumberOfSets <= 4) {
      weights += state.increase
    } else {
      if (reps[ns] == state.initialReps - state.diff * 2) {
        weights = state.stage1weight + state.increase
        reps = state.initialReps
      } else {
        reps -= state.diff
      }
    }
  }
~}

// **T1 Ultra**.
// It asks you if want to go switch to the next stage at the end (0 - keep, 1 - switch).
// Switch to the next stage if the last set is significantly slower than first one.
T1Ultra / used: none / 3x1 / 2x1 / 1x1 / 90% / progress: custom(increase: 5lb, nextstage+: 0) {~
  weights += state.increase
  if (state.nextstage > 0) {
    setVariationIndex += 1
  }
~}
```
