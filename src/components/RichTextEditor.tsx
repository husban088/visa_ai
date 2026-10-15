"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eraser,
  Highlighter,
  Palette,
} from "lucide-react";

const FONTS = [
  "Inter",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
  "Garamond",
  "Palatino",
  "Comic Sans MS",
];
const SIZES = [
  { label: "Tiny", v: "1" },
  { label: "Small", v: "2" },
  { label: "Normal", v: "3" },
  { label: "Medium", v: "4" },
  { label: "Large", v: "5" },
  { label: "X-Large", v: "6" },
  { label: "Huge", v: "7" },
];

const btn =
  "flex h-9 w-9 items-center justify-center rounded-lg text-steel transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:text-white";

function Btn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={btn}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const saved = useRef<Range | null>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value)
      ref.current.innerHTML = value;
    // set initial content once only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) {
      saved.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restore = () => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (saved.current && sel) {
      sel.removeAllRanges();
      sel.addRange(saved.current);
    }
  };

  const emit = () => onChange(ref.current?.innerHTML ?? "");

  const exec = (cmd: string, val?: string) => {
    restore();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, val);
    emit();
    save();
  };

  const sel =
    "h-9 rounded-lg border border-ink-3 bg-white px-2 text-xs text-[var(--foreground)] outline-none transition-colors hover:border-gold focus:border-gold";

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-3 bg-white shadow-sm transition-shadow focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(210,31,31,0.08)]">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-ink-3 bg-paper px-3 py-2">
        <select
          aria-label="Font family"
          className={sel}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) exec("fontName", e.target.value);
            e.target.value = "";
          }}
        >
          <option value="" disabled>
            Font
          </option>
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          aria-label="Font size"
          className={sel}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) exec("fontSize", e.target.value);
            e.target.value = "";
          }}
        >
          <option value="" disabled>
            Size
          </option>
          {SIZES.map((s) => (
            <option key={s.v} value={s.v}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="mx-1 h-6 w-px bg-ink-3" />
        <Btn label="Bold" onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn label="Italic" onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn label="Underline" onClick={() => exec("underline")}>
          <Underline className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-6 w-px bg-ink-3" />
        <label title="Text color" className={`${btn} relative cursor-pointer`}>
          <Palette className="h-4 w-4" />
          <input
            type="color"
            aria-label="Text color"
            defaultValue="#d21f1f"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(e) => exec("foreColor", e.target.value)}
          />
        </label>
        <label
          title="Highlight color"
          className={`${btn} relative cursor-pointer`}
        >
          <Highlighter className="h-4 w-4" />
          <input
            type="color"
            aria-label="Highlight color"
            defaultValue="#fde68a"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(e) => exec("hiliteColor", e.target.value)}
          />
        </label>
        <span className="mx-1 h-6 w-px bg-ink-3" />
        <Btn label="Align left" onClick={() => exec("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
        </Btn>
        <Btn label="Align center" onClick={() => exec("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
        </Btn>
        <Btn label="Align right" onClick={() => exec("justifyRight")}>
          <AlignRight className="h-4 w-4" />
        </Btn>
        <Btn label="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </Btn>
        <Btn label="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn label="Clear formatting" onClick={() => exec("removeFormat")}>
          <Eraser className="h-4 w-4" />
        </Btn>
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        className="rte-area rte-content min-h-[220px] max-h-[480px] overflow-y-auto px-5 py-4 text-sm leading-relaxed text-[var(--foreground)] outline-none"
        onInput={emit}
        onKeyUp={save}
        onMouseUp={save}
        onBlur={() => {
          save();
          emit();
        }}
      />
    </div>
  );
}
