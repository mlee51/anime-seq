//@ts-nocheck
import { useState, useEffect } from "react"
import Image from 'next/image'
import xIcon from '../../public/icons/x-markw.svg'
import qIcon from '../../public/icons/question.svg'

export default function Info() {
    const [isFirstTimeVisit, setIsFirstTimeVisit] = useState(false);
    const [showInfo, setShowInfo] = useState(false)
    const [showMac, setShowMac] = useState(false)
    const [showWindows, setShowWindows] = useState(false)

    useEffect(() => {
        const visitedBefore = localStorage.getItem('visitedBefore');
        if (!visitedBefore) {
            setIsFirstTimeVisit(true)
            setShowInfo(true)
            localStorage.setItem('visitedBefore', true)
        }
    }, []);

    useEffect(() => {
        if(showMac) setShowWindows(false)
    },[showMac])
    useEffect(() => {
        if(showWindows) setShowMac(false)
    },[showWindows])
    return (
        <div>
            <button onClick={() => setShowInfo(!showInfo)} className='absolute z-10 m-2'><Image className="w-8" src={qIcon} alt='Open Info' /></button>
            {showInfo && <div className="flex flex-col gap-y-4 items-start z-10 mt-4 p-10 pt-14 absolute left-0 right-0 mx-auto w-fit bg-background rounded-[20px]">
                <button onClick={() => setShowInfo(!showInfo)} className='absolute z-10 left-0 top-0 m-2 '><Image src={xIcon} alt='Close Info' /></button>
                <h1 className="text-4xl font-bold text-trig">What is CLAY?</h1>
                <p>CLAY is a flexible MIDI sequencer for arranging patterns and songs</p>
                <button onClick={() => setShowWindows(!showWindows)} className="text-4xl font-bold text-trig">Getting Started on Windows</button>
                {showWindows && (<ol className="list-decimal w-[49rem]   [&>li]:my-1.5 text-trig">
                    <li>Install{' '}
                        <a className="underline" href="https://www.tobias-erichsen.de/software/loopmidi.html" target="_blank">
                            loopMIDI
                        </a>
                       {' '}if there is no MIDI output available
                    </li>
                    <li>Open loopMIDI and click the plus icon to create a virtual MIDI port if there are no virtual MIDI ports listed</li>
                    <li>Back in CLAY, click the top right drop down and select your MIDI output device. If none are listed, you can try refreshing</li>
                    <li>We're all set! Click on an empty square to enter a trig and hit Spacebar to start sending out notes</li>
                </ol>)}
                <button onClick={() => setShowMac(!showMac)} className="text-4xl font-bold text-trig">Getting Started on Mac</button>
                {showMac && (<ol className="list-decimal w-[49rem] [&>li]:my-1.5 text-trig">
                    <li>Open Mac Audio MIDI Setup by pressing ⌘CMD + Space and typing Audio MIDI Setup or by going to Applications {'>'} Utilities {'>'} Audio MIDI Setup
                    </li>
                    <li>Click on Window at the top of the screen and open MIDI Studio</li>
                    <li>Inside MIDI Studio double click on IAC Driver</li>
                    <li>Make sure Device is online is checked. If there are no ports listed, click on the plus icon to create one. Hit Apply to save changes</li>
                    <li>Back in CLAY, click the top right drop down and select your MIDI output device. If none are listed you can try refreshing</li>
                    <li>We're all set! Click on an empty square to enter a trig and hit Spacebar to start sending out notes</li>
                </ol>)}
                <div>
                    <h1 className="text-4xl font-bold mb-4 text-off select-none">Controls</h1>
                    <table className="w-full border-collapse text-trig">
                        <thead>
                            <tr className="bg-background">
                                <th className="border py-2 px-4">Action</th>
                                <th className="border py-2 px-4">How To</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-off">
                                <td className="border py-2 px-4">Play/Pause</td>
                                <td className="border py-2 px-4">Click on background | Spacebar</td>
                            </tr>
                            <tr className="bg-background">
                                <td className="border py-2 px-4">Adjust Value</td>
                                <td className="border py-2 px-4">Click and drag | Scroll | Arrow keys | WASD</td>
                            </tr>
                            <tr className="bg-off">
                                <td className="border py-2 px-4">Adjust Duration</td>
                                <td className="border py-2 px-4">Hover over the number in the top right corner of a trig box then Adjust Value</td>
                            </tr>
                            <tr className="bg-background">
                                <td className="border py-2 px-4">Change CC Channel</td>
                                <td className="border py-2 px-4">Scroll over CC trig label</td>
                            </tr>
                            <tr className="bg-off">
                                <td className="border py-2 px-4">Rename CC Channel</td>
                                <td className="border py-2 px-4">Click on CC trig label</td>
                            </tr>
                            <tr className="bg-background">
                                <td className="border py-2 px-4">Shift Sequence</td>
                                <td className="border py-2 px-4">Click the left and right arrows to shift a Track's trigs</td>
                            </tr>
                            <tr className="bg-background">
                                <td className="border py-2 px-4">Delete Trig</td>
                                <td className="border py-2 px-4">Click the X in the top left corner of a trig box</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>}
        </div>
    )
}