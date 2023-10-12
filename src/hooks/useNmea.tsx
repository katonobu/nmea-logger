import {useState, useEffect} from 'react'
import {CreHandler} from '../control/creHandler'

let sentenceGroup:string[] = []
// 引数で与えられたanalyseSentencesの先頭要素で配列を初期化し、
// 受け取ったセンテンスデータを受信順に配列に積んでいく。
// analyseSentencesの最後の要素を受信したら、
// 
export const useNmeaRxSentences = (creHandler:CreHandler|null, analyseSentences:string[]):string[] => {
    const [sentences, setSentences] = useState<string[]>([])
//    const sentenceGroup = useRef<React.RefObject<string>[]>([]);
    useEffect(()=>{
        if (creHandler) {
            creHandler.subscribeEvt((evt:string)=>{
                let rxSentence = ""
                if (evt.startsWith("$")) {
                    rxSentence = evt
                } else if (evt.startsWith("| $")) {
                    rxSentence = evt.slice(2)
                } 
                if (rxSentence.startsWith(analyseSentences[0])){
                    sentenceGroup = []
                }
                sentenceGroup.push(rxSentence)
                if (rxSentence.startsWith(analyseSentences[analyseSentences.length - 1])){
                    setSentences(sentenceGroup)
                }
            })
        }
    },[creHandler])
    return sentences
}

export type sentenceInfoType = {
    name:string,
    sentence:string
}
export type sentencesInfoType = {
    name:string,
    sentences:string[]
}


export const useNmeaSingleLineAnalyseSentence = (rxSentences:string[],analyseSentences:string[]):sentenceInfoType[] => {
    const [sentenceInfos, setSntenceInfos] = useState<sentenceInfoType[]>([])
    useEffect(()=>{
        const infos = analyseSentences.map((reg)=>{
            return {name:reg, sentence:""} as sentenceInfoType
        })
        infos.forEach((si)=>{
            rxSentences.forEach((sentence)=>{
                if (sentence.startsWith(si.name)){
                    si.sentence = sentence
                }
            })
        })
        setSntenceInfos(infos)
    },[rxSentences, analyseSentences])
    return sentenceInfos
}

export const useNmeaMultiLineAnalyseSentence = (rxSentences:string[],analyseSentences:string[]):sentencesInfoType[] => {
    const [sentencesInfos, setSentencesInfos] = useState<sentencesInfoType[]>([])
    useEffect(()=>{
        const infos = analyseSentences.map((reg)=>{
            return {name:reg, sentences:[]} as sentencesInfoType
        })
        infos.forEach((si)=>{
            rxSentences.forEach((sentence)=>{
                if (sentence.startsWith(si.name)){
                    si.sentences.push(sentence)
                }
            })
        })
        setSentencesInfos(infos)
    },[rxSentences, analyseSentences])
    return sentencesInfos
}


export const extractZdaString = (zdaSentenceInfo:sentenceInfoType | undefined):Date => {
    let dateTime = new Date('1980-01-06T00:00:00')
    if (zdaSentenceInfo) {
        const splitted = zdaSentenceInfo.sentence.split(",")
        if (4 < splitted.length) {
            const year = splitted[4]
            const month = splitted[3]
            const day = splitted[2]
            const hour = splitted[1].slice(0, 2)
            const min = splitted[1].slice(2, 4)
            const sec = splitted[1].slice(4)
            dateTime = new Date(Date.UTC(
                parseInt(year,10),
                parseInt(month,10) - 1,
                parseInt(day, 10),
                parseInt(hour, 10),
                parseInt(min, 10),
                parseFloat(sec)
            ))
        }
    }
    return dateTime
}

export const dmLocToD = (str: string, isMinus: boolean) => {
    const locDegMin = parseFloat(str)
    const locDegInt = Math.floor(locDegMin / 100)
    const locMin = (locDegMin / 100 - locDegInt) * 100
    const locDegFloat = locDegInt + locMin / 60
    return isMinus ? (-locDegFloat) : locDegFloat
}

export type GsvArgEle={
    talkerId:string,
    id:number,
    elevationAngle:number,
    azimuth:number,
    cn:number
}

export const extractGsvSentences = (sentencesInfos: sentencesInfoType[]):GsvArgEle[] => {
    let totalResult:GsvArgEle[] = []
    sentencesInfos.forEach(({name, sentences})=>{
        const results:GsvArgEle[] = []
        const talkerId = name.slice(1,3)
        sentences.map((sen)=>{
            const splitted = sen.split(',')
            for (let i = 0; i < 4; i++) {
                const id = parseInt(splitted[i*4+4], 10)
                if (!isNaN(id)){
                    const elv = parseInt(splitted[i*4+5], 10)
                    const az = parseInt(splitted[i*4+6], 10)
                    const cn = parseInt(splitted[i*4+7], 10)
                    results.push({
                        talkerId,
                        id,
                        elevationAngle:isNaN(elv)?-1:elv,
                        azimuth:isNaN(az)?-1:az,
                        cn:isNaN(cn)?-1:cn
                    })
                }
                if (results.length === parseInt(splitted[3], 10)) {
                    break
                }
            }
        })
        totalResult = [...totalResult, ...results]
    })
    return totalResult
}
