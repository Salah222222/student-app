import { DownloadSimple, ShareNetwork } from "@phosphor-icons/react";
import { useInstallPrompt } from "../lib/useInstallPrompt";
import { useEngagementSignal } from "../lib/engagement";

export default function InstallSheet() {
  const { platform, install, remindLater } = useInstallPrompt();
  const engaged = useEngagementSignal();

  if (!platform || !engaged) return null;

  const isIos = platform === "ios";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={remindLater}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-sheet-heading"
        className="relative w-full max-w-md bg-surface rounded-t-lg shadow-lg p-space-2-5 pb-space-3 animate-[none]"
      >
        <div className="mx-auto mb-space-2 h-1 w-10 rounded-full bg-border-strong" />
        <div className="flex flex-col items-center text-center gap-space-1">
          <span className="flex items-center justify-center h-14 w-14 rounded-full bg-surface-alt">
            {isIos ? (
              <ShareNetwork size={28} className="text-primary" aria-hidden />
            ) : (
              <DownloadSimple size={28} className="text-primary" aria-hidden />
            )}
          </span>
          <h2 id="install-sheet-heading" className="text-h1 text-text">
            حمّل التطبيق على شاشتك الرئيسية
          </h2>
          {isIos ? (
            <p className="text-body text-muted">
              افتح قائمة المشاركة ← اختر «إضافة إلى الشاشة الرئيسية»
            </p>
          ) : (
            <ul className="text-body text-muted text-start w-full space-y-1 ps-space-2">
              <li>تابع دروسك حتى من غير نت</li>
              <li>إشعارات فورية لما يضاف محتوى جديد</li>
              <li>دخول أسرع من غير ما تفتح المتصفح</li>
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-space-1 mt-space-2-5">
          {!isIos && (
            <button
              type="button"
              onClick={install}
              className="min-h-touch rounded-sm bg-primary text-primary-contrast text-label"
            >
              ثبّت التطبيق
            </button>
          )}
          <button
            type="button"
            onClick={remindLater}
            className="min-h-touch text-label text-muted"
          >
            ذكّرني لاحقًا
          </button>
        </div>
      </div>
    </div>
  );
}
