import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminAdItems(){
  const [items,setItems] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  async function load(){
    setLoading(true)
    const res = await fetch('/api/admin/ad-items')
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  async function remove(id:number){
    if(!confirm('Remove item? This is a soft-delete.')) return
    await fetch(`/api/admin/ad-items/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-walmartBlue">Admin — Ad Items</h1>
      <div className="mt-4 mb-4"><Link href="/admin/ad-items/new"><a className="bg-walmartBlue text-white px-3 py-1 rounded">New Ad Item</a></Link></div>
      {loading ? <div>Loading…</div> : (
        <table className="w-full bg-white rounded shadow">
          <thead><tr className="text-left"><th className="p-2">ID</th><th>Item</th><th>Dept</th><th>UPC</th><th>Week</th><th></th></tr></thead>
          <tbody>
            {items.map(it=> (
              <tr key={it.id} className="border-t"><td className="p-2">{it.id}</td><td>{it.itemName}</td><td>{it.department}</td><td>{it.upc}</td><td>{it.weekId}</td><td className="p-2"><Link href={`/admin/ad-items/${it.id}`}><a className="text-walmartBlue mr-2">Edit</a></Link><button onClick={()=>remove(it.id)} className="text-red-600">Remove</button></td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
