import {sentenceInfoType, sentencesInfoType, extractZdaString, dmLocToD, extractGsvSentences, GsvArgEle} from '../hooks/useNmea'


export const NmeaSentencesPre = (props: { sentenceInfos: sentenceInfoType[]}) => {
    const { sentenceInfos} = props
    return (
        <>{
            sentenceInfos.map((sen, idx)=>(
                <pre key={idx.toString(10)}>{sen.sentence}</pre>
            ))
        }
        </>
    )
}
export const NmeaMultiLineSentencesPre = (props: {multiLineSentencesInfo:sentencesInfoType[] }) => {
    const { multiLineSentencesInfo} = props
    return (
        <>{
            multiLineSentencesInfo.map((sens)=>(
                sens.sentences.map((sen, idx)=>
                    <pre key={idx.toString(10)}>{sen}</pre>                
                )
            ))
        }
        </>
    )
}


export const ZdaView = (props: { sentenceInfos: sentenceInfoType[] }) => {
    const { sentenceInfos } = props
    let zda = sentenceInfos.find((si) => si.name === '$GNZDA')
    if (zda === undefined || zda.sentence === '') {
        zda = sentenceInfos.find((si) => si.name === '$GPZDA')
    }
    const dateTime = extractZdaString(zda)
    const sec = dateTime.getSeconds()
    let bgColor = ''
    let fontColor = '#213547'

    if(2000 < dateTime.getFullYear()){
        if ((sec % 2) === 0) {
            bgColor = "rgb(219, 234, 254)"
        } else {
            bgColor = 'blue'
            fontColor = 'white'
        }
    } else {
        if ((sec % 2) === 0) {
            bgColor = 'gray'
            fontColor = 'white'
        } else {
            bgColor = 'silver'
        }
    }

    return (
        <div
            style={{
                fontSize: '24px',
                textAlign: 'center',
                margin: '4px'
            }}
        >
            <span
                style={{
                    padding: '4px',
                    backgroundColor: bgColor,
                    color: fontColor,
                    borderRadius: '4px'
                }}
            >
                {dateTime.toLocaleString()}
            </span>
        </div>
    )
}

export const RmcLatLonView = (props: { sentenceInfos: sentenceInfoType[] }) => {
    const { sentenceInfos } = props
    let rmc = sentenceInfos.find((si) => si.name === '$GNRMC')
    if (rmc === undefined || rmc.sentence === '') {
        rmc = sentenceInfos.find((si) => si.name === '$GPRMC')
    }
    if (rmc) {
        const splitted = rmc.sentence.split(",")
        if (splitted[2] === 'A') {
            const lat = dmLocToD(splitted[3], splitted[4] === 'S')
            const lon = dmLocToD(splitted[5], splitted[6] === 'W')
            if (isNaN(lat) || isNaN(lon)) {
                return <div></div>
            } else {
                return <div>{lat.toFixed(6) + " " + lon.toFixed(6)}</div>
            }
        } else {
            return <div></div>
        }
    }
    return <div></div>
}

export const RmcHeadVelView = (props: { sentenceInfos: sentenceInfoType[] }) => {
    const { sentenceInfos } = props
    let rmc = sentenceInfos.find((si) => si.name === '$GNRMC')
    if (rmc === undefined || rmc.sentence === '') {
        rmc = sentenceInfos.find((si) => si.name === '$GPRMC')
    }
    if (rmc) {
        const splitted = rmc.sentence.split(",")
        if (splitted[2] === 'A') {
            const velKmph = parseFloat(splitted[7])*1.852
            const head = parseFloat(splitted[8])
            if (!isNaN(velKmph) && !isNaN(head)) {
                return <div>{velKmph.toFixed(1) + "[km/h] " + head.toFixed(1) + "[deg]"}</div>
            }
        }
    }
    return <div>{"-.-[km/h] ---.-[deg]"}</div>
}

export const RmcNorthCompass = (props: {
    sentenceInfos: sentenceInfoType[],
    width?:number,
    height?:number
}) => {
    const {
        sentenceInfos,
        width,
        height
    } = props
    let headDirectionDeg = 0
    let velocityKmph = 0
    let available = false
    let rmc = sentenceInfos.find((si) => si.name === '$GNRMC')
    if (rmc === undefined || rmc.sentence === '') {
        rmc = sentenceInfos.find((si) => si.name === '$GPRMC')
    }
    if (rmc) {
        const splitted = rmc.sentence.split(",")
        if (splitted[2] === 'A') {
            const head = parseFloat(splitted[8])
            const velKmph = parseFloat(splitted[7])*1.852
            if (!isNaN(velKmph) && !isNaN(head)) {
                available = true
                headDirectionDeg = head
                velocityKmph = velKmph
            }
        }
    }
    return <HeadDirection
        available={available}
        width={width}
        height={height}
        headDirectionDeg={headDirectionDeg}
        velocity={velocityKmph}
    />
}


export const HeadDirection = (props:{
    available:boolean,
    width?:number,
    height?:number,
    headDirectionDeg:number,
    velocity:number
}) => {
    const {
        available,
        width = 200,
        height = 200,
        headDirectionDeg,
        velocity
    } = props
    const vel_len = 20 + 20 * Math.log10(velocity+1.0)
    const vel_wid = 5 + 10 * Math.log10(velocity+1.0)
    return <>
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
        >
            <circle
                cx="100"
                cy="100"
                r="93"
                stroke="black"
                fill={available?"rgb(219, 234, 254)":"silver"}
                strokeWidth="1"
            />
            <line 
                x1="7"
                y1="100"
                x2="193"
                y2="100"
                stroke="black"
                strokeWidth="0.5"
            />    
            <line 
                x1="100"
                y1="7"
                x2="100"
                y2="193"
                stroke="black"
                strokeWidth="0.5"
            />
            <g style={{fontSize:"20pt",fontWeight:"bold"}}>
                <text
                    x="103"
                    y="30"
                    style={{textAnchor:"start"}}
                >
                    N
                </text>                  
            </g>
            <defs>
                <g
                    id="arrow"
                    stroke="black"
                    strokeWidth="1"
                    fill={available?"blue":"gray"}
                >
                    <polygon
                        points={`
                            ${100-vel_wid},${100+vel_len}
                            100,${100-vel_len}
                            ${100+vel_wid},${100+vel_len}
                        `}
                    />
                </g>
            </defs>
            <use xlinkHref="#arrow" transform={`rotate(${headDirectionDeg}, 100, 100)`}/>
        </svg>
   </>
}

export const GsvView = (props: {
    sentencesInfos: sentencesInfoType[],
    width?:number,
    height?:number,
    colorSelFunc?:(sn:number)=>string,
    isFixed:boolean
}) => {
    const {
        sentencesInfos,
        width,
        height,
        colorSelFunc,
        isFixed
    } = props
    const extracted = extractGsvSentences(sentencesInfos)
    return <GsvPolarGraph
        width={width}
        height={height}
        colorSelFunc={colorSelFunc}
        gsvStt={extracted}
        isFixed={isFixed}
    />
}

export const GsvPolarGraph = (props:{
    width?:number,
    height?:number,
    colorSelFunc?:(sn:number)=>string,
    gsvStt:GsvArgEle[],
    isFixed:boolean
}) => {
    const {
        width = 200,
        height = 200,
        colorSelFunc = ()=>'black', 
        gsvStt,
        isFixed
    } = props
    return <>
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
        >
            {
                [0,30,45,60].map((angle)=>
                    90 * Math.cos(angle*Math.PI/180)
                ).map((r, idx)=>
                    <circle
                        cx="100"
                        cy="100"
                        r={r.toString(10)}
                        fill={isFixed?"rgb(219, 234, 254)":"silver"}
                        stroke="black"
                        strokeWidth={r==90?"1":"0.5"}
                        key={idx.toString(10)}
                    />
                )
            }
            {
                [0, 45, 90, 135, 180].map((angle)=>
                    ({
                        x1:100+90*Math.cos(angle*Math.PI/180),
                        y1:100+90*Math.sin(angle*Math.PI/180),
                        x2:100+90*Math.cos((angle + 180)*Math.PI/180),
                        y2:100+90*Math.sin((angle + 180)*Math.PI/180)
                    })
                ).map(({x1,y1,x2,y2}, idx)=>
                    <line 
                        x1={x1.toString(10)}
                        y1={y1.toString(10)}
                        x2={x2.toString(10)}
                        y2={y2.toString(10)}
                        stroke="black"
                        strokeWidth="0.5"
                        key={idx.toString(10)}
                    />                    
                )
            }
            {
                gsvStt.map(({talkerId,id,elevationAngle,azimuth,cn})=>{
                    if (0 <= elevationAngle && 0 <= azimuth) {
                        const radius = 90 * Math.cos(elevationAngle*Math.PI/180)
                        const polarAngle = (360 + 90 - azimuth)%360
    //                    console.log(azimuth, polarAngle, elevationAngle)
                        const cx = 100 + radius * Math.cos(polarAngle*Math.PI/180)
                        const cy = 100 - radius * Math.sin(polarAngle*Math.PI/180) // SVG座標系、Yは下が大きい
                        return <circle
                            cx={cx.toString(10)}
                            cy={cy.toString(10)}
                            r="4"
                            fill={colorSelFunc(cn)}
                            strokeWidth="0"
                            key={talkerId+id.toString(10)}
                        />
                    }
                })
            }
        </svg>
   </>
}


