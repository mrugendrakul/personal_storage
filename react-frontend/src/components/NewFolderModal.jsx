import axios from 'axios'
import React, { useState } from 'react'

const NewFolderModal = ({dismissModal,currentPath}) => {
    const [folderName,setFolderName] = useState('')
    const createNewFolder = ()=>{
        try{
            axios.post('/personal-cloud/files/new-folder',{
                path:currentPath,
                folderName:folderName
            })
            .then((res)=>{
                console.log("Folder created successfully",res)
                dismissModal()
            })
            .catch((err)=>{
                console.error("Error createing dfolder",err)
                dismissModal()
            })
        }catch(err){
            console.error("Error creating folder",err)
        }
    }
  return (
    <div
    className='fixed w-full h-screen bg-gray-400/50 top-0 left-0 z-10 flex justify-center items-center'
    >
        <div className='flex bg-white p-4 justify-center flex-col rounded-2xl'>
            <p className='text-center text-2xl font-bold pb-2'>Create new folder</p>
            <input className='border-none ring-1 ring-gray-400 focus:outline-none focus:ring-blue-400 px-2 py-2 rounded-md'
            placeholder='Enter folder name'
            value={folderName}
            onChange={(e)=>{setFolderName(e.target.value)}}
            />
            <div className='flex flex-row items-end justify-end pt-2 gap-2'>
                <button className='p-2 bg-blue-300 border-2 border-blue-300 px-3 rounded-md disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400'
                disabled={folderName === ''}
                onClick={createNewFolder}
                >Ok</button>
                <button className='p-2 border-2 border-blue-300 px-3 rounded-md'
                onClick={dismissModal}
                >Cancel</button>
            </div>
        </div>
    </div>
  )
}

export default NewFolderModal