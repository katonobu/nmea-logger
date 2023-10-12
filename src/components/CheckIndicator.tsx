const CheckIndicator = (props: {
    checked: boolean,
    checkedStr: string,
    unCheckedStr?: string,
    attackDurationMs?: number,
    releaseDurationMs?: number,
    checkedColor?: string,
    unCheckedColor?: string
}) => {
    const {
        checked,
        checkedStr,
        unCheckedStr = checkedStr,
        attackDurationMs = 0,
        releaseDurationMs = 0,
        checkedColor = 'blue',
        unCheckedColor = 'gray'
    } = props
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center'
            }}
        >
            <div
                style={{
                    position: 'relative'
                }}
            >
                <div
                    // 状態を表す丸
                    style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '12px',
                        // checke状態に応じて色を変える
                        backgroundColor: checked ? checkedColor : unCheckedColor,
                        transition: checked ?
                            `background-color ${attackDurationMs}ms ease-in-out`
                            :
                            `background-color ${releaseDurationMs}ms ease-in-out`,
                        transform: 'translateX(50%)'
                    }}
                />
                <div
                    // スライドスイッチの背景相当は場所を確保して透過100%にして
                    style={{
                        width: '56px',
                        borderRadius: '15px',
                        height: '32px',
                        backgroundColor: 'rgba(0,0,0,0.0)'
                    }}
                />
            </div>
            <span
                style={{
                    marginLeft: '4px'
                }}
            >{
                    checked ?
                        checkedStr
                        :
                        unCheckedStr
            }</span>
        </div>
    )
}
export default CheckIndicator  