import Link from 'next/link'

export default function Home(){
  return (
    <div className="min-h-screen p-6 bg-neutralLight">
      <header className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-walmartBlue">Market #259 Ad Command Center</h1>
        <p className="text-neutralGray mt-2">Mobile-first app for Weekly Market Ads — scaffolded starter.</p>
      </header>

      <main className="max-w-3xl mx-auto mt-6 space-y-4">
        <nav className="grid grid-cols-1 gap-3">
          <Link href="/submit"><a className="block p-4 bg-white rounded shadow hover:shadow-md">Submit Ad Check</a></Link>
          <Link href="/planner"><a className="block p-4 bg-white rounded shadow hover:shadow-md">Weekly Ad Planner (coming)</a></Link>
          <Link href="/admin"><a className="block p-4 bg-white rounded shadow hover:shadow-md">Admin Dashboard (coming)</a></Link>
          <Link href="/qr"><a className="block p-4 bg-white rounded shadow hover:shadow-md">QR Code Page</a></Link>
        </nav>
      </main>
    </div>
  )
}
