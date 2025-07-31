import { useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Box3, Vector3 } from 'three'



export const Scene = ({  canvasRef, cylinderSettings, setCylinderSettings, mode }) => {
  const { scene } = useGLTF('models/scene.gltf')
  const cylinderRef = useRef()
  const controlsRef = useRef()
  const textureRef = useRef()

  // Create directional light manually
  const directionalLightRef = useRef()
  const targetRef = useRef()

  useEffect(() => {
    if (!scene) return

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true

        if (obj.name === 'Cylinder_Curved') {

          cylinderRef.current = obj

          // Get cylinder dimensions
          const box = new Box3().setFromObject(obj)
          const size = new Vector3()
          box.getSize(size)

          setCylinderSettings({
            posX: obj.position.x,
            posY: obj.position.y,
            posZ: obj.position.z,
            height: size.y,
            radius: size.x / 2
          })

          console.log("Cylinder settings provided")
        }

        if (obj.name === 'Cylinder_Top') {
          // Plain black material for the top
          obj.material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.5,
            metalness: 0,
            side: THREE.DoubleSide
          })
        }
      }
    })


  }, [scene])

  // Apply dynamic canvas texture to cylinder
  useEffect(() => {
    const mesh = cylinderRef.current
    const canvas = canvasRef?.current

    if (!mesh || !canvas) return

    textureRef.current = new THREE.CanvasTexture(canvas)
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
        new THREE.Vector3(mesh.position.x, mesh.position.y + cylinderSettings.height / 2, mesh.position.z)
      )
      controlsRef.current.update()
    }
  })

  return (
    <>
      <primitive object={scene} />

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
