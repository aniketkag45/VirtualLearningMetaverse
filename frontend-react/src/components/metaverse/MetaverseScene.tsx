import {useEffect, useRef} from 'react';
import 'aframe';
import { spatialAudioManager } from '../../utils/spatialAudio';

interface Avatar{
    id: string;
    name: string;
    position: {x: number; y: number; z: number;};
    rotation: {x: number; y: number; z: number;};
}

interface MetaverseSceneProps{
    avatars: Avatar[];
    currentUserId: string;
    onPositionUpdate: (position: any, rotation: any) => void;

}
const MetaverseScene = ({avatars, currentUserId, onPositionUpdate}: MetaverseSceneProps) => {
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        //send position updates at intervals
        const interval = setInterval(() => {
            const camera = document.querySelector('a-camera');

            if (camera) {
                const position = camera.object3D.position;
                const rotation = camera.object3D.rotation;
                onPositionUpdate(position, rotation);

                // Update spatial audio listener position
                spatialAudioManager.updateListenerPosition(position);

                 // Calculate forward and up vectors from rotation
      // CONCEPT: Rotation (Euler angles) → Direction vectors for audio
      const forward = {
        x: -Math.sin(rotation.y),
        y: 0,
        z: -Math.cos(rotation.y)
      };
      const up = { x: 0, y: 1, z: 0 };
      spatialAudioManager.updateListenerOrientation(forward, up);
            }
        }, 100); // every 100 milliseconds

        return () => clearInterval(interval);
    }, [onPositionUpdate]);

    return (
        <a-scene embedded style={{ width: '100%', height: '100%' }}>
            {/* Sky */}
            <a-sky color="#87CEEB"></a-sky>
            
            {/* Floor */}
            <a-plane 
                position="0 0 0" 
                rotation="-90 0 0" 
                width="50" 
                height="50" 
                color="#7BC8A4"
            ></a-plane>
            
            {/* Classroom Walls */}
            <a-box position="0 2 -10" width="20" height="4" depth="0.2" color="#FFA500"></a-box>
            <a-box position="-10 2 0" width="0.2" height="4" depth="20" color="#FFA500"></a-box>
            <a-box position="10 2 0" width="0.2" height="4" depth="20" color="#FFA500"></a-box>
            
            {/* Whiteboard */}
            <a-box 
                position="0 3 -9.8" 
                width="8" 
                height="3" 
                depth="0.1" 
                color="#FFFFFF"
            ></a-box>
              {/* Instructor Desk */}
            <a-box 
                position="0 1 -7" 
                width="3" 
                height="1.5" 
                depth="1.5" 
                color="#8B4513"
            ></a-box>
            
            {/* Student Desks */}
            {[-4, -2, 0, 2, 4].map((x) => (
                [-2, 0, 2, 4].map((z) => (
                    <a-box 
                        key={`desk-${x}-${z}`}
                        position={`${x} 0.75 ${z}`} 
                        width="1.2" 
                        height="0.75" 
                        depth="0.8" 
                        color="#8B4513"
                    ></a-box>
                ))
            ))}
            
            {/* Render all avatars except current user */}
            {avatars.filter(avatar => avatar.id !== currentUserId).map((avatar) => (
                <a-entity key={avatar.id} position={`${avatar.position.x} ${avatar.position.y} ${avatar.position.z}`}>
                    {/* Avatar sphere */}
                    <a-sphere 
                      position="0 1.6 0" 
                        radius="0.3" 
                        color="#4285F4"
                    ></a-sphere>
                    
                    {/* Name tag */}
                    <a-text 
                        value={avatar.name} 
                        position="0 2.2 0" 
                        align="center" 
                        color="#000000"
                        scale="2 2 2"
                    ></a-text>
                </a-entity>
            ))}
            
            {/* Camera (first person view) */}
            <a-entity 
                ref={cameraRef}
                position="0 1.6 5" 
                look-controls 
                wasd-controls
            >
                <a-camera></a-camera>
            </a-entity>
             {/* Lighting */}
            <a-light type="ambient" color="#BBB"></a-light>
            <a-light type="directional" color="#FFF" intensity="0.6" position="-1 1 0"></a-light>
        </a-scene>
    );
};

export default MetaverseScene;

