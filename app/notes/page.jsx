// app/notes/page.jsx → 网站路径 "/notes"（学习笔记页）。
// 服务端组件：构建期把 content/notes/ 下的 .md 读出来、转成 HTML + 大纲，
// 再把纯数据交给客户端组件 NotesView（它负责搜索、大纲、选中与滚动定位）。
import { getNotes } from "../../lib/notes.js";
import NotesView from "../../components/NotesView.jsx";

export default async function Page() {
  const notes = await getNotes();
  return <NotesView notes={notes} />;
}
