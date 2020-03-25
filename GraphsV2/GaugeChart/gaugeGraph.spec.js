import React from 'react';
import ReactDom from 'react-dom';

import { getDataAndConfig } from '../testHelper';

import GaugeGraph from '.';

const cheerio = require('cheerio');

describe('GaugeGraph', () => {
    let config;
    let useEffect;

    const mockUseEffect = () => {
      useEffect.mockImplementationOnce(f => f());
    };
    
    beforeAll(async () => {
      config = await getDataAndConfig('GaugeChart');
    });
    
    describe('Initial Configurations', () => {
      let guageGraph, $;
  
      const element = document.createElement("div");
      
      beforeAll((done) => {
        useEffect = jest.spyOn(React, "useEffect");
        
        mockUseEffect();
        mockUseEffect();

        document.body.appendChild(element);
        guageGraph = ReactDom.render(
          <GaugeGraph
            width={500}
            height={500}
            configuration={config.configuration}
            data={config.data}
          />,
          element
        );

        setTimeout(() => {
          done();
          $ = cheerio.load(element.innerHTML);
        }, 3000);
      });
      
      afterAll(() => {
        document.body.removeChild(element);
      });
  
      it("SVG Dimensions", () => {
        const height = $('svg').attr('height');
        const width = $('svg').attr('width');
        expect(height).toEqual("500");
        expect(width).toEqual("500");
      });

      it("Gauge Label", () => {
        const label = $('#chart-value').text();
        expect(label).toEqual("53%");
      });;

      it('Total GaugeGraph', () => {
        const noOfGraphs = $('svg').find('.gauge-sector-fill').children().children().length;
        expect(noOfGraphs).toBe(10)
      });

      it('Gauge Needle path Definition', () => {
        const needle = $('svg').find('#needle').find('polygon').attr('points');
        expect(needle).toEqual("305,252.5 305,257.5 423.75,255");
      });

      it('Gauge Needle Transform', () => {
        const needle = $('svg').find('#needle').find('polygon').attr('transform');
        expect(needle).toEqual("rotate(233 305 255)");
      })

    });
});
