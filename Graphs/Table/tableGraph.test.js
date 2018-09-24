import React from 'react';
import { mount } from 'enzyme';

import { getDataAndConfig, getHtml, numberRows, checkSingleRowData, totalColumn } from '../testHelper';
import Table from '.';

const cheerio = require('cheerio');

describe("Table", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('Table');
    });

    describe("hidePagination", () => {
        let hidePagination, $;
        beforeAll(async () => {
            hidePagination = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.hidePagination}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(hidePagination, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = hidePagination.root.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("Row Data", () => {
            const value = checkSingleRowData($);
            expect(value).toBeDefined();
        });

        it("Total Rows", () => {
            const noOfRows = numberRows($);
            expect(noOfRows).toBe(3);
        });
    });

    describe("hideSearchBar", () => {
        let hideSearchBar, $;
        beforeAll(async () => {
            hideSearchBar = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.hideSearchBar}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(hideSearchBar, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = hideSearchBar.root.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("Row Data", () => {
            const value = checkSingleRowData($);
            expect(value).toBeDefined();
        });

        it("Total Rows", () => {
            const noOfRows = numberRows($);
            expect(noOfRows).toBe(3);
        });
    });

    describe("selectAll", () => {
        let selectAll, $;
        beforeAll(async () => {
            selectAll = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.selectAll}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(selectAll, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = selectAll.root.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            columns.unshift("");
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("Row Data", () => {
            const value = checkSingleRowData($);
            expect(value).toBeDefined();
        });

        it("Total Rows", () => {
            const noOfRows = numberRows($);
            expect(noOfRows).toBe(3);
        });
    });

    describe("highlightColumn", () => {
        let highlightColumn, $;
        beforeAll(async () => {
            highlightColumn = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.highlightColumn}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(highlightColumn, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = highlightColumn.root.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("Row Data", () => {
            const value = checkSingleRowData($);
            expect(value).toBeDefined();
        });

        it("Total Rows", () => {
            const noOfRows = numberRows($);
            expect(noOfRows).toBe(3);
        });
    });
});
