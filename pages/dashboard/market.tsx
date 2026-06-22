import { useState, useEffect } from 'react'

export default function MarketDashboard(){
  const [recap, setRecap] = useState<any>(null)
  const [week, setWeek] = useState(21)
  useEffect(()=>{ load() },[week])
  async function load(){
    const res = await fetch(`/api/admin/recap?week=${week}`)
    const data = await res.json()
    setRecap(data)
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-walmartBlue">Market Dashboard</h1>
      <div className="mt-4">
        <label>Week: <input type="number" value={week} onChange={e=>setWeek(Number(e.target.value))} className="border p-1" /></label>
      </div>
      {!recap ? <div>Loading…</div> : (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Best executing stores</h2>
            <ul>{recap.best.map((b:any)=>(<li key={b.store.storeNumber}>{b.store.name} — {b.avg}% ({b.count} submissions)</li>))}</ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Stores needing follow-up</h2>
            <ul>{recap.needs.map((n:any)=>(<li key={n.store.storeNumber}>{n.store.name} — {n.avg}%</li>))}</ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Top missed items (adItemIds)</h2>
            <pre>{JSON.stringify(recap.missed, null, 2)}</pre>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Top signage issues (adItemIds)</h2>
            <pre>{JSON.stringify(recap.signage, null, 2)}</pre>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Suggested opportunities</h2>
            <ul>{recap.suggestions.map((s:any)=>(<li key={s.id}>{s.itemName} ({s.dept})</li>))}</ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Suggested action plan</h2>
            <p>{recap.plan}</p>
          </div>
        </div>
      )}
    </div>
  )
}
