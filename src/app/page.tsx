//@ts-nocheck
'use client'

import { useEffect, useState } from "react";
import Clay from "./Clay";
import Mobile from "./Mobile";


export default function Home() {
  const [isMobile,setMobile] = useState(true)
  const [isLoaded,setLoaded] = useState(false)
  useEffect(()=>{
    setMobile(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  },[])
  useEffect(()=>{
    setLoaded(true)
  },[isMobile])
  return (
    <>
    {isLoaded && (isMobile? <Mobile/>:<Clay/>)}
    </>
  );
}
