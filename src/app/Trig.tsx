//@ts-nocheck
import React, { useState, useEffect } from 'react';

export default function Trig({ id, handleTrigs, handlePitch, trig, pitch, currentTrig, handleCC, cc }) {
    const [isDragging, setIsDragging] = useState<false>(false);
    const [initialTouch, setInitialTouch] = useState<number>(0);
    const [hovering, setHovering] = useState<boolean>(false)
    const [midicc, setMidiCC] = useState<boolean>(false)

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
            newVal = Math.min(52, Math.max(36, newVal));
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
    }, [isDragging, initialTouch, pitch, handlePitch]); // Include dependencies in the dependency array

    const handleWheel = (e) => {
        // Adjust pitch based on the wheel delta
        let newVal = pitch - e.deltaY / 100; // You can adjust the division factor for sensitivity

        // Limit pitch to the range of 0 to 127
        newVal = Math.min(52, Math.max(36, newVal));
        console.log(e.deltaY)
        handlePitch(id, newVal);
    };

    const handleCCWheel = (e) => {
        // Adjust pitch based on the wheel delta
        console.log(cc)
        let newVal = cc - e.deltaY / 100; // You can adjust the division factor for sensitivity

        // Limit pitch to the range of 0 to 127
        newVal = Math.min(127, Math.max(0, newVal));
        handleCC(id, newVal);
    };

    const calculateBackgroundColor = (pitch) => {
        // Map pitch to a color based on your specific criteria
        const hue = Math.round((pitch - 36) / (52 - 36) * 360); // Example mapping to the hue scale
        return `hsl(${hue}, 90%, 65%)`; // Construct an HSL color based on the hue
    };

    return (
        <>
            <div className="flex flex-col"
                onMouseOver={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}>
                <div
                    onClick={handleClick}
                    className={(currentTrig === id ? 'bg-white' : trig ? 'bg-[#82d9b9]' : 'bg-black') + ' w-10 h-14 rounded-md'}>
                </div>
                {trig && <div
                    onMouseDown={handleMouseDown}
                    onWheel={handleWheel}
                    style={{ backgroundColor: calculateBackgroundColor(pitch) }}
                    className="flex flex-col items-center justify-center select-none w-10 h-14  text-black font-extrabold rounded-md mt-2 hover:h-20">
                    {pitch}
                </div>}
                {midicc && <div
                    onWheel={handleCCWheel}
                    style={{ backgroundColor: calculateBackgroundColor(cc) }}
                    className="flex flex-col items-center justify-center select-none w-10 h-14  text-black font-extrabold rounded-[15px] mt-2 hover:h-20">
                    {cc}
                </div>}
                {hovering && <div
                    onClick={()=>{setMidiCC(!midicc)}}
                    style={{ backgroundColor: calculateBackgroundColor(pitch) }}
                    className="w-10 h-10 flex flex-col items-center justify-center select-none  rounded-lg mt-2 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="black" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>

                </div>}
            </div>
        </>
    );
}
