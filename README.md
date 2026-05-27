# desktop-todo-widget

A clickable to-do dashboard that lives on your macOS desktop wallpaper, powered by
[Übersicht](https://tracesof.net/uebersicht/). Your tasks are stored in a plain
markdown file — edit it in any editor, or interact with the widget directly:

- **Click a task** to toggle it done / undone.
- **Click "+ add task"** for a native dialog to add one (with section picker).
- The widget auto-refreshes every ~2 seconds, so external edits show up on their own.

![A frosted-glass card on the desktop showing a title, progress bar, and grouped tasks.](#)

## How it works

| Piece | Path | Role |
| --- | --- | --- |
| Data file | `~/Documents/Dashboard/todo.md` | Single source of truth (markdown) |
| Helper | `~/Documents/Dashboard/todo.py` | Toggles/adds tasks; called by the widget |
| Widget | `~/Library/Application Support/Übersicht/widgets/todo.widget/index.jsx` | Renders the file and wires up clicks |

The markdown format is just headers and checkboxes:

```markdown
## Today
- [ ] An open task
- [x] A completed task
```

`## Section` headers group tasks. Any non-task line (including HTML comments) is ignored.

## Install

**Requirements:** macOS, [Übersicht](https://tracesof.net/uebersicht/)
(`brew install --cask ubersicht`), and `python3` (`python3 --version`).

### Quick install

```sh
git clone https://github.com/B0bTheSkull/desktop-todo-widget.git
cd desktop-todo-widget
./install.sh
```

Then launch/refresh Übersicht (`open -a "Übersicht"`). The widget appears in the
top-right of your desktop.

### Manual install

1. Copy `bin/todo.py` and `examples/todo.md` into `~/Documents/Dashboard/`.
2. Copy `widget/todo.widget/` into `~/Library/Application Support/Übersicht/widgets/`.
3. Open Übersicht.

The installer never overwrites an existing `todo.md`, so your tasks are safe on re-install.

## Customizing

- **Position / colors:** edit the inline styles in `index.jsx` (`top`/`right` in
  `className`, and the `style` objects in `render`).
- **Refresh rate:** change `refreshFrequency` (milliseconds) in `index.jsx`.
- **Data location:** the path `~/Documents/Dashboard/todo.md` is referenced in both
  `index.jsx` (`TODO`/`PY`) and `todo.py` (`TODO`). Change both to relocate it.

## Notes

- Übersicht widgets render at the desktop level (behind app windows), so click the
  widget when the desktop is visible (e.g. "Show Desktop").
- The add dialog is shown via `osascript`/System Events so it comes to the front.

## License

MIT — see [LICENSE](LICENSE).
