// app/tech-review/page.jsx → 网站路径 "/tech-review"
// 和 text-lab / sql-agent-lab 一样：文件夹 = 路由，一行挂一个 View。
import TechReviewView from "../../components/TechReviewView.jsx";

export default function Page() {
  return <TechReviewView />;
}
