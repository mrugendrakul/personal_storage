const WebSocket = require('ws')
const url = require('url')

const wss = new WebSocket.Server({noServer:true})

const clients = {}
wss.on('connection',(ws,request)=>{
    const {query} = url.parse(request.url,true)
    const uploadId = query.id;
    
    if(!uploadId){
        return ws.close(1008,'upload id is required')
    }
    clients[uploadId] = ws
    console.log("Client connected for upload updates :",uploadId)

    ws.on('close',()=>{
        console.log("Client disconnected",uploadId)
        delete clients[uploadId]
    })
})

function sendProgress(uploadId,progress){
    const socket = clients[uploadId]

    if(socket && socket.readyState == WebSocket.OPEN){
        if(progress === 'error'){
            socket.close(1000,'upload complete')
            delete clients[uploadId]
            socket.send(JSON.stringify({type:"error",progress}))
        }
        if(progress === 100){
            console.log("upload complete")
            socket.send(JSON.stringify({type:"progress",progress}))
            socket.close(1000,'upload complete')
            delete clients[uploadId]
        }
        socket.send(JSON.stringify({type:"progress",progress}))
    }
}

module.exports = {wss,sendProgress}