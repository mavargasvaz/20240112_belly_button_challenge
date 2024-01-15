
// store source URL
let url = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';

d3.json(url).then(function(data){
    console.log(data);
    console.log(data.names)
}); 

// We use the following line to start the app
function start() {
    // Using D3 we select the dropdown
    let selector = d3.select("#selDataset");

    // Accesing the data with D3
    d3.json(url).then((data) => {
        // Assing names from the samples data to a variable
        let id_names = data.names;
        console.log(id_names);
        // Populate the dropdown with the 
        selector.selectAll("option")
            .data(id_names)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        // We use the following line to get the initial selected value from the names array
        let initial_entry = id_names[0];
        console.log(initial_entry)    
        // We call functions to build plots and display demographics for the initial selection
        fillPlots(initial_entry);
        demographics(initial_entry);
    });
}

// This is the function to handle dropdown selection changes
function optionChanged(newID){
    // Call functions to build plots and display demographics for the selected ID
    fillPlots(newID);
    demographics(newID);
}

// This is the function to build and update the plots based on the selected ID
function fillPlots(id) {
    // We do this to load data from samples.json using a Promise
    d3.json("samples.json").then(function(samplesData){
        // We filter samples based on the selected ID
        let filtered = samplesData.samples.filter(sample => sample.id == id);
        let result = filtered[0];

        // We process data to prepare for plotting
        let data_values = [];
        for (let i=0; i<result.sample_values.length; i++){
            data_values.push({
                id: `OTU ${result.otu_ids[i]}`,
                value: result.sample_values[i],
                label: result.otu_labels[i]
            });
        }

        // Top 10 values for the horizontal bar chart

        // Sorted Data
        let Sorted = data_values.sort(function compareFunction(a,b){
            return b.value - a.value;
        }).slice(0,10);
        
        // Sorted Data_Reverse
        let reversed = Sorted.sort(function compareFunction(a,b){
           return a.value - b.value;
        })
        
        // Bar Chart
        let bar_trace = {
            type: "bar",
            orientation: "h",
            x: reversed.map(row=> row.value),
            y: reversed.map(row => row.id),
            text: reversed.map(row => row.label)
        };
        let data = [bar_trace];
        let layout = {
            yaxis: {autorange: true}, 
        };
        
        // New bar chart using Plotly
        Plotly.newPlot("bar", data, layout);

        // Trace and layout for the bubble chart
        let trace1 = {
            x: result.otu_ids,
            y: result.sample_values,
            mode: "markers",
            marker: {
                size: result.sample_values,
                color: result.otu_ids,
                colorscale: "Viridis"
            },
        };
        let data1 = [trace1]
        let layout1 = {
            xaxis: {title:"OTU ID"},
            width: window.width
        };

        // We create a new bubble chart using Plotly
        Plotly.newPlot("bubble", data1, layout1);
    });
}

// This is the function to display demographics information based on the selected ID
function demographics(id) {
    // We load data from samples.json using a Promise
    d3.json("samples.json").then(function(samplesData){
        // We filter metadata based on the selected ID
        let filtered = samplesData.metadata.filter(sample => sample.id == id);

        // We select the container for demographics information
        let selection = d3.select("#sample-metadata");

        // We clear existing content
        selection.html("");
        
        // We display demographics information using h5 elements
        Object.entries(filtered[0]).forEach(([k,v]) => {
            selection.append("h5")
                .text(`${k}: ${v}`);
        });
    })
}

start();
