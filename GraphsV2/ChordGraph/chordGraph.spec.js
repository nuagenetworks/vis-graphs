import React from 'react';
import { mount, configure } from 'enzyme';

import { getHtml, getDataAndConfig, checkSvg } from '../testHelper';
import ChordGraph from '.';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

describe("ChordGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('ChordGraph');
    });

    describe("IntialConfiguration", () => {
        let chordGraph, $;
        beforeAll(async () => {
            chordGraph = mount(
                <ChordGraph
                    width={500}
                    height={500}
                    configuration={config.configuration}
                    data={config.data}>
                </ChordGraph>
            );
            $ = getHtml(chordGraph, 'svg');
        });

        it("Total ChordGraph", () => {
            const noOGraphs = $('svg').find('g').length;
            expect(noOGraphs).toBe(12)
        });

        it("ChordGraph Path Definition", () => {
            const chordGraphDefinition = $('svg').find('g').find('g').find('path').attr("d");
            expect(chordGraphDefinition).toEqual("M9.797174393178826e-15,-160A160,160,0,0,1,85.70957060124412,-135.10688179123352L69.63902611351085,-109.77434145537724A130,130,0,0,0,7.960204194457796e-15,-130Z");
        });

        it("ChordGraph Transform", () => {
            const chordGraphTransform = $('svg').find('g').find('g').find('text').attr("transform");
            expect(chordGraphTransform).toEqual("rotate(-73.8048170546621) translate(170) ");
        });
    });
});
