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
                <button className="btn btn-secondary rounded-full shadow" onClick={() => setMode("other")}>Other visualization</button>
            </div>

            {mode === "barChart" && <BarChartVis canvasRef={canvasRef} />}
            {mode === "other" && <div className="mt-4">Other visualization content here</div>}
            {mode === "init" && <div className="mt-4">Select a visualization for the cylinder screen display</div>}

        </div>
    )
}

export default VisManager