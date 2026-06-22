import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

export default function QRPage(){
  const [src, setSrc] = useState('')
  useEffect(()=>{
    const url = (typeof window !== 'undefined') ? `${window.location.origin}/submit?store=259` : '/submit?store=259'
    QRCode.toDataURL(url).then(setSrc)
  },[])

  return (
    <div className="min-h-screen p-6 bg-neutralLight">
      <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold text-walmartBlue">QR Code - Submit Ad Check</h2>
        <p className="text-sm text-neutralGray mt-2">Scan this QR with a phone to open the Submit Ad Check form (store 259).</p>
        {src && <img src={src} alt="QR Code" className="mx-auto my-4" />}
        <div className="flex justify-between mt-4">
          <a className="text-sm text-walmartBlue" href="/submit" target="_blank">Open form</a>
          <button onClick={()=>window.print()} className="bg-walmartBlue text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>
    </div>
  )
}
