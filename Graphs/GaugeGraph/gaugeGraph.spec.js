import React from 'react';
import ReactDom from 'react-dom';

import { getDataAndConfig, mockUseEffect, clearAllMocks, createElement, appendChildToElement, removeElement } from '../testHelper';

import GaugeGraph from '.';

const cheerio = require('cheerio');

describe('GaugeGraph', () => {
    let config;

    beforeAll(async () => {
      config = await getDataAndConfig('GaugeGraph');
    });
    
    describe('Initial Configurations', () => {
      let guageGraph, $;
  
      const element = createElement();
      
      beforeAll((done) => {
        mockUseEffect();
        appendChildToElement(element);
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
        removeElement(element);
        clearAllMocks();
      });
  
      it("SVG Dimensions", () => {
        const height = $('svg').attr('height');
        const width = $('svg').attr('width');
        expect(height).toEqual("480");
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
        expect(needle).toEqual("255,277.5 255,282.5 397.5,280");
      });

      it('Gauge Needle Transform', () => {
        const needle = $('svg').find('#needle').find('polygon').attr('transform');
        expect(needle).toEqual("rotate(275 255 280)");
      })

    });
});
