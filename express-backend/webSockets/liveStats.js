const webSocket = require('ws')
const si = require('systeminformation')

const wss = new webSocket.Server({noServer:true})

wss.on('connection', ws => {
    console.log("Client connected")
    const interval = setInterval(async () => {
        try {
            const [cpu, mem] = await Promise.all([
                si.currentLoad(),
                si.mem(),
            ])
            const bytesToGB = (bytes) => parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2))
            const stats = {
                cpu: {
                    load: cpu.currentLoad.toFixed(2)
                },
                ram: {
                    total: bytesToGB(mem.total),
                    available: bytesToGB(mem.available),
                    percent: ((mem.used / mem.total) * 100).toFixed(2)
                },


            }
            if (ws.readyState === webSocket.OPEN) {
                ws.send(JSON.stringify(stats))
            }
        }
        catch (err) {
            console.error("Error fetching system details", err);
        }
    }, 2000)

    ws.on('close', () => {
        console.log('Client disconnected')
        clearInterval(interval)
    })
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
})


module.exports = wss 