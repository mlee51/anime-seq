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

export default function Home() {
  const [devices, setDevices] = useState(null)
  const [midiDevice, setMidiDevice] = useState(null)
  const [channel, setChannel] = useState<any>(null);
  const [output, setOutput] = useState<any>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [trigs, setTrigs] = useState(Array(16).fill({ on: false, pitch: 36, duration: 1, cc: { on: false, val: null } }));
  const [currentTrig, setCurrentTrig] = useState<number>(0)
  const trigsRef = useRef(trigs);
  const currentTrigRef = useRef(currentTrig)
  const [bpm, setBpm] = useState<number>(120)
  const loopTime = useRef(60000 / bpm / 4)
  const lastPitch = useRef(null)

  const handleKeyPress = (event) => {
    if (event.code === "Space") {
      setRunning((prev) => !prev)
    }
  };

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
    setChannel(midiDevice?.channels[1])
  }, [midiDevice])

  useEffect(() => {
    loopTime.current = 60000 / bpm / 4
  }, [bpm])

  useEffect(() => {
    trigsRef.current = trigs;
  }, [trigs]);

  useEffect(() => {
    if (currentTrigRef.current !== -1) playNotes()
  }, [currentTrigRef.current])

  useEffect(() => {
    let lightsInterval: NodeJS.Timeout
    if (running) {
      lightsInterval = setInterval(() => {
        currentTrigRef.current = (currentTrigRef.current + 1) % 16
        setCurrentTrig((prevCount) => (prevCount + 1) % 16);
      }, loopTime.current);
      setCurrentTrig((prevCount) => (prevCount + 1) % 16)
      currentTrigRef.current = (currentTrigRef.current + 1) % 16
    } else {
      setCurrentTrig(0)
      currentTrigRef.current = -1
    }

    return () => {
      clearInterval(lightsInterval);
    };
  }, [running, bpm])

  const handleTrigs = (id: number) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      newTrigStates[id] = { ...newTrigStates[id], on: !newTrigStates[id].on }
      return newTrigStates;
    });
  };

  const handlePitch = (id: number, e: string) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      newTrigStates[id] = { ...newTrigStates[id], pitch: parseInt(e) }
      return newTrigStates;
    });
  }

  const handleDuration = (id: number, newDuration: number) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      newTrigStates[id] = { ...newTrigStates[id], duration: newDuration }
      return newTrigStates;
    });
  }

  const handleCC = (id: number, e: any) => {
    const ccVal = parseInt(e.val)
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      newTrigStates[id] = { ...newTrigStates[id], cc: { ...newTrigStates[id]?.cc, val: e.val } }
      return newTrigStates;
    });
    if (!running) {
      channel.sendControlChange(127, ccVal)
    }
  }

  const handleCCOn = (id: number, e: boolean) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      if (e) newTrigStates[id] = { ...newTrigStates[id], cc: { ...newTrigStates[id]?.cc, on: e } }
      else newTrigStates[id] = { ...newTrigStates[id], cc: { ...newTrigStates[id]?.cc, on: e, val: null } }
      return newTrigStates;
    });
  }
  const handleBpmWheel = (e) => {
    let newVal = bpm - e.deltaY / 100;
    newVal = Math.min(300, Math.max(1, newVal));
    setBpm(newVal)
  };

  const handleRunning = (e) => {
    if (e.target === e.currentTarget) {
      setRunning((prev) => !prev)
    }
  }

  const shiftTrigsLeft = () => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      const newArray = [];

      for (let i = 1; i < newTrigStates.length; i++) {
        newArray.push(newTrigStates[i]);
      }
      newArray.push(newTrigStates[0]);
      return newArray;
    });
  };

  const shiftTrigsRight = () => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      const newArray = [];
      const length = newTrigStates.length
      newArray.push(newTrigStates[length - 1]);
      for (let i = 0; i < length - 1; i++) {
        newArray.push(newTrigStates[i]);
      }
      return newArray;
    });
  };

  const onEnabled = () => {
    WebMidi.inputs.forEach((input) => console.log(input.manufacturer, input.name));
    WebMidi.outputs.forEach((output) => console.log(output.manufacturer, output.name));
    setDevices(WebMidi.outputs)
  };

  const playNotes = () => {
    const { pitch, on, cc, duration } = trigsRef.current[currentTrigRef.current]
    if (on) {
      channel?.playNote(pitch, { time: WebMidi.time, duration: loopTime.current * duration, attack: WebMidi.defaults.attack, release: WebMidi.defaults.release })
      lastPitch.current = pitch
    }
    if (cc.val != null) {
      channel?.sendControlChange(127, cc.val)
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
        {devices?.map((device, index) => (
          <option key={index} value={device}>{device.name}</option>
        ))}
      </select>
      <h1 className="fixed text-3xl bottom-0 font-extrabold m-4 text-off">CLAY | midi sequencer</h1>
      <div onClick={handleRunning} className="min-h-screen flex flex-col items-center bg-background">
        <div
          title='Scroll to change BPM'
          className="top-10  text-[#636e72] font-extrabold text-4xl my-4 p-4 select-none hover:text-trig"
          onWheel={handleBpmWheel}>
          {bpm}
        </div>
        <main onClick={handleRunning} className="flex flex-row items-start justify-around pl-24 pr-24  pt-12 pb-12 rounded-3xl grow">{/*bg-[#10191f]*/}
          <button onClick={shiftTrigsLeft} className="h-14 mr-1 select-none">
            <Image src={leftIcon} alt="Shift Left" />
          </button>
          {trigs.map((_, index) => (
            <Trig
              key={index}
              handleTrigs={handleTrigs}
              handlePitch={handlePitch}
              handleCC={handleCC}
              handleCCOn={handleCCOn}
              handleDuration={handleDuration}
              duration={trigs[index].duration}
              pitch={trigs[index].pitch}
              cc={trigs[index].cc}
              id={index} trig={trigs[index].on}
              currentTrig={currentTrig}
            />
          ))}
          <button onClick={shiftTrigsRight} className="h-14 ml-1 select-none">
            <Image src={rightIcon} alt="Shift Right" />
          </button>
        </main >
        <div className="pointer-events-none justify-between mb-10 select-none">
          {running ? <Image width={200} src={pauseIcon} alt="pause" /> : <Image width={200} src={playIcon} alt="play" />}
        </div>
      </div>
    </Suspense>
  );
}
