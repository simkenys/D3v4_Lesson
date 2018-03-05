import * as d3 from 'd3';
import * as styles from '../styles/index.css'; 


const chart = d3.select('body') 
  .append('svg') 
  .attr('id', 'chart');

const req = new window.XMLHttpRequest(); 
req.addEventListener('load', mungeData); 
req.open('GET', 'data/EU-referendum-result-data.csv'); 
req.send(); 

function mungeData() { 
  const data = d3.csvParse(this.responseText); 
  const regions = data.reduce((last, row) => { 
    if (!last[row.Region]) last[row.Region] = [];
    last[row.Region].push(row); 
    return last; 
  }, {}); 
  
  /* 
  const regionsPctTurnout = Object.entries(regions)
    .map(([region, areas]) => ({
      region,
      meanPctTurnout: d3.mean(areas, d => d.Pct_Turnout),
  }));
 */
 
  const regionsPctTurnout = d3.nest() 
    .key(d => d.Region) 
    .rollup(d => d3.mean(d, leaf => leaf.Pct_Turnout)) 
    .entries(data); 

  renderChart(regionsPctTurnout); 
} 

function renderChart(data) { 
console.log(data);
  chart.attr('width', window.innerWidth) 
    .attr('height', window.innerHeight); 
	
  const x = d3.scaleBand()
  //  .domain(data.map(d => d.region))
    .domain(data.map(d => d.key))
    .rangeRound([50, window.innerWidth - 50])
    .padding(0.1);
  
  const y = d3.scaleLinear()
  //  .domain([0, d3.max(data, d => d.meanPctTurnout)])
	.domain([0, d3.max(data, d => d.value)])
    .range([window.innerHeight - 50, 50]);
  
  const xAxis = d3.axisBottom().scale(x); 
  const yAxis = d3.axisLeft().scale(y); 

  chart.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0, ${window.innerHeight - 50}) `)
    .call(xAxis);
  
  chart.append('g') 
    .attr('class', 'axis') 
    .attr('transform', 'translate(50, 0)') 
    .call(yAxis); 
	
  var bars = chart.selectAll('rect') 
    .data(data) 
    .enter() ;
  
  bars.append('rect') 
    .attr('class', 'bar') 
  //  .attr('x', d => x(d.region)) 
    .attr('x', d => x(d.key)) 
    .attr('y', window.innerHeight - 50)
    .attr('width', x.bandwidth()) 
    .attr('height', 0) 
      .transition() 
      .delay((d, i) => i * 20) 
      .duration(800) 
    //  .attr('y', d => y(d.meanPctTurnout)) 
	  .attr('y', d => y(d.value)) 
    //  .attr('height', d => (window.innerHeight - 50) - y(d.meanPctTurnout));
	  .attr('height', d => (window.innerHeight - 50) - y(d.value));
} 