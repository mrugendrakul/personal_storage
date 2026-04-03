import React, { JSX } from 'react'
import AppListMock from '../../Desktop/AppListOnLocal'
import './TaskbarList.css'
import AppMenuIcon from '../ApplicationMenu/AppMenuIcon'

export type taskbarApp = {
  title: String,
  icon: JSX.Element,
  id: keyof typeof AppListMock,
  minimizeStatus: "minimized" | "maximized" | "close"
}

type taskbarProps = {
  pinApps: Array<taskbarApp>,
  openApps: Array<taskbarApp>,
  maximized: (id: string) => void,
}

const TaskbarList = ({ pinApps, openApps, maximized }: taskbarProps) => {
  return (
    <div id="bar-list">
      {openApps.map(app => (
      <button
        className='taskbar-list'
        key={app.id}
        onClick={() => { maximized(app.id) }}
      >
        <div id='app-icon' className='app-icon'>{app.icon}</div>
        {/* <p className='app-text'>{app.title}</p> */}
      </button>))}</div>
  )
}

export default TaskbarList