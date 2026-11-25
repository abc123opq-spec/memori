export interface IGlossaryTerm {
  en: string;
  ja: string;
  avoid: string[];
  note?: string;
}

export interface IGlossaryViolation {
  term: string;
  found: string;
}

export interface IGlossaryStyleRule {
  rule: string;
  good: string;
  bad?: string;
}

export const Glossary_terms: IGlossaryTerm[] = [
  { en: "Set", ja: "セット", avoid: ["セツト", "セッツ"], note: "3 sets は 3セット。数字とのあいだは空けない" },
  {
    en: "Rep",
    ja: "レップ",
    avoid: ["レプ"],
    note: "数値つきは 5回（5 reps）。見出し・ラベルは レップ数。説明文で用語として言うときは レップ（目標レップ、AMRAP のレップ）",
  },
  { en: "Warmup", ja: "ウォームアップ", avoid: ["ウオームアップ", "ウォームアプ", "W-UP"], note: "Warm-up も同じ" },
  {
    en: "Workout",
    ja: "ワークアウト",
    avoid: ["トレーニングセッション"],
    note: "1回の記録単位。Training は トレーニング",
  },
  { en: "Training", ja: "トレーニング", avoid: ["トレーニンク"] },
  {
    en: "Program",
    ja: "プログラム",
    avoid: ["プログラミング"],
    note: "名称の中の Routine は ルーティン のままでよい（Basic Beginner Routine）。メニューは UI の語と紛れるので用語にしない",
  },
  { en: "Exercise", ja: "種目", avoid: ["エクササイズ", "エクサイズ"], note: "自作は 自作種目" },
  { en: "Custom exercise", ja: "自作種目", avoid: ["カスタムエクササイズ", "カスタム種目"] },
  { en: "Equipment", ja: "器具", avoid: ["機材", "道具", "用具"] },
  { en: "Barbell", ja: "バーベル", avoid: ["バーバル", "バーベール"] },
  { en: "Dumbbell", ja: "ダンベル", avoid: ["ダンベール", "ダンベリ"] },
  { en: "Cable", ja: "ケーブル", avoid: [], note: "器具名は ケーブル。種目名の中も ケーブル" },
  { en: "Leverage Machine", ja: "マシン", avoid: ["レバレッジマシン"] },
  { en: "Smith Machine", ja: "スミスマシン", avoid: ["スミス・マシン", "スミスマシーン"] },
  { en: "Kettlebell", ja: "ケトルベル", avoid: ["ケトルベール", "ケトルボール"] },
  { en: "Band", ja: "バンド", avoid: ["チューブ", "ゴムバンド"] },
  { en: "Medicine Ball", ja: "メディシンボール", avoid: ["メディスンボール", "メディスボール"] },
  { en: "EZ Bar", ja: "EZバー", avoid: ["イージーバー", "EZ バー"] },
  { en: "Trap Bar", ja: "トラップバー", avoid: ["ヘックスバー", "ヘキサバー", "トラバー"] },
  {
    en: "Bodyweight (equipment)",
    ja: "自重",
    avoid: ["ボディウェイト", "ボディーウェイト"],
    note: "器具の区分としての Bodyweight",
  },
  {
    en: "Bodyweight (body stat)",
    ja: "体重",
    avoid: ["ボディウェイト", "ボディーウェイト"],
    note: "計測項目としての Bodyweight",
  },
  { en: "Plates", ja: "プレート", avoid: ["ウェイトプレート", "重り"] },
  { en: "Bar", ja: "バー", avoid: [], note: "バーベルのシャフト。重さは バー重量" },
  {
    en: "Weight",
    ja: "重量",
    avoid: ["ウエイト"],
    note: "ウェイトトレーニングなど複合語の ウェイト は可。ウエイト（エ）は不可",
  },
  {
    en: "Rounding",
    ja: "丸め",
    avoid: ["ラウンディング", "ラウンド処理"],
    note: "重量の丸め（使えるプレートに合わせる）",
  },
  { en: "Rest", ja: "休憩", avoid: ["レスト時間", "レストタイム"] },
  {
    en: "Rest timer",
    ja: "休憩タイマー",
    avoid: ["レストタイマー", "インターバルタイマー"],
    note: "Interval は インターバル（有酸素などの別の意味）で使い、休憩の意味では使わない",
  },
  { en: "Timer", ja: "タイマー", avoid: ["タイメー"] },
  {
    en: "1RM",
    ja: "1RM",
    avoid: ["1レップマックス", "ワンレップマックス", "1 RM", "ワンアールエム"],
    note: "説明文の初出で「1RM（最大挙上重量）」と補ってよい",
  },
  {
    en: "Training Max",
    ja: "トレーニングマックス（TM）",
    avoid: ["トレーニング最大重量", "トレーニング・マックス"],
    note: "2回目以降は TM だけでよい",
  },
  {
    en: "Rep Max",
    ja: "レップマックス（RM）",
    avoid: ["レップ・マックス", "回数最大"],
    note: "3RM、5RM のように数字と RM をつなげる",
  },
  { en: "Weight stack", ja: "重量スタック", avoid: ["ウェイトスタック", "重りスタック"] },
  { en: "Peak contraction", ja: "ピーク収縮", avoid: ["ピークコントラクション", "最大収縮"] },
  {
    en: "Accessory / Assistance",
    ja: "補助種目",
    avoid: ["アクセサリー種目", "アクセサリー", "アシスタンス種目"],
    note: "Accessory と Assistance は同じ 補助種目。Assisted（アシスト）は別",
  },
  {
    en: "Auxiliary / Supplemental / Developmental",
    ja: "補強種目",
    avoid: ["オグジュアリー", "補足種目", "サプリメンタル種目", "ディベロップメンタル種目"],
  },
  { en: "Compound", ja: "コンパウンド種目", avoid: ["複合種目", "多関節種目"] },
  { en: "Isolation", ja: "アイソレーション種目", avoid: ["単関節種目"] },
  { en: "Home gym", ja: "自宅ジム", avoid: ["ホームジム"] },
  { en: "Elbow", ja: "ひじ", avoid: ["肘"], note: "ひじ関節、ひじを曲げる。漢字は使わない" },
  { en: "Knee", ja: "ひざ", avoid: ["膝"], note: "ひざ関節、ひざを曲げる、ひざつき。ひざまずく もひらがな" },
  { en: "Repeat", ja: "繰り返す", avoid: ["くり返"] },
  { en: "Injury", ja: "ケガ", avoid: ["怪我"] },
  { en: "Understand", ja: "わかる", avoid: ["分かる"] },
  {
    en: "Resistance band",
    ja: "レジスタンスバンド",
    avoid: ["トレーニングバンド"],
    note: "器具の区分の Band は バンド",
  },
  {
    en: "Low pulley",
    ja: "低い位置のプーリー",
    avoid: ["ローポジションのプーリー", "ロープーリー", "ローポジションプーリー"],
  },
  {
    en: "High pulley",
    ja: "高い位置のプーリー",
    avoid: ["ハイポジションのプーリー", "ハイプーリー", "ハイポジションプーリー"],
  },
  { en: "Foot plate / platform", ja: "フットプレート", avoid: ["フットプラットフォーム", "フットボード"] },
  { en: "Wave", ja: "ウェーブ", avoid: ["ウエーブ"], note: "ウェーブローディングなど" },
  { en: "Return (heading)", ja: "戻す", avoid: ["リターン"], note: "見出し。動作の戻しを指す" },
  { en: "Caution / Warning (heading)", ja: "注意", avoid: ["ご注意", "ウォーニング", "コーション"], note: "見出し" },
  { en: "Tier", ja: "ティア", avoid: ["ティアー"] },
  { en: "Taper", ja: "テーパリング", avoid: ["テーパー"] },
  { en: "Rest-pause", ja: "レストポーズ", avoid: ["レスト・ポーズ", "レストポース", "休憩ポーズ"] },
  { en: "Widowmaker", ja: "ウィドウメーカー", avoid: ["ウィドウメイカー", "ウィドーメーカー"] },
  { en: "Mixed grip", ja: "ミックスドグリップ", avoid: ["ミックスグリップ", "オルタネートグリップ", "混合グリップ"] },
  { en: "Supinated grip", ja: "アンダーハンドグリップ", avoid: ["回外グリップ", "スピネイトグリップ"] },
  { en: "Pronated grip", ja: "オーバーハンドグリップ", avoid: ["回内グリップ", "プロネイトグリップ"] },
  {
    en: "AMRAP",
    ja: "AMRAP",
    avoid: ["アムラップ", "アンラップ"],
    note: "説明文の初出で「AMRAP（限界までのレップ数）」と補ってよい",
  },
  {
    en: "RPE",
    ja: "RPE",
    avoid: ["自覚的運動強度", "アールピーイー"],
    note: "説明文の初出で「RPE（主観的運動強度）」と補ってよい",
  },
  { en: "RIR", ja: "RIR", avoid: ["アールアイアール"], note: "あと何回できるか（Reps In Reserve）" },
  {
    en: "Personal record",
    ja: "自己ベスト",
    avoid: ["パーソナルレコード", "個人記録", "自己記録"],
    note: "略称 PR はそのまま PR",
  },
  {
    en: "Progression",
    ja: "プログレッション",
    avoid: ["プログレス", "プログレッシブ進行"],
    note: "Liftoscript の progress は訳さない。漸進性過負荷は「プログレッシブオーバーロード」と書く",
  },
  {
    en: "Linear progression",
    ja: "リニアプログレッション",
    avoid: ["線形進行", "直線的プログレッション", "リニア・プログレッション"],
  },
  { en: "Double progression", ja: "ダブルプログレッション", avoid: ["二重進行", "ダブル・プログレッション"] },
  { en: "Deload", ja: "ディロード", avoid: ["デロード", "ディーロード", "ディロッド"] },
  { en: "Stall", ja: "停滞", avoid: ["ストール"], note: "重量が伸びなくなること" },
  { en: "Superset", ja: "スーパーセット", avoid: ["スーパーセツト", "スーパー・セット"] },
  { en: "Drop set", ja: "ドロップセット", avoid: ["ドロップ・セット", "ディセンディングセット"] },
  { en: "Top set", ja: "トップセット", avoid: ["トップ・セット"] },
  {
    en: "Back-off set",
    ja: "バックオフセット",
    avoid: ["バックオフ・セット"],
    note: "バックオフ単独で使わず、必ず セット を付ける",
  },
  { en: "Working set", ja: "ワークセット", avoid: ["本セット", "ワーキングセット", "メインセット"] },
  { en: "Failed set", ja: "未達セット", avoid: ["失敗セット"], note: "目標のレップ数に届かなかったセット" },
  { en: "Failure", ja: "限界", avoid: ["フェイラー", "フェイリア"], note: "to failure は「限界まで」" },
  { en: "Pyramid", ja: "ピラミッド", avoid: ["ピラミッドセット"] },
  { en: "Tempo", ja: "テンポ", avoid: [] },
  { en: "Volume", ja: "ボリューム", avoid: ["体積", "容積", "総挙上量"] },
  { en: "Intensity", ja: "強度", avoid: ["インテンシティ", "インテンシティー"] },
  { en: "Fatigue", ja: "疲労", avoid: ["ファティーグ"] },
  { en: "Hypertrophy", ja: "筋肥大", avoid: ["ハイパートロフィー", "ハイパートロフィ"] },
  { en: "Strength", ja: "筋力", avoid: [], note: "ストレングスは固有名（StrongLifts など）以外で使わない" },
  { en: "Powerlifting", ja: "パワーリフティング", avoid: ["パワーリフト競技"] },
  { en: "Bodybuilding", ja: "ボディビル", avoid: ["ボディービル", "ボディビルディング"] },
  {
    en: "Periodization",
    ja: "ピリオダイゼーション",
    avoid: ["ピリオダイゼイション", "周期化", "期分け化"],
    note: "説明文の初出で「（期分け）」と補ってよい",
  },
  { en: "Mesocycle", ja: "メゾサイクル", avoid: ["メソサイクル", "中周期"] },
  { en: "Microcycle", ja: "ミクロサイクル", avoid: ["マイクロサイクル", "小周期"] },
  { en: "Cycle", ja: "サイクル", avoid: [] },
  { en: "Block", ja: "ブロック", avoid: ["ブロク"] },
  { en: "Bulk", ja: "増量", avoid: ["バルクアップ"], note: "Cut は 減量" },
  { en: "Cut", ja: "減量", avoid: ["カット期", "ダイエット期"] },
  { en: "Cardio", ja: "有酸素運動", avoid: ["カーディオ", "カルディオ"] },
  { en: "Stretch", ja: "ストレッチ", avoid: ["ストレッチング"] },
  { en: "Mobility", ja: "モビリティ", avoid: ["モビリティー", "可動性"] },
  {
    en: "Split",
    ja: "スプリット",
    avoid: [],
    note: "名前でも地の文でも スプリット（ブロスプリット、PPLスプリット）。3分割・上下分割のような一般的な説明では 分割 も可",
  },
  { en: "Full body", ja: "全身", avoid: ["フルボディ"] },
  { en: "Upper", ja: "上半身", avoid: ["アッパー"] },
  { en: "Lower", ja: "下半身", avoid: ["ロワー", "ローワー"] },
  {
    en: "Push",
    ja: "プッシュ",
    avoid: ["押す系", "押し系"],
    note: "Pull は プル、Legs は レッグ。まとめて プッシュ・プル・レッグ",
  },
  { en: "Pull", ja: "プル", avoid: ["引く系", "引き系"] },
  { en: "Core", ja: "体幹", avoid: [], note: "コア は使わない" },
  { en: "Week", ja: "週", avoid: [], note: "Week 3 は 3週目（週間・週あたりは 週）" },
  { en: "Day", ja: "日", avoid: [], note: "プログラムの Day 2 は 2日目。暦の日は 日" },
  { en: "Workout day", ja: "トレーニング日", avoid: ["練習日"] },
  { en: "History", ja: "履歴", avoid: ["ヒストリー"] },
  { en: "Measurements", ja: "計測", avoid: ["測定値", "メジャーメント"] },
  { en: "Body stat", ja: "身体計測", avoid: ["ボディスタット", "ボディスタッツ"] },
  { en: "Muscle group", ja: "筋群", avoid: ["筋肉グループ", "マッスルグループ", "筋肉群"] },
  { en: "Target muscles", ja: "主動筋", avoid: ["ターゲット筋", "主働筋", "標的筋"] },
  { en: "Synergist muscles", ja: "協働筋", avoid: ["共同筋", "シナジスト", "協同筋"] },
  { en: "Back", ja: "背中", avoid: [], note: "身体部位の Back。種目名の Back Extension などは バックエクステンション" },
  { en: "Chest", ja: "胸", avoid: [], note: "種目名の中の Chest Press は チェストプレス" },
  { en: "Shoulders", ja: "肩", avoid: [], note: "種目名の中は ショルダープレス" },
  { en: "Upper arms", ja: "上腕", avoid: ["二の腕"] },
  { en: "Forearms", ja: "前腕", avoid: ["フォアアーム"] },
  { en: "Waist", ja: "ウエスト", avoid: ["ウェスト"] },
  { en: "Hips", ja: "ヒップ", avoid: [] },
  { en: "Glutes", ja: "殿筋群", avoid: ["臀"], note: "大殿筋・中殿筋・殿筋群。「臀」は使わない" },
  { en: "Thighs", ja: "太もも", avoid: [], note: "筋名の 大腿四頭筋・大腿二頭筋 は別" },
  { en: "Calves", ja: "ふくらはぎ", avoid: [], note: "種目名の カーフレイズ は可" },
  { en: "Neck", ja: "首", avoid: [], note: "ビハインドネックプレスなど種目名の ネック は可" },
  { en: "Quadriceps", ja: "大腿四頭筋", avoid: ["クアッドリセップス", "クアッド"] },
  { en: "Hamstrings", ja: "ハムストリングス", avoid: ["大腿二頭筋群"] },
  { en: "Gluteus maximus", ja: "大殿筋", avoid: ["大臀筋"] },
  { en: "Gluteus medius", ja: "中殿筋", avoid: ["中臀筋"] },
  { en: "Pectoralis major", ja: "大胸筋", avoid: ["胸筋群"] },
  { en: "Latissimus dorsi", ja: "広背筋", avoid: ["ラッツ"] },
  { en: "Trapezius", ja: "僧帽筋", avoid: ["トラップ筋", "トラピウス"] },
  { en: "Deltoid", ja: "三角筋", avoid: ["デルトイド"], note: "前部・中部（側部）・後部" },
  { en: "Biceps brachii", ja: "上腕二頭筋", avoid: [] },
  { en: "Triceps brachii", ja: "上腕三頭筋", avoid: [] },
  { en: "Rectus abdominis", ja: "腹直筋", avoid: ["腹筋群"] },
  { en: "Obliques", ja: "腹斜筋", avoid: [], note: "オブリーククランチなど種目名の オブリーク は可" },
  { en: "Erector spinae", ja: "脊柱起立筋", avoid: ["背骨起立筋", "脊椎起立筋"] },
  { en: "Gastrocnemius", ja: "腓腹筋", avoid: ["ガストロクネミウス"] },
  { en: "Soleus", ja: "ヒラメ筋", avoid: ["ひらめ筋", "ソレウス"] },
  {
    en: "Rhomboids / Teres",
    ja: "大円筋・小円筋",
    avoid: ["テレスメジャー"],
    note: "Teres Major は 大円筋、Teres Minor は 小円筋",
  },
  { en: "Settings", ja: "設定", avoid: ["セッティング"] },
  { en: "Save", ja: "保存", avoid: ["セーブ"] },
  { en: "Cancel", ja: "キャンセル", avoid: ["取消", "取り消し"], note: "ボタンのみ。Undo は 元に戻す" },
  { en: "Delete", ja: "削除", avoid: ["消去", "デリート"] },
  { en: "Edit", ja: "編集", avoid: ["エディット"] },
  { en: "Add", ja: "追加", avoid: ["アド"] },
  { en: "Done", ja: "完了", avoid: [] },
  { en: "Finish workout", ja: "ワークアウトを終了", avoid: ["ワークアウトを完了", "ワークアウトを終わる"] },
  { en: "Notes", ja: "メモ", avoid: ["ノート"] },
  { en: "Duplicate", ja: "複製", avoid: ["デュプリケート", "ダブリケート"] },
  { en: "Reset", ja: "リセット", avoid: [], note: "データを消す操作の文では 初期化 を使わず、何が消えるかを書く" },
  {
    en: "Backup",
    ja: "バックアップ",
    avoid: ["バックアプ", "退避"],
    note: "JSON の書き出しは エクスポート、読み込みは インポート",
  },
  { en: "Export", ja: "エクスポート", avoid: ["エキスポート"] },
  { en: "Import", ja: "インポート", avoid: ["インポト"] },
  { en: "Graph", ja: "グラフ", avoid: ["チャート"] },
  { en: "Stats", ja: "統計", avoid: ["スタッツ"] },
  { en: "Dashboard", ja: "ダッシュボード", avoid: ["ダッシュボト"] },
  { en: "Widget", ja: "ウィジェット", avoid: ["ウィジット", "ウイジェット"] },
  { en: "Plate calculator", ja: "プレート計算", avoid: ["プレートカリキュレーター", "プレート計算機"] },
  { en: "Unit", ja: "単位", avoid: ["ユニット"] },
];

export const Glossary_untranslated: { category: string; items: string[]; note: string }[] = [
  {
    category: "units",
    items: ["kg", "lb", "%", "min", "sec", "cm", "in"],
    note: "訳さない。数字との間は空けない（100kg）",
  },
  {
    category: "liftoscript",
    items: [
      "state",
      "weights",
      "reps",
      "sets",
      "numberOfSets",
      "setIndex",
      "completedReps",
      "completedWeights",
      "completedRPE",
      "minReps",
      "originalWeights",
      "rm1",
      "rpe",
      "timer",
      "week",
      "day",
      "progress",
      "update",
      "lp",
      "dp",
      "sum",
      "round",
      "min",
      "max",
      "setVariationIndex",
      "descriptionIndex",
    ],
    note: "Liftoscript のキーワード・関数・変数・パーサーのエラー文は訳さない。コードブロック・インラインコードの中は用語チェックの対象外",
  },
  {
    category: "ids",
    items: ["exercise id", "equipment id", "program id", "storage keys", "testID", "data-testid"],
    note: "内部名・ID・保存データのキー・テスト用 ID は訳さない。表示名だけ訳す",
  },
  {
    category: "brands",
    items: ["Liftosaur", "Liftoscript", "Apple Health", "Google", "Apple", "StrongLifts", "GZCLP", "5/3/1", "nSuns"],
    note: "固有名・プログラム名の通称はそのまま",
  },
  {
    category: "abbreviations",
    items: ["1RM", "TM", "AMRAP", "RPE", "RIR", "PR", "EZ", "JSON", "PWA"],
    note: "略語はそのまま。初出に限り日本語の補足を括弧で付けてよい",
  },
];

export const Glossary_style: IGlossaryStyleRule[] = [
  { rule: "文章（説明・メッセージ・解説）は「です・ます」体にする", good: "重量を丸めます。", bad: "重量を丸める。" },
  {
    rule: "ボタン・メニュー・見出し・ラベルは体言止めか短い動詞の連用形名詞にし、「ます」を付けない",
    good: "ワークアウトを開始",
    bad: "ワークアウトを開始します",
  },
  {
    rule: "確認や質問の文は「ですか？」。疑問符は全角の「？」。感嘆符は使わない",
    good: "このプログラムを削除しますか？",
    bad: "このプログラムを削除しますか?!",
  },
  {
    rule: "句読点は「、」「。」。ラベルや見出しの末尾に「。」を付けない",
    good: "プログラムを選択",
    bad: "プログラムを選択。",
  },
  { rule: "数字と英字は半角。全角の数字・英字は使わない", good: "5回 / RPE 8", bad: "５回 / ＲＰＥ ８" },
  {
    rule: "数字と単位・助数詞のあいだは空けない。日本語と半角英数字のあいだも空けない",
    good: "100kg、3セット、5回、20%",
    bad: "100 kg、3 セット",
  },
  {
    rule: "表・プログラム名・方式の呼び名では、英語の並び（セット数x回数）のまま半角数字と × で、空けない",
    good: "5×5、5/3/1",
    bad: "5 x 5",
  },
  {
    rule: "地の文のセット×レップは「回数×セット数」にする。英語の 5x3 はセット数x回数なので並びが逆になる",
    good: "5x3 は 3回×5セット",
    bad: "5x3 は 5回×3セット",
  },
  { rule: "数値つきのレップは「N回」", good: "8回", bad: "8レップ" },
  { rule: "見出しの末尾にコロンを付けない", good: "手順", bad: "手順：" },
  {
    rule: "「（順手）」「（逆手）」の補足は、各ファイルで初出の1回だけ",
    good: "オーバーハンドグリップ（順手）…次からは オーバーハンドグリップ",
    bad: "毎回（順手）を付ける",
  },
  {
    rule: "末尾の締めの文は1文に短くする",
    good: "動作はゆっくり行いましょう。",
    bad: "動作はゆっくり行いましょう。無理をせず、フォームを守って、安全に楽しんでください。",
  },
  {
    rule: "括弧は全角（）。種目名の器具表記もこの形で、読点では区切らない",
    good: "ベンチプレス（ダンベル）",
    bad: "ベンチプレス(ダンベル) / ベンチプレス、ダンベル",
  },
  {
    rule: "長さの inch・feet は cm に換算して書く。重量は kg で書く。lb の原文は Weight_smartConvert の刻み（5lb→2.5kg、10lb→5kg、45lb→20kg）で換算し、ジムで使う値にする。kg と並べた原文は kg だけ残す。記録や体重はおおよその kg に「約」を付ける",
    good: "約180cm、100kg",
    bad: "6ft、102kg",
  },
  {
    rule: "並列の区切りは「・」。英語のスラッシュ区切りは意味が並列のときだけ残す",
    good: "ワークアウト・履歴",
    bad: "ワークアウト/履歴",
  },
  {
    rule: "長音は付ける（JIS 準拠）。3音以上の語は「ー」を落とさない",
    good: "ユーザー、サーバー、バーベル",
    bad: "ユーザ、サーバ",
  },
  {
    rule: "カタカナ複合語は中黒で区切らない。ただし固有名の区切りは残す",
    good: "ウォームアップ、スーパーセット",
    bad: "ウォーム・アップ",
  },
  { rule: "UI の Week N / Day N は「N週目」「N日目」", good: "2週目 3日目", bad: "第2週 第3日" },
  {
    rule: "ラベルの「Weight」は「重量」、体重を指すときだけ「体重」",
    good: "重量 100kg / 体重 80kg",
    bad: "ウェイト 100kg",
  },
  {
    rule: "二人称（あなた）は使わない。主語を省く",
    good: "進め方を選択してください",
    bad: "あなたの進め方を選択してください",
  },
  {
    rule: "命令は「してください」。強い禁止は「できません」と状況を書く",
    good: "名前を入力してください",
    bad: "名前を入力しろ",
  },
  { rule: "空白に頼る表現（改行位置を揃える意図の全角スペース）は使わない", good: "メモを追加", bad: "メモ　を追加" },
];

export const Glossary_headings: { en: string; ja: string }[] = [
  { en: "Setup", ja: "セットアップ" },
  { en: "Execution", ja: "手順" },
  { en: "Movement", ja: "動作" },
  { en: "Starting Position", ja: "スタートポジション" },
  { en: "Key Points", ja: "ポイント" },
  { en: "Tips", ja: "コツ" },
  { en: "Form Tips", ja: "フォームのコツ" },
  { en: "Tips for Proper Form", ja: "フォームのコツ" },
  { en: "Common Mistakes", ja: "よくあるミス" },
  { en: "Safety", ja: "安全のために" },
  { en: "Safety Tips", ja: "安全のために" },
  { en: "Safety Considerations", ja: "安全のために" },
  { en: "Equipment Needed", ja: "必要な器具" },
  { en: "Breathing", ja: "呼吸" },
  { en: "Variations", ja: "バリエーション" },
  { en: "Conclusion", ja: "まとめ" },
  { en: "Notes", ja: "補足" },
  { en: "Benefits", ja: "効果" },
  { en: "Return", ja: "戻す" },
  { en: "Caution", ja: "注意" },
  { en: "Warning", ja: "注意" },
];

export const Glossary_exerciseNaming: string[] = [
  "種目名は、日本のジムで通じる呼び名を優先する。ジム用語はカタカナ（ベンチプレス、デッドリフト、スクワット、ラットプルダウン、レッグプレス、バーベルロウ）。",
  "日本語で定着した自重種目は漢字：懸垂（Pull Up）、腕立て伏せ（Push Up）、腹筋（Sit Up）。Chin Up はチンアップ、Dip はディップス、Crunch はクランチ、Back Extension はバックエクステンション。",
  "器具名は本家と同じ構造で括弧に入れる：ベンチプレス（バーベル）。名称の中に器具が入る場合も同じ（ケーブルクロスオーバー、スミススクワット）。",
  "グリップ・角度などの修飾は日本のジムの語順に合わせて前に置く：ナローグリップベンチプレス、ワイドグリップベンチプレス、インクラインベンチプレス。Row は ロウ（ベントオーバーロウ、シーテッドロウ）、Curl は カール。",
  "種目名の表は src/i18n/ja/exerciseNames.ts（ID から日本語名）。器具は equipmentNames.ts、筋肉は muscles.ts。種目名には器具を含めない（器具名が種目名の一部のものを除く：ケーブルクロスオーバー、ケトルベルスイング、トラップバーデッドリフト）。",
  "グリップ・角度の語はカタカナ：インクライン、デクライン、ナローグリップ、ワイドグリップ、オーバーハンド、アンダーハンド、ニュートラルグリップ。",
  "人名・競技名（Arnold Press、Romanian Deadlift、Bulgarian Split Squat）は日本で通じる形：アーノルドプレス、ルーマニアンデッドリフト、ブルガリアンスクワット。",
  "ID（abWheel、benchPress など）と内部名は訳さない。ID から表示名への対応表は別に持つ。",
];

const stripCode = (text: string): string => text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");

const isKatakana = (c: string | undefined): boolean => c !== undefined && /[ァ-ヺー]/.test(c);

function containsAsWord(body: string, found: string): boolean {
  let from = body.indexOf(found);
  while (from !== -1) {
    const glued =
      (isKatakana(found[0]) && isKatakana(body[from - 1])) ||
      (isKatakana(found[found.length - 1]) && isKatakana(body[from + found.length]));
    if (!glued) {
      return true;
    }
    from = body.indexOf(found, from + 1);
  }
  return false;
}

export function Glossary_findViolations(text: string): IGlossaryViolation[] {
  const body = stripCode(text).replace(/膝蓋/g, "\u0000");
  const result: IGlossaryViolation[] = [];
  const seen = new Set<string>();
  for (const term of Glossary_terms) {
    for (const found of term.avoid) {
      const key = `${term.en}\u0000${found}`;
      if (!seen.has(key) && containsAsWord(body, found)) {
        seen.add(key);
        result.push({ term: term.en, found });
      }
    }
  }
  return result;
}
