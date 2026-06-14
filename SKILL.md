---
name: anim-iris-shutter
description: "Geometric / pattern page-transition animation (pure HTML/CSS/JS, no deps). Use when you need a page-transition effect with a geometric / pattern feel — e.g. 作品インデックス／章送り／ギャラリー切替／ケーススタディ. 多枚葉のカメラ絞り（アイリス）を SVG で再現したページ／ビュー遷移。閉じる → 中身差替 → 開く の 3 フェーズ。架空映像レーベル **REEL ZERO** の short film index に組み込んだ実用デモ。"
---

# anim-iris-shutter (A·Tr · アイリスシャッター遷移)

Pure HTML + CSS + vanilla JS, **zero dependencies**. 多枚葉のカメラ絞り（アイリス）を SVG で再現したページ／ビュー遷移。閉じる → 中身差替 → 開く の 3 フェーズ。架空映像レーベル **REEL ZERO** の short film index に組み込んだ実用デモ。

## When to use / 使いどころ
- **EN:** a *page-transition* effect with a *geometric / pattern* feel.
- **JP:** 幾何学・パターン × ページ遷移。推奨配置: 作品インデックス／章送り／ギャラリー切替／ケーススタディ

## Bundled assets / 同梱アセット
This skill folder is the reference implementation — copy from these files:
- `index.html` — full working demo (open to preview)
- `style.css` — component styles
- `script.js` — the self-contained logic
- `README.md` — full human-facing doc (JP): mechanism, accessibility, constraints

## How to apply / 組み込み手順
Copy the component CSS block from `style.css` and the script from `script.js` (no build step), then follow the markup/parameters below.

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

## Customize / カスタマイズ
### カスタマイズ可能な属性
| データ属性 | 役割 | デフォルト | 範囲 |
|---|---|---|---|
| `data-iris-blades` | 絞り blade 数 | `6` | 3〜12 |
| `data-iris-close` | 閉じる総時間（最遅 blade まで含む、ms） | `380` | 80〜2000 |
| `data-iris-hold` | 閉じ切り後の保持時間（ms） | `60` | 0〜600 |
| `data-iris-open` | 開く総時間（ms） | `420` | 80〜2000 |
| `data-iris-stagger` | 隣接 blade 間のディレイ（ms） | `28` | 0〜200 |
### カスタマイズ可能な CSS 変数
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

---
> Full mechanism, accessibility and known constraints: see **`README.md`** / 詳細・機構・アクセシビリティは README.md 参照。
