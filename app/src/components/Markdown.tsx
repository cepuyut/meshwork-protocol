"use client";
import ReactMarkdown from "react-markdown";

export function Markdown({ content }: { content: string }) {
  if (!content || content === "—") return <span className="text-ink-faint">—</span>;

  return (
    <div className="prose prose-sm max-w-none text-ink-dim
      prose-headings:text-ink prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5
      prose-p:my-1.5 prose-p:leading-relaxed
      prose-code:font-mono prose-code:text-[12px] prose-code:bg-paper prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-paper prose-pre:border prose-pre:border-line prose-pre:rounded-lg prose-pre:text-[12px]
      prose-a:text-blue prose-a:underline prose-a:font-medium
      prose-strong:text-ink prose-strong:font-semibold
      prose-ul:my-1.5 prose-li:my-0.5
      prose-blockquote:border-l-blue prose-blockquote:bg-blue-soft/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-3
      [&_img]:rounded-lg [&_img]:max-w-full">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}