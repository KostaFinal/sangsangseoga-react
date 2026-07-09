/* eslint-disable no-unused-vars, react-hooks/static-components, react-hooks/refs */
import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useReducer,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Rnd } from "react-rnd";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import HTMLFlipBook from "react-pageflip";

import fairyback from "../../assets/fairyback.png";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { toBookDraft } from "../../utils/bookDraftMapper";
import axiosInstance from "../../../../api/axios";

import {
  ChevronLeft,
  ChevronRight,
  Type,
  ImageIcon,
  EyeOff,
  Bold,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  X,
  Underline as UnderlineIcon,
  Strikethrough,
  BookOpen,
} from "lucide-react";

import "./FairytaleEditor.css";
import {
  clone,
  COVER_HEIGHT,
  COVER_WIDTH,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  SAMPLE_PAGES,
} from "../data/fairytaleEditorOptions";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const toParagraphHtml = (value = "") => {
  const text = String(value || "").trim();

  if (!text) return "<p></p>";

  return `<p>${escapeHtml(text).replaceAll("\n", "<br>")}</p>`;
};

const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .trim();

const getTitleFromState = (state) => {
  return (
    state?.title ||
    state?.fairyTaleSetting?.title ||
    state?.fairyTaleSettings?.title ||
    state?.setting?.title ||
    state?.settings?.title ||
    state?.storySeed ||
    state?.seed ||
    "나만의 동화"
  );
};

const getStoryPagesFromState = (state) => {
  const source =
    state?.fairyTalePages ||
    state?.storyPages ||
    state?.pagePlans ||
    state?.outlinePages ||
    [];

  return Array.isArray(source) ? source : [];
};

const getPageNoFromImageRow = (row, fallbackIndex) => {
  if (row?.pageNo !== undefined && row?.pageNo !== null && !Number.isNaN(Number(row.pageNo))) {
    return Number(row.pageNo);
  }

  if (!row?.page) return fallbackIndex + 1;

  const matched = String(row.page).match(/\d+/);

  return matched ? Number(matched[0]) : fallbackIndex + 1;
};

const isCoverImageRow = (row) =>
  row?.imageType === "COVER" || row?.page === "표지" || row?.page === "cover";

const getBodyTextFromStoryPage = (storyPage, imageRow, pageNo) => {
  return (
    storyPage?.bodyText ||
    storyPage?.body ||
    storyPage?.content ||
    storyPage?.summary ||
    storyPage?.text ||
    imageRow?.editText ||
    imageRow?.sceneTitle ||
    `${pageNo}페이지 본문을 입력해 주세요.`
  );
};

// bodyText의 영어 번역. 에디터 화면에는 표시하지 않고, 저장 시 content_text_en으로만 함께 보낸다.
const getBodyTextEnFromStoryPage = (storyPage) => {
  return storyPage?.bodyTextEn || storyPage?.bodyEn || "";
};

const createEditorPagesFromCreationState = (state) => {
  const pageImages = Array.isArray(state?.pageImages) ? state.pageImages : [];
  const storyPages = getStoryPagesFromState(state);

  if (pageImages.length === 0 && storyPages.length === 0) {
    return clone(SAMPLE_PAGES);
  }

  const coverImageRow = pageImages.find(isCoverImageRow) || pageImages[0];

  const bodyImageRows = pageImages.filter((row) => !isCoverImageRow(row));

  const imageStyle = state?.imageStyle || coverImageRow?.imageStyle || "";

  const pageCount =
    Number(state?.pageCount) ||
    Math.max(bodyImageRows.length, storyPages.length, 1);

  const title = getTitleFromState(state);

  const coverPage = {
    id: "cover",
    type: "cover",
    title: "표지",
    imageType: "COVER",
    imageStyle,
    cover: {
      src: coverImageRow?.image || SAMPLE_PAGES[0].cover.src,
      x: 0,
      y: 0,
      w: COVER_WIDTH,
      h: COVER_HEIGHT,
      visible: true,
    },
    text: {
      html: toParagraphHtml(title),
      x: 58,
      y: 420,
      w: 365,
      h: 90,
      fontSize: 34,
      lineHeight: 1.25,
      color: "#ffffff",
      align: "center",
      visible: true,
    },
  };

  const bodyPages = Array.from({ length: pageCount }, (_, index) => {
    const pageNo = index + 1;

    const imageRow =
      bodyImageRows.find(
        (row, rowIndex) => getPageNoFromImageRow(row, rowIndex) === pageNo
      ) || bodyImageRows[index];

    const storyPage =
      storyPages.find(
        (item) =>
          Number(item.pageNo) === pageNo ||
          Number(item.page) === pageNo ||
          Number(item.pageNumber) === pageNo
      ) || storyPages[index];

    const bodyText = getBodyTextFromStoryPage(storyPage, imageRow, pageNo);
    const bodyTextEn = getBodyTextEnFromStoryPage(storyPage);

    return {
      id: `p${pageNo}`,
      type: "spread",
      title: `${pageNo} 페이지`,
      pageNo,
      textEn: bodyTextEn,
      imageType: "PAGE",
      imageStyle: imageRow?.imageStyle || imageStyle,
      image: {
        src: imageRow?.image || SAMPLE_PAGES[1]?.image?.src,
        x: 0,
        y: 0,
        w: PAGE_WIDTH,
        h: PAGE_HEIGHT,
        visible: true,
      },
      text: {
        html: toParagraphHtml(bodyText),
        x: 40,
        y: 220,
        w: 400,
        h: 150,
        fontSize: 20,
        lineHeight: 1.6,
        color: "#2f2d59",
        align: "left",
        visible: true,
      },
    };
  });

  return [coverPage, ...bodyPages];
};

function Toolbar({
  editor,
  selectedBlock,
  onOpenPreview,
  onAddText,
  onReplaceVisual,
  onDeleteSelected,
  onTextStyleChange,
  currentFontSize,
  currentColor,
}) {
  const hasTextSelected = selectedBlock === "text" && editor;

  const run = (fn) => (e) => {
    e.preventDefault();
    if (!editor) return;
    fn();
  };

  const applyAlign = (align) => {
    if (editor) {
      editor.chain().focus().setTextAlign(align).run();
    }

    onTextStyleChange({ align });
  };

  return (
    <div className="fairy-toolbar">
      <div className="fairy-toolbar-divider" />

      <button
        type="button"
        disabled={!hasTextSelected}
        onMouseDown={run(() => editor.chain().focus().toggleBold().run())}
        className={`fairy-icon-btn ${editor?.isActive("bold") ? "active" : ""}`}
        title="굵게"
      >
        <Bold size={15} />
      </button>

      <button
        type="button"
        disabled={!hasTextSelected}
        onMouseDown={run(() => editor.chain().focus().toggleUnderline().run())}
        className={`fairy-icon-btn ${
          editor?.isActive("underline") ? "active" : ""
        }`}
        title="밑줄"
      >
        <UnderlineIcon size={15} />
      </button>

      <button
        type="button"
        disabled={!hasTextSelected}
        onMouseDown={run(() => editor.chain().focus().toggleStrike().run())}
        className={`fairy-icon-btn ${editor?.isActive("strike") ? "active" : ""}`}
        title="취소선"
      >
        <Strikethrough size={15} />
      </button>

      <div className="fairy-toolbar-divider" />

      <button
        type="button"
        disabled={!hasTextSelected}
        onMouseDown={run(() => applyAlign("left"))}
        className="fairy-icon-btn"
        title="왼쪽 정렬"
      >
        <AlignLeft size={15} />
      </button>

      <button
        type="button"
        disabled={!hasTextSelected}
        onMouseDown={run(() => applyAlign("center"))}
        className="fairy-icon-btn"
        title="가운데 정렬"
      >
        <AlignCenter size={15} />
      </button>

      <button
        type="button"
        disabled={!hasTextSelected}
        onMouseDown={run(() => applyAlign("right"))}
        className="fairy-icon-btn"
        title="오른쪽 정렬"
      >
        <AlignRight size={15} />
      </button>

      <div className="fairy-toolbar-divider" />

      <select
        disabled={!hasTextSelected}
        className="fairy-select"
        value={currentFontSize || 20}
        onChange={(e) => onTextStyleChange({ fontSize: Number(e.target.value) })}
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

      <div className="fairy-toolbar-spacer" />

      <button type="button" className="fairy-tool-btn preview" onClick={onOpenPreview}>
        <EyeOff size={15} />
        미리보기
      </button>
    </div>
  );
}

function PageThumbnail({ page, index, active, onClick }) {
  const thumbImage = page.type === "cover" ? page.cover : page.image;

  return (
    <button
      type="button"
      className={`fairy-thumb ${page.type === "cover" ? "cover-thumb" : ""} ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      <div className="fairy-thumb-preview">
        {thumbImage?.visible && (
          <img src={thumbImage.src} alt="" draggable={false} />
        )}

        <div className="fairy-thumb-text">
          {page.type === "cover" ? <BookOpen size={12} /> : index}
        </div>
      </div>

      <span>{page.title}</span>
    </button>
  );
}

function EditableTextBlock({
  data,
  onChange,
  isSelected,
  onSelect,
  onEditorReady,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: data.html,
    editable: true,
    onUpdate: ({ editor }) => {
      onChange({
        ...data,
        html: editor.getHTML(),
      });
    },
    onSelectionUpdate: ({ editor }) => {
      onEditorReady?.(editor);
    },
    onTransaction: ({ editor }) => {
      onEditorReady?.(editor);
    },
    editorProps: {
      attributes: {
        class: "fairy-editor-prose",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;

    if (!editor.isFocused && data.html !== editor.getHTML()) {
      editor.commands.setContent(data.html || "<p></p>", false);
    }
  }, [editor, data.html]);

  if (!data.visible) return null;

  return (
    <Rnd
      position={{ x: data.x, y: data.y }}
      size={{ width: data.w, height: data.h }}
      bounds="parent"
      disableDragging
      enableResizing={false}
      onMouseDown={onSelect}
      className={`fairy-rnd ${isSelected ? "selected" : ""}`}
      style={{ zIndex: isSelected ? 25 : 10 }}
    >
      <div
        className="fairy-text-block"
        style={{
          fontSize: `${data.fontSize || 20}px`,
          lineHeight: data.lineHeight || 1.6,
          color: data.color || "#2f2d59",
          textAlign: data.align || "left",
        }}
      >
        <EditorContent className="fairy-editor-content" editor={editor} />
      </div>
    </Rnd>
  );
}

function EditableImageBlock({
  data,
  onChange,
  isSelected,
  onSelect,
  onPick,
  label = "이미지 변경",
}) {
  if (!data?.visible) return null;

  return (
    <Rnd
      position={{ x: data.x, y: data.y }}
      size={{ width: data.w, height: data.h }}
      bounds="parent"
      disableDragging
      enableResizing={false}
      onMouseDown={onSelect}
      className={`fairy-rnd ${isSelected ? "selected" : ""}`}
      style={{ zIndex: isSelected ? 25 : 10 }}
    >
      <div className="fairy-image-block">
        <img
          src={data.src}
          alt=""
          referrerPolicy="no-referrer"
          draggable={false}
        />
      </div>
    </Rnd>
  );
}

function SquareCanvas({ side, children }) {
  return <div className={`fairy-square-canvas ${side}`}>{children}</div>;
}

function PropertyPanel({
  selectedBlock,
  page,
  editor,
  onTextChange,
  onImageChange,
  onCoverChange,
  onClose,
  onReplaceVisual,
}) {
  const text = page.text;
  const targetVisual = selectedBlock === "cover" ? page.cover : page.image;

  const toggleMark = (mark) => {
    if (!editor) return;

    if (mark === "bold") {
      editor.chain().focus().toggleBold().run();
    }

    if (mark === "italic") {
      editor.chain().focus().toggleItalic().run();
    }

    if (mark === "underline") {
      editor.chain().focus().toggleUnderline().run();
    }

    if (mark === "strike") {
      editor.chain().focus().toggleStrike().run();
    }
  };

  return (
    <aside className="fairy-property-panel" onMouseDown={(e) => e.stopPropagation()}>
      <div className="fairy-panel-head">
        <div>
          <h3>속성 패널</h3>
          <p>{selectedBlock ? "선택한 요소를 조정하세요" : "편집할 요소를 선택하세요"}</p>
        </div>

        {selectedBlock && (
          <button type="button" className="fairy-panel-close" onClick={onClose}>
            <X size={15} />
          </button>
        )}
      </div>

      {!selectedBlock && (
        <div className="fairy-empty-panel">
          <div className="fairy-empty-icon">
            <Type size={22} />
          </div>
          <strong>선택된 요소 없음</strong>
          <p>
            가운데 책 화면에서 텍스트, 이미지, 표지를 클릭하면 세부 설정을
            수정할 수 있어요.
          </p>
        </div>
      )}

      {selectedBlock === "text" && (
        <div className="fairy-panel-section">
          <div className="fairy-selected-label">
            <Type size={15} />
            텍스트 설정
          </div>

          <div className="fairy-style-row">
            <button
              type="button"
              className={editor?.isActive("bold") ? "active" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark("bold");
              }}
              title="굵게"
            >
              <Bold size={15} />
            </button>

            <button
              type="button"
              className={editor?.isActive("underline") ? "active" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark("underline");
              }}
              title="밑줄"
            >
              <UnderlineIcon size={15} />
            </button>

            <button
              type="button"
              className={editor?.isActive("strike") ? "active" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark("strike");
              }}
              title="취소선"
            >
              <Strikethrough size={15} />
            </button>
          </div>

          <label className="fairy-field full">
            <span>글자 크기</span>
            <select
              value={text.fontSize || 20}
              onChange={(e) => onTextChange({ fontSize: Number(e.target.value) })}
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

          <label className="fairy-field full">
            <span>줄 간격</span>
            <select
              value={text.lineHeight || 1.6}
              onChange={(e) => onTextChange({ lineHeight: Number(e.target.value) })}
            >
              <option value="1.2">1.2</option>
              <option value="1.4">1.4</option>
              <option value="1.6">1.6</option>
              <option value="1.8">1.8</option>
              <option value="2">2.0</option>
            </select>
          </label>

          <div className="fairy-align-row">
            <button type="button" onClick={() => onTextChange({ align: "left" })}>
              <AlignLeft size={15} />
            </button>
            <button type="button" onClick={() => onTextChange({ align: "center" })}>
              <AlignCenter size={15} />
            </button>
            <button type="button" onClick={() => onTextChange({ align: "right" })}>
              <AlignRight size={15} />
            </button>
          </div>
        </div>
      )}

      {(selectedBlock === "image" || selectedBlock === "cover") && targetVisual && (
        <div className="fairy-panel-section">
          <div className="fairy-selected-label">
            <ImageIcon size={15} />
            {selectedBlock === "cover" ? "표지 이미지" : "본문 이미지"}
          </div>

          <div className="fairy-empty-panel">
            <strong>이미지는 고정되어 있어요</strong>
            <p>이미지 변경과 위치 조정 기능은 사용할 수 없어요.</p>
          </div>
        </div>
      )}
    </aside>
  );
}

function PreviewModal({ pages, initialIndex, onClose }) {
  const flipBookRef = useRef(null);

  const flipPages = pages.flatMap((page) => {
    if (page.type === "cover") {
      return [
        {
          id: `${page.id}-cover`,
          type: "cover",
          title: "표지",
          visual: page.cover,
          text: page.text,
        },
      ];
    }

    return [
      {
        id: `${page.id}-image`,
        type: "image",
        title: `${page.title} 이미지`,
        visual: page.image,
      },
      {
        id: `${page.id}-text`,
        type: "text",
        title: `${page.title} 본문`,
        text: page.text,
      },
    ];
  });

  const initialFlipIndex = (() => {
    let index = 0;

    for (let i = 0; i < pages.length; i += 1) {
      if (i === initialIndex) return index;

      if (pages[i].type === "cover") {
        index += 1;
      } else {
        index += 2;
      }
    }

    return 0;
  })();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        flipBookRef.current?.pageFlip()?.turnToPage(initialFlipIndex);
      } catch (error) {
        console.warn("미리보기 페이지 이동 실패:", error);
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [initialFlipIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();

      if (e.key === "ArrowLeft") {
        flipBookRef.current?.pageFlip()?.flipPrev();
      }

      if (e.key === "ArrowRight") {
        flipBookRef.current?.pageFlip()?.flipNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const renderPreviewImage = (imageData) => {
    if (!imageData?.visible) return null;

    return (
      <div
        className="flip-preview-image-layer"
        style={{
          left: imageData.x,
          top: imageData.y,
          width: imageData.w,
          height: imageData.h,
        }}
      >
        <img src={imageData.src} alt="" draggable={false} />
      </div>
    );
  };

  const renderPreviewText = (textData) => {
    if (!textData?.visible) return null;

    return (
      <div
        className="flip-preview-text-layer"
        style={{
          left: textData.x,
          top: textData.y,
          width: textData.w,
          height: textData.h,
          fontSize: `${textData.fontSize || 20}px`,
          lineHeight: textData.lineHeight || 1.6,
          color: textData.color || "#2f2d59",
          textAlign: textData.align || "left",
        }}
        dangerouslySetInnerHTML={{ __html: textData.html }}
      />
    );
  };

  return (
    <div className="fairy-preview-modal-backdrop" onMouseDown={onClose}>
      <div
        className="fairy-preview-modal flip-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="fairy-preview-modal-header">
          <div>
            <h3>동화 미리보기</h3>
            <p>책장을 넘기듯 확인하세요</p>
          </div>

          <button type="button" className="fairy-preview-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="fairy-preview-modal-body flip-modal-body">
          <button
            type="button"
            className="fairy-preview-arrow left"
            onClick={() => flipBookRef.current?.pageFlip()?.flipPrev()}
          >
            <ChevronLeft size={24} />
          </button>

          <HTMLFlipBook
            ref={flipBookRef}
            width={480}
            height={620}
            size="fixed"
            minWidth={320}
            maxWidth={480}
            minHeight={420}
            maxHeight={620}
            showCover={true}
            mobileScrollSupport={true}
            usePortrait={true}
            drawShadow={true}
            flippingTime={800}
            className="fairy-flip-book"
          >
            {flipPages.map((item) => (
              <div
                key={item.id}
                className={`flipbook-page ${
                  item.type === "cover" ? "cover-page" : ""
                }`}
              >
                {item.type === "cover" && (
                  <>
                    {renderPreviewImage(item.visual)}
                    {renderPreviewText(item.text)}
                  </>
                )}

                {item.type === "image" && renderPreviewImage(item.visual)}

                {item.type === "text" && renderPreviewText(item.text)}
              </div>
            ))}
          </HTMLFlipBook>

          <button
            type="button"
            className="fairy-preview-arrow right"
            onClick={() => flipBookRef.current?.pageFlip()?.flipNext()}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="fairy-preview-modal-footer">
          <span>좌우 버튼 또는 키보드 방향키로 넘길 수 있어요</span>
        </div>
      </div>
    </div>
  );
}

export default function FairytaleEditor() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialPages = useMemo(
    () => createEditorPagesFromCreationState(location.state),
    [location.state]
  );

  const [pages, setPages] = useState(() => initialPages);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    setPages(initialPages);
    setPageIndex(0);
    setSelectedBlock(null);
  }, [initialPages]);

  const page = pages[pageIndex];
  const isCoverPage = page.type === "cover";

  const totalBodyPages = pages.filter((item) => item.type === "spread").length;
  const bodyPageNumber = isCoverPage
    ? 0
    : pages.slice(0, pageIndex + 1).filter((item) => item.type === "spread")
        .length;

  const activeEditorRef = useRef(null);
  const [, bumpToolbar] = useReducer((count) => count + 1, 0);

  const updateCurrentPage = useCallback(
    (patch) => {
      setPages((prev) =>
        prev.map((p, i) => (i === pageIndex ? { ...p, ...patch } : p))
      );
    },
    [pageIndex]
  );

  const updateText = useCallback(
    (newText) => {
      updateCurrentPage({
        text: newText,
      });
    },
    [updateCurrentPage]
  );

  const updateImage = useCallback(
    (newImage) => {
      updateCurrentPage({
        image: newImage,
      });
    },
    [updateCurrentPage]
  );

  const updateCover = useCallback(
    (newCover) => {
      updateCurrentPage({
        cover: newCover,
      });
    },
    [updateCurrentPage]
  );

  const patchText = useCallback(
    (patch) => {
      updateText({
        ...page.text,
        ...patch,
        visible: true,
      });
    },
    [page.text, updateText]
  );

  const patchImage = useCallback(
    (patch) => {
      if (!page.image) return;

      updateImage({
        ...page.image,
        ...patch,
        visible: true,
      });
    },
    [page.image, updateImage]
  );

  const patchCover = useCallback(
    (patch) => {
      if (!page.cover) return;

      updateCover({
        ...page.cover,
        ...patch,
        visible: true,
      });
    },
    [page.cover, updateCover]
  );

  const handleEditorReady = useCallback((editor) => {
    activeEditorRef.current = editor;
    bumpToolbar();
  }, []);

  const handlePickVisual = useCallback(() => {
    const currentImage = isCoverPage ? page.cover : page.image;
    const label = isCoverPage
      ? "새 표지 이미지 URL을 입력하세요"
      : "새 본문 이미지 URL을 입력하세요";

    const url = window.prompt(label, currentImage?.src || "");
    if (!url) return;

    if (isCoverPage) {
      patchCover({
        src: url,
        visible: true,
      });
      setSelectedBlock("cover");
    } else {
      patchImage({
        src: url,
        visible: true,
      });
      setSelectedBlock("image");
    }
  }, [isCoverPage, page.cover, page.image, patchCover, patchImage]);

  const handleAddText = useCallback(() => {
    const defaultText = isCoverPage
      ? {
          x: 58,
          y: 420,
          w: 365,
          h: 90,
          html: "<p>새 제목을 입력하세요</p>",
          fontSize: 34,
          lineHeight: 1.25,
          color: "#ffffff",
          align: "center",
        }
      : {
          x: 40,
          y: 220,
          w: 400,
          h: 150,
          html: "<p>새 문장을 입력하세요.</p>",
          fontSize: 20,
          lineHeight: 1.6,
          color: "#2f2d59",
          align: "left",
        };

    patchText({
      ...defaultText,
      visible: true,
    });

    setSelectedBlock("text");
  }, [patchText, isCoverPage]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedBlock === "text") {
      patchText({ visible: false });
    }

    if (selectedBlock === "image") {
      patchImage({ visible: false });
    }

    if (selectedBlock === "cover") {
      patchCover({ visible: false });
    }

    setSelectedBlock(null);
  }, [selectedBlock, patchText, patchImage, patchCover]);

  const handleSave = useCallback(async () => {
    const draft = toBookDraft(location.state);
    const coverPage = pages.find((page) => page.type === "cover");
    const bodyPages = pages.filter((page) => page.type !== "cover");

    const requestBody = {
      bookType: "FAIRY_TALE",
      authorAgeGroup: draft.meta.writerLevel,
      readerAgeGroup: draft.meta.readerAge,
      creationMode: draft.meta.interactionMode,
      title:
        stripHtml(coverPage?.text?.html) || draft.setting.title || "제목 없는 동화책",
      description: draft.setting.storySeed || "",
      confirmedSettings: JSON.stringify(draft.setting),
      coverImageUrl: coverPage?.cover?.src || null,
      pages: bodyPages.map((page) => ({
        pageNo: page.pageNo,
        title: page.title,
        contentTextKo: stripHtml(page.text?.html),
        contentTextEn: page.textEn || "",
        imageUrl: page.image?.src || null,
      })),
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await axiosInstance.post("/api/books", requestBody);
      const bookId = response.data?.data?.bookId;

      navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.COMPLETE, {
        state: {
          ...location.state,
          pages,
          bookId,
        },
      });
    } catch (error) {
      setSaveError(
        error.response?.data?.message || "책 저장에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsSaving(false);
    }
  }, [pages, navigate, location.state]);

  const handleAddPage = useCallback(() => {
    const newBodyPageNumber =
      pages.filter((item) => item.type === "spread").length + 1;
    const base = clone(SAMPLE_PAGES[1]);

    const newPage = {
      ...base,
      id: `p-${Date.now()}`,
      type: "spread",
      title: `${newBodyPageNumber} 페이지`,
      image: {
        ...base.image,
        src: `https://picsum.photos/seed/fairy${Date.now()}/600/800`,
      },
      text: {
        ...base.text,
        html: "<p>새 페이지의 이야기를 입력하세요.</p>",
      },
    };

    setPages((prev) => [...prev, newPage]);
    setPageIndex(pages.length);
    setSelectedBlock(null);
  }, [pages]);

  const handleDuplicatePage = useCallback(() => {
    if (page.type === "cover") {
      alert("표지는 복제하지 않고, 본문 페이지만 복제할 수 있어요.");
      return;
    }

    const copied = {
      ...clone(page),
      id: `p-${Date.now()}`,
    };

    setPages((prev) => {
      const next = [...prev];
      next.splice(pageIndex + 1, 0, copied);

      let bodyCount = 0;

      return next.map((p) => {
        if (p.type === "cover") {
          return {
            ...p,
            title: "표지",
          };
        }

        bodyCount += 1;

        return {
          ...p,
          title: `${bodyCount} 페이지`,
        };
      });
    });

    setPageIndex(pageIndex + 1);
    setSelectedBlock(null);
  }, [page, pageIndex]);

  const goPrev = () => {
    setPageIndex((prev) => Math.max(0, prev - 1));
    setSelectedBlock(null);
  };

  const goNext = () => {
    setPageIndex((prev) => Math.min(pages.length - 1, prev + 1));
    setSelectedBlock(null);
  };

  return (
    <div
      className="fairy-editor-page"
      style={{ "--editor-fairy-bg": `url(${fairyback})` }}
      onMouseDown={() => {
        setSelectedBlock(null);
      }}
    >
      <header className="fairy-editor-header">
        <div>
          <h2>동화 편집 모드</h2>
          <p>
            표지는 한 장으로 편집하고, 본문은 왼쪽 이미지와 오른쪽 텍스트가 있는
            펼침 페이지로 편집하세요.
          </p>
        </div>

        <div className="fairy-header-actions">
          <button
            type="button"
            className="fairy-header-btn preview"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewModalOpen(true);
              setSelectedBlock(null);
            }}
          >
            <EyeOff size={16} />
            미리보기
          </button>

          <button
            type="button"
            className="fairy-header-btn save"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check size={16} />
            {isSaving ? "저장 중..." : "저장"}
          </button>

          {saveError && <p className="fairy-save-state">{saveError}</p>}
        </div>
      </header>

      <main className="fairy-editor-workspace">
        <aside className="fairy-page-sidebar" onMouseDown={(e) => e.stopPropagation()}>
          <div className="fairy-sidebar-head">
            <h3>페이지</h3>
          </div>

          <div className="fairy-thumb-list">
            {pages.map((item, index) => (
              <PageThumbnail
                key={item.id}
                page={item}
                index={index}
                active={index === pageIndex}
                onClick={() => {
                  setPageIndex(index);
                  setSelectedBlock(null);
                }}
              />
            ))}
          </div>
        </aside>

        <section className="fairy-book-area">
          {!isPreviewModalOpen && selectedBlock && (
            <div className="fairy-selected-notice" onMouseDown={(e) => e.stopPropagation()}>
              {selectedBlock === "text" && <Type size={16} />}
              {selectedBlock === "image" && <ImageIcon size={16} />}
              {selectedBlock === "cover" && <BookOpen size={16} />}

              <span>
                {selectedBlock === "text" &&
                  "텍스트 블록 선택됨 — 문장과 글자 스타일을 수정할 수 있어요"}
                {selectedBlock === "image" && "본문 이미지 선택됨 — 이미지는 고정되어 있어요"}
                {selectedBlock === "cover" && "표지 이미지 선택됨 — 표지는 고정되어 있어요"}
              </span>

              <button type="button" onClick={() => setSelectedBlock(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          <div
            className={`fairy-book-stage ${
              isCoverPage ? "cover-mode" : "spread-mode"
            }`}
            key={page.id}
          >
            {isCoverPage ? (
              <SquareCanvas side="cover">
                <EditableImageBlock
                  data={page.cover}
                  onChange={updateCover}
                  isSelected={selectedBlock === "cover"}
                  onSelect={(e) => {
                    e.stopPropagation();
                    setSelectedBlock("cover");
                  }}
                  onPick={handlePickVisual}
                  label="표지 변경"
                />

                <EditableTextBlock
                  data={page.text}
                  onChange={updateText}
                  isSelected={selectedBlock === "text"}
                  onSelect={(e) => {
                    e.stopPropagation();
                    setSelectedBlock("text");
                  }}
                  onEditorReady={handleEditorReady}
                />
              </SquareCanvas>
            ) : (
              <>
                <SquareCanvas side="left">
                  <EditableImageBlock
                    data={page.image}
                    onChange={updateImage}
                    isSelected={selectedBlock === "image"}
                    onSelect={(e) => {
                      e.stopPropagation();
                      setSelectedBlock("image");
                    }}
                    onPick={handlePickVisual}
                    label="이미지 변경"
                  />
                </SquareCanvas>

                <div className="fairy-book-spine" />

                <SquareCanvas side="right">
                  <EditableTextBlock
                    data={page.text}
                    onChange={updateText}
                    isSelected={selectedBlock === "text"}
                    onSelect={(e) => {
                      e.stopPropagation();
                      setSelectedBlock("text");
                    }}
                    onEditorReady={handleEditorReady}
                  />
                </SquareCanvas>
              </>
            )}
          </div>

          <div className="fairy-bottom-nav" onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" onClick={goPrev} disabled={pageIndex === 0}>
              <ChevronLeft size={18} />
            </button>

            <div className="fairy-page-dots">
              {pages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === pageIndex ? "active" : ""}
                  onClick={() => {
                    setPageIndex(index);
                    setSelectedBlock(null);
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={pageIndex === pages.length - 1}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <p className="fairy-page-count">
            {isCoverPage ? "표지" : `${bodyPageNumber} / ${totalBodyPages} 페이지`}
          </p>
        </section>

        <PropertyPanel
          selectedBlock={selectedBlock}
          page={page}
          editor={activeEditorRef.current}
          onTextChange={patchText}
          onImageChange={patchImage}
          onCoverChange={patchCover}
          onClose={() => setSelectedBlock(null)}
          onReplaceVisual={handlePickVisual}
        />
      </main>

      {isPreviewModalOpen && (
        <PreviewModal
          pages={pages}
          initialIndex={pageIndex}
          onClose={() => setIsPreviewModalOpen(false)}
        />
      )}
    </div>
  );
}