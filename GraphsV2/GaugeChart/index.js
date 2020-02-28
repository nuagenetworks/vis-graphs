import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { Cell, PieChart, Pie } from 'recharts';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import config from './default.config';
import colorConvert from 'color-convert';
import { RADIAN } from '../../constants';

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, label }) => {
    const radius = outerRadius + 10;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central">
            {label}
        </text>
    );
};

const Arrow = ({ cx, cy, midAngle, outerRadius, width, fontSize, chartValue }) => {
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const mx = cx + (outerRadius + width * 0.03) * cos;
    const my = cy + (outerRadius + width * 0.03) * sin;
    return (
        <g>
            <text x={cx + 15} y={cy + 20} style={{ fontSize: fontSize }} fill="black" textAnchor={mx > cx ? 'start' : 'end'} dominantBaseline="central">
                {parseInt(chartValue)}%
          </text>
            <circle cx={cx} cy={cy} r={width * 0.05} fill="#666" stroke="none" />
            <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth="6" stroke="#666" fill="none" strokeLinecap="round" />
        </g>
    );
};

let chartData = [];
let gaugeTickValue = 0;
let sumValues = [];
let arrowData = [];
let pieProps = {};
let pieRadius = {};

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


    useEffect(() => {
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
            cx: width / 2 - 5,
            cy: width / 2 - 5,
        };

        pieRadius = {
            innerRadius: width * 0.13,
            outerRadius: width * 0.32,
        };

    }, [props.data, props.height, props.width]);

    return (
        <PieChart width={width} height={height} >
            <Pie
                data={chartData}
                fill="#8884d8"
                {...pieRadius}
                {...pieProps}
                stroke="none"
                label={renderCustomizedLabel}
                labelLine={false}
                isAnimationActive={false}
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
                activeShape={(props) => (Arrow({ ...props, width, chartValue, fontSize }))}
                data={arrowData}
                outerRadius={pieRadius.innerRadius}
                fill="none"
                {...pieProps}
                label
            />
        </PieChart>
    );
};

GaugeChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(GaugeChart);
