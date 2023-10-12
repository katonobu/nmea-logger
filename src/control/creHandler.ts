type cmdType = string;
type txDataType = cmdType;
type rspType = string;
type evtType = string;
type sendDataType = (txData: txDataType) => Promise<number>;
export type sendCmdWaitRspType = {
    cmd: cmdType,
    rsp: rspType
}

export class MicroStore<T> {
    private obj: T;
    private callbacks: Set<(obj: T) => void>;

    constructor(initObj: T) {
        this.obj = initObj;
        this.callbacks = new Set<() => void>();
    }
    subscribe(cb: (newObj: T) => void): () => void {
        this.callbacks.add(cb);
        return () => {
            this.callbacks.delete(cb);
            return;
        };
    }
    update(newObj: T) {
        if (this.obj != newObj) {
            this.obj = newObj;
            this.callbacks.forEach((cb) => cb(newObj));
        }
    }
    get(): T {
        return this.obj;
    }
}

export class CreHandler {
    private _rspWaitingCmd: MicroStore<cmdType | null>;
    private _rspStore: MicroStore<rspType>;
    private _evtStore: MicroStore<evtType>
    private _sendData: sendDataType;
    constructor(sendData: sendDataType) {
        this._rspWaitingCmd = new MicroStore<cmdType | null>(null);
        this._rspStore = new MicroStore<rspType>('');
        this._evtStore = new MicroStore<evtType>('');
        this._sendData = sendData;
    }
    sendCmdWaitRsp = (
        command: cmdType,
        signal: AbortSignal | null,
        timeoutMs: number
    ): Promise<sendCmdWaitRspType> => {
        return new Promise(async (resolve, reject) => {
            let timerId:NodeJS.Timeout|null = null;
            const cleanupCallbaks = () => {
                if (timerId != null) {
                    clearTimeout(timerId);
                }
                unsubscribeRsp();
                this._rspWaitingCmd.update(null);
                signal?.removeEventListener('abort', cleanupCallbaks);
            };

            if (this._rspWaitingCmd.get()) {
                reject(new Error('cmd busy'));
            }
            const unsubscribeRsp = this._rspStore.subscribe((rsp) => {
                cleanupCallbaks();
                resolve({ cmd: command, rsp });
            });
            if (0 < timeoutMs) {
                timerId = setTimeout(() => {
                    timerId = null;
                    cleanupCallbaks();
                    console.log(`timeout:${command}`)
                    reject(new Error(`timeout:${command}`));
                }, timeoutMs);
            }
            signal?.addEventListener(
                'abort',
                () => {
                    cleanupCallbaks();
                    reject(new Error('Canceled'));
                },
                {
                    once: true,
                }
            );

            this._rspWaitingCmd.update(command);
            this.sendCmd(command)
                .then((_) => {
                    // to nothing, wait for response
                })
                .catch((e) => {
                    cleanupCallbaks();
                    reject(e);
                });
        });
    };
    subscribeCmdBusy(cb: (stt: boolean) => void): () => void {
        return this._rspWaitingCmd.subscribe((newCmd) => {
            cb(newCmd !== null);
        });
    }
    updateRsp(rsp: rspType): void {
        this._rspStore.update(rsp);
    }
    waitEvt(evalFunc: (arg: string) => boolean, timeoutMs: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const unsubscribeEvt = this._evtStore.subscribe((evt: string) => {
                if (evalFunc(evt)) {
                    unsubscribeEvt()
                    clearTimeout(timerId)
                    resolve(evt)
                }
            })
            const timerId = setTimeout(() => {
                unsubscribeEvt()
                reject("Timeout")
            }, timeoutMs)
        })
    }
    subscribeEvt(cb: (stt: evtType) => void): () => void {
        return this._evtStore.subscribe(cb);
    }
    updateEvt(evt: evtType): void {
//        console.log(evt)
        this._evtStore.update(evt)
    }
    sendCmd(data: cmdType): Promise<number> {
        return this._sendData(data);
    }
}
