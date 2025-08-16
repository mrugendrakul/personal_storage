var express = require('express');
var router = express.Router();
const fsnp = require('fs')
const fs = require('fs').promises;
const path = require('path')
const si = require('systeminformation')
const safeDirectory = '/home/Mrugendra/safeDirectory'
const { randomUUID } = require('crypto');
const busboy = require('busboy');
const { sendProgress } = require('../webSockets/liveUpload');

const bytesToGB = (bytes) => parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2))
const bytesToMB = (bytes) => parseFloat((bytes / (1024 * 1024)).toFixed(2))

/* GET users listing. */
router.get('/disks', async (req, res, next) => {
    try {
        const disks = await si.fsSize()
        const mountPoints = disks.map(disk => ({
            name: disk.fs,
            mount: disk.mount,
            size: bytesToGB(disk.size),
            usedParcent: disk.use
        }))
        res.json(mountPoints)
    } catch (err) {
        console.error("Error getting disks", err)
        res.status(500).json({ error: "Error fetching disks" })
    }
});

router.post('/browse', async (req, res) => {
    // const userPath = req.body.path || '/'
    // const requestedPath = path.resolve(ROOT_DIRECTORY,userPath)

    // if(!requestedPath.startsWith(ROOT_DIRECTORY)){
    //     return res.status(403).json({error:"No such path found"})
    // }

    const userPath = req.body.path || '/'
    const dirPath = path.join(safeDirectory, userPath)

    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true })
        const contents = await Promise.all(
            items.map(async (item) => {
                const showPath = path.join(userPath, item.name)
                const itemPath = path.join(dirPath, item.name)
                try {
                    const stats = await fs.stat(itemPath)
                    return {
                        name: item.name,
                        path: showPath,
                        isDirectory: item.isDirectory(),
                        size: stats.size,
                        modified: stats.mtime
                    }
                } catch (e) {
                    return {
                        name: item.name,
                        path: showPath,
                        isDirectory: item.isDirectory(),
                        size: 'N/A',
                        modified: 'N/A'
                    }
                }
            })
        )
        res.json(contents)
    } catch (err) {
        console.error("Error getting files", err)
        res.status(500).json({ error: "Error getting files" })
    }
})


router.get('/download', (req, res) => {
    const userPath = req.query.path;

    if (!userPath) {
        return res.status(400).json({ error: 'file path is required' })
    }

    const dirPath = path.join(safeDirectory, userPath)
    res.download(dirPath, (err) => {
        if (err) {
            console.error(`Error downloading file ${dirPath}:`, err);
            if (!res.headersSent) {
                res.status(404).json({ error: 'File not found or permission denied.' });
            }
        }
    })
})

router.post('/upload', async (req, res) => {
    // const uploadId = randomUUID()
    console.log("before res")
    // res.status(202).json({uploadId})
    console.log("after res")
    const bb = busboy({ headers: req.headers })
    const uploadId = req.query.id
    const userPath = req.query.path
    let uploadPath =  path.join(safeDirectory, userPath)
    const totalFileSize = parseInt(req.headers['content-length'], 10)
    console.log("Content lenght from header:",totalFileSize)
    // if (req.header['content-length']) {
    //     totalFileSize = parseInt(req.headers['content-length'], 10)
    // }

    bb.on('file', (fieldname, file, info) => {
        const { filename } = info
        const saveTo = path.join(uploadPath, filename)
        const writeStream = fsnp.createWriteStream(saveTo)
        let uploadedBytes = 0;

        console.log("Starting upload", saveTo)

        file.on('data', (chunk) => {
            uploadedBytes += chunk.length
            console.log("file size to upload",totalFileSize)
            if (totalFileSize > 0) {
                const progress = Math.round((uploadedBytes / totalFileSize) * 100)
                console.log(("Progress for file is ",progress))
                sendProgress(uploadId,progress)
            }
        })

        file.pipe(writeStream)

        writeStream.on('error', (err) => {
            console.error('Write stream error:', err);
            sendProgress(uploadId, 'error');
            // res.status(500).json({message:"Error on writeStream",Error:err})
        });

        writeStream.on('finish', () => {
            console.error('Write stream success:', uploadPath);
            res.status(200).json({ message: "success writing data" })
            sendProgress(uploadId,100)
        });

    })

    req.pipe(bb)
})

router.post('/new-folder', async (req, res) => {
    const { path:userPath, folderName } = req.body
    if(!userPath ||!folderName){
        return res.status(400).json({error:'both path and foldre name required'})
    }
    const dirPath = path.join(safeDirectory,userPath)

    try{
        const newfolderPath = path.join(dirPath,folderName)
        await fs.mkdir(newfolderPath)
        res.status(201).json({message:'folder created successfully'})
    }catch(err){
        console.error("Error createing folder",err)
        res.status(500).json({error:"Error creating folder"})
    }
})

router.post('/delete-folder', async (req, res) => {
    const { path:userPath } = req.body
    if(!userPath ){
        return res.status(400).json({error:'both path and foldre name required'})
    }
    const dirPath = path.join(safeDirectory,userPath)

    try{
        const stats = await fs.stat(dirPath)
        if(stats.isDirectory())
        {
            await fs.rm(dirPath,{recursive:true,force:true})
            res.status(201).json({message:'folder created successfully'})
        }else{
            await fs.unlink(itemPath);
            console.log(`File deleted: ${itemPath}`);
            res.status(200).json({ message: 'File deleted successfully.' });
        }
    }catch(err){
        console.error("Error deleting folder",err)
        res.status(500).json({error:"Error deleting folder"})
    }
})

module.exports = router;