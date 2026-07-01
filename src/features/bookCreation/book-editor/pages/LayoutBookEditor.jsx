/* eslint-disable no-unused-vars, react-hooks/static-components, react-hooks/refs */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  ImageIcon,
  Italic,
  Layers,
  Layers2,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Strikethrough,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Wand2,
  X,
} from "lucide-react";

import {
  BOOK_TYPES,
  ELEMENT_TYPES,
  LAYOUT_TYPES,
  PAGE_HEIGHT,
  PAGE_TYPES,
  PAGE_WIDTH,
  cloneData,
  createCoverPage,
  createImageElement,
  createInfoImageLeftPage,
  createInfoProductOverviewPage,
  createInitialPages,
  createNewPageByBookType,
  createPoemOverlayPage,
  createPoemTopImagePage,
  createTextElement,
} from "../data/editorTemplates";

import "./LayoutBookEditor.css";

function getBodyPageNumber(pages, pageIndex) {
  return pages
    .slice(0, pageIndex + 1)
    .filter((page) => page.pageType !== PAGE_TYPES.COVER).length;
}

function getBodyPageCount(pages) {
  return pages.filter((page) => page.pageType !== PAGE_TYPES.COVER).length;
}

function getPageThumbnailImage(page) {
  return page.elements.find((element) => element.type === ELEMENT_TYPES.IMAGE);
}

function sortElements(elements) {
  return [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
}

function Toolbar({
  selectedElement,
  activeEditor,
  onAddText,
  onAddImage,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onOpenPreview,
  onTextStyleChange,
}) {
  const isTextSelected = selectedElement?.type === ELEMENT_TYPES.TEXT;
  const hasSelected = Boolean(selectedElement);

  const runEditorCommand = (command) => (event) => {
    event.preventDefault();

    if (!activeEditor || !isTextSelected) return;

    command();
  };

  const applyAlign = (align) => {
    if (activeEditor && isTextSelected) {
      activeEditor.chain().focus().setTextAlign(align).run();
    }

    if (isTextSelected) {
      onTextStyleChange({ align });
    }
  };

  return (
    <section className="layout-editor-toolbar" onMouseDown={(event) => event.stopPropagation()}>
      <button type="button" className="layout-tool-btn primary-soft" onClick={onAddText}>
        <Type size={15} />
        텍스트 추가
      </button>

      <button type="button" className="layout-tool-btn primary-soft" onClick={onAddImage}>
        <ImageIcon size={15} />
        이미지 추가
      </button>

      <div className="layout-toolbar-divider" />

      <button
        type="button"
        disabled={!isTextSelected}
        className={`layout-icon-btn ${activeEditor?.isActive("bold") ? "active" : ""}`}
        onMouseDown={runEditorCommand(() => activeEditor.chain().focus().toggleBold().run())}
        title="굵게"
      >
        <Bold size={15} />
      </button>

      <button
        type="button"
        disabled={!isTextSelected}
        className={`layout-icon-btn ${activeEditor?.isActive("italic") ? "active" : ""}`}
        onMouseDown={runEditorCommand(() => activeEditor.chain().focus().toggleItalic().run())}
        title="기울임"
      >
        <Italic size={15} />
      </button>

      <button
        type="button"
        disabled={!isTextSelected}
        className={`layout-icon-btn ${activeEditor?.isActive("underline") ? "active" : ""}`}
        onMouseDown={runEditorCommand(() => activeEditor.chain().focus().toggleUnderline().run())}
        title="밑줄"
      >
        <UnderlineIcon size={15} />
      </button>

      <button
        type="button"
        disabled={!isTextSelected}
        className={`layout-icon-btn ${activeEditor?.isActive("strike") ? "active" : ""}`}
        onMouseDown={runEditorCommand(() => activeEditor.chain().focus().toggleStrike().run())}
        title="취소선"
      >
        <Strikethrough size={15} />
      </button>

      <div className="layout-toolbar-divider" />

      <button
        type="button"
        disabled={!isTextSelected}
        className="layout-icon-btn"
        onMouseDown={(event) => {
          event.preventDefault();
          applyAlign("left");
        }}
        title="왼쪽 정렬"
      >
        <AlignLeft size={15} />
      </button>

      <button
        type="button"
        disabled={!isTextSelected}
        className="layout-icon-btn"
        onMouseDown={(event) => {
          event.preventDefault();
          applyAlign("center");
        }}
        title="가운데 정렬"
      >
        <AlignCenter size={15} />
      </button>

      <button
        type="button"
        disabled={!isTextSelected}
        className="layout-icon-btn"
        onMouseDown={(event) => {
          event.preventDefault();
          applyAlign("right");
        }}
        title="오른쪽 정렬"
      >
        <AlignRight size={15} />
      </button>

      <div className="layout-toolbar-divider" />

      <select
        className="layout-select"
        disabled={!isTextSelected}
        value={selectedElement?.fontSize || 20}
        onChange={(event) => onTextStyleChange({ fontSize: Number(event.target.value) })}
      >
        <option value="12">12px</option>
        <option value="14">14px</option>
        <option value="16">16px</option>
        <option value="18">18px</option>
        <option value="20">20px</option>
        <option value="24">24px</option>
        <option value="28">28px</option>
        <option value="32">32px</option>
        <option value="36">36px</option>
      </select>

      <input
        disabled={!isTextSelected}
        className="layout-color-input"
        type="color"
        value={selectedElement?.color || "#2f2d59"}
        onChange={(event) => onTextStyleChange({ color: event.target.value })}
        title="글자 색상"
      />

      <div className="layout-toolbar-divider" />

      <button
        type="button"
        disabled={!hasSelected}
        className="layout-icon-btn"
        onClick={onBringForward}
        title="앞으로 가져오기"
      >
        <Layers size={15} />
      </button>

      <button
        type="button"
        disabled={!hasSelected}
        className="layout-icon-btn"
        onClick={onSendBackward}
        title="뒤로 보내기"
      >
        <Layers2 size={15} />
      </button>

      <button
        type="button"
        disabled={!hasSelected}
        className="layout-icon-btn"
        onClick={onDuplicateElement}
        title="요소 복제"
      >
        <Copy size={15} />
      </button>

      <button
        type="button"
        disabled={!hasSelected}
        className="layout-icon-btn danger"
        onClick={onDeleteElement}
        title="요소 삭제"
      >
        <Trash2 size={15} />
      </button>

      <div className="layout-toolbar-spacer" />

      <button type="button" className="layout-tool-btn preview" onClick={onOpenPreview}>
        <Eye size={15} />
        미리보기
      </button>
    </section>
  );
}

function PageThumbnail({ page, index, active, onClick }) {
  const thumbnailImage = getPageThumbnailImage(page);
  const isCover = page.pageType === PAGE_TYPES.COVER;

  return (
    <button
      type="button"
      className={`layout-page-thumb ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="layout-page-thumb-preview">
        {thumbnailImage && <img src={thumbnailImage.src} alt="" draggable={false} />}

        <span className="layout-page-thumb-badge">
          {isCover ? <BookOpen size={12} /> : index}
        </span>
      </div>

      <span className="layout-page-thumb-title">{page.title}</span>
    </button>
  );
}

function EditableTextElement({
  element,
  selected,
  onSelect,
  onChange,
  onEditorReady,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: element.html,
    editable: true,
    onUpdate: ({ editor }) => {
      onChange({
        html: editor.getHTML(),
      });
    },
    onSelectionUpdate: ({ editor }) => {
      onEditorReady(editor, element.id);
    },
    onTransaction: ({ editor }) => {
      onEditorReady(editor, element.id);
    },
    editorProps: {
      attributes: {
        class: "layout-editor-prose",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (!editor.isFocused && element.html !== editor.getHTML()) {
      editor.commands.setContent(element.html || "<p></p>", false);
    }
  }, [editor, element.html]);

  useEffect(() => {
    if (!editor) return;
    onEditorReady(editor, element.id);
  }, [editor, element.id, onEditorReady]);

  return (
    <Rnd
      position={{
        x: element.x,
        y: element.y,
      }}
      size={{
        width: element.w,
        height: element.h,
      }}
      bounds="parent"
      enableResizing={!element.locked}
      disableDragging={element.locked}
      cancel=".layout-editor-text-content"
      onMouseDown={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDragStop={(_, data) => {
        onChange({
          x: data.x,
          y: data.y,
        });
      }}
      onResizeStop={(_, __, ref, ___, position) => {
        onChange({
          x: position.x,
          y: position.y,
          w: parseInt(ref.style.width, 10),
          h: parseInt(ref.style.height, 10),
        });
      }}
      className={`layout-rnd ${selected ? "selected" : ""}`}
      style={{
        zIndex: selected ? 999 : element.zIndex || 10,
      }}
    >
      <div
        className="layout-text-element"
        style={{
          fontSize: `${element.fontSize || 20}px`,
          lineHeight: element.lineHeight || 1.6,
          color: element.color || "#222222",
          backgroundColor: element.backgroundColor || "transparent",
          textAlign: element.align || "left",
          fontWeight: element.fontWeight || 500,
          opacity: element.opacity ?? 1,
        }}
      >
        <EditorContent className="layout-editor-text-content" editor={editor} />

        {selected && (
          <>
            <span className="layout-handle-dot top-left" />
            <span className="layout-handle-dot top-right" />
            <span className="layout-handle-dot bottom-left" />
            <span className="layout-handle-dot bottom-right" />
          </>
        )}
      </div>
    </Rnd>
  );
}

function EditableImageElement({
  element,
  selected,
  onSelect,
  onChange,
  onReplaceImage,
}) {
  return (
    <Rnd
      position={{
        x: element.x,
        y: element.y,
      }}
      size={{
        width: element.w,
        height: element.h,
      }}
      bounds="parent"
      enableResizing={!element.locked}
      disableDragging={element.locked}
      onMouseDown={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDragStop={(_, data) => {
        onChange({
          x: data.x,
          y: data.y,
        });
      }}
      onResizeStop={(_, __, ref, ___, position) => {
        onChange({
          x: position.x,
          y: position.y,
          w: parseInt(ref.style.width, 10),
          h: parseInt(ref.style.height, 10),
        });
      }}
      className={`layout-rnd ${selected ? "selected" : ""}`}
      style={{
        zIndex: selected ? 999 : element.zIndex || 5,
      }}
    >
      <div
        className="layout-image-element"
        style={{
          borderRadius: `${element.radius || 0}px`,
          opacity: element.opacity ?? 1,
        }}
      >
        <img
          src={element.src}
          alt=""
          draggable={false}
          referrerPolicy="no-referrer"
          style={{
            objectFit: element.objectFit || "cover",
          }}
        />

        {selected && (
          <button
            type="button"
            className="layout-image-change-btn"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={onReplaceImage}
          >
            <ImageIcon size={12} />
            이미지 변경
          </button>
        )}

        {selected && (
          <>
            <span className="layout-handle-dot top-left" />
            <span className="layout-handle-dot top-right" />
            <span className="layout-handle-dot bottom-left" />
            <span className="layout-handle-dot bottom-right" />
          </>
        )}
      </div>
    </Rnd>
  );
}

function EditorCanvas({
  page,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onEditorReady,
  onReplaceImage,
}) {
  const elements = useMemo(() => sortElements(page.elements), [page.elements]);

  return (
    <div
      className="layout-canvas"
      style={{
        backgroundColor: page.backgroundColor || "#ffffff",
      }}
    >
      {elements.map((element) => {
        if (element.type === ELEMENT_TYPES.TEXT) {
          return (
            <EditableTextElement
              key={element.id}
              element={element}
              selected={selectedElementId === element.id}
              onSelect={() => onSelectElement(element.id)}
              onChange={(patch) => onUpdateElement(element.id, patch)}
              onEditorReady={onEditorReady}
            />
          );
        }

        if (element.type === ELEMENT_TYPES.IMAGE) {
          return (
            <EditableImageElement
              key={element.id}
              element={element}
              selected={selectedElementId === element.id}
              onSelect={() => onSelectElement(element.id)}
              onChange={(patch) => onUpdateElement(element.id, patch)}
              onReplaceImage={() => onReplaceImage(element.id)}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

function TemplateSelector({
  bookType,
  page,
  onApplyTemplate,
}) {
  const isCover = page.pageType === PAGE_TYPES.COVER;

  if (isCover) {
    return (
      <div className="layout-template-box">
        <strong>템플릿</strong>

        <button
          type="button"
          className="layout-template-btn active"
          onClick={() => onApplyTemplate(LAYOUT_TYPES.COVER_BASIC)}
        >
          기본 표지
        </button>
      </div>
    );
  }

  if (bookType === BOOK_TYPES.POEM) {
    return (
      <div className="layout-template-box">
        <strong>템플릿</strong>

        <button
          type="button"
          className={`layout-template-btn ${
            page.layoutType === LAYOUT_TYPES.POEM_IMAGE_OVERLAY ? "active" : ""
          }`}
          onClick={() => onApplyTemplate(LAYOUT_TYPES.POEM_IMAGE_OVERLAY)}
        >
          이미지 위 시 배치
        </button>

        <button
          type="button"
          className={`layout-template-btn ${
            page.layoutType === LAYOUT_TYPES.POEM_TOP_IMAGE_BOTTOM_TEXT ? "active" : ""
          }`}
          onClick={() => onApplyTemplate(LAYOUT_TYPES.POEM_TOP_IMAGE_BOTTOM_TEXT)}
        >
          상단 이미지 + 하단 시
        </button>
      </div>
    );
  }

  return (
    <div className="layout-template-box">
      <strong>템플릿</strong>

      <button
        type="button"
        className={`layout-template-btn ${
          page.layoutType === LAYOUT_TYPES.INFO_PRODUCT_OVERVIEW ? "active" : ""
        }`}
        onClick={() => onApplyTemplate(LAYOUT_TYPES.INFO_PRODUCT_OVERVIEW)}
      >
        제품 개요형
      </button>

      <button
        type="button"
        className={`layout-template-btn ${
          page.layoutType === LAYOUT_TYPES.INFO_IMAGE_LEFT_TEXT_RIGHT ? "active" : ""
        }`}
        onClick={() => onApplyTemplate(LAYOUT_TYPES.INFO_IMAGE_LEFT_TEXT_RIGHT)}
      >
        왼쪽 이미지 + 오른쪽 설명
      </button>
    </div>
  );
}

function PropertyPanel({
  bookType,
  page,
  selectedElement,
  activeEditor,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onClose,
  onReplaceImage,
  onApplyTemplate,
  onUpdatePage,
}) {
  const isText = selectedElement?.type === ELEMENT_TYPES.TEXT;
  const isImage = selectedElement?.type === ELEMENT_TYPES.IMAGE;

  const patchSelected = (patch) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, patch);
  };

  const toggleMark = (mark) => {
    if (!activeEditor || !isText) return;

    if (mark === "bold") {
      activeEditor.chain().focus().toggleBold().run();
    }

    if (mark === "italic") {
      activeEditor.chain().focus().toggleItalic().run();
    }

    if (mark === "underline") {
      activeEditor.chain().focus().toggleUnderline().run();
    }

    if (mark === "strike") {
      activeEditor.chain().focus().toggleStrike().run();
    }
  };

  const NumberField = ({ label, value, onChange, min = 0, max }) => (
    <label className="layout-field">
      <span>{label}</span>
      <input
        type="number"
        value={value ?? 0}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );

  return (
    <aside className="layout-property-panel" onMouseDown={(event) => event.stopPropagation()}>
      <div className="layout-panel-head">
        <div>
          <h3>속성 패널</h3>
          <p>{selectedElement ? "선택한 요소를 조정하세요" : "페이지 또는 템플릿을 설정하세요"}</p>
        </div>

        {selectedElement && (
          <button type="button" className="layout-panel-close" onClick={onClose}>
            <X size={15} />
          </button>
        )}
      </div>

      {!selectedElement && (
        <>
          <div className="layout-selected-label">
            <Palette size={15} />
            페이지 설정
          </div>

          <label className="layout-field full">
            <span>페이지 배경색</span>
            <input
              type="color"
              value={page.backgroundColor || "#ffffff"}
              onChange={(event) => onUpdatePage({ backgroundColor: event.target.value })}
            />
          </label>

          <TemplateSelector
            bookType={bookType}
            page={page}
            onApplyTemplate={onApplyTemplate}
          />

          <div className="layout-empty-panel">
            <strong>요소 선택 없음</strong>
            <p>
              가운데 캔버스에서 텍스트나 이미지를 클릭하면 위치, 크기, 색상, 이미지 URL을 수정할 수 있어요.
            </p>
          </div>
        </>
      )}

      {isText && (
        <div className="layout-panel-section">
          <div className="layout-selected-label">
            <Type size={15} />
            텍스트 설정
          </div>

          <div className="layout-field-grid">
            <NumberField label="X" value={selectedElement.x} onChange={(value) => patchSelected({ x: value })} />
            <NumberField label="Y" value={selectedElement.y} onChange={(value) => patchSelected({ y: value })} />
            <NumberField label="W" value={selectedElement.w} onChange={(value) => patchSelected({ w: value })} />
            <NumberField label="H" value={selectedElement.h} onChange={(value) => patchSelected({ h: value })} />
          </div>

          <div className="layout-style-row">
            <button
              type="button"
              className={activeEditor?.isActive("bold") ? "active" : ""}
              onMouseDown={(event) => {
                event.preventDefault();
                toggleMark("bold");
              }}
            >
              <Bold size={15} />
            </button>

            <button
              type="button"
              className={activeEditor?.isActive("italic") ? "active" : ""}
              onMouseDown={(event) => {
                event.preventDefault();
                toggleMark("italic");
              }}
            >
              <Italic size={15} />
            </button>

            <button
              type="button"
              className={activeEditor?.isActive("underline") ? "active" : ""}
              onMouseDown={(event) => {
                event.preventDefault();
                toggleMark("underline");
              }}
            >
              <UnderlineIcon size={15} />
            </button>

            <button
              type="button"
              className={activeEditor?.isActive("strike") ? "active" : ""}
              onMouseDown={(event) => {
                event.preventDefault();
                toggleMark("strike");
              }}
            >
              <Strikethrough size={15} />
            </button>
          </div>

          <label className="layout-field full">
            <span>글자 크기</span>
            <select
              value={selectedElement.fontSize || 20}
              onChange={(event) => patchSelected({ fontSize: Number(event.target.value) })}
            >
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
              <option value="24">24px</option>
              <option value="28">28px</option>
              <option value="32">32px</option>
              <option value="36">36px</option>
            </select>
          </label>

          <label className="layout-field full">
            <span>줄 간격</span>
            <select
              value={selectedElement.lineHeight || 1.6}
              onChange={(event) => patchSelected({ lineHeight: Number(event.target.value) })}
            >
              <option value="1.2">1.2</option>
              <option value="1.4">1.4</option>
              <option value="1.6">1.6</option>
              <option value="1.8">1.8</option>
              <option value="2">2.0</option>
            </select>
          </label>

          <label className="layout-field full">
            <span>글자 색상</span>
            <input
              type="color"
              value={selectedElement.color || "#222222"}
              onChange={(event) => patchSelected({ color: event.target.value })}
            />
          </label>

          <label className="layout-field full">
            <span>텍스트 배경색</span>
            <input
              type="color"
              value={
                selectedElement.backgroundColor === "transparent"
                  ? "#ffffff"
                  : selectedElement.backgroundColor || "#ffffff"
              }
              onChange={(event) => patchSelected({ backgroundColor: event.target.value })}
            />
          </label>

          <div className="layout-align-row">
            <button type="button" onClick={() => patchSelected({ align: "left" })}>
              <AlignLeft size={15} />
            </button>
            <button type="button" onClick={() => patchSelected({ align: "center" })}>
              <AlignCenter size={15} />
            </button>
            <button type="button" onClick={() => patchSelected({ align: "right" })}>
              <AlignRight size={15} />
            </button>
          </div>

          <div className="layout-action-row">
            <button type="button" onClick={onDuplicateElement}>
              <Copy size={14} />
              복제
            </button>

            <button type="button" className="danger" onClick={onDeleteElement}>
              <Trash2 size={14} />
              삭제
            </button>
          </div>
        </div>
      )}

      {isImage && (
        <div className="layout-panel-section">
          <div className="layout-selected-label">
            <ImageIcon size={15} />
            이미지 설정
          </div>

          <div className="layout-field-grid">
            <NumberField label="X" value={selectedElement.x} onChange={(value) => patchSelected({ x: value })} />
            <NumberField label="Y" value={selectedElement.y} onChange={(value) => patchSelected({ y: value })} />
            <NumberField label="W" value={selectedElement.w} onChange={(value) => patchSelected({ w: value })} />
            <NumberField label="H" value={selectedElement.h} onChange={(value) => patchSelected({ h: value })} />
          </div>

          <label className="layout-field full">
            <span>이미지 URL</span>
            <input
              type="text"
              value={selectedElement.src || ""}
              onChange={(event) => patchSelected({ src: event.target.value })}
            />
          </label>

          <label className="layout-field full">
            <span>모서리 둥글기</span>
            <input
              type="range"
              min="0"
              max="60"
              value={selectedElement.radius || 0}
              onChange={(event) => patchSelected({ radius: Number(event.target.value) })}
            />
          </label>

          <label className="layout-field full">
            <span>투명도</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={selectedElement.opacity ?? 1}
              onChange={(event) => patchSelected({ opacity: Number(event.target.value) })}
            />
          </label>

          <label className="layout-field full">
            <span>이미지 맞춤</span>
            <select
              value={selectedElement.objectFit || "cover"}
              onChange={(event) => patchSelected({ objectFit: event.target.value })}
            >
              <option value="cover">cover</option>
              <option value="contain">contain</option>
              <option value="fill">fill</option>
            </select>
          </label>

          <button type="button" className="layout-wide-btn" onClick={() => onReplaceImage(selectedElement.id)}>
            <ImageIcon size={15} />
            이미지 교체
          </button>

          <button type="button" className="layout-wide-btn ghost">
            <Wand2 size={15} />
            AI 이미지 생성
          </button>

          <div className="layout-action-row">
            <button type="button" onClick={onDuplicateElement}>
              <Copy size={14} />
              복제
            </button>

            <button type="button" className="danger" onClick={onDeleteElement}>
              <Trash2 size={14} />
              삭제
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function PreviewModal({ pages, initialIndex, onClose }) {
  const [previewIndex, setPreviewIndex] = useState(initialIndex);
  const page = pages[previewIndex];

  const bodyPageCount = getBodyPageCount(pages);
  const bodyPageNumber = page.pageType === PAGE_TYPES.COVER
    ? 0
    : getBodyPageNumber(pages, previewIndex);

  const goPrev = useCallback(() => {
    setPreviewIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setPreviewIndex((prev) => Math.min(pages.length - 1, prev + 1));
  }, [pages.length]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goPrev, goNext, onClose]);

  const renderPreviewElement = (element) => {
    if (element.type === ELEMENT_TYPES.IMAGE) {
      return (
        <div
          key={element.id}
          className="layout-preview-image"
          style={{
            left: element.x,
            top: element.y,
            width: element.w,
            height: element.h,
            borderRadius: `${element.radius || 0}px`,
            opacity: element.opacity ?? 1,
            zIndex: element.zIndex || 1,
          }}
        >
          <img
            src={element.src}
            alt=""
            draggable={false}
            style={{
              objectFit: element.objectFit || "cover",
            }}
          />
        </div>
      );
    }

    if (element.type === ELEMENT_TYPES.TEXT) {
      return (
        <div
          key={element.id}
          className="layout-preview-text"
          style={{
            left: element.x,
            top: element.y,
            width: element.w,
            height: element.h,
            fontSize: `${element.fontSize || 20}px`,
            lineHeight: element.lineHeight || 1.6,
            color: element.color || "#222222",
            backgroundColor: element.backgroundColor || "transparent",
            textAlign: element.align || "left",
            fontWeight: element.fontWeight || 500,
            opacity: element.opacity ?? 1,
            zIndex: element.zIndex || 10,
          }}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );
    }

    return null;
  };

  return (
    <div className="layout-preview-backdrop" onMouseDown={onClose}>
      <div className="layout-preview-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="layout-preview-header">
          <div>
            <h3>미리보기</h3>
            <p>
              {page.pageType === PAGE_TYPES.COVER
                ? "표지"
                : `${bodyPageNumber} / ${bodyPageCount} 페이지`}
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="layout-preview-body">
          <button
            type="button"
            className="layout-preview-arrow left"
            disabled={previewIndex === 0}
            onClick={goPrev}
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="layout-preview-page"
            style={{
              backgroundColor: page.backgroundColor || "#ffffff",
            }}
          >
            {sortElements(page.elements).map(renderPreviewElement)}
          </div>

          <button
            type="button"
            className="layout-preview-arrow right"
            disabled={previewIndex === pages.length - 1}
            onClick={goNext}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="layout-preview-footer">
          <div className="layout-preview-dots">
            {pages.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={index === previewIndex ? "active" : ""}
                onClick={() => setPreviewIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LayoutBookEditor({ bookType = BOOK_TYPES.INFO }) {
  const [pages, setPages] = useState(() => createInitialPages(bookType));
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [savedLabel, setSavedLabel] = useState("자동 저장됨");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const activeEditorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const [, refreshToolbar] = useReducer((count) => count + 1, 0);

  const page = pages[pageIndex];
  const selectedElement = page.elements.find((element) => element.id === selectedElementId);

  const bodyPageCount = getBodyPageCount(pages);
  const bodyPageNumber = page.pageType === PAGE_TYPES.COVER
    ? 0
    : getBodyPageNumber(pages, pageIndex);

  const editorTitle = bookType === BOOK_TYPES.POEM ? "시 편집 모드" : "정보책 편집 모드";
  const editorDescription =
    bookType === BOOK_TYPES.POEM
      ? "이미지 위에 시 제목과 본문을 배치해 감성적인 시 페이지를 구성하세요."
      : "이미지와 텍스트를 자유롭게 배치해 정보 페이지를 구성하세요.";

  const markSaving = useCallback(() => {
    setSavedLabel("수정 중...");

    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      setSavedLabel("자동 저장됨");
    }, 700);
  }, []);

  const updateCurrentPage = useCallback(
    (patch) => {
      setPages((prev) =>
        prev.map((item, index) =>
          index === pageIndex ? { ...item, ...patch } : item
        )
      );

      markSaving();
    },
    [pageIndex, markSaving]
  );

  const updateElement = useCallback(
    (elementId, patch) => {
      setPages((prev) =>
        prev.map((item, index) => {
          if (index !== pageIndex) return item;

          return {
            ...item,
            elements: item.elements.map((element) =>
              element.id === elementId ? { ...element, ...patch } : element
            ),
          };
        })
      );

      markSaving();
    },
    [pageIndex, markSaving]
  );

  const handleEditorReady = useCallback(
    (editor, elementId) => {
      if (selectedElementId === elementId) {
        activeEditorRef.current = editor;
        refreshToolbar();
      }
    },
    [selectedElementId]
  );

  const handleSelectElement = useCallback((elementId) => {
    setSelectedElementId(elementId);
  }, []);

  const handleAddText = useCallback(() => {
    const newElement = createTextElement();

    setPages((prev) =>
      prev.map((item, index) => {
        if (index !== pageIndex) return item;

        return {
          ...item,
          elements: [...item.elements, newElement],
        };
      })
    );

    setSelectedElementId(newElement.id);
    markSaving();
  }, [pageIndex, markSaving]);

  const handleAddImage = useCallback(() => {
    const newElement = createImageElement();

    setPages((prev) =>
      prev.map((item, index) => {
        if (index !== pageIndex) return item;

        return {
          ...item,
          elements: [...item.elements, newElement],
        };
      })
    );

    setSelectedElementId(newElement.id);
    markSaving();
  }, [pageIndex, markSaving]);

  const handleDeleteElement = useCallback(() => {
    if (!selectedElementId) return;

    setPages((prev) =>
      prev.map((item, index) => {
        if (index !== pageIndex) return item;

        return {
          ...item,
          elements: item.elements.filter((element) => element.id !== selectedElementId),
        };
      })
    );

    setSelectedElementId(null);
    activeEditorRef.current = null;
    markSaving();
  }, [pageIndex, selectedElementId, markSaving]);

  const handleDuplicateElement = useCallback(() => {
    if (!selectedElement) return;

    const duplicated = {
      ...cloneData(selectedElement),
      id: `${selectedElement.type}-${Date.now()}`,
      x: selectedElement.x + 18,
      y: selectedElement.y + 18,
      zIndex: (selectedElement.zIndex || 10) + 1,
    };

    setPages((prev) =>
      prev.map((item, index) => {
        if (index !== pageIndex) return item;

        return {
          ...item,
          elements: [...item.elements, duplicated],
        };
      })
    );

    setSelectedElementId(duplicated.id);
    markSaving();
  }, [pageIndex, selectedElement, markSaving]);

  const handleBringForward = useCallback(() => {
    if (!selectedElement) return;

    updateElement(selectedElement.id, {
      zIndex: (selectedElement.zIndex || 10) + 1,
    });
  }, [selectedElement, updateElement]);

  const handleSendBackward = useCallback(() => {
    if (!selectedElement) return;

    updateElement(selectedElement.id, {
      zIndex: Math.max(1, (selectedElement.zIndex || 10) - 1),
    });
  }, [selectedElement, updateElement]);

  const handleReplaceImage = useCallback(
    (targetElementId = selectedElementId) => {
      const target = page.elements.find((element) => element.id === targetElementId);

      if (!target || target.type !== ELEMENT_TYPES.IMAGE) return;

      const url = window.prompt("새 이미지 URL을 입력하세요", target.src);

      if (!url) return;

      updateElement(target.id, {
        src: url,
      });

      setSelectedElementId(target.id);
    },
    [page.elements, selectedElementId, updateElement]
  );

  const handleApplyTemplate = useCallback(
    (layoutType) => {
      const bodyPageNumberForTemplate =
        page.pageType === PAGE_TYPES.COVER ? 1 : getBodyPageNumber(pages, pageIndex);

      let nextPage;

      if (layoutType === LAYOUT_TYPES.COVER_BASIC) {
        nextPage = createCoverPage();
      }

      if (layoutType === LAYOUT_TYPES.POEM_IMAGE_OVERLAY) {
        nextPage = createPoemOverlayPage(bodyPageNumberForTemplate);
      }

      if (layoutType === LAYOUT_TYPES.POEM_TOP_IMAGE_BOTTOM_TEXT) {
        nextPage = createPoemTopImagePage(bodyPageNumberForTemplate);
      }

      if (layoutType === LAYOUT_TYPES.INFO_PRODUCT_OVERVIEW) {
        nextPage = createInfoProductOverviewPage(bodyPageNumberForTemplate);
      }

      if (layoutType === LAYOUT_TYPES.INFO_IMAGE_LEFT_TEXT_RIGHT) {
        nextPage = createInfoImageLeftPage(bodyPageNumberForTemplate);
      }

      if (!nextPage) return;

      setPages((prev) =>
        prev.map((item, index) =>
          index === pageIndex
            ? {
                ...nextPage,
                id: item.id,
                title: item.title,
              }
            : item
        )
      );

      setSelectedElementId(null);
      activeEditorRef.current = null;
      markSaving();
    },
    [page.pageType, pageIndex, pages, markSaving]
  );

  const handleAddPage = useCallback(() => {
    const nextBodyPageNumber = getBodyPageCount(pages) + 1;
    const newPage = createNewPageByBookType(bookType, nextBodyPageNumber);

    setPages((prev) => [...prev, newPage]);
    setPageIndex(pages.length);
    setSelectedElementId(null);
    activeEditorRef.current = null;
    markSaving();
  }, [bookType, pages, markSaving]);

  const handleDuplicatePage = useCallback(() => {
    if (page.pageType === PAGE_TYPES.COVER) {
      alert("표지는 복제하지 않고, 본문 페이지만 복제할 수 있어요.");
      return;
    }

    const duplicated = {
      ...cloneData(page),
      id: `page-${Date.now()}`,
    };

    setPages((prev) => {
      const next = [...prev];
      next.splice(pageIndex + 1, 0, duplicated);

      let bodyCount = 0;

      return next.map((item) => {
        if (item.pageType === PAGE_TYPES.COVER) {
          return {
            ...item,
            title: "표지",
          };
        }

        bodyCount += 1;

        return {
          ...item,
          title: `${bodyCount} 페이지`,
        };
      });
    });

    setPageIndex(pageIndex + 1);
    setSelectedElementId(null);
    activeEditorRef.current = null;
    markSaving();
  }, [page, pageIndex, markSaving]);

  const handleResetPage = useCallback(() => {
    const initialPages = createInitialPages(bookType);
    const matched = initialPages[pageIndex] || initialPages[0];

    setPages((prev) =>
      prev.map((item, index) =>
        index === pageIndex
          ? {
              ...cloneData(matched),
              id: item.id,
              title: item.title,
            }
          : item
      )
    );

    setSelectedElementId(null);
    activeEditorRef.current = null;
    setSavedLabel("초기화됨");
  }, [bookType, pageIndex]);

  const handleSave = useCallback(() => {
    console.log("저장할 레이아웃 에디터 데이터:", pages);
    setSavedLabel("저장 완료");
  }, [pages]);

  const goPrev = () => {
    setPageIndex((prev) => Math.max(0, prev - 1));
    setSelectedElementId(null);
    activeEditorRef.current = null;
  };

  const goNext = () => {
    setPageIndex((prev) => Math.min(pages.length - 1, prev + 1));
    setSelectedElementId(null);
    activeEditorRef.current = null;
  };

  return (
    <div
      className="layout-editor-page"
      onMouseDown={() => {
        setSelectedElementId(null);
      }}
    >
      <header className="layout-editor-header">
        <div>
          <h2>{editorTitle}</h2>
          <p>{editorDescription}</p>
        </div>

        <div className="layout-header-actions">
          <span className="layout-save-state">{savedLabel}</span>

          <button type="button" className="layout-header-btn" onClick={handleResetPage}>
            <RotateCcw size={16} />
            초기화
          </button>

          <button type="button" className="layout-header-btn save" onClick={handleSave}>
            <Save size={16} />
            저장
          </button>
        </div>
      </header>

      <Toolbar
        selectedElement={selectedElement}
        activeEditor={activeEditorRef.current}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onDeleteElement={handleDeleteElement}
        onDuplicateElement={handleDuplicateElement}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onTextStyleChange={(patch) => {
          if (!selectedElement) return;
          updateElement(selectedElement.id, patch);
        }}
      />

      <main className="layout-editor-workspace">
        <aside className="layout-page-sidebar" onMouseDown={(event) => event.stopPropagation()}>
          <div className="layout-sidebar-head">
            <h3>페이지</h3>

            <button type="button" onClick={handleAddPage}>
              <Plus size={14} />
            </button>
          </div>

          <div className="layout-page-list">
            {pages.map((item, index) => (
              <PageThumbnail
                key={item.id}
                page={item}
                index={index}
                active={index === pageIndex}
                onClick={() => {
                  setPageIndex(index);
                  setSelectedElementId(null);
                  activeEditorRef.current = null;
                }}
              />
            ))}
          </div>

          <button type="button" className="layout-duplicate-page-btn" onClick={handleDuplicatePage}>
            <Copy size={14} />
            현재 페이지 복제
          </button>
        </aside>

        <section className="layout-canvas-area">
          {selectedElement && (
            <div className="layout-selected-notice" onMouseDown={(event) => event.stopPropagation()}>
              {selectedElement.type === ELEMENT_TYPES.TEXT ? (
                <Type size={16} />
              ) : (
                <ImageIcon size={16} />
              )}

              <span>
                {selectedElement.type === ELEMENT_TYPES.TEXT
                  ? "텍스트 요소 선택됨 — 위치와 크기, 글자 스타일을 조정할 수 있어요."
                  : "이미지 요소 선택됨 — 위치, 크기, 둥글기, 투명도를 조정할 수 있어요."}
              </span>

              <button type="button" onClick={() => setSelectedElementId(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          <EditorCanvas
            page={page}
            selectedElementId={selectedElementId}
            onSelectElement={handleSelectElement}
            onUpdateElement={updateElement}
            onEditorReady={handleEditorReady}
            onReplaceImage={handleReplaceImage}
          />

          <div className="layout-bottom-nav" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={goPrev} disabled={pageIndex === 0}>
              <ChevronLeft size={18} />
            </button>

            <div className="editor-page-dots">
              {pages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === pageIndex ? "active" : ""}
                  onClick={() => {
                    setPageIndex(index);
                    setSelectedElementId(null);
                    activeEditorRef.current = null;
                  }}
                />
              ))}
            </div>

            <button type="button" onClick={goNext} disabled={pageIndex === pages.length - 1}>
              <ChevronRight size={18} />
            </button>
          </div>

          <p className="editor-page-count">
            {page.pageType === PAGE_TYPES.COVER
              ? "표지"
              : `${bodyPageNumber} / ${bodyPageCount} 페이지`}
          </p>
        </section>

        <PropertyPanel
          bookType={bookType}
          page={page}
          selectedElement={selectedElement}
          activeEditor={activeEditorRef.current}
          onUpdateElement={updateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onClose={() => setSelectedElementId(null)}
          onReplaceImage={handleReplaceImage}
          onApplyTemplate={handleApplyTemplate}
          onUpdatePage={updateCurrentPage}
        />
      </main>

      {isPreviewOpen && (
        <PreviewModal
          pages={pages}
          initialIndex={pageIndex}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}


