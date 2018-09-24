import React from 'react';
import { mount } from 'enzyme';

import { checkTicks, getDataAndConfig, getHtml, checkSvg } from '../testHelper';
import BarGraph from '.';

const cheerio = require('cheerio');

describe("Bar Graph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('DynamicBarGraph');
    });

    describe("Vertical Bar", () => {
        describe("OtherOption by Number", () => {
            let verticalNumber, $;
            beforeAll(async (done) => {
                verticalNumber = await mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalNumber}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    verticalNumber.update();
                    done();
                }, 350);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(verticalNumber);
                expect(result).toBeTruthy();
            });

            it("Total Bars", () => {
                $ = getHtml(verticalNumber, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(verticalNumber, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(6);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(verticalNumber, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalNumber, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(80.07);
                expect(y).toBeCloseTo(284.54);
                expect(height).toBeCloseTo(167.46);
                expect(width).toBeCloseTo(65.51);
            });
        });

        describe("OtherOption by Percentage", () => {
            let verticalPercentage, $;
            beforeAll(async (done) => {
                verticalPercentage = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalPercentage}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    verticalPercentage.update();
                    done();
                }, 350);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(verticalPercentage);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(verticalPercentage, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(verticalPercentage, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(10);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(verticalPercentage, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(5);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalPercentage, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(48.36);
                expect(y).toBeCloseTo(60.87);
                expect(height).toBeCloseTo(391.13);
                expect(width).toBeCloseTo(39.56);
            });
        });

        describe("Graph without Brush", () => {
            let verticalWithoutBrush, $;
            beforeAll(async (done) => {
                verticalWithoutBrush = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalWithoutBrush}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    verticalWithoutBrush.update();
                    done();
                }, 350);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(verticalWithoutBrush);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(verticalWithoutBrush, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(verticalWithoutBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(10);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(verticalWithoutBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(5);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalWithoutBrush, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(48.36);
                expect(y).toBeCloseTo(60.87);
                expect(height).toBeCloseTo(391.13);
                expect(width).toBeCloseTo(39.56);
            });
        });

        describe("Stacked Grpah", () => {
            let verticalStacked, $;
            beforeAll(async (done) => {
                verticalStacked = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalStacked}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    verticalStacked.update();
                    done();
                }, 350);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(verticalStacked);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(verticalStacked, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(verticalStacked, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(10);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(verticalStacked, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(5);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalStacked, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(48.36);
                expect(y).toBeCloseTo(60.87);
                expect(height).toBeCloseTo(391.13);
                expect(width).toBeCloseTo(39.56);
            });
        });

        describe("Graph with Brush", () => {
            let verticalBrush, $;
            beforeAll(async (done) => {
                verticalBrush = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalBrush}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    verticalBrush.update();
                    done();
                }, 350);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(verticalBrush);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(verticalBrush, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(verticalBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(6);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(verticalBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalBrush, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(214.23);
                expect(y).toBeCloseTo(213.40);
                expect(height).toBeCloseTo(125.60);
                expect(width).toBeCloseTo(175.28);
            });
        });
    });

    describe("Horizontal Bar", () => {
        describe("OtherOption by Number", () => {
            let horizontalNumber, $;
            beforeAll(async (done) => {
                horizontalNumber = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalNumber}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    horizontalNumber.update();
                    done();
                }, 350);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(horizontalNumber);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(horizontalNumber, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(horizontalNumber, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(6);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalNumber, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalNumber, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(0);
                expect(y).toBeCloseTo(81.51);
                expect(height).toBeCloseTo(66.69);
                expect(width).toBeCloseTo(160.05);
            });
        });

        describe("OtherOption by Percentage", () => {
            let horizontalPercentage, $;
            beforeAll(async (done) => {
                horizontalPercentage = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalPercentage}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    horizontalPercentage.update();
                    done();
                }, 350);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(horizontalPercentage);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(horizontalPercentage, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(horizontalPercentage, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(5);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalPercentage, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(10);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalPercentage, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(0);
                expect(y).toBeCloseTo(49.23);
                expect(height).toBeCloseTo(40.28);
                expect(width).toBeGreaterThan(0);
            });
        });

        describe("Graph without Brush", () => {
            let horizontalWithoutBrush, $;
            beforeAll(async (done) => {
                horizontalWithoutBrush = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalWithoutBrush}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    horizontalWithoutBrush.update();
                    done();
                }, 350);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(horizontalWithoutBrush);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(horizontalWithoutBrush, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(horizontalWithoutBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(5);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalWithoutBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(10);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalWithoutBrush, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(0);
                expect(y).toBeCloseTo(49.23);
                expect(height).toBeCloseTo(40.28);
                expect(width).toBeCloseTo(384.21);
            });
        });

        describe("Stacked Graph", () => {
            let horizontalStacked, $;
            beforeAll(async (done) => {
                horizontalStacked = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalStacked}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    horizontalStacked.update();
                    done();
                }, 350);
                const graphBar = horizontalStacked.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(horizontalStacked);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(horizontalStacked, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it(" xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(horizontalStacked, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(5);
            });

            it(" yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalStacked, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(10);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalStacked, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(0);
                expect(y).toBeCloseTo(49.23);
                expect(height).toBeCloseTo(40.28);
                expect(width).toBeCloseTo(384.21);
            });
        });

        describe("Graph with Brush", () => {
            let horizontalBrush, $;
            beforeAll(async (done) => {
                horizontalBrush = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalBrush}
                        data={config.data}>
                    </BarGraph>
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    horizontalBrush.update();
                    done();
                }, 350);
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(horizontalBrush);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(horizontalBrush, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(horizontalBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(6);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalBrush, '.graph-bars');
                const bar = $('.graph-bars').children().first().next().find('rect');
                const x = parseFloat(bar.attr('x'));
                const y = parseFloat(bar.attr('y'));
                const height = parseFloat(bar.attr('height'));
                const width = parseFloat(bar.attr('width'));
                expect(x).toBeCloseTo(240.2);
                expect(y).toBeCloseTo(197.04);
                expect(height).toBeCloseTo(115.96);
                expect(width).toBeCloseTo(196.52);
            });
        });
    });
});
