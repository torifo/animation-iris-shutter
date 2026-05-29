# A·Tr · アイリスシャッター遷移

> 多枚葉のカメラ絞り（アイリス）を SVG で再現したページ／ビュー遷移。閉じる → 中身差替 → 開く の 3 フェーズ。架空映像レーベル **REEL ZERO** の short film index に組み込んだ実用デモ。

**Live demo**: `./index.html`

## 概要

| 項目 | 内容 |
|---|---|
| ジャンル | A · 幾何 |
| 用途 | Tr · ページ遷移 |
| 主な参考 | Awwwards SOTD（カメラ絞り系遷移）/ Igloo Inc |
| 依存 | なし（Pure HTML + CSS + Vanilla JS、SVG のみ） |
| 推奨配置 | 作品インデックス／章送り／ギャラリー切替／ケーススタディ |

## 仕組み（3 フェーズ）

| フェーズ | blade の回転 | 中身 |
|---|---|---|
| 既定（open） | rim pivot で外向きに 96° 退避（aperture 開） | アクティブ |
| ① closing | 0° へ（中央を覆う） | アクティブのまま |
| 〔swap〕 | 0°（覆い切った状態でホールド） | 差し替え |
| ② opening | 0° → 96°（aperture 復帰） | 新アクティブ |

各 blade は SVG の三角ポリゴン。`transform-origin: 95px 0`（=外周上の自身の支点）を中心に回転する。隣接 blade と角度を被らせ、閉じ切ったとき中央に「絞り穴ゼロ」が生まれる。stagger を入れて各 blade が順に閉じる／開くことで、機械的な絞り機構の質感を出す。

## 組み込み手順

### 1. 2 ファイルをコピー

`style.css` の `/* ─── COMPONENT ─── */` ブロック（`.reel*` / `.iris-svg`）と、`script.js` の IIFE 全体を移植先へ。

### 2. マークアップ

```html
<div class="reel"
     data-iris
     data-iris-blades="6"
     data-iris-close="380"
     data-iris-hold="60"
     data-iris-open="420"
     data-iris-stagger="28">

  <div class="reel-stage">
    <!-- 上下メタ枠は任意 -->

    <div class="reel-frame" data-iris-target>
      <article class="film is-active" data-film="0"> ... </article>
      <article class="film"           data-film="1"> ... </article>
      <article class="film"           data-film="2"> ... </article>
    </div>

    <div class="reel-bottombar">
      <div class="reel-nav">
        <button data-iris-prev>PREV</button>
        <button data-iris-next>NEXT</button>
      </div>
    </div>
  </div>
</div>
```

### 3. API（任意 JS から呼ぶ場合）

`data-iris` 要素には `_iris.transition(swapFn)` が生える。`swapFn` は **閉じ切ったタイミング** に呼ばれる。

```js
const root = document.querySelector('[data-iris]');
root._iris.transition(() => {
  // ここで DOM 差し替え、route 切替、img.src 入れ替え 等
});
```

## カスタマイズ可能な属性

| データ属性 | 役割 | デフォルト | 範囲 |
|---|---|---|---|
| `data-iris-blades` | 絞り blade 数 | `6` | 3〜12 |
| `data-iris-close` | 閉じる総時間（最遅 blade まで含む、ms） | `380` | 80〜2000 |
| `data-iris-hold` | 閉じ切り後の保持時間（ms） | `60` | 0〜600 |
| `data-iris-open` | 開く総時間（ms） | `420` | 80〜2000 |
| `data-iris-stagger` | 隣接 blade 間のディレイ（ms） | `28` | 0〜200 |

## カスタマイズ可能な CSS 変数

| 変数 | 役割 | デフォルト |
|---|---|---|
| `--iris-blade` | blade の塗り色（=閉じ切ったときの画面色） | `#0a0a0a` |
| `--iris-edge` | blade 境界に薄く差すハイライト | `rgba(255,255,255,.04)` |
| `--iris-ease` | 各 blade の easing | `cubic-bezier(.7,0,.2,1)` |
| `--iris-d` | 各 blade の transition duration（JS が自動で書き換える） | `380ms` |

### よくある調整例

```css
/* 速くキレよく */
.reel{ --iris-ease:cubic-bezier(.85,0,.15,1); }

/* 白いシャッター（光学レンズ的） */
.reel{ --iris-blade:#f4f3ee; --iris-edge:rgba(0,0,0,.08); }

/* 8 枚葉でより滑らかな絞り */
<div class="reel" data-iris data-iris-blades="8" data-iris-stagger="20"> ... </div>
```

## アクセシビリティ

- `prefers-reduced-motion: reduce` 時は SVG アイリスを表示せず、film のクロスフェード（200ms）で差し替える
- `← / →` キーで作品遷移（input / textarea / contenteditable フォーカス時は無視）
- 遷移中は prev/next ボタンを `disabled` にし、連打を抑止
- ボタンに `aria-label`、SVG に `aria-hidden`

## 制約 / 既知の挙動

- 各 film は DOM 常駐。非アクティブは `opacity:0; visibility:hidden; pointer-events:none`
- `data-iris-close`/`-open` は **stagger を含めた総時間**。最遅 blade は `total - (blades-1) * stagger` でアニメする
- blade 数を減らすと隣接の被りが必要になるが、内部で `overlap = 6°` を加味して計算しているため 3〜12 枚で破綻しない
- still cut は実写画像を持たず、レイヤー化した CSS グラデーション + 走査線で代用

## 変更履歴

- **v0.1** — 初版。SVG 6 枚葉アイリス、REEL ZERO short film index、4 作品 + クリック/← → 操作。

## ライセンス

ANIMATION DESIGN STUDY の一部として公開（コピペ自由）。
