import React, { JSX, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './ApplicationWindow.css'

type appProps = {
    topbar:  JSX.Element,
    content : JSX.Element,
    onMinimize: ()=>void,
    onClose: ()=>void
}

type coordinate = {
    top: number,
    left: number,
}

type windowSize = {
    wid:number,
    hei:number,
}

const ApplicationWindow = ({topbar,content,onMinimize,onClose}:appProps)=> {
    const isActive = useRef(false)
    const [isDragging,setIsDragging] = useState<Boolean>(false)
    const [isResizing,setIsResizing] = useState<Boolean>(false)
    const [windowSize,setWindowSize] = useState<windowSize>({wid:600,hei:500})
    const startingWidth = window.innerWidth;
    const startingHeight = window.innerHeight;
    const [coordindate,setCoordinate] = useState<coordinate>({
        top:(startingHeight-windowSize.hei)/2,left:(startingWidth-windowSize.wid)/2
    })

    const drapOffset = useRef<coordinate>({top:0,left:0})
    const initalResize = useRef({
        wid:0,hei:0,x:0,y:0
    })

    useEffect(()=>{
        console.log("Getting active",isActive.current)
        const handleMouseMove = (e:MouseEvent)=>{
            if(isActive.current === false){
            return
        }
        setCoordinate({
                        top:e.clientY-drapOffset.current.top,
                        left:e.clientX-drapOffset.current.left
                    })
        }

        const onMouseUp=(e:MouseEvent)=>{
                setIsDragging(false)
                console.log("mouse up")
                isActive.current = false
            }
        if(isActive.current){
            window.addEventListener('mousemove',handleMouseMove)
            window.addEventListener('mouseup',onMouseUp)
        }
        return ()=>{
            window.removeEventListener('mousemove',handleMouseMove)
            window.removeEventListener('mouseup',onMouseUp)
        }
    },[isActive,isDragging])

    useEffect(()=>{
        console.log("Starting resizing ",isResizing)
        const handleResizing = (e:MouseEvent)=>{
            if(!isResizing){
                window.removeEventListener('mousemove',handleResizing)
                return
            }
            else{
                setWindowSize({
                    wid:Math.max(400,initalResize.current.wid + (e.clientX-initalResize.current.x)),
                    hei:Math.max(400,initalResize.current.hei+(e.clientY - initalResize.current.y)),
                })
            }
        }

        window.addEventListener('mousemove',handleResizing)
        window.addEventListener('mouseup',(e)=>{
            setIsResizing(false)
        })
        return()=>{
            window.removeEventListener('mousemove',handleResizing)
            window.removeEventListener('mouseup',(e)=>{
                setIsResizing(false)
            })
        }
    },[isResizing])
  return (
    <div id='app-window'
    style={{
        top:`${coordindate?.top}px`,
        left:`${coordindate?.left}px`,
        width:`${windowSize.wid}px`,
        height:`${windowSize.hei}px`,
        }}>
        <div id='topbar'
        style={{cursor:`${isDragging?'grabbing':'grab'}`}}
            onMouseDown={(e)=>{
                console.log("ON Mouse down")
                e.preventDefault()
                setIsDragging(true)
                isActive.current = true
                drapOffset.current = {
                    top:e.clientY - coordindate.top,
                    left:e.clientX - coordindate.left
                }  
            }}
        >   
            <div id='title' >{topbar}</div>
            <button id='min' className='window-button'
            onClick={onMinimize}
            style={{cursor:'pointer'}}>➖</button>
            <button className=' hover:bg-red-400 p-3 window-button'
            onClick={onClose}
            >
                <svg className='fill-current h-6 w-6' viewBox="0 -960 960 960"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>
            </button>
        </div>
        <div id='app-content'>
            {content}
        </div>
        <div
            id='resize-handler'
            onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation() // Prevents the window from thinking you are dragging it
                setIsResizing(true)
                initalResize.current = {
                    wid:windowSize.wid,
                    hei:windowSize.hei,
                    y:e.clientY,
                    x:e.clientX
                }
            }}
            style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '15px',
                height: '15px',
                cursor: 'nwse-resize',
                zIndex: 10
            }}
            />
    </div>
  )
}

export default ApplicationWindow