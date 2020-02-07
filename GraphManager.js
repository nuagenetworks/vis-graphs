import { 
    SimpleTextGraph,
    PieGraph,
    VariationTextGraph,
} from './GraphsV2';

import {
    LineGraph,
    MultiLineGraph,
    ChordGraph,
    GaugeGraph,
    HeatmapGraph,
    AreaGraph,
    DynamicBarGraph,
    Table,
    GeoMap,
    MultiColumnStatusTextGraph,
    TreeGraph,
    PortGraph,
    ProgressBarGraph,
    BarGraph,
} from './Graphs/';

/*
    Stores all graphs.
*/
let registry = {
    Table,
    SimpleTextGraph,
    BarGraph,
    LineGraph,
    MultiLineGraph,
    PieGraph,
    ChordGraph,
    GaugeGraph,
    VariationTextGraph,
    HeatmapGraph,
    AreaGraph,
    DynamicBarGraph,
    GeoMap,
    MultiColumnStatusTextGraph,
    TreeGraph,
    PortGraph,
    ProgressBarGraph,
};

/*
    Registers a new graph for a given name
*/
const register = function (graph, name) {
    registry[name] = graph;
}

// /*
//     Get the graph component registered for the given name
// */
const getGraphComponent = function (name) {
    if (!(name in registry))
        throw new Error("No graph named " + name + " has been registered yet!");

    return registry[name];
}


export const GraphManager = {
    register: register,
    getGraphComponent: getGraphComponent
}
