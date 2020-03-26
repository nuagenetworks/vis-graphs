import React from 'react';
import { configure, mount } from 'enzyme';

import { getDataAndConfig } from '../testHelper';
import Heatmap from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio');

configure({ adapter: new Adapter() });

describe('Heatmap', () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('Heatmap');
        window.SVGElement.prototype.getBBox = () => ({
            x: 0,
            y: 0,
        });
    });

    describe('Graph Test cases', () => {
        let graph, heatmapGraph, $;
        beforeAll(async () => {
            graph = await mount(
                <Heatmap
                    width={500}
                    height={500}
                    configuration={config.configuration}
                    data={config.data}>
                </Heatmap>
            );
            heatmapGraph = graph.html();
            $ = cheerio.load(heatmapGraph);
        });

        it('SVG Dimensions', () => {
            const width = parseInt($('.graphContainer').find('svg').attr('width'));
            expect(width).toBe(500);
        });

        it("Total Heatmap Block", () => {
            const rect = $('.heatmap').find('g').length;
            expect(rect).toBe(28)
        });

        it("Heatmap First Block Configuration", () => {
            const rect = $('.heatmap').children().first().has('rect');
            expect(rect).toBeTruthy();
        });

        it("Heatmap Null Block Color", () => {
            const rect = $('.heatmap').find('g rect').first();
            expect(rect.attr('style')).toEqual(
                "stroke: grey; stroke-width: 0.5px; fill: #f2f2f2; opacity: 1;"
            );
        });

        it("Heatmap Last Block Configuration", () => {
            const rect = $('.heatmap').children().last().has('rect');
            expect(rect).toBeTruthy();
        });

        it("Heatmap Colored Block Color", () => {
            const rect = $('.heatmap').find('g rect').last();
            expect(rect.attr('style')).toEqual(
                "stroke: grey; stroke-width: 0.5px; fill: #f2f2f2; opacity: 1;"
            );
        });

        it("xAxis Ticks Length", () => {
            const xAxisTicks = $('.graph-container').find('.xAxis').find('g').length;
            expect(xAxisTicks).toBe(7);
        });

        it("yAxis Ticks Length", () => {
            const yAxisTicks = $('.graph-container').find('.yAxis').find('g').length;
            expect(yAxisTicks).toBe(4);
        });

        it("Height and Width of Brush Selected Area", () => {
            const height = $('.brush').length;
            expect(height).toEqual(1);
        });

        it("Legends", () => {
            const legend = $('.legend').children().length;
            expect(legend).toEqual(2);
        });
    });

});