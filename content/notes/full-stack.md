---
title: 全栈开发
description: Linux/Git、Web 基础、HTML、模块化、Vite、React/Next、后端 API 与 FastAPI
order: 2
---

# 2.1 Linux、Git 与 Web 基础

## 一、Linux 终端常用命令

| 命令 | 作用 |
| ----- |----- |
|`ls`|列出当前目录下的文件 |
|`pwd`|查看当前所在路径 |
|`cd 目录名`|进入某个目录；`cd ..` 返回上一级；`cd ~` 回到用户主目录；`cd /` 进入根目录 |
|`touch 文件名`|创建空文件 |
|`rm 文件名`|删除文件；`rm -r 目录` 删除文件夹|
|`mkdir 目录名`|创建文件夹 |
|`cat 文件名`|查看文件内容 |
|`clear`|清空终端屏幕|
|`vim 文件名`| 编辑文件：`i` 进入编辑，`Esc` 退出编辑，`:wq` 保存退出（`:q!` 不保存退出） |
---


## 二、Git 全套操作

### 1. 初次全局配置（只执行一次）

```bash
git --version                     # 查看 git 版本，确认安装成功
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 2. 本地仓库操作

```bash
git init                          # 在当前文件夹初始化 git，生成隐藏目录 .git
git add 文件名                    # 把指定文件加入暂存区
git add .                         # 把当前目录的全部改动加入暂存区
git commit -m "提交描述文字"      # 提交暂存区，生成本地版本快照
git status                        # 查看文件状态，哪些改动还没提交
git log --oneline                 # 简洁查看所有提交记录
git checkout 提交id               # 回退到历史某次提交
git checkout main                 # 切回 main 分支最新版本
touch .gitignore                  # 配置忽略文件，写在这里的文件不会被 git 追踪
```

### 3. SSH 密钥配置（本地 ↔ GitHub，免密 push / pull）

> 目的：让本地电脑和 GitHub 建立 SSH 信任，之后 push / pull 不用每次输入账号密码。

```bash
ssh-keygen -t ed25519 -C "你的 GitHub 注册邮箱"
```

生成后，本地 `~/.ssh` 目录下有两个文件：

- `id_ed25519`：私钥，本地保留，不能泄露；
- `id_ed25519.pub`：公钥，复制全部内容，粘贴到 GitHub 的 Settings → SSH keys。

### 4. 本地仓库关联 GitHub 远程仓库

> 先在 GitHub 网页新建一个空仓库，复制仓库的 SSH 地址，格式类似 `git@github.com:用户名/仓库名.git`。

```bash
git remote add origin git@github.com:用户名/仓库名.git   # 绑定远程仓库，远程别名叫 origin（名字可自取）
git branch -M main                                      # 把本地分支重命名为 main
git push -u origin main                                 # 第一次推送本地 main 分支到远程
```

### 5. 日常 push / pull

```bash
git push origin main      # 把本地提交推送到 GitHub 远程
git pull origin main      # 拉取 GitHub 远程最新代码到本地
git clone ssh仓库地址     # 把 GitHub 远程仓库完整下载到本地
```

### 6. 云服务器连接 GitHub

> 云服务器上也要生成 SSH 密钥，把公钥加到 GitHub，服务器才能执行 `git pull` 拉取代码。

```bash
ssh-keygen -t ed25519 -C "邮箱"   # 在云服务器终端执行，步骤同上
# 复制 .pub 公钥内容，添加到 GitHub 的 SSH keys
git clone xxx(ssh地址)            # 服务器下载仓库
git pull                          # 服务器拉取更新代码
```
---
## 三、Web 互联网基础

### 1. 四个基本概念

- **服务器**：一台 24 小时开机的远程电脑，提供网页、接口、静态文件等资源，对外提供访问。
- **IP 地址**：网络中每台设备的唯一编号，用来定位机器，例如 `12.12.12.12`。
- **域名**：给 IP 起的好记的名字，例如 `github.com`。人记域名，机器识别 IP。
- **DNS**：域名解析，负责把域名翻译成 IP。

> DNS 流程：浏览器输入网址 → 请求 DNS 服务器 → DNS 返回对应服务器的 IP → 浏览器拿着 IP 去访问服务器。

### 2. 端口：一台服务器靠端口区分服务

- `80` 端口：HTTP 普通网页
- `443` 端口：HTTPS 加密网页

### 3. 一次完整的访问流程

浏览器输入 URL → DNS 解析域名得到 IP → 通过 IP + 端口访问服务器 → 服务器返回 response 响应 → 浏览器解析响应，渲染网页给用户。

### 4. SSH 协议：操作远程机器

SSH 是安全外壳协议，用于本地电脑远程登录、操作另一台电脑（云服务器）。

```bash
ssh 用户名@服务器IP
# 示例：ssh ubuntu@120.xx.xx.xx
```

前提：服务器开启 SSH 服务，默认端口 22。

两种使用场景：

- 本地电脑 SSH 登录云服务器，操作服务器；
- 用 SSH 密钥完成本地 ↔ GitHub、云服务器 ↔ GitHub 的免密通信。
---

## 四、Nginx Web 服务器

### 1. 安装与常用命令（Ubuntu）

```bash
sudo apt update
sudo apt install nginx -y
systemctl status nginx          # 查看 nginx 运行状态
sudo systemctl reload nginx     # 修改配置后重载生效
sudo nginx -t                   # 校验配置文件语法是否正确
```

### 2. 重要目录与文件

| 路径 | 作用 |
| --- | --- |
| `/usr/bin/nginx` | nginx 可执行程序 |
| `/etc/nginx/` | nginx 全部配置的存放根目录 |
| `/etc/nginx/nginx.conf` | nginx 总入口配置文件 |
| `/etc/nginx/sites-available/` | 各个网站站点的配置，`default` 是默认站点配置 |
| `/etc/nginx/sites-enabled/` | 已启用的站点，软链接指向 `sites-available` 里的配置 |
| `/var/www/html` | nginx 默认的网页静态文件存放目录 |
| `/var/log/nginx/` | nginx 的访问日志、错误日志 |

### 3. 配置的核心逻辑

访问流程：浏览器请求 IP / 域名 → nginx 接收请求 → 按配置转发到对应项目文件夹 → 返回网页内容。

具体做法是修改 `/etc/nginx/sites-available/default`，把 `root` 字段改成项目的静态文件目录。修改完成后：

1. `sudo nginx -t` 校验配置语法；
2. `sudo systemctl reload nginx` 重载配置生效。

### 4. 权限问题

网页项目文件夹需要 nginx 用户可访问。权限不足时，用 `chmod` 给其他用户加上该目录的执行权限（能进入这个目录）：

```bash
sudo chmod o+x 网页项目文件夹地址
```

# 2.2 HTML 基础知识

## 一、HTML 基本文档结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- 头部区域 -->
</head>
<body>
  <!-- 主体区域 -->
</body>
</html>
```

- `<!DOCTYPE html>`：文档声明，告诉浏览器这是 HTML5 网页，必须写在第一行。
- `<html lang="zh-CN">`：整个网页的根标签，`lang="zh-CN"` 表示网页语言是中文。
- `<head></head>`：头部，存放网页元信息，内容不会直接显示在页面上。
- `<body></body>`：主体，页面所有看得见的内容全部写在这里。
---

## 二、head 里可以放什么

head 负责网页的描述、配置和引入外部资源，不在页面中渲染展示。

1. `<meta charset="UTF-8">`：设置网页字符编码，防止中文乱码。
2. `<title>页面标题</title>`：浏览器标签页上显示的标题。
3. `<link rel="stylesheet" href="./style.css">`：引入外部 CSS 样式文件。
4. `<style></style>`：在页面内直接写 CSS（内嵌样式）。
5. `<meta name="description" content="网页描述">`：网页简介，给搜索引擎看。
6. `<script src="./script.js"></script>`：引入 JS 脚本，也可以写在 body 末尾。
---

## 三、body 里可以放什么

body 中写用户肉眼可见的全部页面内容。

- 标题：`<h1>` ~ `<h6>`，一级到六级标题
- 段落：`<p>段落文字</p>`
- 块容器：`<div></div>`，用来划分页面区块
- 行内容器：`<span></span>`，包裹一小段文字
- 图片：`<img src="图片地址" alt="图片描述">`
- 超链接：`<a href="跳转地址">跳转文字</a>`
- 按钮：`<button>按钮</button>`
- 列表：`<ul><li></li></ul>`、`<ol><li></li></ol>`
- 输入框：`<input>`

示例：

```html
<body>
  <h1>大标题</h1>
  <div>
    <p>这是一段普通的段落文字</p>
    <button>点击按钮</button>
  </div>
</body>
```
---
# 2.3 HTML 结构、样式、行为三者分离

## 一、为什么要分离

把三类代码拆开，不要全部堆在一个 html 文件里，方便维护。

| 分类 | 负责什么 | 存放文件 |
| --- | --- | --- |
| 结构 | 页面骨架、标签、文字内容 | index.html |
| 样式 | 颜色、大小、布局、美化页面 | style.css |
| 行为 | 交互逻辑：点击、修改内容、运算 | script.js |
---

## 二、分离步骤

### 1. 结构：index.html

只专注写标签与内容，尽量不写 CSS，也不写 JS 逻辑。

### 2. 抽离样式到 style.css

1. 新建 `style.css`，写所有样式代码；
2. 在 index.html 的 `<head>` 里引入：

```html
<link rel="stylesheet" href="./style.css">
```

### 3. 抽离行为到 script.js

1. 新建 `script.js`，写全部 JavaScript 交互代码；
2. 在 index.html 中引入，一般放在 `</body>` 前面：

```html
<script src="./script.js"></script>
```
---
## 三、完整示例

### 1. index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>示例页面</title>
  <!-- 引入外部 css 样式 -->
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <h1>演示标题</h1>
  <p id="text">原始文字</p>
  <button id="btn">点我修改文字</button>
  <!-- 引入外部 js 脚本，放在 body 末尾 -->
  <script src="./script.js"></script>
</body>
</html>
```

### 2. style.css

```css
h1 {
  color: #333;
}

#text {
  font-size: 16px;
}
```

### 3. script.js

```javascript
function changeText() {
  document.getElementById("text").textContent = "文字被修改了";
}

// 把事件绑定也放在 js 里，html 中不写 onclick
document.getElementById("btn").addEventListener("click", changeText);
```
---
## 四、分离的好处

1. html 只管内容，css 只管外观，js 只管交互；
2. 文件分工清晰：改样式不用动 html，改逻辑不用动样式。
---

# 2.4 前端模块化（ES Module）

## 一、早期写法：结构 / 样式 / 交互分离（非模块化）

### 1. 文件结构

```plaintext
├── index.html
├── style.css
├── utils.js
└── cards.js
```

### 2. index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>页面</title>
    <!-- 引入外部 css 样式 -->
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    <h1>页面标题</h1>
    <div id="cardWrap"></div>

    <!-- 按顺序引入多个 js 脚本 -->
    <script src="./utils.js"></script>
    <script src="./cards.js"></script>
</body>
</html>
```

### 3. style.css

```css
h1 {
    color: #333;
}
#cardWrap {
    margin: 10px;
}
```

### 4. utils.js

```javascript
// 变量全部挂载到 window 全局对象
window.formatData = function () {
    console.log("格式化数据");
}
```

### 5. cards.js

```javascript
// 依赖 utils.js，必须保证 utils 先加载
window.renderCard = function () {
    window.formatData();
    console.log("渲染卡片");
}
```

### 6. 旧方案的问题

1. JS 全部暴露到 window 全局，容易命名冲突；
2. html 需要手动写多个 `<script>`，必须严格控制引入顺序；
3. 文件一多就难维护，没有统一入口。
---

## 二、现代写法：ES Module 模块化

### 1. 改造后的文件结构

新增 `main.js` 作为统一入口：

```plaintext
├── index.html
├── style.css
├── utils.js
├── cards.js
└── main.js    # 【新增】模块统一管理入口
```

### 2. 改造后的 index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>页面</title>
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    <h1>页面标题</h1>
    <div id="cardWrap"></div>

    <!-- 只引入这一个脚本，type="module" 开启 ES 模块化 -->
    <script type="module" src="./main.js"></script>
</body>
</html>
```

html 的变化点：

1. 删除分散的多个 `<script src="xxx.js">`；
2. 只保留 1 个脚本，并加上 `type="module"` 属性。

### 3. utils.js：用 export 导出

```javascript
// export 向外导出函数，不再挂载 window
export function formatData() {
    console.log("格式化数据");
}
```

### 4. cards.js：用 import 导入其他模块

```javascript
// import 导入其他模块的函数
import { formatData } from "./utils.js";

export function renderCard() {
    formatData();
    console.log("渲染卡片");
}
```

### 5. main.js：统一入口

```javascript
// main.js：统一导入所有业务模块
import { formatData } from "./utils.js";
import { renderCard } from "./cards.js";

// 可以再次向外导出，供其他模块继续使用
export { formatData, renderCard };

// 页面初始化逻辑
function bootstrap() {
    renderCard();
}

// 执行启动
bootstrap();
```

### 6. main.js 的作用

1. 集中 `import` 导入所有分散的 js 模块；
2. 统一执行页面初始化业务逻辑；
3. html 只需要引入 main.js，不需要关心底层有多少 js 文件；
4. 变量不再挂载 window，避免全局污染。

### 7. ES Module 的关键规则

1. html 脚本标签必须写 `type="module"`，浏览器才识别 `import` / `export` 语法；
2. module 脚本默认开启严格模式，变量不会自动挂到 window；
3. `export`：模块把内部的函数、变量对外暴露；
4. `import`：读取其他模块 `export` 出来的内容；
5. main.js 充当唯一入口，聚合所有 js 模块，简化 html。
---

# 2.5 Vite 学习笔记

## 一、为什么需要 Vite

### 1. 旧手写模块化的问题

1. 文件多，浏览器要发起大量网络请求；
2. 浏览器缓存：改了代码，浏览器还在加载旧缓存文件，看不到新效果；
3. 项目写起来之后，在本地改项目、看效果很麻烦。

### 2. Vite 的优势

1. 开发：热更新，修改代码立刻刷新页面；
2. 打包构建：把多个 js / css 合并压缩，文件名带上 hash 指纹，解决浏览器缓存问题；
3. 可以在本地电脑实时预览效果。

### 3. 前置环境：Node.js

Vite 是用 JS 写的工具，必须依赖 Node.js 运行环境。

```bash
node -v
npm -v
```

能输出版本号，说明 Node 环境安装成功。

---

## 二、手动初始化项目

### 1. npm init -y

```bash
# -y 全部默认确认，快速生成 package.json（项目记账本）
npm init -y
```

`package.json` 是项目的记账本，记录项目名字、版本、用到哪些包、脚本命令。此时只有 `package.json`，还没有 `node_modules` 和 lock 文件。

### 2. 安装 vite（开发依赖）

```bash
# -D 代表开发依赖：只在开发阶段用，上线打包不需要
npm install -D vite
```

执行完这条命令，才新增两个东西：

1. `node_modules`：存放所有下载的第三方包（vite 工具就在这里）；
2. `package-lock.json`：锁版本文件，锁定每个包的精确版本，保证所有人环境一致。

### 3. node_modules/.bin 目录（重点）

`.bin` 在 `node_modules` 内部，存放工具的可执行脚本：

- `vite`：开发服务器脚本
- `vite-build`：打包构建脚本
- `vite-preview`：预览打包产物 dist 的脚本

`package.json` 里的 `scripts` 脚本，本质就是调用 `.bin` 下面这些文件。

### 4. 安装业务依赖：以 animejs 为例

```bash
npm install animejs
```

- 不加 `-D`：业务代码运行时要用的，打包后也存在；
- 作用：库保存在本地，浏览器不需要再额外发起网络请求下载这个 js。
---
## 三、文件目录对比

手写 ES Module 的旧项目：

```plaintext
├── index.html
├── style.css
├── utils.js
├── cards.js
└── main.js
```

从零 `npm init` 之后，Vite 项目新增的内容：

```plaintext
├── index.html
├── package.json          ✅ npm init -y 生成（记账本）
├── package-lock.json     ✅ npm install -D vite 之后生成
├── node_modules/         ✅ npm install -D vite 之后生成
│   └── .bin/             ✅ vite 命令脚本在此
├── src/                  ✅ 源代码文件夹，js / css 放这里
│   ├── css/
│   └── js/
└── dist/                 ✅ npm run build 之后自动生成（部署产物）
```
---
## 四、package.json scripts 配置命令别名

修改 `package.json`：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

之后运行简写命令：

```bash
npm run dev      # 启动开发服务器
npm run build    # 打包生成 dist 文件夹
npm run preview  # 本地预览 dist 打包效果
```

**dist 打包产物说明**

- `assets/`：合并压缩后的 css、js，文件名带 hash，解决浏览器缓存问题；
- `index.html`：网站入口。

把 dist 文件夹全部上传到服务器，即可部署上线。

---

## 五、完整从零搭建流程

1. `npm init -y` → 创建记账本 `package.json`；
2. `npm install -D vite` → 安装开发工具 vite，生成 `node_modules`、`package-lock.json`；
3. `npm install animejs` → 安装业务第三方库；
4. 配置 `scripts` 脚本命令；
5. `npm run dev` 开发写代码；
6. `npm run build` 打包输出 dist；
7. `npm run preview` 本地检查打包结果；
8. 部署 dist 文件夹。
---

# 2.6 React 笔记（在 Vite 基础上进行）

## 一、React 的作用

React 是组件化的前端库。

- 把页面拆成一个个独立的小组件，UI 和逻辑封装在一起，代码可复用、结构清晰；
- 用 JSX 写页面，浏览器不能直接识别 JSX，需要 Vite 构建工具做翻译。

> 概念区分：
> - Vanilla：原生 JS，直接操作 DOM；
> - React：组件化开发，依赖 Vite 编译 JSX。
---
## 二、创建 React 项目的两种方式

### 1. 方式 A：全新创建（推荐）

```bash
npm create vite@latest my-react-proj -- --template react
```

脚手架会自动生成全部文件、自动配置 vite，不需要手写 `vite.config.js`。

### 2. 方式 B：已有普通 Vite 项目，追加 React 能力

1. 安装核心包：

```bash
npm install react react-dom
```

2. 安装编译 JSX 的插件：

```bash
npm install -D @vitejs/plugin-react
```

3. 手动编写 `vite.config.js`：

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()]
});
```

> `@vitejs/plugin-react` 负责把 JSX 翻译成浏览器可识别的 JS。
---
## 三、开发顺序：从组件到页面

逻辑顺序：先拆分小组件 → 再组装 App 根组件 → main.jsx 挂载 → index.html 提供容器。

### 1. 拆分页面，写各个小组件（components 目录）

示例 1：`components/InputCard.jsx`

```jsx
// 输入卡片小组件
export default function InputCard() {
  return <div className="input-card">输入区域</div>
}
```

示例 2：`components/ResultCard.jsx`

```jsx
// 结果卡片小组件
export default function ResultCard() {
  return <div className="result-card">结果区域</div>
}
```

示例 3：`components/AnimatedCardGrid.jsx`

```jsx
// 动画布局组件
export default function AnimatedCardGrid({ children }) {
  return <div className="animate-wrap">{children}</div>
}
```

示例 4：`components/HomePage.jsx`

```jsx
// 首页页面组件，导入并拼装上面几个小组件
import InputCard from "./InputCard.jsx";
import ResultCard from "./ResultCard.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";

export default function HomePage() {
  return (
    <AnimatedCardGrid>
      <InputCard />
      <ResultCard />
    </AnimatedCardGrid>
  )
}
```

### 2. App.jsx：根组件，做顶层组装

```jsx
// src/App.jsx
import HomePage from "./components/HomePage.jsx";

function App() {
  return (
    <div className="app">
      <HomePage />
    </div>
  )
}

export default App
```

> App.jsx 本身不会直接显示到浏览器，它只做组件汇总。

### 3. main.jsx：入口文件，把 App 挂载到 DOM

```jsx
// src/main.jsx
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// 把 App 渲染进页面 DOM 节点
createRoot(document.getElementById("root")).render(<App />);
```

### 4. index.html：只提供空容器

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>react 项目</title>
</head>
<body>
  <!-- 空白挂载容器，所有 react 内容全部渲染进这里 -->
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### 5. 浏览器实际运行时序

1. 浏览器加载 index.html，读到空的 `<div id="root"></div>`；
2. 执行 main.jsx；
3. main.jsx 导入 App.jsx；
4. App.jsx 导入 HomePage 页面组件；
5. HomePage 导入 InputCard、ResultCard 和布局组件；
6. 全部组件拼装完成，渲染填入 `#root`，页面展示内容。
---
## 四、项目文件夹结构

```plaintext
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx             # 入口，负责挂载渲染
│   ├── App.jsx              # 顶层根组件，组装页面
│   ├── components/          # 第一步写的各个拆分小组件
│   │   ├── InputCard.jsx
│   │   ├── ResultCard.jsx
│   │   ├── AnimatedCardGrid.jsx
│   │   └── HomePage.jsx
│   └── css/
└── node_modules/
```
---
## 五、重点总结

1. 开发写代码的顺序：先写 components 里各个小组件 → HomePage 拼装小组件 → App 拼装页面组件 → main.jsx 执行挂载 → html 放容器；
2. 浏览器执行顺序正好相反：html → main.jsx → App → HomePage → 各个小组件；
3. `npm create vite --template react` 新建项目不用手写 vite 配置，只有旧项目追加 react 才需要手动写配置。
---
# 2.7 React / Next.js 笔记

## 一、数据与界面分离

> 适用场景：组件复用、多语言切换、页面多处使用同一套数据。

### 1. 做法

- 把文字、链接、配置等**数据抽离到独立的数据文件**（例：`data/site.js`）；
- jsx 组件只负责 UI 渲染，不写死业务文字内容；
- 组件导入外部数据文件，读取数据渲染页面；修改内容只改数据文件，不用动组件 JSX。

### 2. 示例

本项目真实的数据文件就是 `data/site.js`，按页面分组导出：`home`（首页）、`textLab`、`sqlAgentLab`、`techReviewPage`。下面用简化版说明写法。

`data/site.js`（存放纯数据）

```javascript
export const siteData = {
  title: "Zero-To-Tech",
  projects: [
    { name: "文字实验室", href: "/text-lab" },
    { name: "SQL-Agent 实验室", href: "/sql-agent" }
  ]
}
```

组件中读取数据

```jsx
// components/CardList.jsx
import { siteData } from "../data/site.js";

export default function CardList() {
  return (
    <div>
      {siteData.projects.map(item =>
        <div key={item.name}>{item.name}</div>
      )}
    </div>
  )
}
```

### 3. 好处

1. UI 组件可以复用，更换内容只改数据源；
2. 便于做多语言，准备多套 data 文件切换即可；
3. 视图与数据解耦，维护简单。
---
## 二、路由：页面跳转与 URL

### 1. 原生 React 需要第三方路由

Vite + React 本身没有路由能力，需要安装第三方库 `react-router-dom`。

- 路由作用：点击导航切换页面组件，浏览器 URL 地址同步变化；
- state：组件内部状态，只存在当前组件内存里，刷新页面就丢失；
- `useNavigate`、`useParams` 等钩子：用于跳转页面、读取 URL 参数。

> 缺点：需要额外安装依赖，还要手动配置路由规则。

### 2. Next.js 内置路由

Next.js 内置路由，不需要额外装包：`app/` 下的文件夹结构就是路由表，跳转用 `<Link href="/notes">`，读当前地址用 `usePathname()`。所以本项目里既没有 `react-router-dom`，也没有 `main.jsx` 挂载这一步

---

## 三、Next.js 框架

### 1. 新建项目

```bash
npm create next-app@latest
```

本项目用的是 **App Router**（Next 13+），所以项目里只有 `app/` 目录，没有老的 `pages/` 目录。

### 2. 和 Vite + React 比：少了三个文件，多了一个目录

| Vite + React 里的东西 | Next.js 里 | 谁接管了它 |
| --- | --- | --- |
| `index.html` | 不需要 | `app/layout.jsx` 里直接写 `<html>`、`<body>` |
| `main.jsx`（createRoot 挂载） | 不需要 | 框架自动把 layout + page 渲染成 HTML |
| `App.jsx`（最外层组装） | `app/layout.jsx` | 外壳 + 全站导航 |
| `react-router-dom` | `app/` 目录 | **文件夹结构就是路由表** |

一句话区别：Vite 项目是“一个 HTML 挂一个 React 应用”，Next 项目是“一个网址对应 `app` 里的一个文件夹”。

### 3. app 目录：文件夹就是网址

```plaintext
app/
├── layout.jsx                # 不产生地址，所有页面共用的外壳
├── page.jsx                  # /                → HomeView
├── text-lab/page.jsx         # /text-lab        → TextLabView
├── sql-agent-lab/page.jsx    # /sql-agent-lab   → SqlAgentLabView
├── notes/page.jsx            # /notes           → NotesView
└── tech-review/page.jsx      # /tech-review     → TechReviewView
```

规则：

1. 文件夹名 = URL 的一段，嵌套文件夹就是嵌套路径；
2. 文件夹里**有 `page.jsx`** 才是一个地址，否则只是普通目录；
3. 加页面 = 新建 `app/xxx/page.jsx`，不用改任何“路由配置”；
4. 文件夹改名等于改 URL，`Nav.jsx` 里的 `href` 要一起改；
5. `layout.jsx` 只套外壳，不产生新地址。

### 4. page.jsx：这一页的入口

一句话：**访问这个地址时渲染什么**。默认导出一个组件，Next 自己调用，不用注册。

```jsx
// app/text-lab/page.jsx —— 最简形态：只挂一个页面组件
import TextLabView from "../../components/TextLabView.jsx"; // 退两级回到项目根

export default function Page() {
  return <TextLabView />;   // 标题、卡片、交互都在组件里，page 只有这 3 行
}
```

`app/page.jsx` 结构完全一样，只是路径退一级：`import HomeView from "../components/HomeView.jsx"`。

需要取数据时加 `async`，服务端组件可以直接读文件：

```jsx
// app/notes/page.jsx
import { getNotes } from "../../lib/notes.js";
import NotesView from "../../components/NotesView.jsx";

export default async function Page() {
  const notes = await getNotes();     // 构建时读 content/notes/*.md → HTML + 大纲
  return <NotesView notes={notes} />; // 搜索、折叠这些交互交给客户端组件
}
```

`page.jsx` 里**不用**写：`<html>`/`<body>`、导航条、URL 判断——这些由 layout 和文件夹结构包掉。

### 5. layout.jsx：全站外壳

`children` 就是当前地址对应的 `page.jsx`。切页面时 layout 不重建、只换 `children`，所以导航条不会闪。

```jsx
// app/layout.jsx —— 全站唯一的根布局
import "../css/reset.css";              // 全局样式只在这里引一次
// …其他 css 省略
import Nav from "../components/Nav.jsx";

export const metadata = {               // 写进 <head> 的标题、描述
  title: "zero to tech",
  description: "个人主页 + 文字实验室",
};

export default function RootLayout({ children }) {
  return (
    // 根 layout 必须自己写 <html> 和 <body>
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <Nav />                       {/* 导航条只写一次，全站共用 */}
        </header>
        <main className="page-content">
          {children}                    {/* 占位：当前页面的 page.jsx */}
        </main>
      </body>
    </html>
  );
}
```

注意：

- 根 layout 必须有 `<html>`、`<body>`，缺了会报错；
- 它是服务端组件，不要加 `'use client'`；
- 子目录也能放 layout（如 `app/notes/layout.jsx` 只包 `/notes`），本项目只有根 layout。

### 6. 一次访问的链路

```plaintext
/text-lab
  → app/layout.jsx          外壳：html/body、全局 CSS、导航条
  → app/text-lab/page.jsx   这一页的入口
  → TextLabView             客户端组件：管理 result 状态
  → InputCard / ResultCard  输入区、结果区
```

和 2.6 的 `main.jsx → App → HomePage → 小组件` 是同一套套娃，只是最外层换成了 layout，入口换成了“文件夹 + page.jsx”。

### 7. 页面之间怎么跳

```jsx
// components/Nav.jsx（只留关键结构）
"use client";                            // 用了 usePathname，必须在浏览器跑
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();        // 当前地址，例如 "/notes"

  return (
    <nav>
      {/* Link 代替 <a>：客户端跳转，不整页刷新 */}
      <Link href="/notes" className={pathname === "/notes" ? "active" : ""}>
        学习笔记
      </Link>
    </nav>
  );
}
```

- `Link` 是客户端跳转，页面状态不丢；
- `usePathname()` 用来判断当前页、给导航加高亮；
- 服务端组件（layout）里可以直接放 `<Nav />`。

### 8. 目录分工

| 目录 | 管什么 | 例子 |
| --- | --- | --- |
| `app/` | 路由：哪个网址对应哪个页面 | `app/text-lab/page.jsx` |
| `components/` | UI：页面长什么样、怎么交互 | `TextLabView`、`InputCard`、`Nav` |
| `data/` | 内容：页面上显示的文字 | `site.js` |
| `lib/` | 逻辑：读文件、转 HTML | `notes.js` |
| `content/` | 原始素材 | `notes/*.md` |

一句话：`app` 决定路由，`components` 决定长相，`data` 决定内容。

### 9. `'use client'` 什么时候加

标准只有一条：这段代码**要不要在浏览器里跑**。

```jsx
// 纯展示：只接收 props 渲染标签 → 不用加
export default function PageHeading({ title }) {
  return <h1 className="hero-display">{title}</h1>;
}
```

```jsx
"use client";                            // 用 useEffect / 动画库 / onClick → 必须加，放第一行
import { useEffect, useRef } from "react";

export default function AnimatedCardGrid({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    // 操作 DOM、跑动画，只能发生在浏览器
  }, []);

  return <section ref={ref}>{children}</section>;
}
```

> `'use client'` 只作用于这个文件和它 import 的子组件，页面本身仍然可以是服务端组件。
---

## 四、Next.js 部署

### 1. 服务端组件 / 客户端组件的“渲染结果”

1. **服务端组件（没有 `'use client'`）**
   构建时就把内容渲染成 HTML，浏览器拿到的是成品，**不需要为它下发 JS**。本项目里 `app/layout.jsx`、`app/notes/page.jsx`、`PageHeading` 都是这种。
2. **客户端组件（顶部写 `'use client'`）**
   需要交互、state、动画，构建时先出一份 HTML，再把对应的 JS 一起下发给浏览器，到浏览器里“接管”这部分界面（hydration）。本项目里 `Nav`、`TextLabView`、`InputCard`、`AnimatedCardGrid` 是这种。

> 这决定了产物形态：能让交互跑起来的代码必须是 JS，所以客户端组件越多，下发的 JS 越大；纯展示的页面尽量留在服务端。

### 2. A：静态导出

`next.config.mjs`（本项目的真实内容）：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
};

export default nextConfig;
```

加了这一行，`npm run build` 不产出“服务端程序”，而是把每个路由预渲染成静态文件，统一放到 `out/`：

```plaintext
out/
├── index.html              # /
├── text-lab/index.html     # /text-lab
├── notes/index.html        # /notes
├── sql-agent-lab/index.html
├── tech-review/index.html
└── _next/static/…          # 公共的 JS、CSS
```

> `output: 'export'` 和 `next start` 只能二选一：配了静态导出再执行 `next start` 会直接报错，因为根本没有服务端进程可跑。本项目全是静态页面 + 独立的后端 API，选静态导出最省事。

### 3. B：next start 常驻 Node 服务

- **原理**：服务器上常驻一个 Node 进程，每次请求由它在服务端现场渲染页面，再返回 HTML。
- **优点**：能拿到实时数据，适合登录态、服务端直接查库的页面。
- **缺点**：服务器要装 Node、常驻进程，占资源。
- **命令**：

```bash
npm run build   # 构建
next start      # 启动服务，默认 3000 端口
```

> 这种方式要删掉 `output: 'export'`，再配合 Nginx 做反向代理。

### 4. 部署到 Nginx

1. 构建，确认 `out/` 生成：

```bash
npm run build
```

2. 把 `out/` 整个上传到云服务器（例如 `/var/www/zero-to-tech`）；
3. 修改 Nginx 站点配置，`root` 指向 out 目录：

```nginx
server {
    listen 80;
    server_name 你的域名;
    root  /var/www/zero-to-tech;  # 指向 out 上传后的位置，不是 dist、不是 .next
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. 校验并重载：

```bash
sudo nginx -t               # 校验配置语法，必须先过这一步
sudo systemctl reload nginx # 重载配置生效
```

两个容易踩的点：

- `/notes`、`/text-lab` 这类地址，导出后是 `notes/index.html`、`text-lab/index.html`，靠 `index index.html` 就能正确返回，不需要额外的 rewrite；
- `out/` 是构建产物，项目 `.gitignore` 里已经忽略，不要提交；换环境重新 `npm run build` 再上传即可。
---

# 2.8 后端 API 基础笔记

## 一、后端与 API 概念

- **后端**：持续运行在服务器上的程序，接收网络请求，做计算、业务处理、读写数据，对外提供能力。
- **API**：把后端能力封装成固定的 URL 入口，供前端、其他程序调用。

### 1. API 调用的四个步骤

1. 调用方向指定 URL 发出网络请求；
2. 后端服务器执行业务逻辑；
3. 后端一般返回 JSON 格式数据；
4. 调用方接收并解析数据，程序直接使用这份数据。

> 通信载体是 HTTP 协议，分为 `request（请求）` 和 `response（响应）`。

### 2. HTTP 请求 request

1. **请求行**：请求方法 + URL 路径 + HTTP 版本，例 `GET /api/profile HTTP/1.1`；
2. **请求头**：附加说明，一行一条（客户端身份、格式、身份凭证等）；
3. **空行**：分隔头与请求体；
4. **请求体**：POST / PATCH 等请求携带的提交数据，GET 一般没有请求体。

### 3. HTTP 响应 response

1. **状态行**：HTTP 版本 + 状态码，2xx 成功、4xx 客户端错误、5xx 服务端错误；
2. **响应头**：附加说明，例如 `Content-Type: application/json` 告诉客户端返回的数据格式；
3. **空行**：分隔头与响应体；
4. **响应体**：真正返回给调用方的数据，如 JSON 字符串。

### 4. curl 工具

作用：在终端发送 HTTP 请求，完整打印原始请求报文、响应报文，方便调试 API。

```bash
curl -v '接口地址'
```
> `-v` 是 verbose，展示完整交互全过程。
---
## 二、HTTP 常见请求方法

| 方法 | 含义 |
| --- | --- |
| GET | 获取资源：把某样东西给我 |
| POST | 提交内容，请服务端处理 |
| PUT | 整体替换资源 |
| PATCH | 局部修改资源 |
| DELETE | 删除资源 |
| HEAD | 和 GET 一样，只要响应头、不要响应体，用于探测 |
| OPTIONS | 询问服务端：我可以对这个资源做哪些操作（跨域时会见到） |
---
## 三、HTTP 常见请求头与响应头

### 1. 请求头（调用方描述本次请求）

- `Host`：访问哪一台服务器
- `User-Agent`：客户端是什么工具 / 浏览器
- `Accept`：客户端希望接收什么格式
- `Content-Type`：我提交的内容是什么格式
- `Content-Length`：请求体数据长度
- `Authorization`：身份凭证
- `Cookie`：客户端携带的会话小纸条

### 2. 响应头（服务端返回给调用方）

- `Content-Type`：服务端返回内容格式
- `Content-Length`：响应体长度
- `Server`：后端服务器软件
- `Set-Cookie`：给客户端下发会话小纸条
- `Location`：资源跳转的新地址
- `Access-Control-Allow-Origin`：跨域允许的来源
---
## 四、手写原生 API

> 目的：理解 API 底层，不使用框架，原生处理 HTTP 请求、拼装响应。

`backend/main.py`

```python
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

profile = {
    "heroTitle": "关于我",
    "heroSubtitle": "项目，创意，灵感，心得，我的作品"
}

class Handler(BaseHTTPRequestHandler):
    # 处理 GET 请求
    def do_GET(self):
        if self.path == "/api/profile":
            # 1. 返回状态码
            self.send_response(200)
            # 2. 设置响应头，告诉客户端返回 json
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            # 3. 构造响应体 json 字符串
            body = json.dumps(profile, ensure_ascii=False)
            # 4. 写回响应体，必须 encode 转成字节
            self.wfile.write(body.encode("utf-8"))
        else:
            # 404：路径不存在
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    print("后端已启动：http://localhost:8000/api/profile")
    server = HTTPServer(("", 8000), Handler)
    server.serve_forever()
```

### 1. 运行

```bash
python main.py
```

访问 `http://localhost:8000/api/profile`，拿到 JSON 数据。

### 2. 底层要点

1. 收到请求后读取请求行、请求路径 `self.path`；
2. `send_response()` 设置状态码，必须写；
3. `send_header()` 设置响应头，`end_headers()` 结束头部分；
4. 空行是协议规定，`end_headers()` 内部会自动处理；
5. `wfile.write()` 写入响应体，只能写字节，字符串需要 `.encode("utf-8")`；
6. 服务端循环等待，持续接收新请求。
---
## 五、FastAPI 使用笔记

### 1. FastAPI 简介

FastAPI 是 Python 的 web 后端框架，把底层 HTTP 报文全部封装，不用手动处理请求行、响应头、字节编码。只需要写函数 + 装饰器定义接口路由，框架自动完成请求解析、返回 JSON、状态码处理。

### 2. 安装依赖

```bash
pip install fastapi uvicorn
```

- `fastapi`：web 框架本体
- `uvicorn`：ASGI 服务器，用来跑 FastAPI 项目

### 3. 基础示例（GET + POST）

`backend/main.py`

```python
from fastapi import FastAPI
from pydantic import BaseModel#post专用

# 创建应用实例
app = FastAPI()


# GET：读数据，没有请求体
@app.get("/api/profile")
def get_profile():
    return {
        "heroTitle": "关于我",
        "heroSubtitle": "项目，创意，灵感，心得，我的作品"
    }


# 用类描述请求体长什么样：前端必须发 {"text": "..."}
class ChatRequest(BaseModel):
    text: str
# POST：接收请求体 → 处理 → 返回回答
@app.post("/api/chat")
def chat(req: ChatRequest):
    text = req.text.strip()
    return {"text": text, "reply": f"收到 {len(text)} 个字的输入。"}
```

两点说明：

- `req: ChatRequest` 让框架自动把 JSON 请求体转成对象，字段缺失或类型不对会直接返回 422；
- 前端发的是 JSON，所以请求头必须带 `Content-Type: application/json`。

用 curl 测一下 POST：

```bash
curl -X POST http://127.0.0.1:8000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"text":"你好，后端"}'
```

### 4. 运行项目：两种方式

方式 1：uvicorn，手动指定“文件名:实例名”。

```bash
uvicorn main:app --reload
```

- `main`：文件名 main.py
- `app`：代码里 `app = FastAPI()` 的实例对象
- `--reload`：代码改动自动重启，只用于开发环境

方式 2：FastAPI CLI，只给文件名，默认就是开发模式。

```bash
fastapi dev main.py
```

- 不用写 `main:app`；
- 默认开启自动重载，不用加 `--reload`；
- 需要先装 CLI：`pip install fastapi-cli`（装 `fastapi[standard]` 也会带上）。

两种方式对比：

| 方式 | 命令 | 写不写实例名 | 特点 |
| --- | --- | --- | --- |
| uvicorn | `uvicorn main:app --reload` | 要 | 最通用，装了 uvicorn 就能用，重载靠手动加参数 |
| FastAPI CLI | `fastapi dev main.py` | 不用 | 一条命令即开发模式，自动重载 |

生产环境则是去掉开发特性：`uvicorn main:app`，或 `fastapi run main.py`。

两种方式启动的是同一个应用，地址都是 `http://127.0.0.1:8000`，文档页面：

- 交互式文档：`http://127.0.0.1:8000/docs`（可以直接点 Try it out 测 GET / POST）
- 简洁文档：`http://127.0.0.1:8000/redoc`

### 5. 生产环境导出依赖

把当前所有包写入 `requirements.txt`，部署服务器时直接批量安装。

```bash
pip freeze > requirements.txt
```

服务器上安装：

```bash
pip install -r requirements.txt
```

> 生产部署不要加 `--reload`，只在开发环境用。
---
## 六、前后端联调与 CORS

### 1. 跨域是什么

浏览器的安全策略：**JS 只能请求和当前网页域名、端口完全相同的后端接口**。

- 前端页面：`http://localhost:3000`
- FastAPI 后端接口：`http://127.0.0.1:8000`

域名或端口不一致就是**跨域**，浏览器 JS 会拦截返回结果，控制台报 CORS 错误。

> 注意：curl、Postman 调用接口**不受 CORS 限制**，CORS 只是浏览器 JS 的安全限制。

### 2. FastAPI 开启 CORS

FastAPI 自带中间件，无需额外安装。导入 `CORSMiddleware` 并注册到 app：

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 配置跨域中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # 允许访问的前端源地址，写前端页面地址
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],      # 允许所有请求方法 GET POST PUT DELETE
    allow_headers=["*"],      # 允许所有请求头
)

@app.get("/api/profile")
def get_profile():
    return {
        "heroTitle": "关于我",
        "heroSubtitle": "项目，创意，灵感，心得，我的作品"
    }
```

### 3. 参数说明

- `allow_origins`：允许哪些前端来源访问后端接口；
  - 开发环境可以写 `["*"]` 允许全部来源，**生产环境不要写**，要指定真实前端域名；
- `allow_credentials`：是否允许携带 Cookie 凭证；
- `allow_methods=["*"]`：允许全部 HTTP 方法；
- `allow_headers=["*"]`：放行全部请求头。

### 4. 接口地址随环境变化

客户端代码里的地址不能写死：本地是 `http://localhost:8000`，上线后是另一个地址。写死的话，部署之后浏览器请求的是“访问者自己电脑的 8000 端口”。

第一步，在项目根目录新建 `.env.local`（和 `package.json` 同级）：

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

三条规则：

1. 只有 `NEXT_PUBLIC_` 开头的变量才会被打进浏览器代码，其他名字只能在服务端读；
2. 变量是构建时替换的，改完要重启 `npm run dev` 才生效；
3. 这个文件不提交，`.gitignore` 里已经有 `.env*`。

第二步，客户端组件里读这个变量，替换掉原来写死的地址：

```jsx
"use client";
import { useState } from "react";

// 地址从 .env.local 来：换环境只改配置，不改代码
const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function InputCard({ onResult }) {
  const [text, setText] = useState("");

  async function handleAnalyze() {
    const res = await fetch(`${API}/api/chat`, {   // 拼上接口路径
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    onResult(await res.json());
  }

  return <button onClick={handleAnalyze}>开始分析</button>;
}
```

对比改之前的那一行：

```jsx
const API = "http://localhost:8000";   // 写死，上线后请求到的是用户自己的电脑
```

两个注意点：

- 值末尾不要加斜杠，否则会拼成 `//api/chat`；
- `NEXT_PUBLIC_` 的变量会明文出现在浏览器 JS 里，只能放地址这种公开信息，密钥必须留在后端。

---

## 七、文字实验室真正跑起来

> **前端一行都不用改**。`InputCard` 本来就把 `{"text": ...}` POST 到 `/api/analyze`，`ResultCard` 也是按 `result.score`、`result.label`、`result.pinyin` 显示的，缺的只是后端把这三个字段算出来。

### 1. 装包

```bash
pip install snownlp pypinyin
```

| 包 | 用途 | 关键用法 |
| --- | --- | --- |
| `snownlp` | 中文情感分析 | `SnowNLP(text).sentiments` → 0~1 的分数 |
| `pypinyin` | 汉字转拼音 | `lazy_pinyin(text, style=Style.TONE)` → 带声调的拼音列表 |

装完顺手更新依赖清单：`pip freeze > requirements.txt`。

### 2. 后端改动
`backend/main.py`
```python
from pypinyin import lazy_pinyin, Style   # 汉字 → 拼音
from snownlp import SnowNLP               # 中文 → 情感分数
# 请求体：前端发的就是 {"text": "..."}
class AnalyzeRequest(BaseModel):
    text: str
# 分数 → 人看的标签（根据分数结果补充的）
def score_label(score):
    if score >= 0.6:
        return "偏积极"
    elif score <= 0.4:
        return "偏消极"
    return "中性"


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    text = req.text
    score = round(SnowNLP(text).sentiments, 2)                    # 0~1，保留两位
    return {
        "text": text,
        "score": score,
        "label": score_label(score),                              # 分数转成结论
        "pinyin": " ".join(lazy_pinyin(text, style=Style.TONE)),  # 列表拼成一句
    }
```

改的只有后端：两个 import、一个请求体模型、一个 `score_label`、一个 `/api/analyze` 路由。

### 3. 测试

```bash
curl -X POST http://127.0.0.1:8000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"text":"今天心情很好"}'
```

```json
{
  "text": "今天心情很好",
  "score": 0.86,
  "label": "偏积极",
  "pinyin": "jīn tiān xīn qíng hěn hǎo"
}
```

也可以在 `http://127.0.0.1:8000/docs` 里点开 `POST /api/analyze` → Try it out。





