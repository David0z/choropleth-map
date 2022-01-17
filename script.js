const App = () => {
  
    // EDUCATION DATA
    
    const [educationData, setEducationData] = React.useState(null);
    
    React.useEffect(() => {
      d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json').then(setEducationData);
    }, []);
    
    // MAP DATA
    
    const[mapData, setMapData] = React.useState(null);
    
    React.useEffect(() => {
      d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json').then(topojsonData => {
        const { counties, states } = topojsonData.objects;
        setMapData({
          counties: topojson.feature(topojsonData, counties),
        states: topojson.mesh(topojsonData, states, function(a, b) { return a !== b;})});
      });
    }, []);
  
    // SVG PROPERTIES
    const svgWidth = 1000;
    const svgHeight = svgWidth * 9 / 16 + 50;
    
    // MAP RERNDERING PROPERTIES
    
    // var projection = d3.geoAlbersUsa();
    var path = d3.geoPath();
    
    //TOOLTIP
  
      function handleMouseOver(e) {
  // cringe jsdom
        e.target.style.stroke = 'red';
        e.target.style.strokeWidth = 3;
        const tooltip = document.getElementById('tooltip');
        
  tooltip.innerText = `${e.target.getAttribute('county-name')}, ${e.target.getAttribute('state-name')}: ${e.target.getAttribute('bachelor-rate')}%`;
        // console.log(e)
        tooltip.style.opacity = 0.9;
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.nativeEvent.offsetY}px`;
    }
    
    function handleMouseLeave(e) {
     e.target.style.stroke = 'none';
     e.target.style.strokeWidth = 0; 
      document.getElementById('tooltip').style.opacity = 0;
    }
    
      if(!mapData) {
      return <p id="loading">Loading data...</p>;
    }
    
    // SCALE
    const eduDataRange = educationData.map(element => element.bachelorsOrHigher);
    
    const colorScale = d3.scaleThreshold()
    .domain(d3.range(d3.min(eduDataRange), d3.max(eduDataRange), (d3.max(eduDataRange) - d3.min(eduDataRange)) / 8))
    .range(d3.schemeReds[9]);
    
    // LEGEND TICKS
  const tickWidth = 30;
  const tickHeight = 30;
  const tickTextOffset = -25;
    
    // LEGEND HOVER HANDLERS
    
    const legendMouseOver = function(event) {
      
      document.querySelectorAll('.legend-tick').forEach(element => {
        if(element.getAttribute('fill') != event.target.getAttribute('fill')) {
           element.style.opacity = 0.2;
        }
      });
      
      document.querySelectorAll('.county-path').forEach(element => {
        element.style.strokeWidth = 1;
        if(element.getAttribute('fill') != event.target.getAttribute('fill')) {
          element.style.opacity = 0.2;
          element.style.stroke = 'rgba(0, 0, 0, 0.5)';
        } else {
          element.style.stroke = 'red';
        }
      });
      document.getElementById('state-border').style.opacity = 0;
    }
    
    const legendMouseLeave = function(event) {
      
          document.querySelectorAll('.legend-tick').forEach(element => {
        if(element.getAttribute('fill') != event.target.getAttribute('fill')) {
           element.style.opacity = 1;
        }
      });
      
          document.querySelectorAll('.county-path').forEach(element => {
        
          element.style.opacity = 1;
          element.style.stroke = 'none';
      });
      
      document.getElementById('state-border').style.opacity = 1;
    }
    
  //   NEW LOGIC
    
  //   mapData.counties.features.forEach(feature => {
  //   feature.bachelors = educationData.filter(element => element.fips === feature.id).map(element => element.bachelorsOrHigher);
  //   feature.color = colorScale(feature.bachelors);
  //   });
    
  //   console.log(mapData)
    
    // RETURN
    
    return (
      <>
    <svg width={svgWidth} height='100%' id="svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio='xMinYMin'>
        <g className="marks">
          {
            mapData.counties.features.map(feature => (
            <path 
              d={path(feature)} 
              county-id={feature.id}
              county-name={educationData.filter(element => element.fips === feature.id).map(element => element.area_name)}
              bachelor-rate={educationData.filter(element => element.fips === feature.id).map(element => element.bachelorsOrHigher)}
              state-name={educationData.filter(element => element.fips === feature.id).map(element => element.state)}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
              fill={colorScale(educationData.filter(element => element.fips === feature.id).map(element => element.bachelorsOrHigher))}
              className='county-path'
              />
            ))
          }
        </g>
            <path
              d={path(mapData.states)}
              id="state-border"
              />
        <g transform={`translate(${svgWidth - 40}, ${svgHeight - 250})`} id='y-axis'>
          {
  colorScale.domain().map((tick, i) => (
    <>
      <text x={tickTextOffset} dy={i * tickHeight - 5}>
              {`${tick.toFixed()}%`}
            </text>
      
            <rect 
              width={tickWidth} 
              height={tickHeight}
              y={i * tickHeight}
              fill={colorScale(tick)}
              onMouseOver={legendMouseOver}
              onMouseLeave={legendMouseLeave}
              className='legend-tick'
              />
            <line
        y1={i * tickHeight}
        y2={i * tickHeight}
        x1={tickTextOffset}
        x2={tickWidth}
        stroke='black'
        stroke-width='1'
        className='tick-line'
        />
      </>
            ))
          }
        </g>
    </svg>
              <div id="tooltip" className='d-flex align-items-center justify-content-center'></div>
      </>
    );
  };
  
  ReactDOM.render(<App/>, document.getElementById('canvas'));