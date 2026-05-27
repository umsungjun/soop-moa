import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-border/60 text-muted-foreground border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {siteConfig.name} — SOOP 공개 임베드 플레이어 기반 멀티뷰. 비공식
          프로젝트입니다.
        </p>
        <p>
          Powered by{" "}
          <a
            href={siteConfig.links.soop}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-foreground underline underline-offset-2"
          >
            SOOP Open API
          </a>
        </p>
      </div>
    </footer>
  );
}
