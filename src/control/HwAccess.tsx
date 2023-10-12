
export class HwAccess {
    constructor() {
    }
    async init(
        // @ts-ignore
        option: any
    ): Promise<boolean> {
        console.log("init()")
        await new Promise<void>((resolve) => setTimeout(resolve, 1500))
        return true
    }
    // sendCmdNoWait
    // sendCmdWaitRsp
    async finalize(): Promise<void> {
        console.log(`finalize()`)
        await new Promise<void>((resolve) => setTimeout(resolve, 10))
    }
}

