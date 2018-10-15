function buildMetadata(sample) {

    var url = `/metadata/${sample}`
  
    console.log("---- buildMetadata initiated ----")
  
    // Use `d3.json` to fetch the metadata for a sample
    d3.json(url).then(function(response) {
     
      // Use d3 to select the panel with id of `#sample-metadata`
      var meta_data = d3.select("#sample-metadata");
  
      // Use `.html("") to clear any existing metadata
      meta_data.html("");
  
      // Use `Object.entries` to add each key and value pair to the panel
      Object.entries(response[0]).forEach(([key, value]) => {
        var cell = meta_data.append("h6");
        cell.text(`${key}: ${value}`);
      });
  
    });
  }
  
  function buildGauge(sample) {
    
    var url = `/wfreq/${sample}`
  
    console.log("---- buildGuage initiated ----")
  
    // Build a Guage Chart using the sample data
    d3.json(url).then(function(response) {
  
      var s_gauge = response[0].wfreq;
  
      console.log(s_gauge);
  
      // convert wash frequency to degrees    
      var level = s_gauge * 20;
  
      // Trig to calc meter point
      var degrees = 180 - level,
          radius = .5;
      var radians = degrees * Math.PI / 180;
      var x = radius * Math.cos(radians);
      var y = radius * Math.sin(radians);
  
      // Path: may have to change to create a better triangle
      var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
          pathX = String(x),
          space = ' ',
          pathY = String(y),
          pathEnd = ' Z';
      var path = mainPath.concat(pathX,space,pathY,pathEnd);
  
      var data = [{ type: 'scatter',
        x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'wfreq',
        text: level,
        hoverinfo: 'text+name'},
      { values: [10/9, 10/9, 10/9, 10/9, 10/9, 10/9, 10/9, 10/9, 10/9, 10],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6',
                '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(32, 208, 5, .5)', 'rgba(35, 234, 4, .5)',
                              'rgba(59, 250, 30, .5)', 'rgba(86, 250, 61, .5)',
                              'rgba(115, 250, 95, .5)', 'rgba(146, 250, 130, .5)',
                              'rgba(168, 250, 155, .5)', 'rgba(194, 250, 185, .5)',
                              'rgba(216, 250, 210, .5)', 'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '0-30', '3-4', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
      }];
  
      var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: '<b>Belly Button Wash Frequency</b> <br> Washes per Week',
      xaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]}
      };
  
      Plotly.newPlot('gauge', data, layout);
  
  
      });
      }
  
      function buildCharts(sample) {
  
      var url = `/samples/${sample}`
  
      console.log("---- buildCharts initiated ----")
  
      // Build a Bubble Chart using the sample data
      d3.json(url).then(function(response) {
        
        var s_x = response.otu_ids
        var s_y = response.sample_values
        var s_text = response.otu_labels
        
        var trace = {
          x: s_x,
          y: s_y,
          mode: 'markers',
          marker: {
            size: s_y,
            color: s_x,
          },
          text: s_text,
        };
  
        var data = [trace];
  
        var layout = {
          title: '<b>Sample Sizes</b>',
          showlegend: false,
          // height: 600,
          // width: 600
        };
  
        Plotly.newPlot('bubble', data, layout);
  
    });
    
    // Build a Pie Chart for the top 10 sample types
    d3.json(url).then(function(response) {
      
      var s_labels = response.otu_ids.slice(0,10);
      var s_values = response.sample_values.slice(0,10);
      var s_hover = response.otu_labels.slice(0,10);
      
      var trace1 = {
          labels: s_labels,
          values: s_values,
          hovertext: s_hover,
          hoverinfo: 'hovertext',
          type: 'pie'
        };
  
      var data1 = [trace1];
  
      var layout1 = {
            title: "<b>Top 10 Samples</b>",
          };
  
      Plotly.newPlot("pie", data1, layout1);
  
    });
  }
  
  function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
  
    // Use the list of sample names to populate the select options
    d3.json("/names").then((sampleNames) => {
      sampleNames.forEach((sample) => {
        selector
          .append("option")
          .text(sample)
          .property("value", sample);
      });
  
      // Use the first sample from the list to build the initial plots
      const firstSample = sampleNames[0];
      buildCharts(firstSample);
      buildGauge(firstSample);
      buildMetadata(firstSample);
    });
  }
  
  function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildGauge(newSample);
    buildMetadata(newSample);
  }
  
  // Initialize the dashboard
  init();