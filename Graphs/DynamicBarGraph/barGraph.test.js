import React from 'react';
import { mount, configure } from 'enzyme';
import ReactDOM from 'react-dom';

import { checkTicks, getDataAndConfig, getHtml, checkSvg, checkBar } from '../testHelper';
import BarGraph from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio');

configure({ adapter: new Adapter() });

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
                expect(yAxisTicks).toBe(5);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalNumber, '.graph-bars');
                const firstBar = checkBar($, 'first');
                const bar = {
                    "height": 96.73247264950544,
                    "width": 66.39344262295081,
                    "x": 81.14754098360653,
                    "y": 355.26752735049456
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalNumber, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 91.89560717375639,
                    "width": 66.39344262295081,
                    "x": 154.91803278688522,
                    "y": 360.1043928262436
                }
                expect(secondBar).toEqual(bar);
            });

            it("Legends", () => {
                $ = getHtml(verticalNumber, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(0);
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
                expect(noOfBars).toBe(6);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(verticalPercentage, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(6);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(verticalPercentage, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(5);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalPercentage, '.graph-bars');
                const firstBar = checkBar($, 'second');
                const bar = {
                    "height": 91.89560717375639,
                    "width": 66.39344262295081,
                    "x": 154.91803278688522,
                    "y": 360.1043928262436
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalPercentage, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 91.89560717375639,
                    "width": 66.39344262295081,
                    "x": 154.91803278688522,
                    "y": 360.1043928262436
                }
                expect(secondBar).toEqual(bar);
            });

            it("Legends", () => {
                $ = getHtml(verticalPercentage, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(0);
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
                expect(noOfBars).toBe(7);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(verticalWithoutBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(7);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(verticalWithoutBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(5);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalWithoutBrush, '.graph-bars');
                const firstBar = checkBar($, 'first');
                const bar = {
                    "height": 96.73247264950544,
                    "width": 57.04225352112676,
                    "x": 69.71830985915491,
                    "y": 355.26752735049456
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalWithoutBrush, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 91.89560717375639,
                    "width": 57.04225352112676,
                    "x": 133.09859154929575,
                    "y": 360.1043928262436
                }
                expect(secondBar).toEqual(bar);
            });

            it("Legends", () => {
                $ = getHtml(verticalWithoutBrush, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(0);
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
                expect(noOfBars).toBe(7);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(verticalStacked, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(7);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(verticalStacked, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(5);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalStacked, '.graph-bars');
                const firstBar = checkBar($, 'first');
                const bar = {
                    "height": 96.73247264950544,
                    "width": 57.04225352112676,
                    "x": 69.71830985915491,
                    "y": 355.26752735049456
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalStacked, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 91.89560717375639,
                    "width": 57.04225352112676,
                    "x": 133.09859154929575,
                    "y": 360.1043928262436
                }
                expect(secondBar).toEqual(bar);
            });

            it("Stacked Graph", () => {
                $ = getHtml(verticalStacked, '.graph-bars');
                const stacked = $('.graph-bars').children().first().find('rect').length;
                expect(stacked).toBe(3);
            });

            it("Legends", () => {
                $ = getHtml(verticalStacked, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(0);
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
                expect(yAxisTicks).toBe(5);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalBrush, '.graph-bars');
                const firstBar = checkBar($, 'first');
                const bar = {
                    "height": 72.54935448712911,
                    "width": 177.9344262295082,
                    "x": 217.47540983606555,
                    "y": 266.4506455128709
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(verticalBrush, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 68.92170538031729,
                    "width": 177.9344262295082,
                    "x": 415.18032786885243,
                    "y": 270.0782946196827
                }
                expect(secondBar).toEqual(bar);
            });
            it("Total Bars in Brush", () => {
                $ = getHtml(verticalBrush, '.min-graph-bars');
                const noOfBars = $('.min-graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("Height and Width of Brush Selected Area", () => {
                $ = cheerio.load(verticalBrush.find('.brush').html());
                const height = parseFloat($('.brush').find('.selection').attr('height'));
                const width = parseFloat($('.brush').find('.selection').attr('width'));
                expect(height).toEqual(83);
                expect(width).toBeCloseTo(134);
            });

            it("Legends", () => {
                $ = getHtml(verticalBrush, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(12);
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
                expect(xAxisTicks).toBe(5);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalNumber, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalNumber, '.graph-bars');
                const firstBar = checkBar($, 'first');
                const bar = {
                    "height": 66.68852459016392,
                    "width": 92.45227474466006,
                    "x": 0,
                    "y": 81.50819672131148
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalNumber, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 66.68852459016392,
                    "width": 87.82942986518307,
                    "x": 0,
                    "y": 155.60655737704917
                }
                expect(secondBar).toEqual(bar);
            });

            it("Legends", () => {
                $ = getHtml(horizontalNumber, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(0);
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
                expect(noOfBars).toBe(6);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(horizontalPercentage, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(5);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalPercentage, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalPercentage, '.graph-bars');
                const firstBar = checkBar($, 'first');
                const bar = {
                    "height": 66.68852459016392,
                    "width": 95.02039348756728,
                    "x": 0,
                    "y": 81.50819672131148
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalPercentage, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 66.68852459016392,
                    "width": 90.26913625032705,
                    "x": 0,
                    "y": 155.60655737704917
                }
                expect(secondBar).toEqual(bar);
            });

            it("Legends", () => {
                $ = getHtml(horizontalPercentage, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(0);
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
                expect(noOfBars).toBe(7);
            });

            it("xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(horizontalWithoutBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(5);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalWithoutBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(7);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalWithoutBrush, '.graph-bars');
                const firstBar = checkBar($, 'first');
                const bar = {
                    "height": 57.29577464788732,
                    "width": 95.02039348756728,
                    "x": 0,
                    "y": 70.02816901408451
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalWithoutBrush, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 57.29577464788732,
                    "width": 90.26913625032705,
                    "x": 0,
                    "y": 133.6901408450704
                }
                expect(secondBar).toEqual(bar);
            });

            it("Legends", () => {
                $ = getHtml(horizontalWithoutBrush, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(0);
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
                const $ = cheerio.load(horizontalStacked.find('.graph-bars').html());
            });

            it("SVG Dimensions", () => {
                const result = checkSvg(horizontalStacked);
                expect(result).toBeTruthy();
            });

            it("Number of Bars", () => {
                $ = getHtml(horizontalStacked, '.graph-bars');
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(7);
            });

            it(" xAxis Ticks Length", () => {
                const xAxisTicks = checkTicks(horizontalStacked, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(5);
            });

            it(" yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalStacked, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(7);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalStacked, '.graph-bars');
                const firstBar = checkBar($, 'first');
                const bar = {
                    "height": 57.29577464788732,
                    "width": 95.02039348756728,
                    "x": 0,
                    "y": 70.02816901408451
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalStacked, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 57.29577464788732,
                    "width": 90.26913625032705,
                    "x": 0,
                    "y": 133.6901408450704
                }
                expect(secondBar).toEqual(bar);
            });

            it("Stacked Graph", () => {
                $ = getHtml(horizontalStacked, '.graph-bars');
                const stacked = $('.graph-bars').children().first().find('rect').length;
                expect(stacked).toBe(3);
            });

            it("Legends", () => {
                $ = getHtml(horizontalStacked, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(0);
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
                expect(xAxisTicks).toBe(10);
            });

            it("yAxis Ticks Length", () => {
                const yAxisTicks = checkTicks(horizontalBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("First Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalBrush, '.graph-bars');
                const firstBar = checkBar($, 'first');
                const bar = {
                    "height": 188.55737704918033,
                    "width": 76.01631479005383,
                    "x": 0,
                    "y": 230.45901639344262
                }
                expect(firstBar).toEqual(bar);
            });

            it("Second Bar Dimensions Height, Width and Positions", () => {
                $ = getHtml(horizontalBrush, '.graph-bars');
                const secondBar = checkBar($, 'second');
                const bar = {
                    "height": 188.55737704918033,
                    "width": 72.21530900026164,
                    "x": 0,
                    "y": 439.9672131147541
                }
                expect(secondBar).toEqual(bar);
            });

            it("Total Bars in Brush", () => {
                $ = getHtml(horizontalBrush, '.min-graph-bars');
                const noOfBars = $('.min-graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("Height and Width of Brush Selected Area", () => {
                $ = getHtml(horizontalBrush, '.brush');
                const height = parseFloat($('.brush').find('.selection').attr('height'));
                const width = parseFloat($('.brush').find('.selection').attr('width'));
                expect(height).toEqual(142);
                expect(width).toBeCloseTo(68.80);
            });

            it("Legends", () => {
                $ = getHtml(horizontalBrush, '.legend');
                const legend = $('.legend').children().length;
                expect(legend).toEqual(12);
            });
        });

        describe("Click Event", () => {
            let barGraph;
            const mockCallBack = jest.fn();
            const element = document.createElement("div");
            beforeAll((done) => {
                document.body.appendChild(element);
                barGraph = ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalNumber}
                        data={config.data}
                        onMarkClick={mockCallBack}
                    />,
                    element
                )
                setTimeout(() => {
                    done();
                }, 1000);
            });

            afterAll(() => {
                document.body.removeChild(element);
            });

            it("Click On Bar", () => {
                element.querySelector('rect').click();
                expect(mockCallBack).toHaveBeenCalled();
            });
        });
    });
});
