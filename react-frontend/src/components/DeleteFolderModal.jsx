import axios from 'axios'
import React from 'react'

const DeleteFolderModal = ({dismissModal,deletePath,deleteDirectory}) => {
  const newPath = deletePath === '/' ? `/${deleteDirectory}` : `${deletePath}/${deleteDirectory}`
  const deleteFolder = ()=>{
    axios.post('/personal-cloud/files/delete-folder',{
      path:newPath
    })
    .then((res)=>{
      console.log("Delete successful",res)
      dismissModal()
    }).catch((res)=>{
      console.error("Delete failed")
      alert(`Detele failed try again : ${res}`)
    })
  }
  return (
   <div
    className='fixed w-full h-screen bg-gray-400/50 top-0 left-0 z-10 flex justify-center items-center'
    >
        <div className='flex bg-white p-4 justify-center flex-col rounded-2xl'>
            <p className='text-center text-2xl font-bold pb-2'>Are you sure to delete this folder</p>
            <div className='flex flex-row items-end justify-end pt-2 gap-2'>
                <button className='p-2 bg-blue-300 border-2 border-blue-300 px-3 rounded-md disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400'
                
                onClick={deleteFolder}
                >Ok</button>
                <button className='p-2 border-2 border-blue-300 px-3 rounded-md'
                onClick={dismissModal}
                >Cancel</button>
            </div>
        </div>
    </div>
  )
}

export default DeleteFolderModal