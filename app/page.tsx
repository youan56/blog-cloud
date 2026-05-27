export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="glass p-12 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-black mb-4">
          <span className="text-[var(--accent)]">佑安 Mi</span> 的云端博客
        </h1>
        <p className="text-[var(--text-secondary)] text-lg mb-8">
          在代码、学术与分子动力学模拟间穿梭的普通人
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/admin/dashboard" className="btn-primary">
            进入后台
          </a>
        </div>
      </div>
    </main>
  );
}
