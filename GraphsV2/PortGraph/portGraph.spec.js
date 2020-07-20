import React from 'react';
import { mount, configure } from 'enzyme';

import { getDataAndConfig } from '../testHelper';
import PortGraph from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio')

configure({ adapter: new Adapter() });

describe('PortGraph', () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('PortGraph');
        window.SVGElement.prototype.getBBox = () => ({
            x: 0,
            y: 0,
        });
    });

    describe('Graph', () => {
        let graph, portGraph, $;
        beforeAll(async () => {
            graph = await mount(
                <PortGraph
                    width={500}
                    height={500}
                    configuration={config.configurations}
                    data={config.data}>
                </PortGraph>
            );
            portGraph = graph.html();
            $ = cheerio.load(portGraph);
        });

        it('Port Count', () => {
            const ports = $('.PortGraph').children().length;
            expect(ports).toBe(3)
        });

        it('Port Text', () => {
            const value = $('div').last().text();
            expect(value).toBe('Wifi');
        });

        it('Legend count check', ()=> {
            const legend = $('.legend').children().length;
            expect(legend).toBe(1);
        });

        it('Legend Label', ()=> {
            const label = $('.legend').children().first().text();
            expect(label).toBe('Port Not Configured');
        });
    });

    afterAll(() => {
        delete window.SVGElement.prototype.getBBox;
    });

});
