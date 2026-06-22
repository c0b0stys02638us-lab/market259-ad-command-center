import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function EditAdItem(){
  const router = useRouter()
  const { id } = router.query
  const [form,setForm] = useState<any>(null)

  useEffect(()=>{
    if(!id) return
    fetch(`/api/admin/ad-items/${id}`).then(r=>r.json()).then(d=>setForm(d.item))
  },[id])

  async function submit(e:any){
    e.preventDefault()
    await fetch(`/api/admin/ad-items/${id}`, { method: 'PUT', headers: {'content-type':'application/json'}, body: JSON.stringify(form) })
    router.push('/admin/ad-items')
  }

  if(!form) return <div className="p-6">Loading…</div>
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-walmartBlue">Edit Ad Item #{id}</h1>
      <form onSubmit={submit} className="mt-4 bg-white p-4 rounded shadow space-y-2">
        <input placeholder="Department" value={form.department} onChange={e=>setForm({...form, department: e.target.value})} className="border p-2 w-full" />
        <input placeholder="Item Name" value={form.itemName} onChange={e=>setForm({...form, itemName: e.target.value})} className="border p-2 w-full" />
        <input placeholder="UPC" value={form.upc} onChange={e=>setForm({...form, upc: e.target.value})} className="border p-2 w-full" />
        <input placeholder="Feature location" value={form.featureLocation} onChange={e=>setForm({...form, featureLocation: e.target.value})} className="border p-2 w-full" />
        <label className="flex items-center"><input type="checkbox" checked={form.removed} onChange={e=>setForm({...form, removed: e.target.checked})} className="mr-2"/> Removed</label>
        <div className="flex justify-end"><button className="bg-walmartBlue text-white px-3 py-1 rounded">Save</button></div>
      </form>
    </div>
  )
}
