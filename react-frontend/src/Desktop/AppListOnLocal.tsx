import { JSX } from "react"
import FileExplorer from "../Applications/FileExplorer"
import FileExplorerIcon from "../Applications/FileExplorer/FileExplorer.icon"

type AppConfig = {
    topbar : JSX.Element,
    content : JSX.Element,
    icon : JSX.Element,
    title:string
}

type appList = {[key:string]: AppConfig}

const AppListMock = {
    FileExplorer : {
        topbar : <p>File Explorer</p>,
        content : <FileExplorer closeButton={()=>{}}/>,
        icon: <FileExplorerIcon height={50} width={50} innerFill={""} outerFill={""}/>,
        title: "File Explorer"
    },
}

export default AppListMock