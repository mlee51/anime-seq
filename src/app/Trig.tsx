//@ts-nocheck
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import plusIcon from '../../public/icons/plus.svg'

export default function Trig({ id, handleTrigs, handlePitch, trig, pitch, currentTrig, handleCC, cc, handleCCOn }) {
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

    const handleWheel = (e) => {
        let newVal = pitch - e.deltaY / 100; 
        newVal = Math.min(127, Math.max(0, newVal));
        console.log(e.deltaY)
        handlePitch(id, newVal);
    };

    const handleCCWheel = (e) => {
        let newVal = cc.val - e.deltaY / 100;
        newVal = Math.min(127, Math.max(0, newVal));
        handleCC(id, { ...cc, val: newVal });
    };

    const calculateBackgroundColor = (pitch) => {
        // Map pitch to a color based on your specific criteria
        const hue = Math.round((pitch - 36) / (52 - 36) * 360); // Example mapping to the hue scale
        return `hsl(${hue}, 85%, 64%)`; // Construct an HSL color based on the hue
    };

    return (
        <>
            <div className="flex flex-col mx-1"
                onMouseOver={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}>
                <div
                    onClick={handleClick}
                    className={(currentTrig === id ? 'bg-[#60d68d]' : trig ? 'bg-[#e6e6e6]' : 'bg-[#0d0d0d]') + ' w-10 h-14 rounded-md hover:bg-[#f83573]'}>
                </div>
                {trig && <div
                    onMouseDown={handleMouseDown}
                    onWheel={handleWheel}
                    style={{ backgroundColor: calculateBackgroundColor(pitch) }}
                    className="flex flex-col items-center justify-center select-none w-10 h-14  text-[#1f1f1f] font-extrabold rounded-md mt-2 hover:h-20">
                    {pitch}
                </div>}
                {cc.on && <div
                    style={{ backgroundColor: calculateBackgroundColor(cc.val) }}
                    className='mt-2 rounded-b-[15px] rounded-t-sm'>
                    <div
                        onClick={() => { handleCCOn(id, !cc.on) }}
                        className='text-sm text-black font-semibold text-center w-10 h-4 select-none hover:opacity-30'
                        title="Delete"
                    >
                        127
                    </div>
                    <div
                        onWheel={handleCCWheel}
                        className="flex flex-col items-center justify-center select-none w-10 h-10  text-black font-extrabold   hover:h-12">
                        {cc.val}
                    </div>
                </div>}
                {hovering && <div
                    onClick={() => { handleCCOn(id, !cc.on) }}
                    className="w-10 h-10 flex flex-col items-center justify-center select-none rounded-lg mt-2 p-4 bg-black opacity-50">
                    <Image src={plusIcon} alt="pause"/>
                </div>}
            </div>
        </>
    );
}
