//@ts-nocheck
export default function Pitch({id, pitch, handleWheel, duration, handleDurationWheel }) {

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

    return (
        <div
            style={{ backgroundColor: calculateBackgroundColor(pitch) }}
            className="select-none w-14 h-14 relative text-off font-extrabold rounded-md mt-2 hover:border">
            <div onWheel={handleDurationWheel} className='absolute pr-1 pt-1 right-0 text-xs'>{duration}</div>
            <div className='flex h-full justify-center items-center' onWheel={(e)=>handleWheel(e,id)}>{pitch}</div>
            <div className='absolute pl-1 pt-b bottom-0 left-0 text-xs mix-blend-difference'>{getPitchForKey(pitch)}</div>
        </div>
    )
}