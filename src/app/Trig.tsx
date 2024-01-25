//@ts-nocheck
import React, { useState, useEffect } from 'react';

import AddMenu from './AddMenu';
import xIcon from '../../public/icons/x-mark.svg'
import Image from 'next/image'

export default function Trig({ id, handleTrigs, handlePitch, trig, pitch, currentTrig, handleCC, cc, handleCreateCC,handleLearnCC, handleDuration, duration }) {
    const [isDragging, setIsDragging] = useState<false>(false);
    const [initialTouch, setInitialTouch] = useState<number>(0);
    const [hovering, setHovering] = useState<boolean>(false)


    const handleMouseDown = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const center = (rect.left + rect.right) / 2; // Calculate the horizontal center
        setInitialTouch(center);
        setIsDragging(true);
        setInitialTouch(e.clientX);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            const offsetX = e.clientX - initialTouch;
            const percentage = (offsetX / window.innerWidth) * window.innerWidth;
            let newVal = pitch + percentage;
            // Limit pitch to the range of 0 to 127
            newVal = Math.min(127, Math.max(0, newVal));
            handlePitch(id, newVal);
            console.log(percentage, newVal);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        handleTrigs(id);
    }

    const handleMouseLeave = () => {
        setIsDragging(false);
    };



    useEffect(() => {
        // Add event listener when the component mounts
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseleave', handleMouseLeave);

        // Clean up the event listeners when the component unmounts
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isDragging, initialTouch, pitch, handlePitch]);

    const handleWheel = (e, i) => {
        let newVal = pitch[i] - e.deltaY / 100;
        newVal = Math.min(127, Math.max(0, newVal));
        let newArray = [...pitch]
        newArray[i] = newVal
        handlePitch(id, newArray);
    };

    const handleDurationWheel = (e) => {
        let newVal = duration - e.deltaY / 100;
        newVal = Math.min(16, Math.max(1, newVal));
        handleDuration(id, newVal)
    };

    const handleCCChannelWheel = (e, i) => {
        let newChan = cc[i].chan - e.deltaY / 100;
        newChan = Math.min(127, Math.max(0, newChan));
        let newArray = cc
        newArray[i].chan = newChan
        handleCC(id, newArray);
    };

    const handleCCWheel = (e, i) => {
        let newVal = cc[i].val - e.deltaY / 100;
        newVal = Math.min(127, Math.max(0, newVal));
        let newArray = cc
        newArray[i].val = newVal
        handleCC(id, newArray);
        handleLearnCC(id,i)
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
            const startingPitch = pitch.length < 1 ? 20 : pitch[pitch.length - 1] + 1
            newPitches.push(startingPitch)
            handlePitch(id, newPitches)
        }
    }

    const deletePitch = (index) => {
        if (pitch.length !== 1) {
            let newPitches = pitch.filter((_, i) => i !== index)
            handlePitch(id, newPitches)
        } else {
            handleTrigs(id);
        }
    }

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
                    <div onWheel={handleDurationWheel} className='absolute pr-1 pt-1 right-0 text-xs mix-blend-difference'>{duration}</div>
                    <div
                        className='flex h-full justify-center items-center'
                        onWheel={(e) => handleWheel(e, i)}>
                        {pitch[i]}
                    </div>
                    <div className='absolute pl-1 pt-b bottom-0 left-0 text-xs mix-blend-difference'>{getPitchForKey(pitch[i])}</div>
                </div>))}
                {/*CC LOGIC */}
                {cc && cc.map((_, index) => (
                    <div
                        key={index}
                        id={index}
                        style={{ backgroundColor: calculateBackgroundColor(cc[index].val + cc[index].chan) }}
                        className='mt-2 rounded-[20px] rounded-tl-md hover:border'>{hovering && <div onClick={() => removeCC(index)} className='absolute pl-0.5 pt-1.5  w-4 text-xs mix-blend-difference opacity-80'><Image src={xIcon} alt='Delete Pitch' /></div>}
                        <div onWheel={(e) => handleCCChannelWheel(e, index)}
                            className='text-sm mx-auto text-off font-semibold text-center w-10 h-6 select-none py-1'
                        >
                            {cc[index].chan}
                        </div>
                        <div
                            onWheel={(e) => handleCCWheel(e, index)}
                            className="flex flex-col mx-auto items-center justify-center select-none w-10 h-8  text-off font-extrabold ">
                            {cc[index].val}
                        </div>
                    </div>
                ))}
                {hovering && <AddMenu createCC={createCC} createTrig={createTrig} />}
            </div>
        </>
    );
}
