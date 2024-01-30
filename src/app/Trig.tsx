//@ts-nocheck
import React, { useState, useEffect } from 'react';

import AddMenu from './AddMenu';
import xIcon from '../../public/icons/x-mark.svg'
import Image from 'next/image'
import Value from './Value';

export default function Trig({ id, handleTrigs, handlePitch, trig, pitch, currentTrig, handleCC, cc, ccLabelMap, setCCLabelMap, handleCreateCC, handleLearnCC, handleDuration, duration, lastKnob }) {
    const [hovering, setHovering] = useState<boolean>(false)

    const handleClick = () => {
        handleTrigs(id);
    }

    const handleCCChannelWheel = (e, i) => {
        let scrollVal = Math.sign(e.deltaY)
        let newChan = cc[i].chan - scrollVal;
        newChan = Math.min(127, Math.max(0, newChan));
        let newArray = cc
        newArray[i].chan = newChan
        handleCC(id, newArray);
    };

    const handleCCWheel = (e, i) => {
        let scrollVal = Math.sign(e.deltaY)
        let newVal = cc[i].val - scrollVal;
        newVal = Math.min(127, Math.max(0, newVal));
        let newArray = cc
        newArray[i].val = newVal
        handleCC(id, newArray);
        handleLearnCC(id, i)
    };

    const removeCC = (i) => {
        let newArray = cc.filter((_, index) => index !== i)

        handleCC(id, newArray);
    }

    const calculateBackgroundColor = (pitch) => {
        // Map pitch to a color based on your specific criteria
        const hue = Math.round((pitch) / (127 * 0.3) * 360); // Example mapping to the hue scale
        return `hsl(${hue}, 80%, 70%)`; // Construct an HSL color based on the hue
    };

    function getPitchForKey(midiValue: number): string | null {
        if (midiValue < 1 || midiValue > 127) {
            // Handle out-of-range values
            return null;
        }

        const pitchNumber = (midiValue) % 12;
        const octave = Math.floor((midiValue) / 12) - 2;

        const pitchMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return `${pitchMap[pitchNumber]}${octave}`;
    }
    const createCC = () => {
        handleCreateCC(id)
    }

    const createTrig = () => {
        if (!trig) {
            handleTrigs(id);
        } else {
            const newPitches = pitch
            const startingPitch = lastKnob
            newPitches.push(startingPitch)
            handlePitch(id, newPitches, lastKnob)
        }
    }

    const deletePitch = (index) => {
        if (pitch.length !== 1) {
            let newPitches = pitch.filter((_, i) => i !== index)
            handlePitch(id, newPitches, null)
        } else {
            handleTrigs(id);
        }
    }

    const handleCCLabel = (e, i) => {
        const { value } = e.target
        // if (value == '') {
        //     setCCLabelMap(prev => {
        //         const newArray = prev
        //         delete newArray[i]
        //         return(newArray)
        //     })
        // } else {
        setCCLabelMap(prev => (
            { ...prev, [i]: value }
        ))
        // }
    }

    const handlePitchValue = (value, i) => {
        let newArray = [...pitch]
        newArray[i] = value
        handlePitch(id, newArray, value, duration);
    }

    const handleDurationValue = (value) => {
        handleDuration(id, value)
    };

    const handleCCValue = (value, i) => {
        let newArray = cc
        newArray[i].val = value
        handleCC(id, newArray);
        handleLearnCC(id, i)
    };

    return (
        <>
            <div className="flex flex-col mx-1"
                onMouseOver={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}>
                <div
                    onClick={handleClick}
                    className={(currentTrig === id ? 'bg-current' : trig ? 'bg-trig' : 'bg-off') + ' w-14 h-14 rounded-md hover:bg-highlight'}>
                </div>
                {trig && pitch.map((_, i) => (<div
                    key={i}
                    id={i}
                    style={{ backgroundColor: calculateBackgroundColor(pitch[i]) }}
                    className="select-none w-14 h-14 relative text-off font-extrabold rounded-md mt-2 hover:border">
                    {hovering && <div
                        onClick={() => deletePitch(i)}
                        className='absolute pl-1 pt-1.5 left-0 w-4 text-xs mix-blend-difference opacity-80'>
                        <Image src={xIcon} alt='Delete Pitch' />
                    </div>}
                    <div className='absolute pr-1 pt-1 right-0 text-xs mix-blend-difference'>
                        <Value parentValue={duration} setter={handleDurationValue} min={1} max={16} />
                    </div>
                    <div className='flex h-full justify-center items-center'>
                        <Value parentValue={pitch[i]} setter={handlePitchValue} index={i} min={0} max={127} />
                    </div>
                    <div
                        className='absolute pl-1 pt-b bottom-0 left-0 text-xs mix-blend-difference'
                    >
                        {getPitchForKey(pitch[i])}
                    </div>
                </div>))}
                {/*CC LOGIC */}
                {cc && cc.map((_, index) => (
                    <div
                        key={index}
                        id={index}
                        style={{ backgroundColor: calculateBackgroundColor(cc[index].val + cc[index].chan) }}
                        className='mt-2 rounded-[20px] rounded-tl-md hover:border'>{hovering && <div onClick={() => removeCC(index)} className='absolute pl-0.5 pt-1.5  w-4 text-xs mix-blend-difference opacity-80'><Image src={xIcon} alt='Delete Pitch' /></div>}
                        {/*TO-DO: Refactor CC labels to use Value*/}
                        <input
                            onChange={(e) => handleCCLabel(e, cc[index].chan)}
                            placeholder={cc[index].chan}
                            value={ccLabelMap.hasOwnProperty(cc[index].chan) ? ccLabelMap[cc[index].chan] : cc[index].chan}
                            onWheel={(e) => handleCCChannelWheel(e, index)}
                            className='text-sm bg-transparent flex mx-auto text-off placeholder:text-off font-semibold text-center w-10 h-6 select-none py-1 focus:outline-none'
                        />
                        <div
                            className="flex flex-col mx-auto items-center justify-center select-none w-10 h-8  text-off font-extrabold ">
                            <Value parentValue={cc[index].val} setter={handleCCValue} index={index} min={0} max={127}/>
                        </div>
                    </div>
                ))}
                {<AddMenu createCC={createCC} createTrig={createTrig} hovering={hovering} />}
            </div>
        </>
    );
}
