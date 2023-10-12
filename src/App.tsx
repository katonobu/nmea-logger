import { useState, useEffect } from 'react'
import './App.css'
import { HwAccess } from './control/HwAccess'
import { HwAccessWs } from './control/HwAccessWs'
import {ErrorMessagePre} from './components/ErrorMsg'
import { DispDebugSelect } from './components/DispDebugSelect'
import {CreHandler} from './control/creHandler'
import SlideSwitch from './components/SlideSwitch'
import CheckIndicator from './components/CheckIndicator'


import {useNmeaRxSentences, useNmeaSingleLineAnalyseSentence,useNmeaMultiLineAnalyseSentence} from './hooks/useNmea'
import {NmeaSentencesPre, NmeaMultiLineSentencesPre, ZdaView, RmcHeadVelView, RmcNorthCompass, GsvView} from './components/Nmea'

import Leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css';
import {updatePosByRmc, PositionMap} from './components/PositionMap'

Leaflet.Icon.Default.imagePath =
  '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/'

const startEndSentences:string[] = [
  '$PSPRA', // useNmeaRxSentences()では先頭に記載したセンテンスがセンテンスの一塊の先頭として扱われる
  '$PSEND', // useNmeaRxSentences()では最後に記載したセンテンスがセンテンスの一塊の先頭として扱われる
]

const analyseSentences:string[] = [
  '$GPGGA',
  '$GNGLL',
  '$GNGSA',
  '$GNGNS',
  '$GNRMC',
  '$GPRMC',
  '$GNVTG',
  '$GNZDA',
  '$GPZDA',
  '$PSGSA',
  '$PSGES',
  '$PSLES',
  '$PSZDA',
  '$PSEPU',
]
const multiLineAnalyseSentences:string[] = [
  '$GPGSV',
  '$QZGSV'
]

function App() {
  const [hwAccess, setHwAccess] = useState<HwAccess | null>(null)
  const [creHandler, setCreHandler] = useState<CreHandler | null>(null)
  const [dispDebug, setDispDebug] = useState<boolean>(true)
  const [currentPosition, setCurrentPosition] = useState<[number,number]>([35.450329,139.634197])
  const [positionFixed, setPositionFixed] = useState<boolean>(false)
  const [currentPositionMakesCenter, setCurrentPositionMakesCenter] = useState<boolean>(true)
//  const [errMsg, setErrMsg] = useState<string[]>([])
  const errMsg:string[] = []

  const sentences = useNmeaRxSentences(creHandler, startEndSentences)
  const sentenceInfos = useNmeaSingleLineAnalyseSentence(sentences, analyseSentences)
  const sentencesInfos = useNmeaMultiLineAnalyseSentence(sentences, multiLineAnalyseSentences)
  updatePosByRmc(sentenceInfos, setCurrentPosition, setPositionFixed)

  useEffect(() => {
    if (hwAccess === null) {
      const hw = new HwAccessWs(setCreHandler)
      hw.init("ws://127.0.0.1:5678")
      setHwAccess(hw)
      return ()=>{
        hw.finalize()
      }
    }
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        maxWidth: '640px'
      }}
    >
      <div
        style={{
          padding: '32px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div>
            <ZdaView sentenceInfos={sentenceInfos}/>
            <RmcHeadVelView sentenceInfos={sentenceInfos}/>
            <RmcNorthCompass width={150} height={150} sentenceInfos={sentenceInfos}/>
            <CheckIndicator
              checked={positionFixed}
              checkedStr={currentPosition[0].toFixed(6)+" "+currentPosition[1].toFixed(6)}
              unCheckedStr={"Not Fixed"}
              attackDurationMs = {300}
              releaseDurationMs = {300}
              unCheckedColor='silver'
            />
          </div>
          <div>
            <GsvView
              width={300}
              height={300}
              sentencesInfos={sentencesInfos}
              colorSelFunc={()=>positionFixed?'blue':'black'}
              isFixed={positionFixed}
            />
          </div>
        </div>

        <div>
          <SlideSwitch
            id={"setCurrentPositionToCenter"}
            checked={currentPositionMakesCenter}
            setChecked={setCurrentPositionMakesCenter}
            checkedStr={"MapFollowsCurrentPosition"}
            unCheckedStr={"MapPositionFree"}
            disabled={!positionFixed}
          ></SlideSwitch>
          <PositionMap
            currentPosition={currentPosition}
            currentPositionMakesCenter={currentPositionMakesCenter}
            positionFixed={positionFixed}
          />
        </div>
      </div>

      <div
        style={{
          padding: '32px'
        }}
      >
        <ErrorMessagePre errMsgs = {errMsg}></ErrorMessagePre>
        <hr></hr>
        <DispDebugSelect setDispDebug={setDispDebug} dispDebug={dispDebug} />
        {dispDebug ? (
          <div>
            <NmeaMultiLineSentencesPre multiLineSentencesInfo={sentencesInfos}/>
            <NmeaSentencesPre sentenceInfos={sentenceInfos}/>
          </div>
        ) :
          null
        }
      </div>
    </div>
  )
}

export default App
