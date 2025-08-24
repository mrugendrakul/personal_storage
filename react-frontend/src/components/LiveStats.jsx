import React from 'react'
import { useCallback, useState } from 'react'
import useWebSocket from '../customHooks/useWebSocket'

const LiveStats = () => {
    
    const [stats, setStats] = useState({
        cpu: { load: 0 },
        ram: { total: 0, available: 0, percent: 0 }
    })
    const [isConnected, setIsConnected] = useState(false)

    const handleNewStats = useCallback((newStats) => {
        setStats(newStats);
        if (!isConnected) setIsConnected(true)
    }, [isConnected])

    useWebSocket('/personal-live-cloud/cpu-stats', handleNewStats)
    return (
        <div className="bg-slate-100 font-sans p-5 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CPU Usage Card */}
                    <div className="flex flex-col bg-white p-6 rounded-xl shadow-md content-between justify-between">
                        <div className="flex flex-col items-baseline mb-4">
                            <h3 className="font-semibold text-slate-600">CPU Load</h3>
                            <p className="font-bold text-3xl text-slate-800">{stats.cpu.load}%</p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                            <div
                                className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${stats.cpu.load}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Memory Usage Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex flex-col items-baseline mb-4">
                            <h3 className="font-semibold text-slate-600">Memory Usage</h3>
                            <p className="font-bold text-3xl text-slate-800">{stats.ram.percent}%</p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                            <div
                                className="bg-purple-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${stats.ram.percent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default LiveStats