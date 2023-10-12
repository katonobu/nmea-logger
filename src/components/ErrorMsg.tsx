
export const ErrorMessagePre = (props: { errMsgs: string[] }) => {
    const {errMsgs} = props
    return (
        <div>
            {errMsgs.map((msg, idx) => (
                <pre
                    key={idx.toString(10)}
                    style={{ margin: '8px' }}
                >{msg}</pre>
            ))}
        </div>

    )
}
