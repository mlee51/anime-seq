//@ts-nocheck
import React, { useState, useEffect } from 'react';

export default function Trig({ id, handleTrigs, handlePitch, trig, pitch, currentTrig }) {
    const [isDragging, setIsDragging] = useState(false);
    const [initialTouch, setInitialTouch] = useState(0);

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

        handlePitch(id, newVal);
    };

    const calculateBackgroundColor = (pitch) => {
        // Map pitch to a color based on your specific criteria
        const hue = Math.round((pitch - 36) / (52 - 36) * 360); // Example mapping to the hue scale
        return `hsl(${hue}, 90%, 65%)`; // Construct an HSL color based on the hue
    };

    return (
        <>
            <div className="flex flex-col">
                <div
                    onClick={handleClick}
                    className={(currentTrig === id ? 'bg-white' : trig ? 'bg-[#a4d678]' : 'bg-black') + ' w-10 h-14 rounded-md'}>
                </div>
                {trig && <div
                    onMouseDown={handleMouseDown}
                    onWheel={handleWheel}
                    style={{ backgroundColor: calculateBackgroundColor(pitch) }}
                    className="flex flex-col items-center justify-center select-none w-10 h-14  text-black font-extrabold rounded-md mt-2">
                    {pitch}
                </div>}
                {/* {trig && <div className="w-10 h-14 bg-green-300 rounded-md mt-2"></div>} */}
            </div>
        </>
    );
}
