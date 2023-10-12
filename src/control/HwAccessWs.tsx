import {HwAccess} from './HwAccess'
import {CreHandler} from './creHandler'
import ReconnectingWebSocket from 'reconnecting-websocket'

type RxDataType = {
    id:number,
    ts:number,
    data:string
}

export class HwAccessWs extends HwAccess {
    private sock:ReconnectingWebSocket | null
    private creHandler:CreHandler|null
    private setCreHandler:(stt:CreHandler|null)=>void
    constructor(
        setCreHandler:(stt:CreHandler|null)=>void,
    ){
        super()
        this.sock = null
        this.setCreHandler = setCreHandler
        this.creHandler = null
    }
    onMessage(e:{data:unknown}){
        const rxDataStr = e.data as string
        const rxData = JSON.parse(rxDataStr) as RxDataType
        if (rxData.data.startsWith("$") && this.creHandler){
            this.creHandler.updateEvt(rxData.data)
        } else if (rxData.data.endsWith("[WUP] Done")) {
            console.log("Target is reseted")
        }
    }
    async init(
        url:string
    ):Promise<boolean> {
        if (this.sock == null) {
            this.sock = new ReconnectingWebSocket(url)
            return new Promise((resolve, reject)=> {
                if (this.sock){
                    this.sock.addEventListener('open',(e:any)=>{
                        console.log(`Socket connected to ${e.target.url}`);
                        if (this.sock) {
                            const creHandler = new CreHandler((dataToSend:string)=>{
                                if (this.sock) {
                                    this.sock.send(dataToSend)
                                    return Promise.resolve(1)
                                } else {
                                    throw new Error("WebSocked is closed")
                                }
                            })
                            this.creHandler = creHandler
                            this.setCreHandler(this.creHandler)
            
                            this.sock.addEventListener('message',(e)=>this.onMessage(e))
                            resolve(true)
                        } else {
                            reject(new Error("WebSocket is opend but this.sock is falsy"))
                        }
                    })
                }
            })
        } else {
            return Promise.resolve(false)
        }
    }
    async finalize():Promise<void> {
        return new Promise((resolve, reject)=>{
            if (this.sock) {
                this.sock.close()
                this.sock.addEventListener('close',()=>{
                    if (this.sock) {
                        this.sock.removeEventListener('message',this.onMessage)
                        this.sock = null
                    }
                    this.setCreHandler(null)
                    resolve()
                })
            } else {
                reject(new Error("WebSocket is not initialized"))
            }
        })
    }
}

