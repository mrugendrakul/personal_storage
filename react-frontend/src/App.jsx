
import './App.css'
import FileExplorer from './Applications/FileExplorer'
import LiveStats from './components/LiveStats'
import SystemInfo from './components/SystemInfo'
import Desktop from './Desktop/Desktop'

function App() {
  return(
    <div className='w-screen h-screen bg-slate-100'>
      {/* <div className='flex flex-row'>
      <div className='w-1/4 min-w-sm '>
      <LiveStats/>
      <SystemInfo/>
      </div>
      <div className=' min-w-lg h-screen w-3/4'>
        <FileExplorer/>
      </div>
      </div> */}
      <Desktop/>
    </div>
)
}

export default App
