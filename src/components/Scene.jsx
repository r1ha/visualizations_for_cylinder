import { useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Box3, Vector3 } from 'three'



export const Scene = ({  canvasRef, cylinderSettings, setCylinderSettings, mode, setLoading }) => {
  const { scene } = useGLTF('models/scene.gltf')
  const cylinderRef = useRef()
  const controlsRef = useRef()
  const textureRef = useRef()

  // Create directional light manually
  const directionalLightRef = useRef()
  const targetRef = useRef()

  useEffect(() => {
    if (!scene) return
    setLoading(false)

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [scene])

  // Provide cylinder settings once the scene is loaded
  useEffect(() => {
    if (cylinderRef.current) {
      const box = new Box3().setFromObject(cylinderRef.current)
      const size = new Vector3()
      box.getSize(size)

      setCylinderSettings({
        posX: cylinderRef.current.position.x,
        posY: cylinderRef.current.position.y,
        posZ: cylinderRef.current.position.z,
        height: size.y,
        radius: size.x / 2
      })
    }
  }, [])


  // Apply dynamic canvas texture to cylinder
  useEffect(() => {
    const mesh = cylinderRef.current
    const canvas = canvasRef?.current

    if (!mesh || !canvas) return

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.minFilter = THREE.LinearFilter;
    textureRef.current.magFilter = THREE.LinearFilter;
    textureRef.current.generateMipmaps = false;
    textureRef.current.wrapS = THREE.ClampToEdgeWrapping
    textureRef.current.wrapT = THREE.ClampToEdgeWrapping
    textureRef.current.needsUpdate = true

    if (mesh.material) {
      mesh.material.map = textureRef.current
      mesh.material.needsUpdate = true
    }
  }, [scene, mode])

  useFrame(() => {
    const mesh = cylinderRef.current
    const canvas = canvasRef?.current

    if (mesh && textureRef.current && canvas) {
      textureRef.current.needsUpdate = true
    }

    if (controlsRef.current && mesh) {
      controlsRef.current.target.copy(
        new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z)
      )
      controlsRef.current.update()
    }
  })

  return (
    <>
      <primitive object={scene} />

      <mesh
        ref={cylinderRef}
        position={[0, 0.95, 0]}
        castShadow
        receiveShadow
      >

        {/* Cylinder geometry with dynamic texture */}
        <cylinderGeometry
          args={[
            0.1, // radiusTop
            0.1, // radiusBottom
            0.3, // height
            128, // radialSegments (smooth)
            1,   // heightSegments
            true // openEnded (no caps)
          ]}
        />
        <meshStandardMaterial
          map={textureRef.current}
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={0.0}
        />
      </mesh>

      {/* Top black cap */}
      <mesh
        position={[0, 0.95 + 0.15, 0]} // 0.15 = height/2
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <circleGeometry args={[0.1, 128]} />
        <meshStandardMaterial color="#000000" roughness={0.3} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      <directionalLight
        ref={directionalLightRef}
        castShadow
        intensity={3.5}
        color={0xfffcf2}
        position={[5, 10, 7.5]}
        target={new THREE.Object3D(-2, -2.5, -1)}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.000025}
      />
      <primitive object={new THREE.Object3D()} ref={targetRef} position={[-1.9, -2.5, -1]} />

      <Environment files="hdris/citrus_orchard_puresky_4k.hdr" background />

      <OrbitControls ref={controlsRef} />
    </>
  )
}