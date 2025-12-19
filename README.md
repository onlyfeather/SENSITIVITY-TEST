# 🔮 Sensitivity Test / 默契度大挑战

> 一个基于 Vue 3 + Tailwind CSS 构建的趣味互动测试应用。包含粒子特效、震动反馈以及隐藏的作弊彩蛋。

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

## ✨ 特性 (Features)

本项目包含以下核心功能：

- **👥 双人同屏模式**：支持两名用户在同一设备或远程进行默契度/敏感度测试。
- **✨ 沉浸式视觉体验**：集成全屏粒子特效，打造流畅、高端的视觉反馈。
- **📳 触感反馈 (Haptics)**：在关键交互（如按钮点击、结果揭晓）时触发设备震动，提升移动端体验。
- **📸 二维码分享卡片**：测试结束后自动生成精美的结果卡片，包含动态二维码，方便社交分享。
- **🎁 隐藏彩蛋 (Easter Egg)**：内置“作弊模式”，通过特定操作触发，可自定义测试结果（懂的都懂 😏）。

## 🛠️ 技术栈 (Tech Stack)

- **核心框架**: Vue 3 (Composition API)
- **开发语言**: TypeScript / TSX
- **样式库**: Tailwind CSS
- **构建工具**: Vite
- **动画/特效**: Canvas API (粒子系统)

## 🚀 快速开始 (Getting Started)

如果你想在本地运行这个项目：

### 1. 克隆仓库
```bash
git clone [https://github.com/onlyfeather/SENSITIVITY-TEST.git](https://github.com/onlyfeather/SENSITIVITY-TEST.git)
cd SENSITIVITY-TEST

```

### 2. 安装依赖

```bash
npm install
# 或者使用 pnpm / yarn
yarn install
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可看到效果。

## 🕹️ 玩法说明 (How to Play)

1. 输入参与者的名字。
2. 跟随屏幕指引完成一系列测试题目。
3. 系统将基于算法（其实是随机数+魔法✨）生成你们的默契度/敏感度报告。
4. 点击保存，生成带有二维码的卡片分享给朋友。

> **🤫 关于彩蛋**：
> 想要在朋友面前展示惊人的默契度？试着在输入名字时包含特定关键词，或在某个角落连续点击...（具体触发方式请查看源码 `src/App.tsx`）

## 📦 部署 (Deployment)

本项目针对 **Vercel** 进行了优化，建议使用 Vercel 进行一键部署。

## 📄 License

[MIT](https://www.google.com/search?q=LICENSE) © 2025 OnlyFeather
