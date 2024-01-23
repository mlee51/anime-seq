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
  const [channel, setChannel] = useState<any>(null);
  const [output, setOutput] = useState<any>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [trigs, setTrigs] = useState(Array(16).fill({ on: false, pitch: 36, cc: { on: false, val: null } }));
  const [currentTrig, setCurrentTrig] = useState<number>(0)
  const trigsRef = useRef(trigs);
  const currentTrigRef = useRef(currentTrig)
  const [bpm, setBpm] = useState<number>(120)
  const loopTime = useRef(60000 / bpm / 4)

  useEffect(() => {
    WebMidi.enable(onEnabled)
      .then(() => console.log("WebMidi enabled!"))
      .catch((err) => alert(err))
      .finally(() => {
        setOutput(WebMidi.outputs[0])
        setChannel(WebMidi.outputs[0].channels[1])
      });
  }, []);

  useEffect(() => {
    loopTime.current = 60000 / bpm / 4
  }, [bpm])

  useEffect(() => {
    trigsRef.current = trigs;
  }, [trigs]);

  useEffect(() => {
    currentTrigRef.current = currentTrig
    playNotes()
  }, [currentTrigRef.current])

  useEffect(() => {
    let lightsInterval: NodeJS.Timeout
    if (running) {
      playNotes()
      currentTrigRef.current = (currentTrigRef.current + 1) % 16
      setCurrentTrig((prevCount) => (prevCount + 1) % 16)
      lightsInterval = setInterval(() => {
        currentTrigRef.current = (currentTrigRef.current + 1) % 16
        setCurrentTrig((prevCount) => (prevCount + 1) % 16);
      }, loopTime.current);
    } else {
      setCurrentTrig(0)
      currentTrigRef.current = 0
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
  };

  const playNotes = () => {
    const { pitch, on, cc } = trigsRef.current[currentTrigRef.current]
    if (on) {
      channel.playNote(pitch, { time: WebMidi.time, duration: loopTime.current })
    }
    if (cc.val != null) {
      channel.sendControlChange(127, cc.val)
    }
  }

  const handleRunning = (e) => {
    if (e.target === e.currentTarget) {
      setRunning(!running)
    }
  }

  return (
    <Suspense>
      <div className="fixed w-full font-extrabold text-3xl select-none inline">
        <div className="fixed bottom-20 left-1/2 transform text-[2rem] -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          {running ? <Image width={200} src={pauseIcon} alt="pause" /> : <Image width={200} src={playIcon} alt="play" />}
        </div>
        <div
          className="fixed top-10 left-1/2 transform text-[2rem] -translate-x-1/2 -translate-y-1/2 opacity-20 text-black"
          onWheel={handleBpmWheel}>
          {bpm}
        </div>
      </div>
      <div>
        <main onClick={handleRunning} className="flex flex-row items-start justify-around pl-24 pr-24 pt-[12rem] bg-[#10191f] h-screen">{/*bg-[#10191f]*/}
          <button onClick={shiftTrigsLeft} className="h-14 mr-4">
          <Image src={leftIcon} alt="Shift Left" />
          </button>
          {trigs.map((_, index) => (
            <Trig
              key={index}
              handleTrigs={handleTrigs}
              handlePitch={handlePitch}
              handleCC={handleCC}
              handleCCOn={handleCCOn}
              pitch={trigs[index].pitch}
              cc={trigs[index].cc}
              id={index} trig={trigs[index].on}
              currentTrig={currentTrig}
            />
          ))}
          <button onClick={shiftTrigsRight} className="h-14 ml-4">
            <Image src={rightIcon} alt="Shift Right" />
          </button>
        </main >
      </div>
    </Suspense>
  );
}
