// app/layout.jsx 是 Next.js 的"全站外壳"——所有页面都套在它里面。
// 它取代了 index.html + main.jsx + App.jsx 最外面那层壳：
//   - <html>/<body> 由它提供；
//   - app-shell / page-shell / page-content 这层包裹，和 4.4 App.jsx 里一模一样；
//   - 4.4 main.jsx 里那 8 行 import CSS，原样搬到这里（顺序不变）。
// 注意：导航条 Nav 统一放在这里（吸顶 header），所有页面共用，不再是每页各放一份。

import "../css/reset.css";
import "../css/variables.css";
import "../css/layout.css";
import "../css/hero.css";
import "../css/nav.css";
import "../css/cards.css";
import "../css/lab.css";
import "../css/review.css";
import "../css/notes.css";
import "../css/responsive.css";
import "highlight.js/styles/github.css";
// 笔记里的 LaTeX 公式在构建期由 rehype-katex 转成 HTML，浏览器这边只需要它的样式和字体。
// 字体文件（woff2）由 Next 打包进 /_next/static/media/，静态导出后也能正常加载。
import "katex/dist/katex.min.css";
import Nav from "../components/Nav.jsx";

export const metadata = {
  title: "zero to tech",
  description: "个人主页 + 文字实验室",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="app-shell">
          <header className="site-header">
            <div className="site-header-inner">
              <Nav />
            </div>
          </header>
          <div className="page-shell">
            <main className="page-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
