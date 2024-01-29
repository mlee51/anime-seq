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

export default function Track({ channel, handleRunning, running, bpm }) {
  const [trigs, setTrigs] = useState(Array(16).fill({ on: false, pitch: [], duration: 1, cc: [] }));
  const [currentTrig, setCurrentTrig] = useState<number>(0)
  const trigsRef = useRef(trigs);
  const currentTrigRef = useRef(currentTrig)
  const loopTime = useRef(60000 / bpm / 4)
  const lastPitch = useRef(null)
  const [ccLabelMap, setCCLabelMap] = useState({
    // 1: "filter",
    // 2: "porta",
    // 3: "wet",
  })
  const [lastKnob, setLastKnob] = useState(36) ///initially 36

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress, true);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

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

  const handleKeyPress = (event) => {
    if (event.code === "Space") {
      handleRunning
    }
  };

  const handleTrigs = (id: number) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      let newPitches = []
      if (newTrigStates[id].pitch.length < 1) {
        newPitches.push(lastKnob)
      }
      else {
        newPitches = [lastKnob]//newTrigStates[id].pitch
      }
      newTrigStates[id] = { ...newTrigStates[id], on: !newTrigStates[id].on, pitch: newPitches }

      if (newTrigStates[id].on) channel.playNote(newPitches, { time: WebMidi.time, duration: loopTime.current * newTrigStates[id].duration, attack: WebMidi.defaults.attack, release: WebMidi.defaults.release })
      return newTrigStates;
    });
  };

  const handlePitch = (id: number, pitches: Array, value: number = null, duration: number) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      // const newVal = parseInt(value)
      newTrigStates[id] = { ...newTrigStates[id], pitch: pitches }
      if (value !== null) {
        channel?.playNote(value, { time: WebMidi.time, duration: loopTime.current * duration, attack: WebMidi.defaults.attack, release: WebMidi.defaults.release })
        setLastKnob(value)
      }
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

  const handleCC = (id: number, e: Array) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      newTrigStates[id].cc = e
      return newTrigStates;
    });
  }

  const handleLearnCC = (id: number, index: number) => {
    channel.sendControlChange(trigs[id].cc[index].chan, trigs[id].cc[index].val)
  }

  const handleCreateCC = (id: number) => {
    setTrigs((prevStates) => {
      const newTrigStates = [...prevStates];
      if (newTrigStates[id].cc.length < 1) {
        newTrigStates[id] = { ...newTrigStates[id], cc: [...newTrigStates[id].cc, { chan: 0, on: true, val: 0 }] }
      } else {
        const length = newTrigStates[id].cc.length
        const lastCC = newTrigStates[id].cc[length - 1]
        newTrigStates[id] = { ...newTrigStates[id], cc: [...newTrigStates[id].cc, { chan: lastCC.chan + 1, on: true, val: 0 }] }
      }
      return newTrigStates;
    });
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


  const playNotes = () => {
    const { pitch, on, cc, duration } = trigsRef.current[currentTrigRef.current]
    if (on) {
      channel?.playNote(pitch, { time: WebMidi.time, duration: loopTime.current * duration, attack: WebMidi.defaults.attack, release: WebMidi.defaults.release })
      lastPitch.current = pitch
    }
    cc.forEach((message) => {
      if (message.val != null) {
        channel?.sendControlChange(message.chan, message.val)
      }
    })
  }

  return (
    <Suspense>
      <main onClick={handleRunning} className="flex flex-row items-start justify-around pl-24 pr-24  pt-12 pb-12 rounded-3xl ">{/*bg-[#10191f]*/}
        <button onClick={shiftTrigsLeft} className="h-14 mr-1 select-none">
          <Image src={leftIcon} alt="Shift Left" />
        </button>
        {trigs.map((_, index) => (
          <Trig
            key={index}
            handleTrigs={handleTrigs}
            handlePitch={handlePitch}
            handleCC={handleCC}
            handleCreateCC={handleCreateCC}
            handleLearnCC={handleLearnCC}
            handleDuration={handleDuration}
            duration={trigs[index].duration}
            pitch={trigs[index].pitch}
            cc={trigs[index].cc}
            ccLabelMap={ccLabelMap}
            setCCLabelMap={setCCLabelMap}
            id={index}
            trig={trigs[index].on}
            currentTrig={currentTrig}
            lastKnob={lastKnob}
          />
        ))}
        <button onClick={shiftTrigsRight} className="h-14 ml-1 select-none">
          <Image src={rightIcon} alt="Shift Right" />
        </button>
      </main >
    </Suspense>
  );
}
