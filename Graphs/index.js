import SimpleTextGraph from "./SimpleTextGraph"
import VariationTextGraph from "./VariationTextGraph"
import BarGraph from "./DynamicBarGraph"
import LineGraph from "./LineGraph"
import MultiLineGraph from "./LineGraph"
import PieGraph from "./PieGraph"
import ChordGraph from "./ChordGraph"
import GaugeGraph from "./GaugeGraph"
import HeatmapGraph from "./HeatmapGraph"
import AreaGraph from "./AreaGraph"
import DynamicBarGraph from "./DynamicBarGraph"
import Table from "./Table"
import GeoMap from "./GeoMap"
import MultiColumnStatusTextGraph from './MultiColumnStatusTextGraph'
import TreeGraph from './TreeGraph'

import { theme } from "../theme"

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
