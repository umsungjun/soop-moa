"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { PanelOptions } from "@/domains/multiview/types";
import {
  buildEmbedSrc,
  buildWatchUrl,
} from "@/domains/multiview/utils/embed-url";

interface PanelPlayerProps {
  bjId: string;
  options: PanelOptions;
  reloadNonce: number;
}

export function PanelPlayer({ bjId, options, reloadNonce }: PanelPlayerProps) {
  const [failed, setFailed] = useState(false);

  const src = useMemo(
    () =>
      buildEmbedSrc({
        bjId,
        muted: options.muted,
        chat: options.chat,
      }),
    [bjId, options.muted, options.chat],
  );

  // Re-mount the iframe when chat visibility or reload nonce changes.
  const iframeKey = `${bjId}-${options.chat ? "chat" : "nochat"}-${reloadNonce}`;

  return (
    <div className="relative size-full bg-black">
      <iframe
        key={iframeKey}
        src={src}
        title={`SOOP live - ${bjId}`}
        className="size-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onError={() => setFailed(true)}
      />

      {failed ? (
        <div className="bg-background/90 text-foreground absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-sm">
          <p className="text-muted-foreground">재생할 수 없는 방송입니다.</p>
          <a
            href={buildWatchUrl(bjId)}
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary inline-flex items-center gap-1 underline underline-offset-2"
          >
            <ExternalLink className="size-3.5" />
            SOOP에서 보기
          </a>
        </div>
      ) : null}
    </div>
  );
}
