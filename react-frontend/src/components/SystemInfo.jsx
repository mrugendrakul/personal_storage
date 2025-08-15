import axios from 'axios'
import React, { useEffect, useState } from 'react'

const SystemInfo = () => {
    const [systemData, setSystemData] = useState({
        cpuInfo: {
            name: "..."
        },
        storage: {
            total: 0,
            type: "...",
            numberOfStorage: 0,
            used: 0,
            percent: 0
        },
        gpu: [{
            modal: "...",
            load: "...",
            memory_used: 0,
            memory_total: 0
        }]
    })
    useEffect(()=>{
        console.log("Use effect")
        axios.get('http://localhost:3000/usage/cpu')
        .then((res)=>{
            console.log("got data",res.data)
            setSystemData(res.data)
        })
        .catch((err)=>{
            console.error("Error fetching data from backend",err)
        })
    },[])
    return (
        <div >
            <div className="bg-white p-6 rounded-xl shadow-md m-4">
                <div className="flex flex-col items-baseline mb-4">
                    <h3 className="font-semibold text-slate-600">Memory Usage ({systemData.storage.type})</h3>
                    <p className="font-bold text-3xl text-slate-800">{systemData.storage.used} GB / {systemData.storage.total} GB</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                    <div
                        className="bg-purple-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${systemData.storage.percent}%` }}
                    ></div>
                </div>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-md m-4'>
                <div className='flex flex-col'>
                    CPU name : {systemData.cpuInfo.name}

                </div>
            </div>
        </div>
    )
}

export default SystemInfo