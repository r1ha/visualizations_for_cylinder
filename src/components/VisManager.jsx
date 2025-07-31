import React, { useEffect, useRef, useState } from 'react';
import BarChartVis from './BarChartVis';

function VisManager({canvasRef, cylinderSettings, mode, setMode}) {

    // if cylinder settings are provided, update the canvas dimensions
    useEffect(() => {

        if (cylinderSettings) {
            const canvas = canvasRef?.current;
            if (canvas) {
                // Preserving the ratio
                const height = cylinderSettings.height;
                const radius = cylinderSettings.radius;

                const width = 2 * Math.PI * radius; // Circumference of the cylinder
                const aspectRatio = width / height;

                // Set canvas dimensions based on cylinder setting
                canvas.height = 200;
                canvas.width = 200 * aspectRatio * 1.5; // Adjusted for better visibility

                // Make it invisible
                canvas.style.display = 'none';

                const ctx = canvas?.getContext('2d');

                if (ctx && mode === 'init') {
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
        }
    }, [cylinderSettings]);

    return (
        <div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="flex gap-2 mt-4">
                <button className="btn btn-primary rounded-full shadow" onClick={() => setMode("barChart")}>Bar chart</button>
                <button className="btn btn-secondary rounded-full shadow" onClick={() => setMode("other")}>Other visualization</button>
            </div>

            {mode === "barChart" && <BarChartVis canvasRef={canvasRef} />}
            {mode === "other" && <div>Other visualization content here</div>}
            {mode === "init" && <div>Initial state, waiting for user action...</div>}

        </div>
    )
}

export default VisManager