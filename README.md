## 簡介

這個專案整合了 Nexon Open API（冒險島台服）並提供角色搜尋與資料展示，包括基本資訊、能力值、裝備、技能與聯盟等常用面板。前端採用 React Query 管理資料請求，介面元件以 shadcn/ui（Radix + Tailwind）打造。

## 環境變數

取得 Nexon Open API 金鑰後，新增 `.env.local`（或任何支援的環境設定檔）並加入：

```bash
NEXON_OPEN_API_KEY=your_api_key_here
```

> 注意：金鑰必須向 Nexon 開放平臺申請，且查詢次數會受官方配額限制。

## 本地開發

安裝相依套件並啟動開發伺服器：

```bash
pnpm install
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000) 進行預覽。輸入角色名稱即可從 API 擷取資料；若當天資料尚未更新，可改查詢前一日日期。

## 主要功能

- 角色基本資訊與角色圖像
- 能力值最終面板（含剩餘 AP）
- 裝備清單（含星力、潛能與附加潛能摘要）
- 技能面板（自動依職業轉職階段與超技分類）
- 冒險島聯盟摘要
- 友善錯誤提示（例如 API 尚未更新或角色名稱錯誤）與局部載入失敗標示
- React Query 快取與 DevTools，減少重複查詢並方便除錯
- shadcn/ui 元件庫打造的響應式儀表板介面

## 部署

部署到雲端前，記得在環境設定中加入 `NEXON_OPEN_API_KEY`。框架採用 Next.js 15，可直接部署至 Vercel 或任何支援 Node.js 的平臺。
