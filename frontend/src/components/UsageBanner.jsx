export default function UsageBanner({ usage, apiCalls, source }) {
  if (source !== 'ai' || !usage?.total_tokens) {
    return (
      <div className="rounded-intercom border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Demo mod:</strong> NVIDIA API çağrısı yapılmadı, bakiye düşmez. Gerçek AI için{' '}
        <code className="rounded bg-white px-1">backend/.env</code> içinde key olmalı ve analiz
        ~30–90 sn sürmeli.
      </div>
    );
  }

  return (
    <div className="rounded-intercom border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      <p>
        <strong>NVIDIA API kullanıldı</strong> — {apiCalls || 1} istek,{' '}
        <strong>{usage.total_tokens.toLocaleString('tr-TR')}</strong> token (
        {usage.prompt_tokens} girdi + {usage.completion_tokens} çıktı).
      </p>
      <p className="mt-2 text-emerald-800/80">
        Bakiye hemen düşmeyebilir: NVIDIA genelde önce ücretsiz developer kredisinden düşer;
        panelde gecikmeli güncellenir. Kontrol:{' '}
        <a
          href="https://build.nvidia.com/"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline"
        >
          build.nvidia.com
        </a>
      </p>
    </div>
  );
}
