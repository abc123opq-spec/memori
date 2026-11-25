---
id: gzclp-blacknoir
name: "GZCLP: Blacknoir版"
author: /u/blacknoir
url: "https://www.reddit.com/r/gzcl/comments/1207bs7/announce_as_requested_single_spreadsheet_versions/"
shortDescription: Redditユーザーu/blacknoirによるGZCLPのバリエーション
isMultiweek: true
tags: []
frequency: 3
age: "3_to_12_months"
duration: "45-60"
goal: "strength"
---

GZCLPプログラムを手直ししたもので、セット×レップの組み方とプログレッションが少し違います（1回×10セットが苦手な人向けかもしれません :)）。
Redditユーザー **/u/blacknoir** が作った、定番の凝ったスプレッドシート群がもとになっています。

**標準**のGZCLP、**改変版**のGZCLP、**上級版**のそれぞれの例の種目が入っているので、さまざまなタイプのT1・T2・T3の種目を組み合わせて、自分に合ったウェイトトレーニングのプログラムを作れます。

<!-- faq -->

### GZCLP Blacknoir版は、通常のGZCLPと何が違いますか？

Blacknoir版は、標準のGZCLPとは、セット数とレップ数の組み方やプログレッションが違います。いちばん大きな変更は、苦手とするリフターもいる1回×10セットのステージをなくしたことです。標準・改変版・上級版の種目のテンプレートも入っていて、組み合わせて使えます。

### GZCLP Blacknoir版は初心者に向いていますか？

はい。標準のGZCLPと同じく、初心者から中級に入ったばかりのリフター向けに作られています。同じGZCLのティアの考え方（T1・T2・T3）を使いますが、プログレッションの組み方を変えてあり、そのほうが楽しいと感じるリフターもいます。始める前に、数か月のトレーニング経験があるとよいでしょう。

### GZCLP Blacknoir版は週に何日ですか？

GZCLP Blacknoir版は週3日のプログラムです。標準のGZCLPと同じく、連続しない日に、たとえば月・水・金で、ワークアウトを順に回します。

### GZCLP Blacknoir版の種目は変更できますか？

はい。標準・改変版・上級版のGZCLPの種目のテンプレートが入っています。プログレッションの仕組みはそのままに、T2とT3の種目を、自分の器具や目標に合わせて入れ替えられます。

### GZCLP Blacknoir版のあとは、何をすればよいですか？

毎回重量を足すリニアなプログレッションが続かなくなったら、中級者向けのGZCLプログラムに移ってください。筋力なら[The Rippler](/programs/gzcl-the-rippler)、筋肥大なら[Jacked & Tan 2.0](/programs/gzcl-jacked-and-tan-2)です。どちらも、リニアではなくピリオダイゼーションを取り入れたプログレッションを使います。

```liftoscript
# Week 1
## Day 1
// ...t1_modified
t1: Squat / ...t1_modified

// ...t2_modified
t2: Bench Press / ...t2_modified

// ...t3_modified
t3: Lat Pulldown / ...t3_modified

## Day 2
// ...t1_modified
t1: Overhead Press / ...t1_modified / progress: custom(increase: 5lb) { ...t1_modified }

// ...t2_modified
t2: Deadlift / ...t2_modified / progress: custom(stage1weight: 0lb, increase: 10lb, stage3increase: 15lb) { ...t2_modified }

// ...t3_modified
t3: Bent Over Row / ...t3_modified

## Day 3
// ...t1_modified
t1: Bench Press / ...t1_modified / progress: custom(increase: 5lb) { ...t1_modified }

// ...t2_modified
t2: Squat / ...t2_modified / progress: custom(stage1weight: 0lb, increase: 10lb, stage3increase: 15lb) { ...t2_modified }

// ...t3_modified
t3: Lat Pulldown / ...t3_modified

## Day 4
// ...t1_modified
t1: Deadlift / ...t1_modified

// ...t2_modified
t2: Overhead Press / ...t2_modified

// ...t3_modified
t3: Bent Over Row / ...t3_modified

// **T1**. It starts with **85% of 5RM** (or approximately **75% or 1RM**).
// You can adjust your 1RM by clicking the **edit** icon, and setting the **1 Rep Max** value.
// There's the RM calculator there to help find it out if you don't know it

// **T1**.

// **T1**. Retest week, you may skip warmups. Find your new 5RM (5 rep max), as follows
// * Start with the bar, do 5 reps.
// * Throw on some more weight, do 5 reps.
// * Repeat, when the bar starts to get heavy, make smaller jumps.
// * When you finally get to a set that is hard, but you do it - take that number, and enter into "5RM Test" set weight
// * Mark it completed!
t1_modified / used: none / 2x5, 1x5+ / 3x3, 1x3+ / 4x2, 1x2+ / 1x5 (5RM Test) / 75% / progress: custom(increase: 10lb) {~
  if (descriptionIndex == 1) {
    descriptionIndex = 2
  }
  if (setVariationIndex == 4) {
    descriptionIndex = 2
    setVariationIndex = 1
    weights = completedWeights[1] * 0.85
    rm1 = completedWeights[1] / rpeMultiplier(5, 10)
  } else if (completedReps >= reps) {
    weights = completedWeights[ns] + state.increase
  } else if (setVariationIndex == 3) {
    descriptionIndex = 3
    setVariationIndex += 1
  } else {
    setVariationIndex += 1
  }
~}

// **T2**. Start with **55% of 1RM**.
// You can adjust your 1RM by clicking the **edit** icon, and setting the **1 Rep Max** value.
// There's the RM calculator there to help find it out if you don't know it

// **T2**.
t2_modified / used: none / 4x8 / 4x6 / 4x4 / 55% / progress: custom(stage1weight: 0lb, increase: 5lb, stage3increase: 10lb) {~
  if (descriptionIndex == 1) {
    descriptionIndex = 2
  }
  if (completedReps >= reps) {
    weights = completedWeights[ns] + state.increase
  } else if (setVariationIndex == 1) {
    state.stage1weight = completedWeights[ns]
    setVariationIndex += 1
  } else if (setVariationIndex == 2) {
    setVariationIndex += 1
  } else {
    setVariationIndex = 1
    weights = state.stage1weight + state.stage3increase
  }
~}

// **T3**.
t3_modified / used: none / 3x12, 1x12+ / 60% 90s / progress: custom() {~
  if (completedReps[ns] >= 18) {
    weights = completedWeights[ns] + 5lb
  }
~}

/// Other variations of T1 and T3:
/// To use them, reuse those templates in your other exercises.
t1_advanced / used: none / 4x5, 1x5+ / 2x5, 1x5+ / 2x3, 1x3+ / 1x5 (5RM Test) / 75% / progress: custom(increase: 5lb) {~
  if (descriptionIndex == 1) {
    descriptionIndex = 2
  }
  if (setVariationIndex == 4) {
    descriptionIndex = 2
    setVariationIndex = 1
    weights = completedWeights[1] * 0.85
    rm1 = completedWeights[1] / rpeMultiplier(5, 10)
  } else if (completedReps >= reps) {
    weights = completedWeights[ns] + state.increase
  } else if (setVariationIndex == 3) {
    descriptionIndex = 3
    setVariationIndex += 1
  } else {
    setVariationIndex += 1
  }
~}


t3_linear / used: none / 3x15 / 3x12 / 3x8 / 60% 90s / progress: custom(stage1weight: 0lb, increase: 5lb, stage3increase: 10lb) {~
  if (completedReps >= reps) {
    weights = completedWeights[ns] + state.increase
  } else if (setVariationIndex == 1) {
    state.stage1weight = completedWeights[ns]
    setVariationIndex += 1
  } else if (setVariationIndex == 2) {
    setVariationIndex += 1
  } else {
    setVariationIndex = 1
    weights = state.stage1weight + state.stage3increase
  }
~}
```
