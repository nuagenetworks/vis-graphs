import SimpleTextGraph from "./GraphsV2/SimpleTextGraph"
import VariationTextGraph from "./Graphs/VariationTextGraph"
import BarGraph from "./Graphs/DynamicBarGraph"
import LineGraph from "./Graphs/LineGraph"
import MultiLineGraph from "./Graphs/LineGraph"
import PieGraph from "./Graphs/PieGraph"
import ChordGraph from "./Graphs/ChordGraph"
import GaugeGraph from "./Graphs/GaugeGraph"
import HeatmapGraph from "./Graphs/HeatmapGraph"
import AreaGraph from "./Graphs/AreaGraph"
import DynamicBarGraph from "./Graphs/DynamicBarGraph"
import Table from "./Graphs/Table"
import GeoMap from "./Graphs/GeoMap"
import MultiColumnStatusTextGraph from './Graphs/MultiColumnStatusTextGraph'
import TreeGraph from './Graphs/TreeGraph'
import PortGraph from './Graphs/PortGraph'
import ProgressBarGraph from './Graphs/ProgressBarGraph'
import RechartBarGraph from './Graphs/RechartBarGraph'

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
    RechartBarGraph,
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
