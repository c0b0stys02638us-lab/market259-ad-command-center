import { useState } from 'react'
import { useRouter } from 'next/router'

export default function NewAdItem(){
  const [form,setForm] = useState({ weekId: '', department: '', itemName: '', upc: '', featureLocation: '' })
  const router = useRouter()
  async function submit(e:any){
    e.preventDefault()
    await fetch('/api/admin/ad-items', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(form) })
    router.push('/admin/ad-items')
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-walmartBlue">New Ad Item</h1>
      <form onSubmit={submit} className="mt-4 bg-white p-4 rounded shadow space-y-2">
        <input placeholder="Week ID" value={form.weekId} onChange={e=>setForm({...form, weekId: e.target.value})} className="border p-2 w-full" />
        <input placeholder="Department" value={form.department} onChange={e=>setForm({...form, department: e.target.value})} className="border p-2 w-full" />
        <input placeholder="Item Name" value={form.itemName} onChange={e=>setForm({...form, itemName: e.target.value})} className="border p-2 w-full" />
        <input placeholder="UPC" value={form.upc} onChange={e=>setForm({...form, upc: e.target.value})} className="border p-2 w-full" />
        <input placeholder="Feature location" value={form.featureLocation} onChange={e=>setForm({...form, featureLocation: e.target.value})} className="border p-2 w-full" />
        <div className="flex justify-end"><button className="bg-walmartBlue text-white px-3 py-1 rounded">Create</button></div>
      </form>
    </div>
  )
}
