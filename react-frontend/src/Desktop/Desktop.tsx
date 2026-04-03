import React, { Activity, useEffect, useState } from 'react'
import './Desktop.css'
import LiveStats from '../components/LiveStats'
import SystemInfo from '../components/SystemInfo'
import ApplicationWindow from '../components/ApplicationWindow'
import TaskbarList, { taskbarApp } from '../components/TaskbarList/TaskbarList'
import AppListMock from './AppListOnLocal'
import FileExplorerIcon from '../Applications/FileExplorer/FileExplorer.icon'
import ApplicationMenu from '../components/ApplicationMenu/ApplicationMenu'
import AppMenuIcon from '../components/ApplicationMenu/AppMenuIcon'

const Desktop = () => {
    const [openApps,setOpenApps] = useState<Array<taskbarApp>>([
        {
            title:"File Explore",
            icon:<FileExplorerIcon height={50} width={50} innerFill={""} outerFill={""}/>,
            id:"FileExplorer",
            minimizeStatus: "maximized"
        }
    ])
    const [showAppMenu,setShowAppMenu] = useState<Boolean>(false)
    const [openAppMenu,setOpenAppMenu] = useState<Boolean>(false)

    useEffect(()=>{
        console.log("Called with open App menu")
        if(openAppMenu){
            setShowAppMenu(true);
        }
    },[openAppMenu])

    const appIds = Object.keys(AppListMock) as Array<keyof typeof AppListMock>
    const installedApps:Array<taskbarApp> = Object.values(AppListMock).map((app,index)=>({
        title:app.title,
        icon: app.icon,
        id: appIds[index],
        minimizeStatus : "close"
    }))

    const onClose =(id:string)=>{
        setOpenApps(prev=>{
            const newArr = prev.filter(app=>app.id!== id)
            return newArr
        })
    }

    const onMinimize = (id:string)=>{
        setOpenApps(prev=> prev.map(app=>
            app.id === id ? {...app, minimizeStatus:"minimized"} : app
        ))
    }

    const onMaximize = (id:string)=>{
        setOpenApps(prev=> prev.map(app=>
            app.id === id ? {...app, minimizeStatus:"maximized"} : app
        ))
    }

    const onOpenApplication = (id:keyof typeof AppListMock) =>{
        const openApp = AppListMock[id]
        if (openApps.some(app=>(app.id === id))){
            return
        }
        setOpenApps(prev=>[...prev ,{
            title : openApp.title,
            icon : openApp.icon,
            id : id,
            minimizeStatus: "maximized"
        } ])
    }

    const unmountMenu = ()=>{
        if(!openAppMenu)
            {
        setShowAppMenu(false)
        }
    }

    return (
        <div
            id='desktop-background'
            style={{ background: 'url(wallpaper-4k.jpg)' }}
        >
            {showAppMenu && <ApplicationMenu appInstalled={installedApps} 
            openApplication={onOpenApplication} 
            closeMenu={()=>{setOpenAppMenu(false)}}
            unMountMenu={unmountMenu}
            className={`${openAppMenu?'slideIn' : 'slideOut'}`}
            />}
            <div id='usable-space'>
                <div className='w-1/4 min-w-sm '>
                    <LiveStats />
                    <SystemInfo />
                </div>
                {openApps.map(app=>{
                    const currentApp = AppListMock[app.id]
                    return <Activity
                        mode={`${app.minimizeStatus === 'minimized'?'hidden':'visible'}`}
                    >
                        <ApplicationWindow 
                        key={app.id} 
                        topbar={currentApp.topbar} 
                        content={currentApp.content} 
                        onMinimize={()=>{onMinimize(app.id)}} 
                        onClose={()=>{onClose(app.id)}}/>
                    </Activity>
                })}
            </div>
            <div id='taksbar'>
                <button id="app-menu-icon" onClick={()=>{setOpenAppMenu(prev=>!prev)}}><AppMenuIcon/></button>
                <TaskbarList openApps={openApps} pinApps = {openApps} maximized={onMaximize}/>
            </div>
        </div>
    )
}

export default Desktop