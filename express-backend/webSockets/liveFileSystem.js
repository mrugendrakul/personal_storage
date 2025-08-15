const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const url = require('url');
const safeDirectory = '/home/Mrugendra/safeDirectory'
const wss = new WebSocket.Server({ noServer: true })

/**
 * dirPath:fsWather,clientsSet
 */
const activeWatchers = {}

const broadcast = (dirpath, data) => {
    const watcherInfo = activeWatchers[dirpath]
    if (watcherInfo) {
        watcherInfo.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data)
            }
        })
    }
}

wss.on('connection', (ws, request) => {
    const { query } = url.parse(request.url, true);
    const userPath = query.path || '/'
    const dirPath = path.join(safeDirectory, userPath)

    console.log("Client connected to watch", userPath)
    ws.watchPath = dirPath

    if (!activeWatchers[dirPath]) {
        try {
            const watcher = fs.watch(dirPath,(eventType,filename)=>{
                if(filename){
                   console.log(`Change in ${dirPath}: ${eventType} on ${filename}`);
                    const contents = getDirectoryContents(dirPath,userPath);
                    broadcast(
                        dirPath, 
                        JSON.stringify({ type: 'update', path: userPath, contents })
                    );
                }
            })
            activeWatchers[dirPath] = {watcher,clients:new Set()};
            console.log('started new watcher',dirPath)

        } catch (error) {
            console.error(`Failed to watch directory ${requestedPath}:`, error);
            ws.close(1011, 'Failed to watch directory');
            return;
        }
    }

    activeWatchers[dirPath].clients.add(ws)
    const initialContents = getDirectoryContents(dirPath,userPath)
    ws.send(JSON.stringify({type:'initial',path:userPath,contents:initialContents}))

    ws.on('close',()=>{
        console.log("client disconnected ",ws.watchPath)
        const watcherInfo = activeWatchers[ws.watchPath];
        if (watcherInfo) {
            // Remove the client from the watcher's set
            watcherInfo.clients.delete(ws);

            // If no clients are left watching this directory, clean up the watcher
            if (watcherInfo.clients.size === 0) {
                watcherInfo.watcher.close(); // Stop the fs.watch process
                delete activeWatchers[ws.watchPath]; // Remove from our active list
                console.log(`Stopped watcher for: ${ws.watchPath}`);
            }
        }
    })
})

const getDirectoryContents=  (dirpath,userPath) =>{
    try{
        const items =  fs.readdirSync(dirpath,{withFileTypes:true})
        
        // const stats =  fs.stat(dirpath)
        return items.map(item=>{
            const itemPath = path.join(dirpath,item.name)
            try{
                const stats = fs.statSync(itemPath)
                return {
                    name: item.name,
                    path: userPath,
                    isDirectory: item.isDirectory(),
                    size: stats.size,
                    modified: stats.mtime,
                    extension:item.name.split('.').pop().toLowerCase()
                };
            }
            catch(err){
                return {
                    name: item.name,
                    path: userPath,
                    isDirectory: item.isDirectory(),
                    size: 'N/A',
                    modified: 'N/A'
                };
            }
           })
    }catch(err){
        console.error("Error reading directory" ,dirpath, err)
    }
}

module.exports = wss