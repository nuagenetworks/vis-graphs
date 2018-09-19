import React from 'react';
import { mount } from 'enzyme';

import { getInnerHtml, getDataAndConfig, checkTicks } from '../testHelper';
import HeatmapGraph from '.';

const cheerio = require('cheerio');

describe("HeatmapGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('HeatmapGraph');
    });

    describe("with-brush", () => {
        let withBrush;
        beforeAll(async () => {
            withBrush = mount(
                <HeatmapGraph 
                    width={500} 
                    height={500} 
                    configuration={config.withBrush} 
                    data={config.data}> 
                </HeatmapGraph>
            );
        });

        it("SVG", () => {
            const $ = getInnerHtml(withBrush, 'svg');
            const svgHeight = $('svg').attr('height');
            const svgWidth = $('svg').attr('width');
            expect(svgHeight).toEqual("500");
            expect(svgWidth).toEqual("500");
        });

        it("Number of HeatmapGraph", () => {
            const $ = getInnerHtml(withBrush, '.heatmap');
            const newHtml = $('.heatmap').find('g').length;
            expect(newHtml).toBe(30)
        });

        it("Heatmap block configuration", () => {
            const $ = getInnerHtml(withBrush, '.heatmap');
            const newHtml = $('.heatmap').find('g rect').first();
            expect(parseInt(newHtml.attr('height'))).toBeCloseTo(214);
            expect(parseInt(newHtml.attr('width'))).toBeCloseTo(57);
        });

        it("Check xAxis ticks", () => {
            const xAxisTicks = checkTicks(withBrush, '.graph-container', '.xAxis', 'g');
            expect(xAxisTicks).toBe(6);
        });

        it("Check yAxis ticks", () => {
            const yAxisTicks = checkTicks(withBrush, '.graph-container', '.yAxis', 'g');
            expect(yAxisTicks).toBe(5);
        });

    });

    describe("withoutBrush", () => {
        let withoutBrush;
        beforeAll(async () => {
            withoutBrush = mount(<HeatmapGraph width={500} height={500} configuration={config.withoutBrush} data={config.data}> </HeatmapGraph>);
        });

        it("SVG", () => {
            const $ = getInnerHtml(withoutBrush, 'svg');
            const svgHeight = $('svg').attr('height');
            const svgWidth = $('svg').attr('width');
            expect(svgHeight).toEqual("500");
            expect(svgWidth).toEqual("500");
        });

        it("Number of HeatmapGraph", () => {
            const $ = getInnerHtml(withoutBrush, '.heatmap');
            const newHtml = $('.heatmap').find('g').length;
            expect(newHtml).toBe(30)
        });

        it("Heatmap block configuration", () => {
            const $ = getInnerHtml(withoutBrush, '.heatmap');
            const newHtml = $('.heatmap').find('g rect').first();
            expect(parseInt(newHtml.attr('height'))).toBeGreaterThan(0);
            expect(parseInt(newHtml.attr('width'))).toBeGreaterThan(0);
        });

        it("Check xAxis ticks", () => {
            const xAxisTicks = checkTicks(withoutBrush, '.graph-container', '.xAxis', 'g')
            expect(xAxisTicks).toBe(6);
        });

        it("Check yAxis ticks", () => {
            const yAxisTicks = checkTicks(withoutBrush, '.graph-container', '.yAxis', 'g')
            expect(yAxisTicks).toBe(5);
        });

    });
});