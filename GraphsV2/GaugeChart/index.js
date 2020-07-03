import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { Cell, PieChart, Pie } from 'recharts';
import { styled } from '@material-ui/core/styles';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import config from './default.config';
import colorConvert from 'color-convert';

const LabelHeight = 10;


const renderNeedle = ({ cx, cy, outerRadius, chartValue }) => {
    const x1 = cx,
        y1 = cy - 2.5,
        x2 = cx,
        y2 = cy + 2.5,
        x3 = cx + outerRadius * 0.95,
        y3 = cy;

    const needleAngle = parseInt((180 + chartValue * 1.8));
    
    return (<g id="needle">
        <polygon
            points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
            stroke="#666"
            fill="#666"
            transform={`rotate(${needleAngle} ${cx} ${cy})`}
        />
        <circle
            stroke="#666"
            fill="none"
            cx={cx}
            cy={cy}
            r="2"
            stroke="#666"
        />
    </g>);
}

let chartData = [];
let gaugeTickValue = 0;
let sumValues = [];
let arrowData = [];
let pieProps = {};
let pieRadius = {};

const Label = styled('div')({
    fontSize: '1em',
    margin: '10px 0 0 10px',
    height: '10px',
});

const GaugeChart = (props) => {

    const {
        data: originalData,
        width,
        height,
        properties,
    } = props;

    const {
        minValue,
        maxValue,
        gaugeTicks,
        fontSize,
    } = properties;

    const chartValue = originalData[0].value;

    React.useEffect(() => {
        chartData = [];
        
        gaugeTickValue = parseInt(parseInt(maxValue) / parseInt(gaugeTicks));

        for (let i = parseInt(minValue) + gaugeTickValue; i <= parseInt(maxValue); i += gaugeTickValue) {
            chartData.push({
                name: i,
                value: gaugeTickValue,
                label: i,
                color: ((code) => {
                    var rgb = colorConvert.hsl.rgb(code, 100, 50);
                    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                })(parseInt(maxValue) - i),
            })
        }

        sumValues = chartData
            .map(cur => cur.value)
            .reduce((a, b) => a + b);

        arrowData = [
            { value: chartValue },
            { value: 0 },
            { value: sumValues - chartValue },
        ];

        pieProps = {
            startAngle: 180,
            endAngle: 0,
            cx: width * .50,
            cy: width * .45,
        };

        pieRadius = {
            innerRadius: width * 0.25,
            outerRadius: width * 0.32,
        };

    }, [props.data, props.height, props.width]);

    return (
        <React.Fragment>
            <Label id="chart-value">
                {parseInt(chartValue)}%
            </Label>
            <PieChart width={width} height={height- 2 * LabelHeight} >
                <Pie
                    data={chartData}
                    fill="#8884d8"
                    {...pieRadius}
                    {...pieProps}
                    stroke="none"
                    className="gauge-sector-fill"
                    labelLine={false}
                >
                    {
                        chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartData[index].color} />
                        ))
                    }
                </Pie>
                <Pie
                    stroke="none"
                    activeIndex={1}
                    activeShape={(props) => (renderNeedle({ ...props, width, fontSize, chartValue}))}
                    data={arrowData}
                    outerRadius={pieRadius.innerRadius}
                    fill="none"
                    {...pieProps}
                    label
                />
            </PieChart>
        </React.Fragment>
    );
};

GaugeChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(GaugeChart);
