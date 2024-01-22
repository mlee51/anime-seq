//@ts-nocheck
import { useEffect, useState } from "react"

export default function Knob ({output}) {
    const [value,setValue] = useState(0)
    const [value2,setValue2] = useState(72)
    useEffect(()=>{
        output?.sendControlChange(value2, value)
    },[value])
    return(<>
        <input id="slide" type="range" min="1" max="127" step="1" value={value} onChange={(e)=>setValue(e.target.value)}/>
        <br/>
        <input id="slide" type="range" min="1" max="127" step="1" value={value2} onChange={(e)=>setValue2(e.target.value)}/>
        </>
    )
}