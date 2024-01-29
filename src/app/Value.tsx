//@ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react"

export default function Value({ parentValue, setter, min, max, index = null }) {
    const [value, setValue] = useState(parentValue)
    const [snapshot, setSnapshot] = useState(value)
    const [startVal, setStartVal] = useState(0)
    const hovering = useRef(false)

    const onStart = useCallback(
        (event) => {
            setStartVal(event.clientX);
            setSnapshot(value);
        },
        [value]
    );

    const handleValue = (e) => {
        let newVal = e
        newVal = Math.min(max, Math.max(min, newVal));
        setValue(newVal)
    }

    useEffect(() => {
        if (index !== null) {
            setter(value,index)
        } else {
            setter(value)
        }

    }, [value])



    useEffect(() => {
        const onKeyDown = (event) => {
            if (hovering.current) {
                let inc = 0
                switch (event.code) {
                    case "ArrowUp":
                    case "KeyW":
                        inc = 1
                        break
                    case "ArrowDown":
                    case "KeyS":
                        inc = -1
                        break
                    case "ArrowLeft":
                    case "KeyA":
                        inc = -12
                        break
                    case "ArrowRight":
                    case "KeyD":
                        inc = 12
                        break
                    default:
                        break
                }
                setValue((prev) => {
                    let newVal = prev + inc
                    newVal = Math.max(min, Math.min(newVal, max))
                    return (newVal)
                })
            }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [])

    useEffect(() => {
        // Only change the value if the drag was actually started.
        const onUpdate = (event) => {
            if (startVal) {
                handleValue(snapshot + event.clientX - startVal);
            }
        };

        // Stop the drag operation now.
        const onEnd = () => {
            document.removeEventListener("mousemove", onUpdate);
            document.removeEventListener("mouseup", onEnd);
            setStartVal(0);
        };
        document.addEventListener("mousemove", onUpdate);
        document.addEventListener("mouseup", onEnd);
        return () => {
            document.removeEventListener("wheel", onWheel);
            document.removeEventListener("mousemove", onUpdate);
            document.removeEventListener("mouseup", onEnd);
        };
    }, [startVal, setValue, snapshot]);

    const onWheel = (e) => {
        const scrollVal = Math.sign(e.deltaY)
        let newVal = value - scrollVal
        handleValue(newVal)
    };


    return (
        <div
            onMouseEnter={() => hovering.current = true}
            onMouseLeave={() => hovering.current = false}
            onWheel={onWheel}
            onMouseDown={onStart}>
            {value}
        </div>
    )
}