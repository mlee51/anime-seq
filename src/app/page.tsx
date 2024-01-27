//@ts-nocheck
'use client'

import { useEffect, useState, useRef, Suspense } from "react";
import Image from 'next/image';
import Trig from "./Trig";
import { WebMidi } from "webmidi";
import pauseIcon from '../../public/icons/pause.svg'
import playIcon from '../../public/icons/play.svg'
import leftIcon from '../../public/icons/leftarrow.svg'
import rightIcon from '../../public/icons/rightarrow.svg'
import Track from "./Track";

export default function Home() {
  const [devices, setDevices] = useState(null)
  const [midiDevice, setMidiDevice] = useState(null)
  const [channels, setChannel] = useState<any>([]);
  const [output, setOutput] = useState<any>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(120)
  const loopTime = useRef(60000 / bpm / 4)

  useEffect(() => {
    WebMidi.defaults.attack = 1
    WebMidi.defaults.release = 1
    WebMidi.enable(onEnabled)
      .then(() => console.log("WebMidi enabled!"))
      .catch((err) => alert(err))
      .finally(() => {
        if (WebMidi.outputs.length) setMidiDevice(WebMidi.outputs[0])
      });
    window.addEventListener("keydown", handleKeyPress, true);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    setOutput(midiDevice)
    setChannel(midiDevice?.channels)
  }, [midiDevice])

  useEffect(() => {
    loopTime.current = 60000 / bpm / 4
  }, [bpm])

  const handleKeyPress = (event) => {
    if (event.code === "Space") {
      setRunning((prev) => !prev)
    }
  };


  const handleBpmWheel = (e) => {
    let newVal = bpm - e.deltaY / 100;
    newVal = Math.min(300, Math.max(1, newVal));
    setBpm(newVal)
  };

  const onEnabled = () => {
    WebMidi.inputs.forEach((input) => console.log(input.manufacturer, input.name));
    WebMidi.outputs.forEach((output) => console.log(output.manufacturer, output.name));
    setDevices(WebMidi.outputs)
  };

  const handleRunning = (e) => {
    if (e.target === e.currentTarget) {
      setRunning(!running)
    }
  }

  return (
    <Suspense>
      <select
        className="text-off fixed right-0 text-3xl rounded-md m-2 bg-background focus:outline-none"
        name="devices"
        id="devices"
        title="Select MIDI Device"
        defaultValue={1}
        onChange={e => setMidiDevice(devices[e.target.selectedIndex])}>
        {devices == '' && <option>No MIDI Output Connected</option>}
        {devices?.map((device, index) => (
          <option key={index} value={device}>{device.name}</option>
        ))}
      </select>
      <h1 className="fixed text-3xl bottom-0 font-extrabold m-4 text-off inline-flex items-center"><div className="w-12 h-12 bg-off rounded-[20px] rounded-tl-lg mr-2"/>CLAY | midi sequencer</h1>
      <div onClick={handleRunning} className="min-h-screen flex flex-col items-center bg-background">
        <div
          title='Scroll to change BPM'
          className="top-10  text-[#636e72] font-extrabold text-8xl my-4 p-4 select-none hover:text-trig"
          onWheel={handleBpmWheel}>
          {bpm}
        </div>
        {channels?.slice(0,3).map((_,index)=>(<Track key={index} channel={channels[index]} handleRunning={handleRunning} running={running} bpm={bpm}/>))}
        
        <div className="fixed pointer-events-none right-0 mb-10 select-none bottom-0">
          {running ? <Image width={200} src={pauseIcon} alt="pause" /> : <Image width={200} src={playIcon} alt="play" />}
        </div>
      </div>
    </Suspense>
  );
}
