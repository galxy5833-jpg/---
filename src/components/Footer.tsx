import { ExternalLink, Mail } from 'lucide-react';
import type { WorkspaceTab } from '../types/career';

interface FooterProps {
  onSelectTab: (tab: WorkspaceTab) => void;
}

export function Footer({ onSelectTab }: FooterProps) {
  return (
    <footer className="mt-12 bg-white/85 backdrop-blur-md border-t border-slate-200/90">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Brand */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-slate-900">커리어데스크</span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-500">반도체 · 전기 취업준비 워크스페이스</span>
          </div>

          {/* Right: Quick Page Links */}
          <nav
            aria-label="하단 메뉴"
            className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => {
                onSelectTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              대시보드
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectTab('documents');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              자소서 · 이력서
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectTab('interview-prep');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              면접 · 체크리스트
            </button>
          </nav>
        </div>

        {/* Bottom Divider & Requested Contact / Links */}
        <div className="pt-5 border-t border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-500">
          <p className="text-slate-400">
            © {new Date().getFullYear()} CareerDesk. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="mailto:galxy5833@gmail.com"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>galxy5833@gmail.com</span>
            </a>

            <a
              href="https://oneclickai.co.kr"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <span>oneclickai.co.kr</span>
              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
            </a>

            <a
              href="https://ai.studio/apps/888f4cde-fe4f-4964-81d9-51f156b3390f"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors break-all sm:break-normal"
            >
              <span>https://ai.studio/apps/888f4cde-fe4f-4964-81d9-51f156b3390f</span>
              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
