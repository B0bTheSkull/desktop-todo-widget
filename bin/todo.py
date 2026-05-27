#!/usr/bin/env python3
"""Helper for the desktop to-do widget. Edits ~/Documents/Dashboard/todo.md.

Commands:
  toggle <line>   Flip the checkbox on 1-based line <line> ([ ] <-> [x]).
  prompt          Show native dialogs (text + section) and add a task.
"""
import os
import re
import subprocess
import sys

TODO = os.path.expanduser("~/Documents/Dashboard/todo.md")
TASK_RE = re.compile(r"^(\s*-\s*\[)( |x|X)(\]\s+.*)$")


def read():
    with open(TODO, "r", encoding="utf-8") as f:
        return f.read().split("\n")


def write(lines):
    with open(TODO, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def toggle(line_no):
    lines = read()
    i = line_no - 1
    if not (0 <= i < len(lines)):
        return
    m = TASK_RE.match(lines[i])
    if not m:
        return
    new_mark = " " if m.group(2).lower() == "x" else "x"
    lines[i] = f"{m.group(1)}{new_mark}{m.group(3)}"
    write(lines)


def osa(script):
    r = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    return r.returncode, r.stdout.strip()


def prompt():
    rc, text = osa(
        'tell application "System Events" to '
        'text returned of (display dialog "New to-do:" '
        'default answer "" with title "Add Task" buttons {"Cancel","Add"} '
        'default button "Add")'
    )
    if rc != 0 or not text.strip():
        return  # cancelled or empty
    rc, section = osa(
        'tell application "System Events" to '
        'choose from list {"Today","This Week","Later"} '
        'with title "Add Task" with prompt "Which section?" default items {"Today"}'
    )
    if rc != 0 or section in ("", "false"):
        return  # cancelled
    add(section, text.strip())


def add(section, text):
    lines = read()
    header = f"## {section}"
    # find the section header
    try:
        h = next(i for i, l in enumerate(lines) if l.strip() == header)
    except StopIteration:
        # section missing: create it before any trailing comment block / at EOF
        insert_at = next((i for i, l in enumerate(lines) if l.strip().startswith("<!--")), len(lines))
        block = [header, f"- [ ] {text}", ""]
        lines[insert_at:insert_at] = block
        write(lines)
        return
    # find end of this section's task block (next "## " or comment or EOF)
    j = h + 1
    last_task = h
    while j < len(lines):
        s = lines[j].strip()
        if s.startswith("## ") or s.startswith("<!--"):
            break
        if TASK_RE.match(lines[j]):
            last_task = j
        j += 1
    lines.insert(last_task + 1, f"- [ ] {text}")
    write(lines)


def main():
    if len(sys.argv) < 2:
        return
    cmd = sys.argv[1]
    if cmd == "toggle" and len(sys.argv) >= 3:
        try:
            toggle(int(sys.argv[2]))
        except ValueError:
            pass
    elif cmd == "prompt":
        prompt()


if __name__ == "__main__":
    main()
