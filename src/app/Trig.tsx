//@ts-nocheck
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import plusIcon from '../../public/icons/plus.svg'

export default function Trig({ id, handleTrigs, handlePitch, trig, pitch, currentTrig, handleCC, cc, handleCCOn, handleDuration, duration }) {
    const [isDragging, setIsDragging] = useState<false>(false);
    const [initialTouch, setInitialTouch] = useState<number>(0);
    const [hovering, setHovering] = useState<boolean>(false)
    const [hoveringPitch, setHoveringPitch] = useState<boolean>(false)
    const [hoveringCC, setHoveringCC] = useState<boolean>(false)

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

    const handleArrowKeyUp = (event) => {
        if (event.code === "ArrowUp" && hoveringPitch) {
            let newVal = pitch + 1
            newVal = Math.min(127, Math.max(0, newVal));
            handlePitch(id, newVal);
        }
        else if (event.code === "ArrowDown" && hoveringPitch) {
            let newVal = pitch - 1
            newVal = Math.min(127, Math.max(0, newVal));
            handlePitch(id, newVal);
        }
        // else if (event.code === "ArrowUp" && hoveringCC) {
        //     let newVal = cc.val !== null ? cc.val + 1 : 0
        //     newVal = Math.min(127, Math.max(0, newVal));
        //     handleCC(id, { ...cc, val: newVal });
        // }
        // else if (event.code === "ArrowDown" && hoveringCC) {
        //     console.log('hi')
        //     let newVal = cc.val !== null ? cc.val - 1 : 0
        //     newVal = Math.min(127, Math.max(0, newVal));
        //     handleCC(id, { ...cc, val: newVal });
        // }
    };


    useEffect(() => {
        // Add event listener when the component mounts
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener("keyup", handleArrowKeyUp);

        // Clean up the event listeners when the component unmounts
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener("keyup", handleArrowKeyUp);
        };
    }, [isDragging, initialTouch, pitch, handlePitch]);

    const handleWheel = (e) => {
        let newVal = pitch + e.deltaY //pitch - e.deltaY / 100; 
        newVal = Math.min(127, Math.max(0, newVal));
        handlePitch(id, newVal);
    };

    const handleDurationWheel = (e) => {
        let newVal = duration - e.deltaY / 100;
        newVal = Math.min(16, Math.max(1, newVal));
        handleDuration(id, newVal)
    };

    const handleCCWheel = (e) => {
        let newVal = cc.val + e.deltaY//cc.val - e.deltaY / 100;
        newVal = Math.min(127, Math.max(0, newVal));
        handleCC(id, { ...cc, val: newVal });
    };

    const calculateBackgroundColor = (pitch) => {
        // Map pitch to a color based on your specific criteria
        const hue = Math.round((pitch) / (127 * 0.3) * 360); // Example mapping to the hue scale
        return `hsl(${hue}, 85%, 68%)`; // Construct an HSL color based on the hue
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
                {trig && <div
                    onMouseOver={() => setHoveringPitch(true)}
                    onMouseLeave={() => setHoveringPitch(false)}
                    style={{ backgroundColor: calculateBackgroundColor(pitch) }}
                    className="select-none w-14 h-14 relative text-off font-extrabold rounded-md mt-2 hover:border">
                    <div onWheel={handleDurationWheel} className='absolute pr-1 pt-1 right-0 text-xs'>{duration}</div>
                    <div className='flex h-full justify-center items-center' onWheel={handleWheel}>{pitch}</div>
                </div>}
                {cc.on && <div
                    onMouseOver={() => setHoveringCC(true)}
                    onMouseLeave={() => setHoveringCC(false)}
                    style={{ backgroundColor: calculateBackgroundColor(cc.val) }}
                    className='mt-2 rounded-[15px] rounded-t-md  hover:border'>
                    <div
                        onClick={() => { handleCCOn(id, !cc.on) }}
                        className='text-sm mx-auto text-off font-semibold text-center w-10 h-6 select-none  hover:opacity-20 py-1'
                        title="Delete"
                    >
                        127
                    </div>
                    <div
                        onWheel={handleCCWheel}
                        className="flex flex-col mx-auto items-center justify-center select-none w-10 h-8  text-off font-extrabold ">
                        {cc.val}
                    </div>
                </div>}
                {hovering && <div
                    onClick={() => { handleCCOn(id, !cc.on) }}
                    className="w-10 h-10 mx-auto select-none rounded-lg mt-2 p-4 bg-off opacity-25">
                    <Image src={plusIcon} alt="pause" />
                </div>}
            </div>
        </>
    );
}
