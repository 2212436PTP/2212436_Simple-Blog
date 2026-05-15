"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post, PostStatus } from "@/types/database";
import mammoth from "mammoth/mammoth.browser";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

interface PostFormProps {
  post?: Post;
  authorId: string;
}

type UploadState = {
  name: string;
  type: string;
  message: string;
} | null;

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`link-${key++}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 dark:text-blue-400 underline underline-offset-4"
        >
          {match[2]}
        </a>,
      );
    } else if (match[4]) {
      nodes.push(
        <strong
          key={`bold-${key++}`}
          className="font-semibold text-slate-950 dark:text-white"
        >
          {match[4]}
        </strong>,
      );
    } else if (match[5]) {
      nodes.push(
        <code
          key={`code-${key++}`}
          className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-900 dark:bg-slate-800 dark:text-slate-100"
        >
          {match[5]}
        </code>,
      );
    } else if (match[6]) {
      nodes.push(
        <em
          key={`italic-${key++}`}
          className="italic text-slate-900 dark:text-slate-100"
        >
          {match[6]}
        </em>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderMarkdownPreview(content: string): ReactNode[] {
  const blocks = content
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return [
      <p
        key="empty"
        className="text-sm italic text-slate-500 dark:text-slate-400"
      >
        Nội dung của bạn sẽ hiển thị ở đây khi bắt đầu nhập Markdown.
      </p>,
    ];
  }

  return blocks.flatMap((block, index) => {
    if (block.startsWith("# ")) {
      return [
        <h1
          key={`h1-${index}`}
          className="text-2xl font-bold text-slate-950 dark:text-white"
        >
          {renderInlineMarkdown(block.slice(2))}
        </h1>,
      ];
    }

    if (block.startsWith("## ")) {
      return [
        <h2
          key={`h2-${index}`}
          className="text-xl font-semibold text-slate-950 dark:text-white"
        >
          {renderInlineMarkdown(block.slice(3))}
        </h2>,
      ];
    }

    if (block.startsWith("### ")) {
      return [
        <h3
          key={`h3-${index}`}
          className="text-lg font-semibold text-slate-950 dark:text-white"
        >
          {renderInlineMarkdown(block.slice(4))}
        </h3>,
      ];
    }

    if (/^(- |\* )/m.test(block)) {
      const items = block
        .split(/\n/)
        .map((line) => line.replace(/^(- |\* )/, "").trim())
        .filter(Boolean);

      return [
        <ul
          key={`ul-${index}`}
          className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300"
        >
          {items.map((item, itemIndex) => (
            <li key={`${index}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      ];
    }

    return [
      <p
        key={`p-${index}`}
        className="leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
      >
        {renderInlineMarkdown(block)}
      </p>,
    ];
  });
}

export function PostForm({ post, authorId }: PostFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = !!post;
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [status, setStatus] = useState<PostStatus>(post?.status || "draft");
  const [isAnonymous, setIsAnonymous] = useState(post?.is_anonymous || false);
  const [commentsEnabled, setCommentsEnabled] = useState(
    post?.comments_enabled ?? true,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>(null);

  const buildPostData = (userId: string) => {
    const baseData = {
      title,
      slug: slugify(title),
      content,
      excerpt,
      status,
      author_id: userId,
      is_anonymous: isAnonymous,
      comments_enabled: commentsEnabled,
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    return baseData;
  };

  const readPdfText = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      pages.push(pageText);
    }

    return pages.join("\n\n").trim();
  };

  const extractTextFromFile = async (file: File) => {
    const fileName = file.name.toLowerCase();

    if (file.type === "text/plain" || fileName.endsWith(".txt")) {
      return file.text();
    }

    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
      return readPdfText(file);
    }

    throw new Error("Chỉ hỗ trợ file .txt, .docx hoặc .pdf.");
  };

  const handleFileImport = async (file: File) => {
    setError(null);
    setUploading(true);
    setUploadState({
      name: file.name,
      type: file.type || "unknown",
      message: "Đang đọc nội dung file...",
    });

    try {
      const text = (await extractTextFromFile(file)).trim();

      if (!text) {
        throw new Error("File không có nội dung có thể đọc được.");
      }

      setContent(text);
      setUploadState({
        name: file.name,
        type: file.type || "unknown",
        message: `Đã nhập nội dung từ ${file.name}`,
      });

      if (!excerpt.trim()) {
        setExcerpt(text.replace(/\s+/g, " ").trim().slice(0, 180));
      }

      if (!title.trim()) {
        const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể đọc nội dung file đã chọn.";
      setError(message);
      setUploadState({
        name: file.name,
        type: file.type || "unknown",
        message,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await handleFileImport(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const postData = buildPostData(authorId);

      if (isEditing) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", post.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(postData);

        if (error) throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {uploadState && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Nhập file</p>
              <p className="mt-1">{uploadState.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setUploadState(null)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Ẩn
            </button>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập tiêu đề bài viết"
        />
      </div>

      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-gray-700"
        >
          Tóm tắt
        </label>
        <input
          id="excerpt"
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Mô tả ngắn về bài viết"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nội dung
        </label>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? "Đang nhập file..." : "Tải file DOCX / PDF / TXT"}
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            File sẽ được đọc và đổ trực tiếp vào nội dung bài viết.
          </span>
        </div>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
          placeholder="Viết nội dung bài viết của bạn..."
        />
        <p className="mt-1 text-xs text-gray-500">Hỗ trợ Markdown</p>
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Trạng thái
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as PostStatus)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="draft">Bản nháp</option>
          <option value="published">Xuất bản</option>
        </select>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/70 sm:grid-cols-2">
        <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            <strong className="block text-slate-900 dark:text-white">
              Đăng ẩn danh
            </strong>
            Người đọc sẽ không thấy tên/tài khoản của bạn ở bài viết này.
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={commentsEnabled}
            onChange={(e) => setCommentsEnabled(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            <strong className="block text-slate-900 dark:text-white">
              Cho phép bình luận
            </strong>
            Bạn có thể bật/tắt bình luận bất cứ lúc nào.
          </span>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-900/70">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Xem trước
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Xem bài viết sẽ hiển thị như thế nào khi người đọc mở bài.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-700">
            {content.trim() ? "Đang cập nhật" : "Trống"}
          </span>
        </div>

        <div className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
          {renderMarkdownPreview(content)}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo bài viết"}
        </button>
      </div>
    </form>
  );
}
