---
id: gzcl-general-gainz-riptide
name: "GZCL: General Gainz - Riptide"
author: Cody Lefever
url: "https://www.gainzfever.com/"
shortDescription: "RMを探す週と、それを超えて押す週を交互に行う、General Gainzの8週間プログラム。T1を軽めにして、ボリュームを増やし、筋肥大寄りにしている"
isMultiweek: true
tags: []
frequency: 4
age: "more_than_year"
duration: "90+"
goal: "strength_and_hypertrophy"
---

Riptideは、Cody LefeverのGeneral Gainzの本に載っている、8週間のプログラムです。「Find」の週（目標の重量でRMを探す）と「Push」の週（同じ重量で、より多くのレップに挑む）を交互に行います。T1は、段階的に重くなるRMの目標を順に回ります。T2も、中程度の重量で同じように進めます。T3は、8週間のあいだにレップ数の範囲を2回、波のように上下させます。

<!-- more -->

Riptideは、Cody Lefeverの[General Gainz](https://www.amazon.com/General-Gainz-Weight-Training-Framework-ebook/dp/B0GNLQHM6S)の本で紹介されている、名前つきのプログラムの1つです。General Gainzの基本の枠組みを土台にしていて、ティアの仕組み（T1/T2/T3）、Volume Drop Sets（VDS）、そしてFind（探る）、Hold（維持）、Push（伸ばす）、Extend（上乗せ）の4つのアクションを使います。

このプログラムの背景にある考え方を十分に理解するために、**[本を購入する](https://www.amazon.com/General-Gainz-Weight-Training-Framework-ebook/dp/B0GNLQHM6S)ことを強くおすすめします**。本では、努力度の評価、Volume Drop Sets、Effort Gap、Compensatory Acceleration Training（CAT、補償的加速トレーニング）、Find/Hold/Push/Extendのプログレッションの仕組みなどが詳しく説明されています。Abyssal Wake、Iron Tides、Wave Breaker、Steel Helmなどの、ほかのプログラムも載っています。

## 概要

Riptideは、**Find** の週（奇数週：目標の努力度でRMを探す）と **Push** の週（偶数週：同じ重量を使い、より多くのレップに挑む）を交互に行います。目標の努力度はRPEで決めます。@8は楽（あと2回以上できる、RIR 2以上）、@9は中くらい（あと1回できる、RIR 1）、@10はきつい（もう1回もできない、RIR 0）です。

この実装は、週4日の上下分割です。T2とT3の種目は自由に入れ替えられます。T1は、バーベルの主要なコンパウンド種目のままにしてください。

## アプリでの使い方

**Findの週**は、ウォームアップセットでRMの重量まで上げていきます。足りなければ、**+ warmup set** で追加してください。RMのセットを終えると、Volume Drop Setsが、その重量とレップ数に合わせて自動的に調整されます。

**Pushの週**は、直前のFindの週と同じ重量を使います。アプリが重量を覚えています。できるだけ多くのレップ（AMRAP）を目指してください。

始める前に、種目ごとに**1RM**を設定してください。アプリは、これをもとにRPEの表から初期重量を提案します。

## 器具の代替

T3のマシン種目を、自宅ジムで行うための代替です。

- [{Leg Press}] → [{Bulgarian Split Squat}]または[{Goblet Squat}]
- [{Seated Leg Curl}] → 軽めの[{Romanian Deadlift, Barbell}]、またはノルディックカール
- [{Leg Extension}] → [{Lunge}]または[{Sissy Squat}]
- [{Lat Pulldown}] → [{Pull Up}]または[{Chin Up}]
- [{Seated Row}] → [{Bent Over Row, Dumbbell}]
- [{Triceps Pushdown}] → [{Skullcrusher}]または[{Triceps Dip}]
- [{Face Pull}] → ダンベルの[{Reverse Fly}]

```liftoscript
# Week 1
## Day 1
// **T1 - Find week**. Use warmup sets to work up to your RM weight.
// Add more via **+ warmup set** if necessary.
// VDS auto-adjust after you complete the RM. Move each rep explosively (CAT).
t1 / used: none / 1x5 (RM) ?+ @8, 5x2 (VDS) 80% / 180s / update: custom() {~
  if (setIndex == 1) {
    weights = completedWeights[1]
    if (week == 8) {
      numberOfSets = 1
    } else if (week <= 2) {
      var.r = max(floor(completedReps[1] / 2), 1)
      sets(2, numberOfSets, var.r, var.r, 0, completedWeights[1], 120, 0, 0)
    } else if (week == 4 || week == 6) {
      if (completedReps[1] >= 5) {
        var.r = max(floor(completedReps[1] / 2), 1)
        sets(2, numberOfSets, var.r, var.r, 0, completedWeights[1], 120, 0, 0)
      } else {
        sets(2, numberOfSets, 1, 1, 0, completedWeights[1], 150, 0, 0)
      }
    } else {
      sets(2, numberOfSets, 1, 1, 0, completedWeights[1], 150, 0, 0)
    }
  }
~} / progress: custom() {~
  if (week % 2 == 1) {
    weights[week + 1:*:*:*] = completedWeights[1]
  }
~}

// **T2 - Find week**. Use warmup sets to work up to your RM weight.
// Add more via **+ warmup set** if necessary. Half-sets auto-adjust after the RM.
t2 / used: none / 1x10 (RM) ?+ @8, 4x5 (VDS) 60% / 120s / update: custom() {~
  if (setIndex == 1) {
    weights = completedWeights[1]
    var.r = max(floor(completedReps[1] / 2), 1)
    sets(2, numberOfSets, var.r, var.r, 0, completedWeights[1], 90, 0, 0)
  }
~} / progress: custom() {~
  if (week % 2 == 1) {
    weights[week + 1:*:*:*] = completedWeights[1]
  }
~}

// **T3** - Max Rep Sets. Easy effort.
t3 / used: none / 4x15-20+ (MRS) ?+ @8 / 60s

// ...t1
t1: Squat[1-8] / ...t1
// ...t2
t2: Romanian Deadlift, Barbell[1-8] / ...t2
// ...t3
t3: Leg Press[1-8] / ...t3
// ...t3
t3: Seated Leg Curl[1-8] / ...t3
// ...t3
t3: Leg Extension[1-8] / ...t3
// ...t3
t3: Standing Calf Raise[1-8] / ...t3

## Day 2
// ...t1
t1: Bench Press[1-8] / ...t1
// ...t2
t2: Overhead Press[1-8] / ...t2
// ...t3
t3: Lat Pulldown[1-8] / ...t3
// ...t3
t3: Seated Row[1-8] / ...t3
// ...t3
t3: Lateral Raise[1-8] / ...t3
// ...t3
t3: Triceps Pushdown[1-8] / ...t3

## Day 3
// ...t1
t1: Deadlift[1-8] / ...t1
// ...t2
t2: Front Squat[1-8] / ...t2
// ...t3
t3: Leg Press[1-8] / ...t3
// ...t3
t3: Seated Leg Curl[1-8] / ...t3
// ...t3
t3: Leg Extension[1-8] / ...t3
// ...t3
t3: Standing Calf Raise[1-8] / ...t3

## Day 4
// ...t1
t1: Overhead Press[1-8] / ...t1
// ...t2
t2: Chin Up[1-8] / ...t2
// ...t3
t3: Seated Row[1-8] / ...t3
// ...t3
t3: Bicep Curl[1-8] / ...t3
// ...t3
t3: Face Pull[1-8] / ...t3
// ...t3
t3: Skullcrusher[1-8] / ...t3


# Week 2
## Day 1
// **T1 - Push week**. Same weight as Week 1. Go for max reps.
t1 / 1x5+ (RM) @10, 5x3 (VDS) 80% / 180s

// **T2 - Push week**. Same weight as Week 1.
t2 / 1x10+ (RM) @10, 4x5 (VDS) 60% / 120s

// **T3** - Easy effort.
t3 / 4x12-15+ (MRS) ?+ @8 / 60s
## Day 2
## Day 3
## Day 4


# Week 3
## Day 1
// **T1 - Find week**. Go heavier than Week 1.
t1 / 1x3 (RM) ?+ @9, 5x1 (VDS) 85% / 180s

// **T2 - Find week**.
t2 / 1x6 (RM) ?+ @9, 4x3 (VDS) 70% / 120s

// **T3** - Moderate effort.
t3 / 4x10-12+ (MRS) ?+ @9 / 60s
## Day 2
## Day 3
## Day 4


# Week 4
## Day 1
// **T1 - Push week**. Same weight as Week 3.
// VDS: if you hit <5 reps, **singles**. If 5+, **half-sets**.
t1 / 1x3+ (RM) @10, 5x1 (VDS) 85% / 180s

// **T2 - Push week**. Same weight as Week 3.
t2 / 1x6+ (RM) @10, 4x3 (VDS) 70% / 120s

// **T3** - Hard effort.
t3 / 3x8-10+ (MRS) ?+ @10 / 60s
## Day 2
## Day 3
## Day 4


# Week 5
## Day 1
// **T1 - Find week**.
t1 / 1x4 (RM) ?+ @8, 5x1 (VDS) 80% / 180s

// **T2 - Find week**.
t2 / 1x8 (RM) ?+ @8, 4x4 (VDS) 65% / 120s

// **T3** - New wave. Easy effort.
t3 / 4x15-20+ (MRS) ?+ @8 / 60s
## Day 2
## Day 3
## Day 4


# Week 6
## Day 1
// **T1 - Push week**. Same weight as Week 5.
// VDS: if you hit <5 reps, **singles**. If 5+, **half-sets**.
t1 / 1x4+ (RM) @10, 5x1 (VDS) 80% / 180s

// **T2 - Push week**. Same weight as Week 5.
t2 / 1x8+ (RM) @10, 4x4 (VDS) 65% / 120s

// **T3** - Easy effort.
t3 / 4x12-15+ (MRS) ?+ @8 / 60s
## Day 2
## Day 3
## Day 4


# Week 7
## Day 1
// **T1 - Find week**. Heaviest of the cycle.
t1 / 1x2 (RM) ?+ @9, 2x1 (VDS) 90% / 180s

// **T2 - Find week**.
t2 / 1x5 (RM) ?+ @9, 4x2 (VDS) 75% / 120s

// **T3** - Moderate effort.
t3 / 4x10-12+ (MRS) ?+ @9 / 60s
## Day 2
## Day 3
## Day 4


# Week 8
## Day 1
// **T1 - Push week**. Same weight as Week 7. No VDS. Final push!
t1 / 1x2+ (RM) @10 / 180s

// **T2 - Push week**. Same weight as Week 7. Final week!
t2 / 1x5+ (RM) @10, 4x2 (VDS) 75% / 120s

// **T3** - Hard effort. Final wave!
t3 / 3x8-10+ (MRS) ?+ @10 / 60s
## Day 2
## Day 3
## Day 4
```
