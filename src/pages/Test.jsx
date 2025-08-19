import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Test({
    data = [10, 20, 30, 40, 50, 10, 80, 20, 0, 60, 70, 90]
}) {
  const svgRef = useRef()
  const width = 1000
  const height = 400
  const margin = { top: 20, right: 20, bottom: 40, left: 40 }
  const rotationIntervalMs = 5000 // idle delay before each rotation
  const rotationDurationMs = 800  // duration of the rotation animation
  const maxValue = 120 // Fixed maximum instead of dynamic

  // Repeat first value to create a seamless wrap
    data = [...data, data[0]]; // Ensure the first value is repeated for wrapping

  const navigate = useNavigate()
    
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Scales - use fixed domain [0, maxValue] instead of d3.extent(data)
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, maxValue])  // Fixed scale from 0 to 100
      .range([height - margin.bottom, margin.top]);

    // Plot width (period for wrapping)
    const plotWidth = width - margin.left - margin.right;

    // Threshold (expectations)
    const expectations = 30;
    const expectationsData = new Array(data.length).fill(expectations);

    // Gradient mapping by Y with a smooth grey blend band around the threshold
    const yTop = margin.top;
    const yBot = height - margin.bottom;
    const yThresholdPx = yScale(expectations);
    const offset = ((yThresholdPx - yTop) / (yBot - yTop)) * 100;

    const blendPx = 100; // smoothing band around threshold in px
    const blendPct = (blendPx / (yBot - yTop)) * 100;
    const clamp01 = (v) => Math.max(0, Math.min(100, v));

    const upStop    = clamp01(offset - blendPct);
    const midStop   = clamp01(offset);
    const downStop  = clamp01(offset + blendPct);

    const defs = svg.append("defs");
    const grad = defs
      .append("linearGradient")
      .attr("id", "thresholdGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", yTop)
      .attr("x2", 0).attr("y2", yBot);

    // Cyan from top to just before the blend band
    grad.append("stop").attr("offset", "0%").attr("stop-color", "cyan");
    grad.append("stop").attr("offset", `${upStop}%`).attr("stop-color", "cyan");
    // Grey at threshold for a smooth blend
    grad.append("stop").attr("offset", `${midStop}%`).attr("stop-color", "#9CA3AF");
    // Violet below the blend band
    grad.append("stop").attr("offset", `${downStop}%`).attr("stop-color", "#8B5CF6");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#8B5CF6");

    // Line generator
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveBumpX);

    // Static elements (axes and expectation line)
    svg.append("path")
      .datum(expectationsData)
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("d", line);

    const xAxis = d3.axisBottom(xScale)
      .ticks(data.length)
      .tickFormat((d, i) => `#${i + 1}`);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    // Moving group for periodic wrapping
    const pathsG = svg.append("g").attr("class", "scroll-paths");

    // Primary path
    pathsG.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "url(#thresholdGradient)")
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

    // Duplicate path shifted by +plotWidth for seamless wrap
    pathsG.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "url(#thresholdGradient)")
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("transform", `translate(${plotWidth},0)`)
      .attr("d", line);

    // Discrete rotation (idle -> quick spin -> reset -> idle)
    let rafId = null
    let timeoutId = null

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3)

    const startRotation = () => {
      const start = performance.now()
      const animate = (now) => {
        const elapsed = now - start
        const t = Math.min(1, elapsed / rotationDurationMs)
        const eased = easeOutCubic(t)
        const tx = -eased * plotWidth
        pathsG.attr("transform", `translate(${tx},0)`)
        if (t < 1) {
          rafId = requestAnimationFrame(animate)
        } else {
          // reset instantly to start position for next cycle
            pathsG.attr("transform", `translate(0,0)`)
          timeoutId = setTimeout(startRotation, rotationIntervalMs)
        }
      }
      rafId = requestAnimationFrame(animate)
    }

    // initial wait before first rotation
    timeoutId = setTimeout(startRotation, rotationIntervalMs)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [data, width, height, margin, rotationIntervalMs, rotationDurationMs]);

  return (
    <>

      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        style={{ border: '1px solid #ccc' }}
      />

      <button className='btn btn-primary rounded-4xl mt-4 shadow' onClick={() => navigate('/')}>
        Simulator
      </button>
    </>
  )
}

export default Test