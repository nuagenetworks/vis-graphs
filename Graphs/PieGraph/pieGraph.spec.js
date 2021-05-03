import React from 'react';
import { configure } from 'enzyme';
import ReactDOM from 'react-dom';

import { getDataAndConfig } from '../testHelper';
import PieGraph from '.';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const cheerio = require('cheerio');

describe('PieGrpah', () => {
    let config;
    
    beforeAll(async () => {
        config = await getDataAndConfig('PieGraph');
    });

    describe('Percentage', () => {
        const element = document.createElement('div');
        let $;
        beforeAll((done) => {
            ReactDOM.render(
                <PieGraph
                    width={500}
                    height={500}
                    configuration={config.percentage}
                    data={config.data}
                />,
                element
            );

            setTimeout(() => {
                done();
                $ = cheerio.load(element.innerHTML);
            }, 300);
        });

        it('SVG Dimensions', () => {
            const height = $('svg').attr('height');
            const width = $('svg').attr('width');
            expect(height).toEqual('500');
            expect(width).toEqual('500');
        });

        it('Total PieGrpah', () => {
            const noOfGraphs = $('.recharts-wrapper').children().length;
            expect(noOfGraphs).toBe(3)
        });

        it('Number of Legends', () => {
            const legend = $('.recharts-legend-wrapper').children().length;
            expect(legend).toBe(3);
        });

        it('Legends Label', () => {
            const legend = $('.recharts-legend-wrapper').find('div').find('div').first().text();
            expect(legend).toEqual('3 Consectetur leo');
        });

        afterAll(() => {
            document.body.removeChild(element);
        });
    });


    describe('Standard', () => {
        const element = document.createElement('div');
        let $;
        beforeAll((done) => {
            ReactDOM.render(
                <PieGraph
                    width={500}
                    height={500}
                    configuration={config.standard}
                    data={config.data}
                />,
                element
            );

            setTimeout(() => {
                done();
                $ = cheerio.load(element.innerHTML);
            }, 300);
        });

        it('SVG Dimensions', () => {
            const height = $('svg').attr('height');
            const width = $('svg').attr('width');
            expect(height).toEqual('500');
            expect(width).toEqual('500');
        });

        it('Total PieGrpah', () => {
            const noOfGraphs = $('.recharts-wrapper').children().length;
            expect(noOfGraphs).toBe(3)
        });

        it('Number of Legends', () => {
            const legend = $('.recharts-legend-wrapper').children().length;
            expect(legend).toBe(3);
        });

        it('Legends Label', () => {
            const legend = $('.recharts-legend-wrapper').find('div').find('div').first().text();
            expect(legend).toEqual('3 Consectetur leo');
        });

        afterAll(() => {
            document.body.removeChild(element);
        });

    });
});
