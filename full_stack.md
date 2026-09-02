# 前后端基础笔记
 
## Linux终端常用命令 + Git全套操作
 
### Linux终端基础命令
 
|命令 | 作用 
|------|------|
|ls | 列出当前目录文件 
 |pwd | 查看当前所在路径 
 |cd |目录名  进入某个目录； cd ..  返回上一级； cd ~ 回到家目录； cd / 进入根目录 
 |touch| 文件名  创建空文件 
 |rm |文件名  删除文件； rm -r 目录 删除文件夹 
 |mkdir| 目录名  创建文件夹 
 |cat| 文件名  查看文件内容 
 |clear|  清空终端屏幕 
 |vim|文件名  编辑文件； i 进入编辑， ESC 退出编辑， :wq保存退出(:q!不保存退出)
 
 
 
### Git 使用
 
#### 初次全局配置（只执行一次）
 
```bash
git --version                     #查看git版本，确认安装
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```
 
#### 本地仓库操作
 
```bash
  
git init                          #在当前文件夹初始化git，生成隐藏文件夹 .git
git add 文件名                    #把指定文件加入暂存区
git add .                         #把当前目录全部改动加入暂存区
git commit -m "提交描述文字"      #提交暂存区，生成本地版本快照
git status                        #查看文件状态，哪些修改未提交
git log --oneline                 #简洁查看所有提交记录
git checkout 提交id               #回退到历史某一次提交
git checkout main                 #切回main分支最新版本
touch .gitignore                  #配置忽略文件，写在这里的文件不会被git追踪
```


#### SSH密钥配置（本地 ↔ Github，免密码push/pull）
 
>***目的***：本地电脑和Github建立SSH信任，不用每次输入账号密码
 
```bash
  
#生成ssh密钥
ssh‑keygen -t ed25519 -C "你的github注册邮箱"
#生成后，在本地 ~/.ssh 目录：
-  id_ed25519 ：私钥（本地保留，不能泄露）
-  id_ed25519.pub ：公钥，复制全部内容，粘贴到Github设置‑SSH keys
```

#### 本地仓库关联Github远程仓库
 
> Github网页新建空仓库，复制仓库SSH地址，格式类似： git@github.com:用户名/仓库名.git 
 
```bash
git remote add origin git@github.com:用户名/仓库名.git #绑定远程仓库，远程别名叫 origin(自己起的)
git branch -M main                                     #把本地分支重命名main
git push -u origin main                               #第一次推送本地main分支到远程
```
 
 
#### 日常 push / pull
 
```bash
git push origin main      #把本地提交推送到github远程
git pull origin main      #拉取github远程最新代码到本地
git clone ssh仓库地址     #把github远程仓库完整下载到本地
```
 
#### 远程服务器（云服务器）连接Github
 
>云服务器上也要生成ssh密钥，把公钥放到Github，服务器才能执行 git pull 拉取代码
 
```bash
#云服务器终端执行，步骤同上
ssh‑keygen -t ed25519 -C "邮箱"
#复制 .pub公钥内容，添加到Github SSH keys
git clone xxx(ssh地址)    #服务器下载仓库
git pull                 #服务器拉取更新代码
```
  
## Web互联网基础：IP、域名、DNS、服务器
 
-  服务器：一台24小时开机的远程电脑，提供资源（网页、接口、静态文件），对外提供访问。
-  IP地址：网络里每一台设备的唯一编号，用来定位机器。例如 12.12.12.12 。
-  域名：给IP起好记的名字，例如 github.com ，人记域名，机器识别IP。
-  DNS域名解析
 
>***DNS服务器***：做域名→IP翻译。
***流程***：浏览器输入网址 → 请求DNS服务器 → DNS返回对应服务器IP → 浏览器拿着IP去访问服务器。
 
端口：一台服务器多个服务靠端口区分
 
-  80 端口：HTTP普通网页
-  443 端口：HTTPS加密网页
 
>***完整访问流程***：
 浏览器输入URL → DNS解析域名得到IP → 通过IP+端口访问服务器 → 服务器返回response响应 → 浏览器解析响应渲染网页给用户 
 
### SSH协议：操作远程机器
 
SSH：安全外壳协议，本地电脑远程登录操作另一台电脑（云服务器）
 
```bash
ssh 用户名@服务器IP
#示例 ssh ubuntu@120.xx.xx.xx
```
  
前提：服务器开启ssh服务，默认端口22。
 
两种SSH使用场景
 
-  本地电脑ssh登录云服务器，操作服务器；
-  ssh密钥完成本地 ↔ Github、云服务器 ↔ Github的免密通信。
 
## Nginx web服务器
 
安装Nginx（Ubuntu）
 
```bash
sudo apt update
sudo apt install nginx -y
systemctl status nginx    #查看nginx运行状态
sudo systemctl reload nginx #修改配置后重载生效
sudo nginx -t              #校验配置文件语法是否正确
```
  
Nginx重要目录&文件
 
|路径 |作用
|------|------| 
| /usr/bin/nginx|  nginx可执行程序 
| /etc/nginx/ | nginx全部配置存放根目录 
| /etc/nginx/nginx.conf |  nginx总入口配置文件 
| /etc/nginx/sites‑available/  |存放各个网站站点配置，default是默认站点配置 
| /etc/nginx/sites‑enabled/ | 启用的站点，软链接指向sites‑available里的配置 
| /var/www/html | nginx默认网页静态文件存放目录 
| /var/log/nginx/ | nginx访问日志、错误日志 

Nginx配置核心逻辑
 
访问流程：浏览器请求IP/域名 → nginx接收请求 → 根据配置转发到对应项目文件夹，返回网页内容。
 
修改 /etc/nginx/sites‑available/default ，修改 root 字段，指定为项目的静态文件目录。
 
修改完成操作：
 
1.  sudo nginx -t 校验配置语法
2.  sudo systemctl reload nginx 重载配置生效
 
权限注意：网页项目文件夹需要nginx用户可读，权限不足使用 chmod 修改目录权限。 
```bash
sudo chmod o+x 网页项目文件地址
```

# HTML基础知识
##  HTML基本文档结构
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
- `<!DOCTYPE html>`：文档声明，告诉浏览器这是 HTML5 网页，必须写在最第一行。
- `<html lang="zh-CN">`：整个网页的根标签；`lang="zh-CN"` 代表网页语言是中文。
- `<head></head>`：头部，存放网页元信息，内容不会直接显示在页面上。
- `<body></body>`：身体/主体，页面所有看得见的内容全部写在这里。
## head 头部里面可以放什么
head 负责网页描述、配置、引入外部资源，不在页面渲染展示。
1. `<meta charset="UTF-8">`：设置网页字符编码，防止中文乱码
2. `<title>页面标题</title>`：浏览器标签页上面显示的标题
3. `<link rel="stylesheet" href="./style.css">`：引入外部 CSS 样式文件
4. `<style></style>`：直接在页面内写 CSS 样式（内嵌样式）
5. `<meta name="description" content="网页描述">`：网页简介，给搜索引擎看
6. `<script src="./script.js"></script>`：引入 JS 脚本（也可以写在body末尾）
## body 主体里面可以放什么
body 中写用户肉眼可见的全部页面内容
- 标题：`<h1>~<h6>` 一级到六级标题
- 段落：`<p>段落文字</p >`
- 容器：`<div></div>` 块容器，用来划分页面区块
- 行内容器：`<span></span>`，包裹一小段文字
- 图片：`< img src="图片地址">`
- 超链接：`<a href=" ">跳转文字</a >`
- 按钮：`<button>按钮</button>`
- 列表：`<ul><li></li></ul>`、`<ol><li></li></ol>`
- 输入框：`<input>`
示例：
```html
<body>
  <h1>大标题</h1>
  <div>
    <p>这是一段普通的段落文字</p >
    <button>点击按钮</button>
  </div>
</body>
```
# Html结构、样式、行为三者分离
核心思想：把三类代码拆开，不要全部堆在一个html文件，方便维护。
| 分类 | 负责什么 | 存放文件 |
| --- | --- | --- |
| 结构 | 页面骨架、标签、文字内容 | index.html |
| 样式 | 颜色、大小、布局、美化页面 | style.css |
| 行为 | 交互逻辑：点击、修改内容、运算 | script.js |
### ① 结构：index.html
只专注写标签与内容，尽量不写css、不写js逻辑。
### ② 抽离样式到 style.css
1. 新建文件 `style.css`，写所有样式代码
2. 在 index.html 的 `<head>` 里面引入css
```html
<link rel="stylesheet" href="./style.css">
```
### ③ 抽离行为到 script.js
1. 新建文件 `script.js`，写全部JavaScript交互代码
2. 在 index.html 引入js文件，一般放在 `</body>` 前面
```html
<script src="./script.js"></script>
```
### 完整分离后的示例 index.html
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>示例页面</title>
  <!--引入外部css样式-->
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <h1>演示标题</h1>
  <p id="text">原始文字</p >
  <button onclick="changeText()">点我修改文字</button>
  <!--引入外部js脚本，放在body末尾-->
  <script src="./script.js"></script>
</body>
</html>
```
### script.js
```javascript
function changeText(){
  document.getElementById("text").textContent = "文字被修改了";
}
```
### 好处
1. html只管内容；css只管外观；js只管交互
2. 文件分工清晰，修改样式不用动html，修改逻辑不用动样式
markdown
  
# 前端模块化笔记（工程化module）
## 早期：结构、样式、交互分离（非模块化）
### 1. 文件文件夹框架
 
```plaintext
├── index.html
├── style.css
├── utils.js
└── cards.js
```

### 2. index.html 原有内容
```html
<!DOCTYPE html>
<html lang="zh‑CN">
<head>
    <meta charset="UTF‑8">
    <title>页面</title>
    <!-- 引入外部css样式 -->
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    <h1>页面标题</h1>
    <div id="cardWrap"></div>

    <!-- 按顺序引入多个js脚本 -->
    <script src="./utils.js"></script>
    <script src="./cards.js"></script>
</body>
</html>
```

### 3. 示例css文件 style.css

```css
h1 {
    color:#333;
}
#cardWrap {
    margin:10px;
}
```
 
 
### 4. 旧版js文件示例
 

utils.js文件
```javascript
// 变量全部挂载到window全局对象
window.formatData = function(){
    console.log("格式化数据");
}
```
  
cards.js文件
```javascript
// 依赖utils.js，必须保证utils先加载
window.renderCard = function(){
    window.formatData();
    console.log("渲染卡片");
}
```
 
 
>旧方案问题
1. JS全部暴露到window全局，容易命名冲突
2. html需要手动写多个`<script>` ，必须严格控制引入顺序
3. 文件多之后维护麻烦，没有统一入口
 
## 现代前端 ES Module 模块化
 
 改造后文件夹框架（新增main.js统一入口）
``` plaintext
├── index.html
├── style.css
├── utils.js
├── cards.js
└── main.js    #【新增】模块统一管理入口
```
 
 改造之后 index.html
 
```html  
<!DOCTYPE html>
<html lang="zh‑CN">
<head>
    <meta charset="UTF‑8">
    <title>页面</title>
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    <h1>页面标题</h1>
    <div id="cardWrap"></div>

    <!-- 只引入这一个脚本，type="module"开启ES模块化 -->
    <script type="module" src="./main.js"></script>
</body>
</html>
```
 
 
 html变化点：
 1. 删除分散的多个 `<script src="xxx.js">` 
 2. 只保留1个脚本，增加` type="module"` 属性      
 3. 改造后的js模块文件（使用 `import `/ `export`）


utils.js
 
```javascript  
// export向外导出函数，不再挂载window
export function formatData(){
    console.log("格式化数据");
}
```

 
cards.js 
```javascript
// import导入其他模块的函数
import { formatData } from "./utils.js";

export function renderCard(){
    formatData();
    console.log("渲染卡片");
}
```
 
4. 新增 main.js 入口文件
 
```javascript
// main.js：统一导入所有业务模块
import { formatData } from "./utils.js";
import { renderCard } from "./cards.js";

// 可以再次向外导出，供其他模块继续使用
export { formatData, renderCard }

// 页面初始化逻辑
function bootstrap(){
    renderCard();
}

// 执行启动
bootstrap();
```


>main.js作用
1. 集中 import 导入所有分散js模块
2. 统一执行页面初始化业务逻辑
3. html只需要引入main.js，不需要关心底层有多少js文件
4. 变量不再挂载window，避免全局污染
 
5. ES模块化关键规则
1. html脚本标签必须写  type="module" ，浏览器才识别import/export语法
2. module脚本默认开启严格模式，变量不会自动挂到window
3.  export ：模块把内部函数、变量对外暴露
4.  import ：读取其他模块export出来的内容
5. main.js充当唯一入口，聚合所有js模块，简化html

# Vite学习笔记
## 1. Vite 解决旧ES Module的痛点
旧手写模块化问题：
1. 文件多，浏览器发起大量网络请求
2. 浏览器缓存：修改代码，浏览器加载旧缓存文件，看不到新效果
3. 项目显现之后，在本地改项目，看效果麻烦
✅ Vite优势
1. 开发：热更新，修改代码立刻刷新页面
2. 打包构建：把多个js/css合并压缩，文件名带上hash指纹，解决浏览器缓存问题
3. 在本地电脑实时预览效果
> Vite是JS写的工具，必须依赖Node.js运行环境

检查环境命令：
```bash
node -v
npm -v
```

输出版号代表Node环境安装成功。
## 2. 手动初始化项目
```bash
#-y 全部默认确认，快速生成package.json（项目记账本）
npm init -y
```
package.json：记账本，记录项目名字、版本、用到哪些包、脚本命令。
此时只有 package.json，还没有 node_modules、lock文件。
**安装vite（开发依赖 -D）**
```bash
#-D 代表开发依赖：只开发阶段用，上线打包不需要
npm install -D vite
```
执行完这条命令，才新增两个东西：
1. node_modules：存放所有下载的第三方包（vite工具就在这里）
2. package-lock.json：锁版本文件，锁定每个包精确版本，保证所有人环境一致

**node_modules/bin 文件夹（重点）**
`.bin` 在 `node_modules` 内部，存放工具可执行脚本：
`vite`：开发服务器脚本
`vite-build`：打包构建脚本
`vite-preview`：预览打包dist脚本
`package.json `里scripts脚本，本质就是调用 `.bin `下面这些文件。

**安装第三方库示例 animejs（业务依赖，不加-D）**
```bash
npm install animejs
```
* 不加 -D：业务代码运行要用到，打包后也存在。
* 作用：库保存在本地，浏览器不需要额外网络请求下载该js。
## 3. 文件目录对比
手写ES Module旧项目
```plaintext
├── index.html
├── style.css
├── utils.js
├── cards.js
└── main.js
```
从零npm init之后，Vite项目新增内容
```plaintext
├── index.html
├── package.json          ✅ npm init -y生成（记账本）
├── package-lock.json     ✅ npm install -D vite之后生成
├── node_modules/         ✅ npm install -D vite之后生成
│   └── .bin/             ✅ vite命令脚本在此
├── src/                  ✅ 源代码文件夹，js/css放这里
│   ├── css/
│   └── js/
└── dist/                 ✅ npm run build之后自动生成（部署产物）
```
## 4. package.json scripts 配置命令别名
修改 `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```
运行简写命令：
```bash
npm run dev      # 启动开发服务器
npm run build    # 打包生成dist文件夹
npm run preview  # 本地预览dist打包效果
```
**dist打包产物说明**
* `assets/`：合并压缩后的css、js，文件名带hash，解决浏览器缓存
* `index.html`：网站入口
dist文件夹全部上传服务器即可部署上线。
## 5. 完整从零搭建流程
1. `npm init -y` → 创建记账本 package.json
2. `npm install -D vite` → 安装开发工具vite，生成 `node_modules`、`package-lock.json`
3. `npm install animejs` → 安装业务第三方库
4. 配置 `scripts` 脚本命令
5. `npm run dev` 开发写代码
6. `npm run build` 打包输出dist
7. `npm run preview` 本地检查打包结果
8. 部署dist文件夹

# React笔记（在vite基础上进行）
## 1. React 的作用
React是组件化前端库。
- 把页面拆成一个个独立小组件，UI、逻辑封装在一起，代码复用、结构清晰
- 使用JSX写页面，浏览器不能直接识别JSX，可以用Vite构建工具做翻译

> 概念区分
> - Vanilla：原生JS，直接操作DOM
> - React：组件化开发，依赖Vite编译JSX

## 2. 创建React项目两种方式
### 方式A：全新创建（推荐）
```bash
npm create vite@latest my-react-proj -- --template react
```

脚手架自动生成全部文件，自动配置vite，不需要手写 vite.config.js
 
### 方式B：已有普通Vite项目，追加React能力
 
1. 安装核心包
 
```bash  
npm install react react-dom
```

 
2. 安装编译JSX插件
 
```bash
npm install -D @vitejs/plugin-react
```

3. 手动编写 vite.config.js
 
```javascript
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins:[react()]
})
```
  
> @vitejs/plugin‑react：负责把JSX翻译成浏览器可识别JS
 
## 3. 开发顺序逻辑
逻辑顺序：先拆分小组件 → 再组装App根组件 → main.jsx挂载 → index.html提供容器
 
**步骤1：拆分页面，写各个小组件（components目录）**
 
示例1 components/InputCard.jsx
 
```jsx
//输入卡片小组件
export default function InputCard(){
  return <div className="input-card">输入区域</div>
}
```

示例2 components/ResultCard.jsx
 
```jsx
//结果卡片小组件
export default function ResultCard(){
  return <div className="result-card">结果区域</div>
}
```
示例3 components/AnimatedCardGrid.jsx
 
```jsx
//动画布局组件
export default function AnimatedCardGrid({children}){
  return <div className="animate-wrap">{children}</div>
}
``` 
示例4 components/HomePage.jsx
 
```jsx
//首页页面组件，导入拼装上面小组件
import InputCard from "./InputCard.jsx"
import ResultCard from "./ResultCard.jsx"
import AnimatedCardGrid from "./AnimatedCardGrid.jsx"

export default function HomePage(){
  return (
    <AnimatedCardGrid>
      <InputCard/>
      <ResultCard/>
    </AnimatedCardGrid>
  )
}
``` 
**步骤2：App.jsx，根组件，引入页面组件做顶层组装**
 
```jsx
// src/App.jsx
import HomePage from "./components/HomePage.jsx"

function App(){
  return (
    <div className="app">
      <HomePage />
    </div>
  )
}
export default App
``` 
>App.jsx本身不会自己显示到浏览器，只是做组件汇总。
 
**步骤3：main.jsx 入口文件：把App组件挂载到DOM上**
 
```jsx
// src/main.jsx
import { createRoot } from "react-dom/client"
import App from "./App.jsx"

//把App渲染放入页面DOM节点
createRoot(document.getElementById("root")).render(<App/>)
```
**步骤4：index.html，只提供空DOM容器，引入main.jsx**
```html
<!DOCTYPE html>
<html lang="zh‑CN">
<head>
  <meta charset="UTF‑8">
  <title>react项目</title>
</head>
<body>
  <!-- 空白挂载容器，所有react内容全部渲染进这里 -->
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```
**浏览器实际运行时序**
1. 浏览器加载 index.html，读到空的 `<div id="root"></div>`
2. 执行main.jsx
3. main.jsx导入App.jsx
4. App.jsx导入HomePage页面组件
5. HomePage导入InputCard、ResultCard、布局组件
6. 全部组件拼装完成，渲染填入`#root`，页面展示内容
 
## 4. 项目文件夹框架
 
```plaintext
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx             #入口，负责挂载渲染
│   ├── App.jsx              #顶层根组件，组装页面
│   ├── components/          #第一步写的各个拆分小组件
│   │   ├── InputCard.jsx
│   │   ├── ResultCard.jsx
│   │   ├── AnimatedCardGrid.jsx
│   │   └── HomePage.jsx
│   └── css/
└── node_modules/
```
 
**重点总结** 
1. 开发写代码顺序：**先写components里各个小组件 → HomePage拼装小组件 → App拼装页面组件 → main.jsx执行挂载 → html放容器**
2. 浏览器执行顺序反过来：html → main.jsx → App → HomePage → 各个小组件
3.  npm create vite --template react 新建项目不用手写vite配置；只有旧项目追加react才手动写配置。

markdown
  
# React / Next.js 笔记
## 1. 数据与界面框架分离
> 适用场景：组件复用、多语言切换、页面多处使用同一套数据。

- 把文字、链接、配置等**数据抽离到独立数据文件**（例：`data/site.js`）
- jsx组件只负责UI渲染，不写死业务文字内容
- 组件导入外部数据文件，读取数据渲染页面；修改内容只改数据文件，不用改动组件JSX。

### 示例
`data/site.js`（存放纯数据）
```javascript
export const siteData = {
  title:"Zero‑To‑Tech",
  projects:[
    {name:"文字实验室",href:"/text‑lab"},
    {name:"SQL‑Agent实验室",href:"/sql‑agent"}
  ]
}
``` 
组件中读取数据
```jsx
// components/CardList.jsx
import { siteData } from "../data/site.js"

export default function CardList(){
  return (
    <div>
      {siteData.projects.map(item=>
        <div key={item.name}>{item.name}</div>
      )}
    </div>
  )
}
``` 
>优点
1. UI组件可以复用，更换内容只修改数据源
2. 便于做多语言，准备多套data文件切换即可
3. 视图、数据解耦，维护简单
 
## 2. 路由：页面跳转与URL
 
**原生React（vite+react）**
 
原生React本身没有路由能力，需要安装第三方库 react‑router‑dom 。
 
- 路由作用：点击导航切换页面组件，浏览器URL地址同步变化
-  state ：组件内部状态，只在当前组件内存，刷新页面丢失
-  useRoute  /  useRouter ：路由钩子，读取url、获取url参数、修改浏览器地址。
 
>缺点：需要额外安装依赖，手动配置路由规则。
Next.js内置路由，不需要额外装包。
 
## 3. Next.js框架
 
从零新建Next项目命令
 
```bash
npm create next-app@latest 
```
**Next.js带来的好处** 

1. **内置路由**： app/page.jsx 文件系统即路由，新建文件自动生成访问url，不用配置路由库
2. SEO友好，支持服务端渲染、静态生成，浏览器可以拿到完整html
3. 内置布局Layout，多个页面共用导航栏、侧边栏
4. 生产构建、部署能力开箱即用。
 
**和普通Vite‑React项目对比**
 
1. Vite‑React：全部是客户端渲染，入口`main.jsx` 手动挂载root容器；路由需要手动引入react‑router‑dom。
2. Next.js：**没有main.jsx，没有index.html手写挂载点**；由框架接管渲染。
文件系统驱动路由， `app` 文件夹决定url路径。
 
**Next App Router 文件框架**
 
```plaintext
├── app/                     # app路由文件夹，文件名对应浏览器url
│   ├── page.jsx             # 首页，对应 /
│   ├── text‑lab/
│   │   └── page.jsx         # 对应 /text‑lab
│   ├── sql‑agent/
│   │   └── page.jsx         # 对应 /sql‑agent
│   └── layout.jsx           # 全局公共布局，所有页面共用导航栏
├── components/              # 公共UI组件
│   ├── InputCard.jsx
│   ├── ResultCard.jsx
│   ├── AnimatedCardGrid.jsx  #动画行为组件，需要'use client'声明
├── data/
│   └── site.js              # 数据文件，继续保持数据视图分离
├── public/                  # 静态资源，html、图片、静态报告
└── package.json
```
>components目录重要变化
1. 依旧存放可复用UI小组件； app 目录专门放页面路由组件，components只放通用小组件，职责划分更清晰。
2. Next13+ App Router重要：有动画、交互、事件、state状态的组件，必须在文件最顶部添加  'use client'  用户客户端声明。
>- 什么时候加：用到onClick、useState、动画库、浏览器DOM API的组件。
>- 什么时候不加：纯展示静态组件，仅做渲染，无交互逻辑，不需要写'use client'。
 
示例：带动画交互组件 AnimatedCardGrid.jsx
 
```jsx
'use client' //必须放在文件最顶部
import { useState } from 'react'

export default function AnimatedCardGrid({children}){
  const [active,setActive] = useState(false)
  return <div onClick={()=>setActive(!active)}>{children}</div>
}
``` 
## 4.next.js两种部署方式
前置概念：服务端组件 / 客户端组件
1. **服务端组件（无 `'use client'`）**
Next 默认，组件在服务端构建时渲染成HTML。
浏览器请求，服务器直接返回已经渲染完成的HTML，**不额外下发JS**。

2. **客户端组件（顶部写 `'use client'`）**
组件包含交互、点击事件、state状态、动画。
返回：`HTML + JS`。
交互逻辑只能浏览器运行，需要额外下发JS给浏览器执行。

### 方式A：常驻 Next 服务（next‑start，Node服务运行）
- **原理**：云服务器上常驻运行一个Node进程，执行`next start`。用户浏览器发起请求，Next服务收到请求，在服务端现场渲染页面，把生成好的HTML返回浏览器。
- **优点**：每次请求现场渲染，可以拿到最新动态数据；支持服务端组件实时获取数据。
- **缺点**：服务器必须安装Node环境，需要常驻Node进程，消耗服务器资源。
- **操作命令**
```bash
# 1.构建
npm run build
# 2.启动next服务
next start
```
>云服务器部署：服务器安装Node，build之后执行 next start ，可以搭配Nginx做反向代理。
 
### 方式B：静态导出（output:"export"，交给Nginx静态托管）
 
把整个Next项目全部预先生成静态页面，产出静态文件，类似Vite的dist文件夹。
 
1. 修改 next.config.mjs 配置
```javascript
// next.config.mjs
const nextConfig = {
  output: "export"
}
export default nextConfig
```
2. 执行构建
 
```bash
npm run build
```
>构建完成，生成产物文件夹 out/（不是dist），每一页生成预渲染好的静态html文件。
 
3. 部署到云服务器Nginx
把本地构建出来的 `out/` 全部上传到云服务器。
修改Nginx配置， `root` 指向 out文件夹路径。
 
```nginx
server {
    listen 80;
    server_name 你的域名;
    root  /xxx/out;  # 重点：指向out，不是dist
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
 
 
4. 重载Nginx配置生效
 
```bash
sudo nginx -t              #校验配置文件语法是否正确
sudo systemctl reload nginx #修改配置后重载生效
```

markdown
  
# 后端API基础笔记
## 1.后端与API概念
- **后端**：持续运行在服务器上的程序，接收网络请求，做计算、业务处理、读写数据，对外提供能力。
- **API**：把后端能力封装成固定URL入口，供前端、其他程序调用。
- API调用四步骤
1. 调用方向指定URL发出网络请求
2. 后端服务器执行业务逻辑
3. 后端一般返回JSON格式数据
4. 调用方接收解析数据，程序直接使用这份数据

> 通信载体：HTTP协议，分为`request（请求）`、`response（响应）`

### HTTP 请求 request
1. **请求行**：请求方法 + URL路径 + HTTP版本，例 `GET /api/profile HTTP/1.1`
2. **请求头**：附加说明，一行一条（客户端身份、格式、身份凭证等）
3. **空行**：分隔头与请求体
4. **请求体**：POST/PATCH等请求携带提交的数据，GET一般没有请求体

### HTTP 响应 response
1. **状态行**：HTTP版本 + 状态码，2xx成功、4xx客户端错误、5xx服务端错误
2. **响应头**：附加说明，例如`Content‑Type:application/json`告诉客户端返回的数据格式
3. **空行**：分隔头与响应体
4. **响应体**：真正返回给调用方的数据，如JSON字符串

### curl工具
作用：在终端发送HTTP请求，完整打印原始请求报文、响应报文，方便调试API。
```bash
curl -v '接口地址'
```
> ‑v ：verbose，展示完整交互全过程。
 
## 2. HTTP常见请求方法（代表调用意图）
 
|方法| 含义 |
|------|------|
|GET| 获取资源：把某样东西给我 
|POST| 提交内容，请服务端处理 
PUT |整体替换资源 
PATCH |局部修改资源 
DELETE |删除资源 
HEAD |和GET一样，只要响应头，不要响应体，用于探测 
OPTIONS| 询问服务端：我可以对这个资源做哪些操作（跨域会见到） 
 
## 3. HTTP常见请求头、响应头
 
**请求头（调用方描述本次请求）**
 
-  Host ：访问哪一台服务器
-  User‑Agent ：客户端是什么工具/浏览器
-  Accept ：客户端希望接收什么格式
-  Content‑Type ：我提交的内容是什么格式
-  Content‑Length ：请求体数据长度
-  Authorization ：身份凭证
-  Cookie ：客户端携带的会话小纸条
 
**响应头（服务端返回给调用方）**
 
-  Content‑Type ：服务端返回内容格式
-  Content‑Length ：响应体长度
-  Server ：后端服务器软件
-  Set‑Cookie ：给客户端下发会话小纸条
-  Location ：资源跳转新地址
-  Access‑Control‑Allow‑Origin ：跨域允许来源
 
## 4.手搓原生API（Python http.server，理解底层）
 
>目的：理解API底层，不使用框架，原生处理HTTP请求、拼装响应。
 
 `backend/main.py` 
```python
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

profile = {
    "heroTitle": "关于我",
    "heroSubtitle": "项目，创意，灵感，心得，我的作品"
}

class Handler(BaseHTTPRequestHandler):
    #处理GET请求
    def do_GET(self):
        if self.path == "/api/profile":
            #1 返回状态码
            self.send_response(200)
            #2 设置响应头，告诉客户端返回json
            self.send_header("Content‑Type", "application/json")
            self.end_headers()
            #3 构造响应体json字符串
            body = json.dumps(profile, ensure_ascii=False)
            #4 写回响应体，必须encode转字节
            self.wfile.write(body.encode("utf‑8"))
        else:
            #404路径不存在
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    print("后端已启动：http://localhost:8000/api/profile")
    server = HTTPServer(("", 8000), Handler)
    server.serve_forever()
```
 
 
运行
```bash
python main.py
```
访问`http://localhost:8000/api/profile`，拿到JSON数据。
 
>底层要点
1. 收到请求读取请求行、请求路径 self.path 
2.  send_response() 设置状态码，必须写
3.  send_header() 设置响应头， end_headers() 结束头部分
4. 空行是协议规定， end_headers() 内部自动处理
5.  wfile.write() 写入响应体，只能写字节，字符串需要 .encode("utf‑8") 
6. 服务端循环等待，持续接收新请求。


  
## 5.FastAPI 使用笔记
**FastAPI 简介**
FastAPI 是 Python 的web后端框架，把底层HTTP报文全部封装，不用手动处理请求行、响应头、字节编码。
只需要写函数 + 装饰器定义接口路由，框架自动完成请求解析、返回JSON、状态码处理。

**安装依赖**
```bash
pip install fastapi uvicorn
```
-  `fastapi` ：web框架本体
-  `uvicorn` ：ASGI服务器，用来跑FastAPI项目
 
**基础示例代码**
backend/main.py
```python
from fastapi import FastAPI
# 创建应用实例
app = FastAPI()
# 定义GET接口路由
@app.get("/api/profile")
def get_profile():
    profile = {
        "heroTitle": "关于我",
        "heroSubtitle": "项目，创意，灵感，心得，我的作品"
    }
    return profile
```
 
 
**运行项目** 
**开发模式（代码修改自动重启）** 
```bash
uvicorn main:app --reload
```
-  `main` ：文件名 main.py
-  `app` ：代码里  `app = FastAPI()`  的实例对象
-  `--reload` ：代码改动自动重启，只用于开发环境
 
访问接口：
 `http://127.0.0.1:8000/api/profile` 

自动生成文档页面（FastAPI自带）
 
- 交互式文档： http://127.0.0.1:8000/docs
- 简洁文档： http://127.0.0.1:8000/redoc
 
**生产环境导出依赖**
 
把当前所有包写入 requirements.txt，部署服务器时直接批量安装
 
```bash
pip freeze > requirements.txt
```
服务器上安装：
```bash
pip install -r requirements.txt
```
>开发环境不要用 --reload 放到服务器生产部署，生产去掉该参数。



## 6.前后端联调与 CORS
### 1. 跨域是什么
浏览器安全策略：**JS只能请求和当前网页域名、端口完全相同的后端接口**。
- 前端页面：`http://localhost:3000`
- FastAPI后端接口：`http://127.0.0.1:8000`
域名/端口不一致 → **跨域**，浏览器JS会拦截返回结果，控制台报CORS错误。

> 注意：curl、postman调用接口**不受CORS限制**，CORS是浏览器JS的安全限制。

### 2. FastAPI 开启CORS跨域
### 安装（fastapi自带中间件，无需额外pip安装）
导入 `CORSMiddleware`，注册到app。

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
**参数说明** 
-  allow_origins ：允许哪些前端来源访问后端接口
- 开发环境可以写  ["*"]  允许全部来源；*生产环境不要写 ，指定真实前端域名 
-  allow_credentials ：是否允许携带Cookie凭证
-  allow_methods=["*"] ：允许全部HTTP方法
-  allow_headers=["*"] ：放行全部请求头
 
