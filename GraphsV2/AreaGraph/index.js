import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import { config } from './default.config';
import { compose } from 'redux';
import {
    AreaChart, 
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import ValiddataHOC from '../../HOC/ValiddataHOC';
import CustomTooltip from '../utils/CustomTooltip';
import * as dataParser from '../utils/DataParser';
import GraphLegend from '../utils/Legends/';
import GraphAxis from '../utils/GraphAxis';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { 
    PERCENTAGE,
    STANDARD
} from './../../constants';

// const parseData = (props) => {
//     let {
//         data,
//         properties,
//     } = props;
//     console.error("date", data);
//     const {
//         yColumn,
//         xColumn,
//         linesColumn,
//         stacked,
//     } = properties;

//     let parseData = [];
//     let parseSequence = [];
//     let parseYColumns = [];
//     let parseYValue = "";
//     let parseYKey = ""
//     if (linesColumn) {
//         parseYKey = linesColumn
//         parseYValue = yColumn
//     }
//     if (linesColumn) {
//         let filteredData = data.filter((item) => {
//             return (item[linesColumn] && typeof item[linesColumn] !== 'object')
//         })
//         parseYColumns = [
//             ...new Set(
//                 filteredData.map(item => item[linesColumn])
//             )
//         ].map(d => ({ key: d }));
//         parseData = filteredData;
//         // this.updateTooltipConfiguration();
//     }
//     else {
//         parseYColumns = typeof yColumn === 'object' ? yColumn : [{ key: yColumn }];
//         data.forEach((d) => {
//             parseYColumns.forEach((ld, index) => {
//                 parseData.push(Object.assign({
//                     [parseYValue]: d[ld.key] !== null ? d[ld.key] : 0,
//                     [parseYKey]: ld.key,
//                 }, d));
//             })
//         })
//     }
//     // console.error("parseYColumns", parseYColumns);

//     parseSequence = nest({
//         data: parseData,
//         key: parseYKey,
//         sortColumn: parseYValue,
//         sortOrder: 'DESC'
//     }).sort((a, b) => {
//         return b.values[0][parseYValue] - a.values[0][parseYValue]
//     }).map(d => d.key);
//     // console.error("parseSequence", parseSequence);
//     let nestedXPartialData = nest({
//         data: parseData,
//         key: xColumn,
//         sortColumn: parseYKey,
//         sortOrder: 'DESC',
//         sequence: parseSequence
//     });

//     let reverseSequence = parseSequence.slice(0).reverse()
//     let sequenceLength = parseSequence.length

//     let nestedXData = nestedXPartialData.map(item => {
//         let d = Object.assign({}, item)

//         if (d.values.length === sequenceLength) {
//             return d
//         }

//         d.values = reverseSequence.map(key => {
//             let index = (d.values).findIndex(o => {
//                 return o[parseYKey] === key
//             })

//             return index !== -1
//                 ? Object.assign({}, d.values[index])
//                 : {
//                     [xColumn]: parseInt(d.key, 10),
//                     [parseYKey]: key,
//                     [parseYValue]: 0
//                 }
//         })

//         return d
//     });

//     if (stacked === false) {
//         nestedXData.forEach(data => {
//             data.values.forEach(value => {
//                 Object.assign(value, {
//                     y0: 0,
//                     y1: value[parseYValue]
//                 })
//             })
//         })

//     } else {
//         nestedXData = nestStack({
//             data: nestedXData,
//             stackColumn: parseYValue
//         })
//     }

//     let parseTooltipData = nestedXData

//     //Merging Back with y0 and y1 calculated according to xAxis and now will be used for line plotting
//     let parseRefinedData = merge({
//         data: nestedXData,
//         fields: [{ name: 'values', type: 'array' }]
//     }).values

//     let parseDataNest = nest({
//         data: parseRefinedData,
//         key: parseYKey
//     }).sort(sorter({
//         column: 'key',
//         sequence: parseSequence
//     }));
//     let finalParsedData = [];
//     parseDataNest.map((item, key) => {
//         item.values.map((data, key2) => {
//             finalParsedData.push({ ...data, [parseDataNest[key].key]: data.y1 });
//         })
//     })
//     console.error("finParsed",parseDataNest,  finalParsedData);
//     return finalParsedData;
// }

const AreaGraph = (props) => {

    const {
        properties,
        height,
        width,
        data,
    } = props;

    const {
        xLabel,
        yLabel,
        xColumn,
        yColumn,
        tooltip,
        legend,
        percentages,
        XAxisLabelConfig,
        YAxisLabelConfig,
        margin,
        xLabelRotateHeight,
        dateHistogram,
        xTickFormat,
        yTickFormat,
        linesColumn,
    } = properties;
    
    const parsedData =  dataParser.PraseData({data, key:linesColumn, xColumn, yColumn});
    console.error("parsedData", parsedData);
    const finalParsedData = parsedData.parsedData;
    console.error("finalParsedData", finalParsedData);
    const uniqueKeys = parsedData.uniqueKeys;
    const type = percentages ? PERCENTAGE : STANDARD;
    const legendHeight = (legend.separate * height) / 100;
    const colors = scaleOrdinal(schemeCategory10).range();
    return (
        <AreaChart
            width={width}
            height={height}
            data={finalParsedData}
            margin={margin}
        >
            <XAxis 
              dataKey={xColumn}
              label= {{ value: xLabel, ...XAxisLabelConfig}}
              tick= {
                  <GraphAxis 
                      rotation = {xLabelRotateHeight * -1}
                      tickFormat = {xTickFormat}
                      dateHistogram = {dateHistogram}
                      dy = "15"
                      dx = "15"
                  />
              }
              interval={0}
            />
            <YAxis
              dataKey={yColumn}
              label={{ value: yLabel, ...YAxisLabelConfig }}
              tick={
                <GraphAxis
                  tickFormat={yTickFormat}
                  dy = "5"
                />
              }
            />
            {/* {
                legend && legend.show && (
                    <Legend
                        wrapperStyle={{ overflowY: 'auto', height: legendHeight }}
                        content={(props) => (
                            <GraphLegend
                                legend={legend}
                                type={type}
                                {...props}
                            />
                        )}  
                    />
                )
            } */}
            {/* {
                tooltip && (
                    <Tooltip
                        content={<CustomTooltip tooltip={tooltip} />}
                        wrapperStyle={{ backgroundColor: "black" }}
                    />
                )
            } */}
            {
              uniqueKeys.map((areaItem, index) => {
                console.error("areaItem", areaItem, `${areaItem}X`)
                return(<Area type="monotone" dataKey={`${areaItem}Y`} stackId="1" stroke="#8884d8" fill={colors[index % 20]}/>)
              })
            }
        </AreaChart>
    );
}

AreaGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.array,
};

export default compose(
    ValiddataHOC(),
    (WithConfigHOC(config))
)(AreaGraph);