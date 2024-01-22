//@ts-nocheck
'use client'

import { useEffect, useState, useRef } from "react";
import Trig from "./Trig";
import { WebMidi } from "webmidi";

export default function Home() {
  const [channel, setChannel] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [trigs, setTrigs] = useState(Array(16).fill({ on: false, pitch: 36 }));
  const [intervalId, setIntervalId] = useState<any>();
  const [currentTrig, setCurrentTrig] = useState(0)
  const trigsRef = useRef(trigs);

  useEffect(() => {
    trigsRef.current = trigs;
  }, [trigs]);

  const handleTrigs = (id:number) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      newTrigStates[id] = { ...newTrigStates[id], on: !newTrigStates[id].on }
      return newTrigStates;
    });
  };

  const handlePitch = (id:number, e:string) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      newTrigStates[id] = { ...newTrigStates[id], pitch: parseInt(e) }
      return newTrigStates;
    });
  }

  const onEnabled = () => {
    WebMidi.inputs.forEach((input) => console.log(input.manufacturer, input.name));
    WebMidi.outputs.forEach((output) => console.log(output.manufacturer, output.name));
  };

  const playNotes = () => {
    trigsRef.current.forEach((trig, index) => {
      if (trig.on) {
        const pitch = trig.pitch
        channel.playNote(pitch, { time: `+${index * 100}`, duration: 100 });
      }
    });
  };

  const handleRunning = () => {
    setRunning(!running)
  }

  useEffect(() => {
    let lightsInterval:NodeJS.Timeout
    if (running) {
      lightsInterval = setInterval(() => {
        setCurrentTrig((prevCount) => (prevCount + 1) % 16);
      }, 100);
      const id:NodeJS.Timeout = setInterval(playNotes, 1600);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setIntervalId(null);
      setCurrentTrig(0)
    }

    return () => {
      clearInterval(lightsInterval);
    };
  }, [running])

  useEffect(() => {
    
    WebMidi.enable(onEnabled)
      .then(() => console.log("WebMidi enabled!"))
      .catch((err) => alert(err))
      .finally(() => setChannel(WebMidi.outputs[0].channels[1]));
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
              pitch={trigs[index].pitch}
              id={index} trig={trigs[index].on}
              currentTrig={currentTrig}
            />
          ))}
        </main >
      </div>
    </>
  );
}
