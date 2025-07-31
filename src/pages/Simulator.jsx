import { Canvas } from '@react-three/fiber'
import { Scene } from '../components/Scene'
import * as THREE from 'three'
import VisManager from '../components/VisManager'
import { useRef, useState } from 'react'

function Simulator() {

    // Canvas for 2D visualization
    const canvasRef = useRef()

    // Getting height and radius from the cylinder
    const [cylinderSettings, setCylinderSettings] = useState(
        {
        posX: 0,
        posY: 0,
        posZ: 0,
        height: 1,
        radius: 1
        }
  )

    const [useWebSocket, setUseWebSocket] = useState(false);
    const [mode, setMode] = useState('init');

  return (
    <div className="relative w-full h-full">

        <Canvas
            className="w-fit h-fit"
            shadows
            dpr={window.devicePixelRatio}
            gl={{
            antialias: true,
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.5,
            }}
            camera={{ position: [0, 2, 5], fov: 50 }}
        >

            <Scene
                canvasRef={canvasRef}
                cylinderSettings={cylinderSettings}
                setCylinderSettings={setCylinderSettings}
                mode={mode}
                setMode={setMode}
            />

        </Canvas>
        
        <div className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-auto">

        <VisManager
            canvasRef={canvasRef}
            cylinderSettings={cylinderSettings}
            mode={mode}
            setMode={setMode}
        />

        </div>

    </div>
  )
}

export default Simulator
