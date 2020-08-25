import React, { Children } from 'react';
import { mount, configure } from 'enzyme';
import ReactDOM from 'react-dom';

import { checkTicks, getDataAndConfig, getHtml, checkSvg, checkBar } from '../testHelper';
import BarGraph from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio');

configure({ adapter: new Adapter() });

describe('Bar Graph', () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('BarGraph');
    });

    describe('Vertical Bar', () => {
        describe('OtherOption by Number', () => {
            let $;
            const element = document.createElement('div');
            beforeAll((done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalNumber}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangle').length;
                expect(noOfBars / 2).toBe(6);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks / 2).toBe(6);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks).toBe(5);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'vertical');
                const bar = {
                    'width': 27,
                    'x': 78.41666666666667,
                }
                expect(firstBar).toEqual(bar);
            });

            it('Second Bar Dimensions Height, Width and Positions', () => {
                const secondBar = checkBar($, 'second', 'vertical');
                const bar = {
                    'width': 27,
                    'x': 112.58333333333333
                }
                expect(secondBar).toEqual(bar);
            });
        });

        describe('OtherOption by Percentage', () => {
            let $;
            const element = document.createElement('div');
            beforeAll(async (done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalPercentage}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangle').length;
                expect(noOfBars / 2).toBe(6);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks / 2).toBe(6);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks).toBe(5);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'vertical');
                const bar = {
                    'width': 27,
                    'x': 78.41666666666667,
                }
                expect(firstBar).toEqual(bar);
            });

            it('Second Bar Dimensions Height, Width and Positions', () => {
                const secondBar = checkBar($, 'second', 'vertical');
                const bar = {
                    'width': 27,
                    'x': 112.58333333333333
                }
                expect(secondBar).toEqual(bar);
            });
        });

        describe('Graph without Brush', () => {
            let $;
            const element = document.createElement('div');
            beforeAll(async (done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalWithoutBrush}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangle').length;
                expect(noOfBars / 2).toBe(6);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks / 2).toBe(6);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks).toBe(5);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'vertical');
                const bar = {
                    'width': 27,
                    'x': 78.41666666666667,
                }
                expect(firstBar).toEqual(bar);
            });

            it('Second Bar Dimensions Height, Width and Positions', () => {
                const secondBar = checkBar($, 'second', 'vertical');
                const bar = {
                    'width': 27,
                    'x': 112.58333333333333
                }
                expect(secondBar).toEqual(bar);
            });
        });

        describe('Stacked Grpah', () => {
            let $;
            const element = document.createElement('div');
            beforeAll(async (done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalStacked}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangle').children().length;
                expect(noOfBars).toBe(7);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks).toBe(7);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks).toBe(5);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'vertical');
                const bar = {
                    'width': 46,
                    'x': 80.85714285714286,
                }
                expect(firstBar).toEqual(bar);
            });

            it('Stacked Graph', () => {
                const stacked = $('.recharts-bar').length;
                expect(stacked).toBe(7);
            });
        });

        describe('Graph with Brush', () => {
            let $;
            const element = document.createElement('div');
            beforeAll(async (done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalBrush}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangle').length;
                expect(noOfBars).toBe(3);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks).toBe(3);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks).toBe(5);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'vertical');
                const bar = {
                    'width': 109,
                    'x': 88.66666666666666,
                }
                expect(firstBar).toEqual(bar);
            });

            it('Height and Width of Brush Selected Area', () => {
                const height = parseFloat($('.recharts-brush').find('rect').attr('height'));
                const width = parseFloat($('.recharts-brush').find('rect').attr('width'));
                expect(height).toEqual(20);
                expect(width).toBeCloseTo(410);
            });

            it('Number of Legends', () => {
                const legend = $('.recharts-legend-wrapper').children().first().children().length;
                expect(legend/2).toBe(6);
            });
    
            it('Legends Label', () => {
                const legend = $('.recharts-legend-wrapper').find('div').find('div').first().text();
                expect(legend).toEqual('Test1');
            });
        });
    });

    describe('Horizontal Bar', () => {
        describe('OtherOption by Number', () => {
            let $;
            const element = document.createElement('div');
            beforeAll(async (done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalNumber}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangle').length;
                expect(noOfBars/2).toBe(6);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks).toBe(5);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks/2).toBe(6);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'horizontal');
                const bar = {
                    'height': 27,
                    'y': 18.375,
                    'x': 75,
                }
                expect(firstBar).toEqual(bar);
            });
        });

        describe('OtherOption by Percentage', () => {
            let $;
            const element = document.createElement('div');
            beforeAll(async (done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalPercentage}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangle').length;
                expect(noOfBars/2).toBe(6);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks).toBe(5);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks/2).toBe(6);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'horizontal');
                const bar = {
                    'height': 27,
                    'y': 18.375,
                    'x': 75,
                }
                expect(firstBar).toEqual(bar);
            });
        });

        describe('Graph without Brush', () => {
            let $;
            const element = document.createElement('div');
            beforeAll(async (done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalWithoutBrush}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangle').length;
                expect(noOfBars/2).toBe(6);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks).toBe(5);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks/2).toBe(6);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'horizontal');
                const bar = {
                    'height': 27,
                    'y': 18.375,
                    'x': 75,
                }
                expect(firstBar).toEqual(bar);
            });
        });

        describe('Stacked Graph', () => {
            let $;
            const element = document.createElement('div');
            beforeAll(async (done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalStacked}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangles').children().length;
                expect(noOfBars).toBe(7);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks).toBe(5);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks/2).toBe(5);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'horizontal');
                const bar = {
                    'height': 32,
                    'x': 75,
                    'y': 19.05,
                }
                expect(firstBar).toEqual(bar);
            });

            it('Stacked Graph', () => {
                const stacked = $('.recharts-bar').length;
                expect(stacked).toBe(7);
            });
        });

        describe('Graph with Brush', () => {
            let $;
            const element = document.createElement('div');
            beforeAll(async (done) => {
                ReactDOM.render(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalBrush}
                        data={config.data}>
                    </BarGraph>,
                    element
                );
                /* Delayed added because bar is rendered with 300ms animation */
                setTimeout(() => {
                    done();
                    $ = cheerio.load(element.innerHTML);
                }, 350);
            });

            it('SVG Dimensions', () => {
                const height = $('svg').attr('height');
                const width = $('svg').attr('width');
                expect(height).toEqual('500');
                expect(width).toEqual('500');
            });

            it('Total Bars', () => {
                const noOfBars = $('.recharts-bar-rectangle').length;
                expect(noOfBars).toBe(3);
            });

            it('xAxis Ticks Length', () => {
                const xAxisTicks = $('.xAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(xAxisTicks).toBe(5);
            });

            it('yAxis Ticks Length', () => {
                const yAxisTicks = $('.yAxis').find('.recharts-cartesian-axis-tick-line').length;
                expect(yAxisTicks).toBe(3);
            });

            it('First Bar Dimensions Height, Width and Positions', () => {
                const firstBar = checkBar($, 'first', 'horizontal');
                const bar = {
                    "height": 102,
                    "x": 75,
                    "y": 27.833333333333336,
                }
                expect(firstBar).toEqual(bar);
            });

            it('Height and Width of Brush Selected Area', () => {
                const height = parseFloat($('.recharts-brush').find('rect').attr('height'));
                const width = parseFloat($('.recharts-brush').find('rect').attr('width'));
                expect(height).toEqual(20);
                expect(width).toBeCloseTo(410);
            });

            it('Number of Legends', () => {
                const legend = $('.recharts-legend-wrapper').children().first().children().length;
                expect(legend/2).toBe(6);
            });
    
            it('Legends Label', () => {
                const legend = $('.recharts-legend-wrapper').find('div').find('div').first().text();
                expect(legend).toEqual('20000');
            });
        });
    });
});
