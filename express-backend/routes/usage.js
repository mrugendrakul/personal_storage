var express = require('express');
var router = express.Router();
const si = require('systeminformation')

/* GET users listing. */
router.get('/cpu', async (req, res, next) => {
    try {
        const [cpuInfo , fs,gpu] = await Promise.all([
            si.cpu(),
            si.fsSize(),
            si.graphics()
        ])
        const bytesToGB =(bytes)=>parseFloat( (bytes/(1024*1024*1024)).toFixed(2))
        const stats = {
            cpuInfo: { 
                name: cpuInfo.manufacturer+cpuInfo.brand,
            },
            storage:{
                total:bytesToGB(fs[0].size),
                type:fs[0].type,
                numberOfStorage:fs.length,
                used:bytesToGB(fs[0].used),
                percent:fs[0].use
            },
            gpu:gpu.controllers.map(gpu=>({
                modal:gpu.model,
                load:gpu.utilizationGpu || 'N/A',
                memory_used: parseFloat((gpu.memoryUsed/1024).toFixed(2)) || 'N/A',
                memory_total: parseFloat((gpu.memoryTotal/1024).toFixed(2)) || 'N/A'
            }))
            
        }
        res.json(stats)
    }
    catch (err) {
        console.error("Error fetching system details", err);
        res.status(500).json({ message: "Error fetching system details ", error: err })
    }
});

module.exports = router;
