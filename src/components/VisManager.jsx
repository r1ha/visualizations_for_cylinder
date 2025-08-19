import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BarChartVis from './vis/BarChartVis';
import HeatMapVis from './vis/HeatMapVis';

const interval = 2000;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function VisManager({canvasRef, cylinderSettings, mode, setMode}) {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [useWebSocket, setUseWebSocket] = useState(false);
    const [wsStatus, setWsStatus] = useState('disconnected');
    const [wsAddress, setWsAddress] = useState('192.168.0.103:81');
    const webSocketRef = useRef(null);

    // Move these refs OUTSIDE of useEffect!
    const lastSim = useRef({
        timestamp: Date.now(),
        top: Math.random() * 100,
        right: Math.random() * 100,
        bottom: Math.random() * 100,
        left: Math.random() * 100
    });
    const simDrift = useRef([0, 0, 0, 0]);

    // WebSocket connection logic
    useEffect(() => {
        if (!useWebSocket) {
            if (webSocketRef.current) {
                webSocketRef.current.close();
                webSocketRef.current = null;
            }
            setWsStatus('disconnected');
            return;
        }

        setWsStatus('connecting');
        const ws = new window.WebSocket(`ws://${wsAddress}`);
        webSocketRef.current = ws;

        ws.onopen = () => {
            setWsStatus('connected');
            console.info('[WebSocket] Connected to', wsAddress);
        };
        ws.onclose = () => {
            setWsStatus('disconnected');
            console.info('[WebSocket] Disconnected');
        };
        ws.onerror = (e) => {
            setWsStatus('error');
            console.error('[WebSocket] Error:', e);
        };
        ws.onmessage = (event) => {
            setData(JSON.parse(event.data));
        };

        return () => {
            ws.close();
        };
    }, [useWebSocket, wsAddress]);

    // Data simulation logic (only if not using WebSocket)
    useEffect(() => {
        if (useWebSocket) return;
        const generateSimulatedData = () => {
            const reset = Math.random();
            let data;
            const general = (Math.random() - 0.5) * 10;
            for (let i = 0; i < 4; i++) {
                simDrift.current[i] = (Math.random() - 0.5) * 7.5;
            }
            if (reset > 0.75) {
                data = {
                    timestamp: Date.now(),
                    top: Math.random() * 100,
                    right: Math.random() * 100,
                    bottom: Math.random() * 100,
                    left: Math.random() * 100
                };
            } else {
                data = {
                    timestamp: Date.now(),
                    top: clamp(lastSim.current.top + general + simDrift.current[0], 0, 120),
                    right: clamp(lastSim.current.right + general + simDrift.current[1], 0, 120),
                    bottom: clamp(lastSim.current.bottom + general + simDrift.current[2], 0, 120),
                    left: clamp(lastSim.current.left + general + simDrift.current[3], 0, 120)
                };
            }
            lastSim.current = data;
            return data;
        };

        setData(generateSimulatedData());
        const timer = setInterval(() => {
            setData(generateSimulatedData());
        }, interval);
        return () => clearInterval(timer);
    }, [mode, useWebSocket]);

    // if cylinder settings are provided, update the canvas dimensions
    useEffect(() => {

        if (cylinderSettings) {
            const canvas = canvasRef?.current;
            if (canvas) {
                // Preserving the ratio
                const height = cylinderSettings.height;
                const radius = cylinderSettings.radius;
                const width = 2 * Math.PI * radius;
                const aspectRatio = width / height;

                canvas.height = 400;
                canvas.width = canvas.height * aspectRatio; // Adjusted for better visibility

                const ctx = canvas?.getContext('2d');

                if (ctx && mode === 'init') {
                    // Black fill for the canvas
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
        }
    }, [cylinderSettings, mode]);

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="flex gap-2 mt-4 justify-center">
                <button className="btn btn-primary rounded-full shadow" onClick={() => setMode("barChart")}>Bar chart</button>
                <button className="btn btn-secondary rounded-full shadow" onClick={() => setMode("heatMap")}>Heat Map</button>

                {/* link to another page of the router */}
                <button 
                    className="btn btn-accent rounded-full shadow" 
                    onClick={() => navigate('/test')}
                >
                    Test page
                </button>

            </div>
            <div className="bg-gray-400 rounded-4xl p-3 shadow flex gap-2 mt-4 justify-center items-center">
                <button
                    className="bg-gray-800 hover:bg-gray-900 px-5 py-2 rounded-full"
                    onClick={() => setUseWebSocket(ws => !ws)}
                >
                    {useWebSocket ? "✅WebSocket: on" : "❌WebSocket: off"}
                </button>
                <span className={
                    wsStatus === 'connected' ? "text-success" :
                    wsStatus === 'connecting' ? "text-warning" :
                    wsStatus === 'error' ? "text-error" : "text-gray-900"
                }>
                    {wsStatus.charAt(0).toUpperCase() + wsStatus.slice(1)}
                </span>
                <input 
                    type="text" 
                    placeholder="IP:Port" 
                    value={wsAddress}
                    onChange={(e) => setWsAddress(e.target.value)}
                    className="px-2 py-1 rounded text-gray-900"
                />
            </div>

            {mode === "barChart" && <BarChartVis canvasRef={canvasRef} data={data} />}
            {mode === "heatMap" && <HeatMapVis canvasRef={canvasRef} data={data} />}
            {mode === "init" && <div className="mt-4">Select a visualization for the cylinder screen display</div>}

        </div>
    )
}

export default VisManager;