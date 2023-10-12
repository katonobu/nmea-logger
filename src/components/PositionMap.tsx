import { useMemo, useState, useEffect } from 'react'
import {sentenceInfoType, dmLocToD} from '../hooks/useNmea'
import { MapContainer, TileLayer, Marker,LayersControl } from 'react-leaflet'
/*
// https://logsuke.com/web/programming/leaflet/react-leaflet-marker-customize
// 効かない。。。
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const colorMarker = (color:string) => {
  return L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    className: `default-marker ${color}`,
  });
};
*/

export const updatePosByRmc = (
    sentenceInfos: sentenceInfoType[],
    setRmcPos:(stt:[number,number])=>void,
    setPositionFixed:(stt:boolean)=>void
) => {
    useEffect(()=>{
        let rmc = sentenceInfos.find((si) => si.name === '$GNRMC')
        if (rmc === undefined || rmc.sentence === '') {
            rmc = sentenceInfos.find((si) => si.name === '$GPRMC')
        }
        if (rmc) {
            const splitted = rmc.sentence.split(",")
            const positionFixed = splitted[2] === "A"
            setPositionFixed(positionFixed)
            if (positionFixed) {
                const lat = dmLocToD(splitted[3], splitted[4] === 'S')
                const lon = dmLocToD(splitted[5], splitted[6] === 'W')
                if (!isNaN(lat) && !isNaN(lon)) {
//                    console.log(rmc)
                    setRmcPos([lat, lon])
                }
            }
        }
    },[sentenceInfos, setRmcPos, setPositionFixed])
    return null
}

export const PositionMap = (props: {
    positionFixed: boolean,
    currentPosition: [number,number],
    currentPositionMakesCenter:boolean
}) => {
    const {
        positionFixed,
        currentPosition,
        currentPositionMakesCenter        
    } = props
    const [map, setMap] = useState(null)
    useEffect(()=>{
        if (map && currentPositionMakesCenter) {
            // @ts-ignore
            map.setView(currentPosition)
        }
    }, [map, currentPosition,currentPositionMakesCenter])

    const displayMap = useMemo(
        () => {
            try {
                return <>
                    <MapContainer
                        center={currentPosition}
                        zoom={13}
                        scrollWheelZoom={true}
                        // @ts-ignore
                        ref={setMap}
                    >
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="淡色">
                                <TileLayer
                                    attribution="<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>"
                                    url='https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
                                />
                            </LayersControl.BaseLayer>

                            <LayersControl.BaseLayer name="白地図">
                                <TileLayer
                                    attribution="<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>"
                                    url='https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="標準">
                                <TileLayer
                                    attribution="<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
                                    url='https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="写真">
                                <TileLayer
                                    attribution="<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
                                    url='https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg                    '
                                />
                            </LayersControl.BaseLayer>
                        </LayersControl>
                        <Marker position={currentPosition}/>
                    </MapContainer>
                </>
            } catch (e) {
                return null
            }
        },
        [currentPosition, setMap, positionFixed]
    )            
    return (
        <div>
            {displayMap}
        </div>
    )
}    
