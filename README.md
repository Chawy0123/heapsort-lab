# Heap Sort Lab｜堆積排序實驗室

一個以繁體中文製作的互動式 Heap Sort 學習網站。使用者可以輸入自己的整數資料，逐步觀察建立 Max-Heap、比較、交換、取出最大值與縮小堆積區的完整過程。

## 線上作品

GitHub Pages 網址：<https://chawy0123.github.io/heapsort-lab/>

## 主要功能

- 輸入 2–12 個 JavaScript 安全整數（±9,007,199,254,740,991），支援負數、零與重複值。
- 同步顯示陣列與完全二元樹。
- 用不同顏色標示堆積區、比較中、交換中及已排序區。
- 支援建立最大堆積、上一步、下一步、自動排序、暫停與重設。
- 顯示每輪取出的最大值、比較次數、交換次數與堆積大小。
- 說明 Heap Sort 的核心原理、陣列索引公式與 JavaScript 程式。
- 正確比較 Heap Sort 與 Bubble Sort 的時間複雜度。
- 包含完整的實作與學習心得。

## Heap Sort 原理

Heap Sort 分成兩個階段：

1. 從 `floor(n / 2) - 1` 開始向前執行 `siftDown`，把陣列建立成 Max-Heap。
2. 將索引 `0` 的最大值與堆積區最後一格交換，縮小 `heapSize`，再從根節點執行 `siftDown`，直到排序完成。

使用 Max-Heap 時，每輪最大值會被放到陣列右側，因此最後得到由小到大的結果。

## 複雜度比較

| 項目 | Heap Sort | Bubble Sort |
|---|---|---|
| 最佳時間 | O(n log n) | O(n)，需提前終止最佳化 |
| 平均時間 | O(n log n) | O(n²) |
| 最差時間 | O(n log n) | O(n²) |
| 額外空間 | O(1) | O(1) |
| 穩定性 | 不穩定 | 穩定 |

## 本機開啟

這是無框架、無外部套件的靜態網站。由於 JavaScript 使用 ES modules，請透過本機 HTTP server 開啟：

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

接著開啟 `http://127.0.0.1:4173/`。

## 執行測試

需要 Node.js 18 以上版本：

```powershell
node --test
```

測試涵蓋輸入解析與安全整數邊界、一般排序、已排序、反向、重複值、負數與零、兩元素、每輪最大值、Max-Heap 合法性、不可變快照、播放控制器、鍵盤快捷鍵、長數字視覺尺寸及頁面必要內容。

## 專案結構

```text
index.html                   頁面結構與教學內容
styles.css                  視覺設計與響應式版面
favicon.svg                 網站圖示
src/heap-sort.js            Heap Sort 步驟產生器與輸入驗證
src/playback-controller.js  上一步、下一步與自動播放控制
src/keyboard-shortcuts.js   不干擾表單與頁面捲動的鍵盤快捷鍵判斷
src/view-model.js            陣列、樹與歷程的顯示模型
src/app.js                  DOM、SVG 與使用者互動
tests/                      Node.js 自動化測試
docs/                       設計規格、實作計畫與視覺驗證紀錄
```

## 鍵盤操作

- `←`：上一步
- `→`：下一步
- `Space`：開始或暫停自動排序

## 技術

HTML5、CSS3、JavaScript ES Modules、SVG、Node.js built-in test runner，以及 GitHub Pages。
