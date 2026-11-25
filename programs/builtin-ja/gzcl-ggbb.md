---
id: gzcl-ggbb
name: "GZCL: General Gainz - ボディビル"
author: Cody Lefever
url: "https://swoleateveryheight.blogspot.com/2022/01/general-gainz-body-building.html"
shortDescription: "General Gainzを筋肥大・ボディビル向けにアレンジしたバリエーション"
isMultiweek: false
tags: []
frequency: 4
age: "more_than_year"
duration: "90+"
goal: "hypertrophy"
---

中級者から上級者向けの筋肥大プログラムで、プログレッションの進め方がとても柔軟です。

始める前に、[Codyによるプログラムの解説](https://swoleateveryheight.blogspot.com/2022/01/general-gainz-body-building.html)を必ず読んでください。

このプログラムには、初期状態でAの日だけが入っています（1日目A、2日目A、など。アプリ上の日名はDay 1A、Day 2A）。CodyのGGBB記事にある別の日の種目に入れ替えたり、自分で種目を考えたりして変えてかまいません。部位ごとの週あたりボリュームが、種目を選ぶ目安になります。ボリュームが非常に多いプログラムなので、そこまで要らない場合は、セットを減らす、最後のT3種目の組を外す、といった調整をしてください。

1日に4つのスーパーセットで行うことを前提に、T2とT3をスーパーセットにします。そのため種目の並びは、T2、T3、T2、T3、T2、T3の順です。T2の重量は、Extendを6セットこなし、最初のセットで10回できたら自動で上がります。T3の重量は、すべてのセットで20回以上できたら上がります。

Codyはブログ記事で、努力度を記録することも勧めています。アプリではRPEの記録がこれにあたります。**@8** が楽、**@9** が中くらい、**@10** がきつい、という目安です。

それ以外は、T2に使う従来のGeneral Gainzと同じです。つまり、Find（探る）、Push（伸ばす）、Hold（維持）、Extend（上乗せ）のアクションで進めます。アプリには先週のセット数・レップ数・RPEなどが表示されるので、それを見て、今回はどの部分をPushし、どの部分をHoldするかを決められます。

<!-- faq -->

### GZCL General Gainz Bodybuildingは筋肥大に向いていますか？

はい。GGBBは、筋肥大のために作られたプログラムです。重いT1をなくし、1日にT2を3種目、T3を5種目行うことで、非常に高いボリュームを確保します。GZCLプログラムのなかでも、特にボリュームが多いプログラムのひとつです。

### GGBBは週何日ですか？

週4日で、脚と腹、肩、背中、腕という部位別の分割です。種目数が多く、スーパーセットで進めるため、1回のワークアウトは90分以上かかります。

### GGBBは通常のGeneral Gainzとどう違いますか？

通常のGeneral Gainzは、筋力のためにT1の重いコンパウンド種目を行います。GGBBはT1をなくしてT2とT3だけにし、筋肥大に重点を置きます。1回あたりのボリュームも大幅に多く、1日8〜10種目をスーパーセットで組むのが一般的です。

### GGBBのスーパーセットはどんな構成ですか？

1日を、T2種目とT3種目をスーパーセットにした組（T2、T3、T2、T3…）で構成します。休憩が効率的になり、トレーニングの密度が上がります。T2はGeneral GainzのFind、Push、Hold、Extendで進め、T3はマックスレップセットで行います。

### GGBBのボリュームは減らせますか？

はい。Cody自身も、必要に応じてボリュームを調整するよう勧めています。各日の最後のT3の組を外したり、セット数を減らしたりできます。まずは控えめに始め、回復できていれば少しずつ増やしてください。

### GGBBに必要な経験はどのくらいですか？

GGBBは中級者から上級者向けです。1年以上継続してトレーニングしていて、General GainzのFind、Push、Hold、Extendの仕組みに慣れていることが目安です。ボリュームが多いので、回復力とトレーニング経験が求められます。

```liftoscript
# Week 1
## Day 1A: Legs & Abs
// **T2**.
// * **Find**: Initially find your 6RM on the first set. After you found your weight for 6RM - update that weight by tapping on the edit icon and setting weight there, and then tap on the first set to complete it.
// * **Extend**: Do the of "halfes" sets (your RM from the first set / 2) so the volume would be double of your RM. E.g. if you did 10RM, do 4 sets x 5 reps (20 total) after. You can extend the number of sets up to 2 extra sets if 10RM was easy.
// * Next time, try to **Push** one of the variables (e.g. reps or number of sets), and **Hold** (i.e. keep the same) other variables.
// * Once you are able to do 10RM with 6 extensions, the weight will be increased next time
t2 / used: none / 1x6-10, 4+x3 / @8+ 10s 85% / update: custom() {~
  if (setIndex == 1) {
    sets(2, 99, floor(completedReps[1] / 2), floor(completedReps[1] / 2), 0, completedWeights[1], 10, RPE[1], 1)
  }
~} / progress: custom(increase: 10lb) {~
  if (numberOfSets == 7 && completedReps >= reps) {
    weights += state.increase
  }
~}

// **T3**
t3 / used: none / 1x15-20, 3x15-20+ / @8+ 120s 50% / progress: lp(5lb)

// ...t2
t2a: Safety Squat Bar Squat, Barbell / ...t2
// ...t3
t3a: Ab Wheel, Bodyweight / ...t3 / progress: none
// ...t2
t2b: Romanian Deadlift, Barbell / ...t2
// ...t3
t3b: Cable Crunch, Cable / ...t3
// ...t2
t2c: Leg Press, Leverage Machine / ...t2
// ...t3
t3c: Seated Leg Curl, Leverage Machine / ...t3
// ...t3
t3d: Standing Calf Raise, Barbell / ...t3
// ...t3
t3e: Cable Twist, Cable / ...t3

## Day 2A - Shoulders
// ...t2
t2a: Behind The Neck Press, Barbell / ...t2
// ...t3
t3a: Reverse Fly, Dumbbell / ...t3
// ...t2
t2b: Incline Bench Press, Barbell / ...t2
// ...t3
t3b: Lateral Raise, Cable / ...t3
// ...t2
t2c: Chest Dip, Bodyweight / ...t2
// ...t3
t3c: Front Raise, Cable / ...t3
// ...t3
t3d: Push Up, Bodyweight / ...t3
// ...t3
t3e: Lateral Raise, Dumbbell / ...t3

## Day 3A - Back
// ...t2
t2a: Clean, Barbell / ...t2
// ...t3
t3a: Pull Up, Bodyweight / ...t3
// ...t2
t2b: Bent Over Row, Barbell / ...t2
// ...t3
t3b: Lat Pulldown, Cable / ...t3
// ...t2
t2c: Seated Row, Cable / ...t2
// ...t3
t3c: Shoulder Press, Dumbbell / ...t3
// ...t3
t3d: Bent Over One Arm Row, Dumbbell / ...t3
// ...t3
t3e: Shrug, Dumbbell / ...t3

## Day 4A - Arms
// ...t2
t2a: Bicep Curl, EZ Bar / ...t2
// ...t3
t3a: Triceps Pushdown, Cable / ...t3
// ...t2
t2b: Triceps Extension, Dumbbell / ...t2
// ...t3
t3b: Bicep Curl, Cable / ...t3
// ...t3
t3c: Bicep Curl, Band / ...t3
// ...t3
t3d: Triceps Extension, Band / ...t3
// ...t3
t3e: Hammer Curl, Dumbbell / ...t3
// ...t3
t3f: Skullcrusher, EZ Bar / ...t3
```
