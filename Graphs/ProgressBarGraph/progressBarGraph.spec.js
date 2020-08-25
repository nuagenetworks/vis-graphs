import React from 'react';
import { mount, configure } from 'enzyme';

import { getDataAndConfig } from '../testHelper';
import ProgressBarGraph from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio')

configure({ adapter: new Adapter() });

describe('ProgressBarGraph', () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('ProgressBarGraph');
        window.SVGElement.prototype.getBBox = () => ({
            x: 0,
            y: 0,
        });
    });

    describe('Graph', () => {
        let graph, progressBarGraph, $;
        beforeAll(async () => {
            graph = await mount(
                <ProgressBarGraph
                    width={500}
                    height={500}
                    configuration={config.configurations}
                    data={config.data}>
                </ProgressBarGraph>
            );
            progressBarGraph = graph.html();
            $ = cheerio.load(progressBarGraph);
        });

        it('progressBar count', () => {
            const progressBars = $('.ProgressBarGraph').children().length;
            expect(progressBars).toBe(5)
        });

        it('First progressBar upper text', () => {
            const first = $('.ProgressBarGraph').children().first().children().first().text();
            expect(first).toBe(' Gold ');
        });

        it('Second progressBar upper text', () => {
            const second = $('.ProgressBarGraph').children().first().next().children().first().text();
            expect(second).toBe(' Silver ');
        });
    });

    afterAll(() => {
        delete window.SVGElement.prototype.getBBox;
    });
});
