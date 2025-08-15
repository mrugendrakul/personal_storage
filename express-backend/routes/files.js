var express = require('express');
var router = express.Router();
const fs = require('fs').promises;
const path = require('path')
const si = require('systeminformation')
const safeDirectory = '/home/Mrugendra/safeDirectory'
const multer = require('multer')

const bytesToGB =(bytes)=>parseFloat( (bytes/(1024*1024*1024)).toFixed(2))
const bytesToMB =(bytes)=>parseFloat( (bytes/(1024*1024)).toFixed(2))

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        const userPath = req.query.path || '/'
        const dirPath = path.join(safeDirectory,userPath)
        cb(null,dirPath)
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})

const upload = multer({
    storage:storage
})
/* GET users listing. */
router.get('/disks', async (req, res, next) =>{
    try{
        const disks = await si.fsSize()
        const mountPoints = disks.map(disk =>({
            name:disk.fs,
            mount:disk.mount,
            size:bytesToGB(disk.size),
            usedParcent:disk.use
        }))
        res.json(mountPoints)
    }catch(err){
        console.error("Error getting disks",err)
        res.status(500).json({error:"Error fetching disks"})
    }
});

router.post('/browse',async(req,res)=>{
    // const userPath = req.body.path || '/'
    // const requestedPath = path.resolve(ROOT_DIRECTORY,userPath)

    // if(!requestedPath.startsWith(ROOT_DIRECTORY)){
    //     return res.status(403).json({error:"No such path found"})
    // }

    const userPath = req.body.path || '/'
    const dirPath = path.join(safeDirectory,userPath)

    try{
        const items = await fs.readdir(dirPath,{withFileTypes:true})
        const contents = await Promise.all(
            items.map(async (item)=>{
                const showPath = path.join(userPath,item.name)
                const itemPath = path.join(dirPath,item.name)
                try{
                    const stats = await fs.stat(itemPath)
                    return{
                        name:item.name,
                        path:showPath,
                        isDirectory:item.isDirectory(),
                        size:stats.size,
                        modified:stats.mtime
                    }
                }catch(e){
                    return {
                        name:item.name,
                        path:showPath,
                        isDirectory:item.isDirectory(),
                        size:'N/A',
                        modified:'N/A'
                    }
                }
            })
        )
        res.json(contents)
    }catch(err){
        console.error("Error getting files",err)
        res.status(500).json({error:"Error getting files"})
    }
})


router.get('/download',(req,res)=>{
    const userPath = req.query.path;

    if(!userPath){
        return res.status(400).json({error:'file path is required'})
    }

    const dirPath = path.join(safeDirectory,userPath)
    res.download(dirPath,(err)=>{
        if(err){
            console.error(`Error downloading file ${dirPath}:`, err);
            if (!res.headersSent) {
                res.status(404).json({ error: 'File not found or permission denied.' });
            }
        }
    })
})

router.post('/upload',(req,res)=>{
    const uploader = upload.single('file')
    console.log("upload data req", req.query.path)
    uploader(req,res,function(err){
        if(err instanceof multer.MulterError){
            return res.status(500).json({error:"multer error"+err.message})
        }
        else if (err) {
            // An unknown error occurred (like our custom path validation error)
            return res.status(403).json({ error: err.message });
        }

        // Everything went fine, file is uploaded
        if (!req.file) {
            return res.status(400).send('No file was uploaded.');
        }
        
        res.status(201).json({
            message: 'File uploaded successfully!',
            filename: req.file.filename,
            path: req.file.path
        });
    })
})



module.exports = router;