
// https://reffect.co.jp/html/toggle-switch/
const SlideSwitch = (props: {
    id:string,
    checked: boolean,
    setChecked: (stt: boolean) => void,
    checkedStr: string,
    unCheckedStr?: string,
    transformDurationMs?: number,
    checkedColor?: string,
    unCheckedColor?: string,
    disabledColor?: string,
    disabledBorderColor?: string,
    disabledBorderLineStyle?: string,
    disabledBorderLineWidth?: string,
    checkedBackgroundColor?: string,
    unCheckedBackgroundColor?: string,
    disabledBackgroundColor?: string,
    disabled?:boolean
}) => {
    const {
        id,
        checked,
        setChecked,
        checkedStr,
        unCheckedStr = checkedStr,
        transformDurationMs = 300,
        checkedColor = 'blue',
        unCheckedColor = 'white',
        disabledColor = 'rgb(239,239,239)',
        disabledBorderColor = 'rgb(16,16,16)',
        disabledBorderLineStyle = 'dashed',
        disabledBorderLineWidth = '0.5px',
        checkedBackgroundColor = 'rgb(219, 234, 254)',
        unCheckedBackgroundColor = 'rgb(208,208,208)',
        disabledBackgroundColor = 'rgb(239,239,239)',
        disabled = false
    } = props
    return (
        <div>
            <label
                // このlabel要素内でクリックするとcheckboxのonChange()が呼ばれる
                htmlFor={`switch_${id}`}
                style={{
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <div
                    // このdiv でスライドスイッチ背景、丸、checkbox要素をまとめる
                    style={{
                        position: 'relative'
                    }}
                >
                    <input
                        // width,heightともに0なので見えない
                        type="checkbox"
                        id={`switch_${id}`}
                        disabled={disabled}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            //              console.log(event.target.checked)
                            setChecked(event.target.checked)
                        }}
                        checked={checked}
                        style={{
                            position: 'absolute',
                            width: '0',
                            height: '0'
                        }}
                    />
                    <div
                        // スライドする丸
                        style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '12px',
                            // checke状態に応じて色を変える
                            backgroundColor: disabled ? disabledColor
                                :
                                    checked ? 
                                        checkedColor 
                                    : 
                                        unCheckedColor,
                            // checke状態に応じて位置を変える
                            transform: checked ? 'translateX(100%)' : 'translateX(0)',
                            // checke状態変化時ゆっくり動かす
                            transition: `transform ${transformDurationMs}ms ease-in-out`,
                            border: disabled ? 
                                disabledBorderLineWidth + ' ' + disabledBorderLineStyle + ' ' + disabledBorderColor
                            :
                                'none'
                        }}
                    />
                    <div
                        // スライドスイッチの背景
                        style={{
                            width: '56px',
                            borderRadius: '15px',
                            height: '32px',
                            backgroundColor:  disabled ? disabledBackgroundColor
                            :
                                checked ? 
                                    checkedBackgroundColor
                                : 
                                    unCheckedBackgroundColor
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
            </label>
        </div>
    )
}
export default SlideSwitch