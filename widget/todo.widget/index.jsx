// Interactive To-Do dashboard widget for Übersicht.
// Reads ~/Documents/Dashboard/todo.md; clicking a task toggles it, and the
// "+ add task" button pops a native dialog. All edits go through todo.py.

import { run } from "uebersicht";

const TODO = "$HOME/Documents/Dashboard/todo.md";
const PY = "python3 \"$HOME/Documents/Dashboard/todo.py\"";

export const command = `cat "${TODO}" 2>/dev/null || echo '# To-Do\\n_todo.md not found_'`;

export const refreshFrequency = 2000; // ms

export const className = `
  top: 40px;
  right: 40px;
  width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
  color: #f5f5f7;
  z-index: 0;
`;

// Parse markdown -> sections, keeping each task's 1-based line number in the file.
const parse = (md) => {
  const lines = md.split("\n");
  let title = "To-Do";
  const sections = [];
  let current = null;
  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const line = raw.trim();
    if (line.startsWith("<!--") || line.startsWith("-->") || line === "") return;
    const h1 = line.match(/^#\s+(.*)/);
    if (h1) { title = h1[1]; return; }
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) { current = { name: h2[1], tasks: [] }; sections.push(current); return; }
    const task = line.match(/^-\s+\[( |x|X)\]\s+(.*)/);
    if (task && current) {
      current.tasks.push({ done: task[1].toLowerCase() === "x", text: task[2], line: lineNo });
    }
  });
  return { title, sections };
};

const toggle = (lineNo) => run(`${PY} toggle ${lineNo}`);
const addTask = () => run(`${PY} prompt`);

export const render = ({ output }) => {
  const { title, sections } = parse(output || "");
  const allTasks = sections.flatMap((s) => s.tasks);
  const done = allTasks.filter((t) => t.done).length;
  const total = allTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div
      style={{
        background: "rgba(28, 28, 32, 0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "16px",
        padding: "18px 20px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "0.2px" }}>
          ✦ {title}
        </span>
        <span style={{ fontSize: "12px", color: "#9a9aa2" }}>
          {done}/{total}
        </span>
      </div>

      <div
        style={{
          height: "4px",
          borderRadius: "2px",
          background: "rgba(255,255,255,0.12)",
          overflow: "hidden",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg,#5b8def,#7bd88f)",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {sections.map((sec) => (
        <div key={sec.name} style={{ marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: "#8a8a92",
              marginBottom: "6px",
            }}
          >
            {sec.name}
          </div>
          {sec.tasks.length === 0 && (
            <div style={{ fontSize: "13px", color: "#6a6a72", fontStyle: "italic" }}>—</div>
          )}
          {sec.tasks.map((t) => (
            <div
              key={t.line}
              onClick={() => toggle(t.line)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                fontSize: "13.5px",
                lineHeight: "1.45",
                marginBottom: "3px",
                opacity: t.done ? 0.45 : 1,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <span style={{ color: t.done ? "#7bd88f" : "#5b8def" }}>
                {t.done ? "☑" : "☐"}
              </span>
              <span style={{ textDecoration: t.done ? "line-through" : "none" }}>
                {t.text}
              </span>
            </div>
          ))}
        </div>
      ))}

      <div
        onClick={addTask}
        style={{
          marginTop: "6px",
          padding: "7px 10px",
          fontSize: "13px",
          color: "#9aa7c7",
          background: "rgba(255,255,255,0.06)",
          border: "1px dashed rgba(255,255,255,0.18)",
          borderRadius: "9px",
          textAlign: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        + add task
      </div>

      <div style={{ fontSize: "10.5px", color: "#5a5a62", marginTop: "8px", textAlign: "right" }}>
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
};
