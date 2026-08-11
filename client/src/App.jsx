function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mini DEPO</h1>

        <p className="text-gray-500">Daily stock management</p>
      </header>

      <main>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Expected Sales</p>

            <h2 className="mt-2 text-2xl font-bold">0 RWF</h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Mobile Money</p>

            <h2 className="mt-2 text-2xl font-bold">0 RWF</h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Expected Cash</p>

            <h2 className="mt-2 text-2xl font-bold">0 RWF</h2>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
