export default function UploadZone({ file, onFileChange, disabled }) {
  return (
    <label
      className={`flex cursor-pointer flex-col items-center rounded-intercom border-2 border-dashed border-intercom-gray-200 bg-intercom-gray-50 px-6 py-14 transition-colors hover:border-intercom-blue hover:bg-white ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        disabled={disabled}
      />
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-intercom-blue/10">
        <svg className="h-6 w-6 text-intercom-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-intercom-black">JSON dosyası yükle</p>
      <p className="mt-1 text-sm text-intercom-gray-400">Stok, rota ve şirket kuralları</p>
      {file && (
        <p className="mt-3 text-sm font-medium text-intercom-blue">{file.name}</p>
      )}
    </label>
  );
}
