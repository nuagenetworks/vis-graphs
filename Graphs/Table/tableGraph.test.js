import React from 'react';
import { mount } from 'enzyme';

import { getDataAndConfig } from '../testHelper';
import Table from '.';

const cheerio = require('cheerio')

describe("Table", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('Table');
    });

    describe("hidePagination", () => {
        let hidePagination, table, $;
        beforeAll(async () => {
            hidePagination = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.hidePagination}
                    data={config.data}>
                </Table>
            );
            table = hidePagination.find('table').html();
            $ = cheerio.load(table);
        });

        it("Number of column", () => {
            const noOfColumns = $('table').find('thead').find('tr').children().length;
            const totalCoulmn = hidePagination.root.props().configuration.data.columns.length;
            expect(noOfColumns).toBe(totalCoulmn);
        });

        it("Check column names", () => {
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

        it("Check row", () => {
            const value = $('table tbody tr').first().find('td').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(value).toBeDefined();
        });

        it("Number of rows", () => {
            const noOfRows = $('table tbody tr').length;
            expect(noOfRows).toBe(3);
        })
    });

    describe("hideSearchBar", () => {
        let hideSearchBar, table, $;
        beforeAll(async () => {
            hideSearchBar = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.hideSearchBar}
                    data={config.data}>
                </Table>
            );
            table = hideSearchBar.find('table').html();
            $ = cheerio.load(table);
        });

        it("Number of column", () => {
            const noOfColumns = $('table').find('thead').find('tr').children().length;
            const totalCoulmn = hideSearchBar.root.props().configuration.data.columns.length;
            expect(noOfColumns).toBe(totalCoulmn);
        });

        it("Check column names", () => {
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

        it("Check row", () => {
            const value = $('table tbody tr').first().find('td').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(value).toBeDefined();
        });

        it("Number of rows", () => {
            const noOfRows = $('table tbody tr').length;
            expect(noOfRows).toBe(3);
        })
    });

    describe("selectAll", () => {
        let selectAll, table, $;
        beforeAll(async () => {
            selectAll = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.selectAll}
                    data={config.data}>
                </Table>
            );
            table = selectAll.find('table').html();
            $ = cheerio.load(table);
        });

        it("Number of column", () => {
            const noOfColumns = $('table').find('thead').find('tr').children().length;
            const totalCoulmn = selectAll.root.props().configuration.data.columns.length;
            expect(noOfColumns).toBe(totalCoulmn + 1);
        });

        it("Check column names", () => {
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

        it("Check row", () => {
            const value = $('table tbody tr').first().find('td').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(value).toBeDefined();
        });

        it("Number of rows", () => {
            const noOfRows = $('table tbody tr').length;
            expect(noOfRows).toBe(3);
        })
    });

    describe("highlightColumn", () => {
        let highlightColumn, table, $;
        beforeAll(async () => {
            highlightColumn = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.highlightColumn}
                    data={config.data}>
                </Table>
            );
            table = highlightColumn.find('table').html();
            $ = cheerio.load(table);
        });

        it("Number of column", () => {
            const noOfColumns = $('table').find('thead').find('tr').children().length;
            const totalCoulmn = highlightColumn.root.props().configuration.data.columns.length;
            expect(noOfColumns).toBe(totalCoulmn);
        });

        it("Check column names", () => {
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

        it("Check row", () => {
            const value = $('table tbody tr').first().find('td').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(value).toBeDefined();
        });

        it("number of rows", () => {
            const noOfRows = $('table tbody tr').length;
            expect(noOfRows).toBe(3);
        })
    });
});
