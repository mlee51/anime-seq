//@ts-nocheck
'use client'

import { useEffect, useState, useRef } from "react";
import Trig from "./Trig";
import { WebMidi } from "webmidi";
import Knob from "./Knob";

export default function Home() {
  const [channel, setChannel] = useState<any>(null);
  const [output, setOutput] = useState<any>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [trigs, setTrigs] = useState(Array(16).fill({ on: false, pitch: 36, cc: 60 }));
  const [intervalId, setIntervalId] = useState<any>();
  const [currentTrig, setCurrentTrig] = useState<number>(0)
  const trigsRef = useRef(trigs);
  const currentTrigRef = useRef(currentTrig)
  useEffect(() => {
    trigsRef.current = trigs;
  }, [trigs]);

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

  const handleCC = (id: number, e: string) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      newTrigStates[id] = { ...newTrigStates[id], cc: parseInt(e) }
      return newTrigStates;
    });
  }

  const onEnabled = () => {
    WebMidi.inputs.forEach((input) => console.log(input.manufacturer, input.name));
    WebMidi.outputs.forEach((output) => console.log(output.manufacturer, output.name));
  };

  // const playNotes = () => {
  //   trigsRef.current.forEach((trig, index) => {
  //     if (trig.on) {
  //       const pitch = trig.pitch
  //       channel.playNote(pitch, { time: `+${index * 100}`, duration: 100 });
  //     }
  //   });
  // };

  const playNotes = () => {
    const { pitch, on, cc } = trigsRef.current[currentTrigRef.current]
    if(on){
      channel.sendControlChange(127, cc).playNote(pitch, { time: WebMidi.time, duration: 100 })
    }
  }

  const handleRunning = () => {
    setRunning(!running)
  }

  useEffect(()=>{
    currentTrigRef.current = currentTrig
    playNotes()
  },[currentTrigRef.current])

  useEffect(() => {
    let lightsInterval: NodeJS.Timeout
    if (running) {
      playNotes()
      currentTrigRef.current = (currentTrigRef.current + 1) % 16
      setCurrentTrig((prevCount) => (prevCount + 1) % 16)
      lightsInterval = setInterval(() => {
        currentTrigRef.current = (currentTrigRef.current + 1) % 16
        setCurrentTrig((prevCount) => (prevCount + 1) % 16);
      }, 100);
      //const id: NodeJS.Timeout = setInterval(playNotes, 100);
      //setIntervalId(id);
    } else {
      //clearInterval(intervalId);
      //setIntervalId(null);
      setCurrentTrig(0)
      currentTrigRef.current = 0
    }

    return () => {
      clearInterval(lightsInterval);
    };
  }, [running])

  useEffect(() => {

    WebMidi.enable(onEnabled)
      .then(() => console.log("WebMidi enabled!"))
      .catch((err) => alert(err))
      .finally(() => {
        setOutput(WebMidi.outputs[0])
        setChannel(WebMidi.outputs[0].channels[1]
        )
      });
  }, []);

  return (
    <>
      <div className="fixed font-extrabold text-3xl select-none right-1/4 top-1/4">
        <button onClick={handleRunning}>
          {running ? 'Stop' : 'Play'}
        </button>
      </div>
      <div className="max-w-5xl mx-auto">
        <main className="flex min-h-screen flex-row items-start justify-around pl-24 pr-24 pt-[24rem] bg-[#10191f]">
          {Array.from({ length: 16 }, (_, index) => (
            <Trig
              key={index}
              handleTrigs={handleTrigs}
              handlePitch={handlePitch}
              handleCC={handleCC}
              pitch={trigs[index].pitch}
              cc={trigs[index].cc}
              id={index} trig={trigs[index].on}
              currentTrig={currentTrig}
            />
          ))}
        </main >
      </div>
      {/* <Knob output={output}/> */}
    </>
  );
}
