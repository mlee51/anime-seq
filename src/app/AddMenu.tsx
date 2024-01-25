//@ts-nocheck
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import plusIcon from '../../public/icons/plus.svg'

export default function AddMenu({ createCC, createTrig }) {
    const [hoveringAdd, setHoveringAdd] = useState<boolean>(false)
    return (
        <div
            onMouseOver={() => setHoveringAdd(true)}
            onMouseLeave={() => setHoveringAdd(false)}

            className="w-auto p-2 h-auto flex flex-col items-center m-auto mt-2 select-none rounded-lg  bg-off opacity-25">
            {hoveringAdd && <><div onClick={() => createTrig()}
                className="select-none w-8 h-8 text-off font-extrabold rounded-md hover:border mb-2 bg-background" />
                <div onClick={() => createCC()}
                    className="select-none w-8 h-8  text-off font-extrabold rounded-tl-md rounded-[12px] hover:border bg-background" /></>}
            {!hoveringAdd && <Image width={22} src={plusIcon} alt="pause" />}
        </div>
    )
}