import React from 'react';
import { mount } from 'enzyme';

import { checkTicks, getDataAndConfig } from '../testHelper';
import BarGraph from '.';

const cheerio = require('cheerio');

describe("Bar Graph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('DynamicBarGraph');
    });

    describe("Vertical Bar", () => {

        describe("Numbered", () => {

            let verticalNumber;
            
            beforeAll(async (done) => {
                verticalNumber = await mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalNumber}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    verticalNumber.update(); 
                    done(); 
                }, 350); 

            });
           
            it("Test svg", () => {
                const svg = verticalNumber.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Total Bars", () => {
                const graphBar = verticalNumber.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(verticalNumber, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(6);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(verticalNumber, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = verticalNumber.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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

        describe("Percentage", () => {
            let verticalPercentage;
            beforeAll(async (done) => {
                verticalPercentage = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalPercentage}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    verticalPercentage.update(); 
                    done(); 
                }, 350); 
            });

            it("Test svg", () => {
                const svg = verticalPercentage.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Number of Bars", () => {
                const graphBar = verticalPercentage.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(verticalPercentage, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(10);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(verticalPercentage, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(5);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = verticalPercentage.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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

        describe("WithoutBush", () => {
            let verticalWithoutBrush;
            beforeAll(async (done) => {
                verticalWithoutBrush = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalWithoutBrush}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    verticalWithoutBrush.update(); 
                    done(); 
                }, 350); 
            });

            it("Test svg", () => {
                const svg = verticalWithoutBrush.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Number of Bars", () => {
                const graphBar = verticalWithoutBrush.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(verticalWithoutBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(10);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(verticalWithoutBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(5);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = verticalWithoutBrush.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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

        describe("Stacked", () => {
            let verticalStacked;
            beforeAll(async (done) => {
                verticalStacked = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalStacked}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    verticalStacked.update(); 
                    done(); 
                }, 350); 
            });

            it("Test svg", () => {
                const svg = verticalStacked.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Number of Bars", () => {
                const graphBar = verticalStacked.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(verticalStacked, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(10);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(verticalStacked, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(5);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = verticalStacked.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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

        describe("WithBrush", () => {
            let verticalBrush;
            beforeAll(async (done) => {
                verticalBrush = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.verticalBrush}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    verticalBrush.update(); 
                    done(); 
                }, 350); 
            });

            it("Test svg", () => {
                const svg = verticalBrush.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Number of Bars", () => {
                const graphBar = verticalBrush.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(verticalBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(6);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(verticalBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = verticalBrush.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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

        describe("Numbered", () => {
            let horizontalNumber;
            beforeAll(async (done) => {
                horizontalNumber = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalNumber}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    horizontalNumber.update(); 
                    done(); 
                }, 350); 
            });

            it("Test svg", () => {
                const svg = horizontalNumber.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Number of Bars", () => {
                const graphBar = horizontalNumber.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(horizontalNumber, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(6);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(horizontalNumber, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = horizontalNumber.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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

        describe("Percentage", () => {
            let horizontalPercentage;
            beforeAll(async (done) => {
                horizontalPercentage = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalPercentage}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    horizontalPercentage.update(); 
                    done(); 
                }, 350); 
            });

            it("Test svg", () => {
                const svg = horizontalPercentage.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Number of Bars", () => {
                const graphBar = horizontalPercentage.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(horizontalPercentage, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(5);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(horizontalPercentage, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(10);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = horizontalPercentage.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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

        describe("WithoutBrush", () => {
            let horizontalWithoutBrush;
            beforeAll(async (done) => {
                horizontalWithoutBrush = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalWithoutBrush}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    horizontalWithoutBrush.update(); 
                    done(); 
                }, 350); 
            });

            it("Test svg", () => {
                const svg = horizontalWithoutBrush.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Number of Bars", () => {
                const graphBar = horizontalWithoutBrush.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(horizontalWithoutBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(5);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(horizontalWithoutBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(10);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = horizontalWithoutBrush.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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

        describe("Stacked", () => {
            let horizontalStacked;
            beforeAll(async (done) => {
                horizontalStacked = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalStacked}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    horizontalStacked.update(); 
                    done(); 
                }, 350); 
            });

            it("Test svg", () => {
                const svg = horizontalStacked.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Number of Bars", () => {
                const graphBar = horizontalStacked.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(10);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(horizontalStacked, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(5);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(horizontalStacked, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(10);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = horizontalStacked.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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

        describe("WithBrush", () => {
            let horizontalBrush;
            beforeAll(async (done) => {
                horizontalBrush = mount(
                    <BarGraph
                        width={500}
                        height={500}
                        configuration={config.horizontalBrush}
                        data={config.data}>
                    </BarGraph>
                );
                setTimeout(() => { 
                    horizontalBrush.update(); 
                    done(); 
                }, 350); 
            });

            it("Test svg", () => {
                const svg = horizontalBrush.find('svg').html();
                const $ = cheerio.load(svg);
                const svgHeight = $('svg').attr('height');
                const svgWidth = $('svg').attr('width');
                expect(svgHeight).toEqual("500");
                expect(svgWidth).toEqual("500");
            });

            it("Number of Bars", () => {
                const graphBar = horizontalBrush.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
                const noOfBars = $('.graph-bars').find('g').length;
                expect(noOfBars).toBe(6);
            });

            it("Check xAxis ticks", () => {
                const xAxisTicks = checkTicks(horizontalBrush, '.graph-container', '.xAxis', 'g')
                expect(xAxisTicks).toBe(6);
            });

            it("Check yAxis ticks", () => {
                const yAxisTicks = checkTicks(horizontalBrush, '.graph-container', '.yAxis', 'g')
                expect(yAxisTicks).toBe(6);
            });

            it("Checking Bars Height Width X Y", () => {
                const graphBar = horizontalBrush.find('.graph-bars').html();
                const $ = cheerio.load(graphBar);
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
