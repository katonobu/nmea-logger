export const DispDebugSelect = (props: {
    setDispDebug: (stt: boolean) => void,
    dispDebug: boolean
}) => {
    const { setDispDebug, dispDebug } = props
    return <>
        <label
            htmlFor={'disp-debug'}
        >
            <input
                // width,heightともに0なので見えない
                type="checkbox"
                id={'disp-debug'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    //              console.log(event.target.checked)
                    setDispDebug(event.target.checked)
                }}
                checked={dispDebug}
            />
            View Debugging Info
        </label>
    </>
}

