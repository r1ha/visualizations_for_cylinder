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
    const [loading, setLoading] = useState(true)

  return (
    <div className="relative w-full h-full rounded-4xl bg-white/50">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
                <span className="loading loading-spinner loading-xl"></span>
            </div>
        )}
        <Canvas
            className="w-fit h-fit rounded-4xl"
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
                setLoading={setLoading}
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
