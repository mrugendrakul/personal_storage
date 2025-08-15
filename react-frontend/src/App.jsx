
import './App.css'
import FileExplorer from './components/FileExplorer'
import LiveStats from './components/LiveStats'
import SystemInfo from './components/SystemInfo'

function App() {
  return(
    <div className='flex flex-col  w-screen h-screen'>
      <div className='flex flex-row'>
      <div className='w-1/4 min-w-sm bg-slate-100'>
      <LiveStats/>
      <SystemInfo/>
      </div>
      <div className=' min-w-lg h-screen w-3/4'>
        <FileExplorer/>
      </div>
      </div>
    </div>
)
}

export default App
