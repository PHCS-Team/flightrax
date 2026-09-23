"use client";

import { FileTextIcon } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { LEGAL_DOCUMENTS } from "@/modules/auth/constants/legal-documents";
import { useLegalDocument } from "@/modules/auth/hooks/use-legal-document.query";
import type { LegalDocumentKind } from "@/modules/auth/types/legal-document";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

const PROSE =
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-secondary [&_blockquote]:bg-muted/40 [&_blockquote]:px-3 [&_blockquote]:py-2 [&_blockquote]:text-sm [&_blockquote]:text-muted-foreground [&_h1]:hidden [&_h2]:mt-5 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:leading-6 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-6 [&_strong]:font-semibold [&_strong]:text-foreground [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-top [&_td]:text-xs [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-foreground [&_ul]:list-disc [&_ul]:pl-5";

export function LegalDocumentDialog({
  kind,
  label,
}: {
  kind: LegalDocumentKind;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const { data, error, isPending } = useLegalDocument(kind, open);
  const { title } = LEGAL_DOCUMENTS[kind];

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button
          className="cursor-pointer font-semibold text-primary-foreground underline underline-offset-4 transition hover:text-primary-foreground/80"
          type="button"
        >
          {label}
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-4 overflow-hidden p-5 sm:max-w-2xl sm:p-6">
        <DialogSectionHeader
          description="Read this before you create your account."
          icon={FileTextIcon}
          title={title}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          {isPending ? (
            <LoadingScreen variant="section" />
          ) : error ? (
            <EmptyState
              description={error.message}
              icon={<FileTextIcon className="size-7" />}
              title={`${title} Could Not Be Loaded`}
            />
          ) : (
            <div
              className={`grid gap-3 text-sm text-muted-foreground ${PROSE}`}
            >
              <Markdown remarkPlugins={[remarkGfm]}>{data}</Markdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
