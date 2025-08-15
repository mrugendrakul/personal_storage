import { useEffect } from "react"

const useWebSocket = (url, StateData,setIsConnected=()=>{}) => {

    useEffect(() => {
        const ws = new WebSocket(url)
        ws.onopen = () => {
            console.log('WebSocket Connected : ',url)
            setIsConnected(true)
        }
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                StateData(data)
            } catch (err) {
                console.error("Error got here getting data:", err)
            }
        }
        ws.onclose = () => {
            console.log('webSocket disconnected')
            setIsConnected(false)
        }
        return () => {
            ws.close();
        }
    }, [url, StateData])
}

export default useWebSocket