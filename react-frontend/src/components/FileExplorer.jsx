import React, { useRef, useState } from 'react'
import useWebSocket from '../customHooks/useWebSocket'
import axios from 'axios'
import NewFolderModal from './NewFolderModal'

function generateUUID() {
  // Check if the modern crypto API is available
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers or non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const FileExplorer = () => {
    const [isConnected, setIsConnected] = useState(false)
    const [currentPath, setCurrentPath] = useState('/')
    const [isUploading, setIsUploading] = useState(false)
    const [fileSelected, setFileSeleted] = useState(null)
    const fileInputRef = useRef(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [settingNewfolder, setSettingNewFolder] = useState(false)
    const [fileData, setFileData] = useState({
        "type": "initial",
        "path": "/",
        "contents": [
            {
                "name": "...",
                "path": "/",
                "isDirectory": false,
                "size": 0,
                "modified": "2024-11-29T13:43:07.800Z",
                "extension": "..."
            }
        ]
    })
    useWebSocket(`/personal-live-cloud/file-system?path=${currentPath}`, setFileData, setIsConnected)

    const handleOnClick = (Path, Name, isDirectory) => {
        const newPath = Path === '/' ? `/${Name}` : `${Path}/${Name}`
        if (isDirectory) { setCurrentPath(newPath) }
        else {
            window.open(`/personal-cloud/files/download?path=${newPath}`)
        }
    }
    const iconPaths = {
        folder: <svg className='fill-current h-6 w-6' viewBox="0 -960 960 960" ><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h207q16 0 30.5 6t25.5 17l57 57h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z" /></svg>,
        files: <svg className='fill-current h-6 w-6' viewBox="0 -960 960 960"><path d="M160-160q-33 0-56.5-23.5T80-240v-400q0-33 23.5-56.5T160-720h240l80-80h320q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm73-280h207v-207L233-440Zm-73-40 160-160H160v160Zm0 120v120h640v-480H520v280q0 33-23.5 56.5T440-360H160Zm280-160Z" /></svg>
    }
    const handleGoUp = () => {
        if (currentPath === '/') return;
        const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
        setCurrentPath(parentPath);
    };
    const handleSelectFile = (e) => {
        setFileSeleted(e.target.files[0])
    }
    const handleUploadProgress = (uploadId) => {
        console.log("Called handling the upload id", uploadId)
        const ws = new WebSocket(`/personal-live-cloud/upload-progress?id=${uploadId}`)
        ws.onopen = () => {
            console.log("We are connected to get the updates")
            setIsUploading(true)
        }
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'progress') {
                    setUploadProgress(data.progress)
                }
            }
            catch (err) {
                console.error("Error get on upload ws", err)
            }
        }
        ws.onclose = () => {
            console.log("File uploaded successfully ig")
            setUploadProgress(0)
            setFileSeleted(null)
            fileInputRef.current.value = null
        }
    }

    const handleUpload = async () => {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', fileSelected)
        formData.append('path', currentPath)
        console.log("form data path", currentPath)
        const uploadId = generateUUID()
        try {
            handleUploadProgress(uploadId)
            axios.post(`/personal-cloud/files/upload?path=${currentPath}&id=${uploadId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then((res) => {
                console.log("Response we got", res.data)
                if (res.status === 200) {
                    console.log("File uploaded successfully", res)
                    setIsUploading(false)
                    setFileSeleted(null)
                    fileInputRef.current.value = null
                }
            })


        } catch (err) {
            console.log("Error uploaidn file", err)
            setIsUploading(false)
        }
    }
    return (
        <div>
            {settingNewfolder && <NewFolderModal dismissModal={() => { setSettingNewFolder(false) }} currentPath={currentPath} />}
            <div className='flex flex-row justify-between align-center'>
                <div className='flex flex-row gap-2'>
                    <button onClick={handleGoUp}>
                        GO up
                    </button>
                    <div>
                        {isConnected ? <p className='text-green-500'>connected</p> : <p className='text-red-600'>not connected</p>}
                        {currentPath}
                    </div>
                </div>
                <div className='flex flex-row gap-2 items-center justify-center'>
                    <button
                        className='mr-2 rounded-sm p-2 m-2 bg-blue-200 hover:cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400'

                        onClick={() => { setSettingNewFolder(true) }}>
                        Create new folder
                    </button>
                    {!isUploading && <p className={'bg-blue-300 rounded-md p-0.5'}>
                        {fileSelected?.name}
                    </p>}
                    {isUploading &&
                    <div>
                        <div className={'bg-slate-200 rounded-md p-0.5 relative'}>
                            {fileSelected?.name}
                            <div className={`bg-green-500/30 absolute top-0 left-0 p-0.5 rounded-md transition-all ease-in-out duration-50 h-full`}
                                style={{ width: `${uploadProgress}%` }}
                            >
                            </div>
                        </div>
                    </div>
                    }
                    <input type='file' name='file' onChange={handleSelectFile} className='hidden' id='file-upload' ref={fileInputRef} />
                    <label
                        className='mr-2 rounded-sm p-2 m-2 bg-blue-200 hover:cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400'
                        htmlFor='file-upload'
                        >
                        Choose file
                    </label>
                    <button
                        className='mr-2 rounded-sm p-2 m-2 bg-blue-200 hover:cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400'
                        disabled={isUploading || fileSelected === null || fileSelected === undefined}
                        onClick={handleUpload}>
                        Upload
                    </button>
                </div>
            </div>
            <div className='overflow-x-auto'>
                <table className='w-full text-left'>
                    <thead className='bg-slate-200'>
                        <tr>
                            <th className='px-3 py-2'>
                                name
                            </th>
                            <th className='px-3 py-2 '>
                                path
                            </th>
                            <th className='px-3 py-2 '>
                                size
                            </th>
                            <th className='px-3 py-2 '>
                                modified
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {fileData.contents && fileData.contents.map((file, index) =>
                            <tr className='hover:bg-blue-200 hover:cursor-pointer' key={index}
                                onClick={() => { handleOnClick(file.path, file.name, file.isDirectory) }}
                            >
                                <td className='flex flex-row gap-1 py-2 border-b-gray-200 border-b-1'>
                                    {file.isDirectory && iconPaths.folder}
                                    {!file.isDirectory && iconPaths.files}
                                    {file.name}
                                </td>
                                <td className=' py-2 border-b-gray-200 border-b-1'>
                                    {file.path}
                                </td >
                                <td className='py-2 border-b-gray-200 border-b-1'>
                                    {file.size}
                                </td>
                                <td className='py-2 border-b-gray-200 border-b-1'>
                                    {file.modified}
                                </td>
                            </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default FileExplorer