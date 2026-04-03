import React from 'react'
import './ApplicationMenu.css'
import AppListMock from '../../Desktop/AppListOnLocal'
import { taskbarApp } from '../TaskbarList/TaskbarList'

type ApplicationMenuProps = {
    appInstalled:Array<taskbarApp>,
    openApplication : (id:keyof typeof AppListMock)=>void,
    unMountMenu:()=>void,
    closeMenu : ()=>void,
    className:string,
}

const ApplicationMenu = ({appInstalled,openApplication,unMountMenu,closeMenu,className}:ApplicationMenuProps) => {
  return (
    <div id='application-shell'>
        <div id='Application-menu' className={className}
        onAnimationEnd={()=>{unMountMenu()
        }}
        >
            <div id="Apps">
                {
        appInstalled.map(app=>(<button
        id='app'
        key={app.id}
        onClick={()=>{
            openApplication(app.id)
            closeMenu()
            }}>
            {app.icon}
            {app.title}
            </button>))
        }</div></div>
    </div>
  )
}

export default ApplicationMenu