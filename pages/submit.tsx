import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

const initial = {
  storeNumber: 259,
  department: '',
  submitter: '',
  weekNumber: 21,
  itemName: '',
  upc: '',
  featureLocation: '',
  itemOnFeature: 'yes',
  fullness: 'full',
  signage: 'yes',
  priceShown: 'yes',
  rollbackFlag: 'no',
  modularHome: 'no',
  notes: ''
}

export default function Submit(){
  const { data: session } = useSession()
  const [form,setForm] = useState(initial)
  const [loading,setLoading] = useState(false)
  const [message,setMessage] = useState('')
  const [files,setFiles] = useState<FileList | null>(null)

  useEffect(()=>{
    if(session && session.user){
      setForm(f => ({ ...f, submitter: (session.user as any).name || '' }))
    }
  },[session])

  async function uploadFile(file: File){
    // Request presigned URL from server
    const resp = await fetch('/api/photos/presign', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type })
    })
    if(!resp.ok) throw new Error('Could not get presign')
    const data = await resp.json()
    const uploadUrl = data.url
    // Upload directly to S3 using PUT
    const put = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    if(!put.ok) throw new Error('Upload failed')
    return data.publicUrl
  }

  async function handleSubmit(e:any){
    e.preventDefault()
    if(!session || !session.user){ setMessage('Please sign in before submitting'); return }
    setLoading(true)
    setMessage('')
    try{
      const uploadedURLs:string[] = []
      if(files && files.length > 0){
        for(let i=0;i<files.length;i++){
          const f = files[i]
          const url = await uploadFile(f)
          uploadedURLs.push(url)
        }
      }

      const payload = {
        ...form,
        submitter: session.user.name,
        photoCount: uploadedURLs.length,
        photoURLs: uploadedURLs
      }

      const resp = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await resp.json()
      setMessage(data.message || 'Submitted')
      setForm(initial)
      setFiles(null)
    }catch(err:any){
      console.error(err)
      setMessage(err.message || 'Error submitting')
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen p-6 bg-neutralLight">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold text-walmartBlue">Submit Ad Check</h2>

        <div className="mt-3 bg-white p-3 rounded shadow">
          {!session ? (
            <div className="grid grid-cols-1 gap-2">
              <div className="text-sm text-neutralGray">Sign in with your company SSO to submit (Auth0)</div>
              <div className="flex justify-end">
                <button onClick={()=>signIn('auth0')} className="bg-walmartBlue text-white px-3 py-1 rounded">Sign in</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Signed in as {session.user?.name}</div>
                <div className="text-sm text-neutralGray">{session.user?.email} — {(session.user as any).role}</div>
              </div>
              <div><button onClick={() => signOut()} className="text-walmartBlue">Sign out</button></div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-white p-4 rounded shadow">
          <div>
            <label className="block text-sm font-medium">Store Number</label>
            <input value={form.storeNumber} onChange={e=>setForm({...form, storeNumber: Number(e.target.value)})} className="mt-1 w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Department</label>
            <input value={form.department} onChange={e=>setForm({...form, department: e.target.value})} className="mt-1 w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Team Lead / Coach / SM name</label>
            <input value={form.submitter} onChange={e=>setForm({...form, submitter: e.target.value})} className="mt-1 w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Week Number</label>
            <input type="number" value={form.weekNumber} onChange={e=>setForm({...form, weekNumber: Number(e.target.value)})} className="mt-1 w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Ad item</label>
            <input value={form.itemName} onChange={e=>setForm({...form, itemName: e.target.value})} className="mt-1 w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">UPC / item number</label>
            <input value={form.upc} onChange={e=>setForm({...form, upc: e.target.value})} className="mt-1 w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Feature location</label>
            <input value={form.featureLocation} onChange={e=>setForm({...form, featureLocation: e.target.value})} className="mt-1 w-full border p-2 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select value={form.itemOnFeature} onChange={e=>setForm({...form, itemOnFeature: e.target.value})} className="border p-2 rounded">
              <option value="yes">Item on feature: Yes</option>
              <option value="no">No</option>
              <option value="partial">Partial</option>
            </select>

            <select value={form.fullness} onChange={e=>setForm({...form, fullness: e.target.value})} className="border p-2 rounded">
              <option value="full">Full</option>
              <option value="partial">Partial</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select value={form.signage} onChange={e=>setForm({...form, signage: e.target.value})} className="border p-2 rounded">
              <option value="yes">Signage correct</option>
              <option value="no">No</option>
              <option value="partial">Partial</option>
            </select>

            <select value={form.priceShown} onChange={e=>setForm({...form, priceShown: e.target.value})} className="border p-2 rounded">
              <option value="yes">Price shown</option>
              <option value="no">No</option>
              <option value="na">N/A</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Rollback flag present?</label>
            <select value={form.rollbackFlag} onChange={e=>setForm({...form, rollbackFlag: e.target.value})} className="border p-2 rounded w-full">
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="na">N/A</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Customer-facing photo upload</label>
            <input type="file" accept="image/*" multiple onChange={e=>setFiles(e.target.files)} className="mt-1" />
            <p className="text-xs text-neutralGray mt-1">Photos will be uploaded directly to S3 (configure AWS keys and bucket in .env)</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Suggested item or feature opportunity</label>
            <textarea value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} className="mt-1 w-full border p-2 rounded" />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="bg-walmartBlue text-white px-4 py-2 rounded">{loading? 'Submitting...':'Submit'}</button>
          </div>

          {message && <p className="text-sm text-neutralGray">{message}</p>}
        </form>
      </div>
    </div>
  )
}
