const liveStatsWss = require('./liveStats')
const liveFileSystem = require('./liveFileSystem')
const url = require('url')
const {wss :liveUpload} = require('./liveUpload')

function initializeWebSocket(server) {
    server.on('upgrade', (request, socket, head) => {
        const pathname = url.parse(request.url).pathname
        console.log("Incomming socket request url :", pathname)

        switch (pathname) {
            case '/cpu-stats':
                liveStatsWss.handleUpgrade(request, socket, head, (ws) => {
                    liveStatsWss.emit('connection', ws, request)
                });
                break;
            case '/file-system':
                liveFileSystem.handleUpgrade(request, socket, head, (ws) => {
                    liveFileSystem.emit('connection', ws, request)
                });
                break;
            case '/upload-progress':
                liveUpload.handleUpgrade(request,socket,head,(ws)=>{
                    liveUpload.emit('connection',ws,request)
                })
                break;
            default:
                console.error("No web socket for path", pathname)
                socket.destroy();
                break;
        }
    })
}

module.exports = { initializeWebSocket }