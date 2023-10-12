# https://websockets.readthedocs.io/en/stable/howto/quickstart.html#broadcast-messages
import asyncio
import math
import time
import websockets
import asyncio
import json
import serial
import os
from time import sleep
from serial_asyncio import open_serial_connection

CONNECTIONS = set()

def writeDataToFile(date_time_str, log_data):
    log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs","nmea_log_{}.json".format(date_time_str))
    f = open(log_file_path, "w")
    f.writelines(json.dumps(log_data, indent=2))
    f.close()    
    print("--- log file is written to {} ---".format(log_file_path))

async def register(websocket):
    print("Added:{}".format(websocket))
    CONNECTIONS.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        CONNECTIONS.remove(websocket)
        print("Disconnected:{}".format(websocket))

async def forward_serial():
    log_out_interval_min = 5
    try:
        reader, _ = await open_serial_connection(url='COM27', baudrate=115200)
    except serial.serialutil.SerialException as e:
        print(e)
        return
    log_data = []
    try:
        print("port open succeeded")
        count = 0
        prev_year = ""
        pszda_datetime_str = ""
        prev_quality = 0
        prev_min = -1
        log_out_req = False
        while True:
            line = await reader.readline()
            # 頭一発目の不正なデータはutf-8 decodeに失敗することがある。
            # decodeメソッドの引数に'backslashreplace'を指定することでbackslash付きで表示される。
            # https://docs.python.org/ja/3/howto/unicode.html#python-s-unicode-support
            message = line.decode('utf-8', 'backslashreplace').strip()
            ts = math.floor(time.time() * 1000)
            send_message = {'id':count, 'ts':ts, 'data':message}
            websockets.broadcast(CONNECTIONS, json.dumps(send_message))
            log_data.append(send_message)
            if ((count % 100) == 0):
                print("handles {} lines".format(count))
            count += 1

            if message.endswith("[WUP] Done"):
                prev_year = 0
                prev_quality = 0
                print("--- Target restarted ---")

            elif message.startswith("$PSZDA"):
                year = int(message.split(",")[4])
                if (2000 < year) :
                    time_str = message.split(",")[1]
                    current_min = int(time_str[2:4], 10)
                    current_sec = int(time_str[4:6], 10)
                    if prev_min != current_min:
                        prev_min = current_min
                        if current_min % log_out_interval_min == 0 and current_sec == 0:
                            log_out_req = True
                            pszda_datetime_str = message.split(",")[4] + message.split(",")[3] + message.split(",")[2] + time_str.split(".")[0]

            elif message.startswith("$GPZDA") or message.startswith("$GNZDA"):
                if prev_year != message.split(",")[4]:
                    prev_year = message.split(",")[4]
                    if 2000 < int(prev_year):
                        print("--- Get Time ---")

            elif message.startswith("$GPGGA") or message.startswith("$GNGGA"):
                splitted = message.split(",")
                quality = int(splitted[6])
                if prev_quality == 0 and 0 < quality:
                    prev_quality = quality
                    print("--- Position Fixed ---")
                elif 0 < prev_quality and quality == 0:
                    print("--- Position Lost ---")
                    prev_quality = quality

            elif message.startswith("$PSEND") and log_out_req:
                log_out_req = False
                print(pszda_datetime_str)
                data_to_write = log_data.copy()
                log_data =[]
                loop = asyncio.get_event_loop()
                loop.run_in_executor(None, writeDataToFile, pszda_datetime_str, data_to_write)

    except Exception as e:
        print(e)
        return



async def main():
    port = int(os.environ.get("PORT", "5678"))
    async with websockets.serve(register, "localhost", port):
        await forward_serial()

if __name__ == "__main__":
    asyncio.run(main())