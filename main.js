d3.select('#chart-area')
.append("h1")
.attr("id", "title")
.text("United States Educational Attainment")

d3.select('#chart-area')
.append("h2")
.attr("id", "description")
.text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)")

Promise.all([
   fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
   .then(response => response.json()),
  fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
   .then(response => response.json()),])
   .then(data => {
      document.getElementById("chart-area").value = JSON.stringify(data);
      const dataEducation = data[0]
      const dataGeo = data[1]

    
      const w = 900;
      const h = 600;

  
      const legend = d3.select("#chart-area")
         .append("svg")
         .attr("id", "legend")
         .attr("width", "400")
         .attr("height", "60")

      const percent = d3.range(d3.min(dataEducation, (d) => d.bachelorsOrHigher), d3.max(dataEducation, (d) => d.bachelorsOrHigher), ((d3.max(dataEducation, (d) => d.bachelorsOrHigher) - d3.min(dataEducation, (d) => d.bachelorsOrHigher))/7))    
   
      const colors = ['#f7f7f7','#fddbc7','#f4a582','#d6604d', '#b2182b','#67001f','#3f040c']

      const legendxScale = d3.scaleLinear()
         .domain([d3.min(percent), d3.max(percent)])
         .range([30, 370])
        
      legend.selectAll("rect")
         .data(percent.slice(0,-1))
         .enter()
         .append("rect")
         .attr("x", (d) => legendxScale(d))
         .attr("y", 0)
         .attr("width", 400/percent.length)
         .attr("height", 25)
         .attr("fill",  (d, i) => colors[i])
         
      const legendxAxis = d3.axisBottom(legendxScale)
         .tickValues(percent)
         .tickFormat((d) => Math.round(d) +"%")
           
      legend.append("g")
         .attr("transform", "translate(0,25)")
         .attr("id", "legendx-axis")
         .attr("color", "#474862")
         .style("font-family", "Amiri Quran, serif")
         .style("font-size", "0.8rem")
         .call(legendxAxis)
         
   
      const tooltip = d3.select("#chart-area")
         .append("tooltip")
         .attr("id", "tooltip")

      const svg = d3.select("#chart-area")
         .append("svg")
         .attr("width", w)
         .attr("height", h)
         .style("margin-top", "3rem")

      const path = d3.geoPath()
   
      svg.selectAll(".county")
            .data(topojson.feature(dataGeo, dataGeo.objects.counties).features)
            .enter()
            .append("path")
            .attr('class', 'county')
            .attr('data-fips', (d) => d.id)
            .attr('data-education', function (d) {
               const result = dataEducation.filter(function (obj) {
               return obj.fips === d.id;
               });
               if (result[0]) {
               return result[0].bachelorsOrHigher;
               }
               // could not find a matching fips id in the data
               console.log('could find data for: ', d.id);
               return 0;
            })
            .attr('data-county', function (d) {
               const result = dataEducation.filter(function (obj) {
               return obj.fips === d.id;
               });
               if (result[0]) {
               return result[0].area_name;
               }
               // could not find a matching fips id in the data
               console.log('could find data for: ', d.id);
               return 0;
            })
            .attr('data-state', function (d) {
               const result = dataEducation.filter(function (obj) {
               return obj.fips === d.id;
               });
               if (result[0]) {
               return result[0].state;
               }
               // could not find a matching fips id in the data
               console.log('could find data for: ', d.id);
               return 0;
            })
            .attr('fill', function (d) {
               const result = dataEducation.filter(function (obj) {
               return obj.fips === d.id;
               });
               if (result[0]) {
               return colors[Math.floor(((result[0].bachelorsOrHigher-3)/5) -1)];
               }
               // could not find a matching fips id in the data
               return "transparent";
            })
            .attr('d', path)
            .on("mouseover", function (event) {
               tooltip.attr("data-education", this.getAttribute("data-education"))
            .style("opacity", "0.8")
            .html( this.getAttribute("data-county") +
            ', ' +
            this.getAttribute("data-state") +
            ': ' +
            this.getAttribute("data-education") +
            '%')
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px');
         
            })
            .on("mouseout", function () {
               tooltip.style("opacity", "0")            
            })
   
      
      svg.append('path')
            .datum(topojson.mesh(dataGeo, dataGeo.objects.states, function (a, b) {
               return a !== b;
            })
            )
            .attr('class', 'states')
            .attr('d', path)
            .attr("fill", "none");
      
})
