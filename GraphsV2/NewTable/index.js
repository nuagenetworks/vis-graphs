import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react'
import { Column, Table, InfiniteLoader, AutoSizer, SortIndicator } from 'react-virtualized';
import 'react-virtualized/styles.css';
import objectPath from "object-path";
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import orderBy from 'lodash/orderBy';
import uuid from 'lodash/uniqueId';
import isEqual from 'lodash/isEqual';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import { properties } from "./default.config";
import { events } from '../../utils/types';
import SearchBar from "../../SearchBar";
import { expandExpression, labelToField } from '../../utils/helpers';
import columnAccessor from "../../utils/columnAccessor";

const getGraphProperties = (props) => {
    const {
        data,
        scrollData,
        size,
    } = props;

    return {
        searchString: objectPath.has(scrollData, 'searchText') ? objectPath.get(scrollData, 'searchText') : null,
        sort: objectPath.has(scrollData, 'sort') ? objectPath.get(scrollData, 'sort') : undefined,
        size: size || data.length, expiration: objectPath.has(scrollData, 'expiration') ? objectPath.get(scrollData, 'expiration') : false,
    }
}

const getRemovedColumns = (columns, filterColumns, selectedColumns) => {
    let removedColumns = [];
    columns.forEach((d, index) => {
        if (d.displayOption) {
            if (d.display === false || !filterColumns.length || !filterColumns.find(column => d.column === column)) {
                removedColumns.push(`${index}`);
            }
        } else if (selectedColumns && selectedColumns.length) {
            if (!selectedColumns.find(column => d.label === column)) {
                removedColumns.push(`${index}`)
            }
        } else if (d.display === false) {
            removedColumns.push(`${index}`);
        }
    });
    return removedColumns;
}

const getColumnByContext = (columns, context) => {
    const filterColumns = [];
    let removedColumnsKey = '';
    columns.forEach((d) => {
        if (d.displayOption) {
            for (let key in d.displayOption) {
                if (context.hasOwnProperty(key)) {
                    removedColumnsKey = context[key];
                    const keyValue = d.displayOption[key];
                    const contextKeyValue = context[key];
                    if ((typeof keyValue === 'string' && contextKeyValue === keyValue) ||
                        (Array.isArray(keyValue) && keyValue.includes(contextKeyValue))) {
                        filterColumns.push(d.column);
                    }
                }
            }
        }
    })
    return { filterColumns, removedColumnsKey };
}

const TableGraph = (props) => {
    const {
        width,
        height,
        properties,
        data,
        context,
        scrollData,
        scroll,
        selectedColumns,
        size,
    } = props;

    const {
        multiSelectable,
    } = properties;

    const [stateSortOrder, setStateSortOrder] = useState({});
    const [rowSelected, setRowSelected] = useState([]);
    const [filterData, setFilterData] = useState(data);
    const [orignalData, setOrignalData] = useState(data);

    useEffect(() => {
        initiate(props);
    }, [props.data, props.scrollData]);

    const {
        sort,
    } = getGraphProperties(props);

    if (!isEmpty(sort) && !isEqual(stateSortOrder, sort)) {
        setStateSortOrder(sort);
    }

    const initiate = (props) => {
        const {
            matchingRowColumn,
        } = props.properties;

        const columns = getColumns(props);

        if (!columns.length) {
            return;
        }

        const filterData = [];
        const columnNameList = [];

        columns.forEach(d => {
            columnNameList.push(d.column);
        });

        props.data.forEach((d, i) => {
            const random = uuid();
            const data = {
                'row_id': random,
            };

            for (let key in columns) {
                if (columns.hasOwnProperty(key)) {
                    const columnData = { ...columns[key] };
                    delete columnData.totalCharacters;

                    const accessor = columnAccessor(columnData);
                    data[columnData.column] = accessor(d);

                    if (columnData.tooltip && !columnNameList.includes(columnData.tooltip.column)) {
                        data[columnData.tooltip.column] = columnAccessor({ column: columnData.tooltip.column })(d);
                    }

                    if (matchingRowColumn && !columnNameList.includes(matchingRowColumn)) {
                        data[matchingRowColumn] = columnAccessor({ column: matchingRowColumn })(d);
                    }
                }
            }

            filterData.push(data);
        });
        setFilterData(filterData);
        setOrignalData(filterData);
    }

    const handleScrollSorting = (sortBy, sortDirection) => {

        const sort = objectPath.has(scrollData, 'sort') ? objectPath.get(scrollData, 'sort') : undefined;
        if (sort && sort.column === sortBy.toLowerCase()) {
            sortDirection = sort.order === 'desc' ? 'asc' : 'desc';
        }

        props.updateScroll({
            sort: { column: sortBy, order: sortDirection },
            currentPage: 1,
            selectedRow: {},
            event: events.SORTING,
        });
    }

    const handleStaticSorting = (sortBy, sortDirection) => {
        const sortOrder = !isEmpty(stateSortOrder) ? stateSortOrder : {};
        if (sortOrder && sortOrder.column === sortBy) {
            sortDirection = sortOrder.order === 'desc' ? 'asc' : 'desc';
            sortOrder.order = sortDirection;
            setStateSortOrder(sortOrder);
        } else {
            sortOrder.order = sortDirection;
            sortOrder.column = sortBy;
            setStateSortOrder(sortOrder);
        }

        setFilterData(orderBy(filterData, [sortBy], [sortDirection]));
    }

    const handleSortOrderChange = ({ sortBy, sortDirection }) => {
        scroll ? handleScrollSorting(sortBy, sortDirection) : handleStaticSorting(sortBy, sortDirection)
    }

    const getColumns = () => (properties.columns || []);

    const { filterColumns } = getColumnByContext(getColumns(), context);
    const removedColumns = getRemovedColumns(getColumns(), filterColumns, selectedColumns);
    const removedColumn = objectPath.has(scrollData, `removedColumn`) ? objectPath.get(scrollData, `removedColumn`) : uniq(removedColumns);

    const getHeaderData = () => {
        const { ESColumns } = props;
        let columnKeys = new Map();

        if (ESColumns) {
            ESColumns.forEach(item => {
                columnKeys.set(item.key, true);
            });
        }

        const columns = getColumns();
        let headerData = [];
        for (let index in columns) {
            if (columns.hasOwnProperty(index)) {
                const columnRow = columns[index];
                const displayColumn = removedColumn.includes(index) ? 'false' : 'true';
                const sort = !isEmpty(columnKeys) ? columnKeys.get(columnRow.column) : true;
                const headerColumn = {
                    name: index,
                    label: columnRow.label || columnRow.column,
                    columnField: columnRow.column,
                    columnText: columnRow.selection ? "" : (columnRow.label || columnRow.column),
                    filter: columnRow.filter !== false,
                    type: columnRow.selection ? "selection" : "text",
                    style: {
                        textIndent: '2px'
                    },
                    options: {
                        display: displayColumn,
                        sort,
                    }
                };

                headerData.push(headerColumn);
            }
        }

        return headerData;
    }

    const columns = getHeaderData().filter(d => d.options.display === 'true');

    const headerRenderer = ({ dataKey, label }) => {
        return (
            <div>
                {label}
                {stateSortOrder.column === dataKey && <SortIndicator sortDirection={stateSortOrder.order} />}
            </div>
        );
    }

    const columnsDetail = () => {
        return columns.map(column => <Column label={column.label} dataKey={(column.columnField)} cellDataGetter={({ dataKey, rowData }) => get(rowData, dataKey)} headerRenderer={headerRenderer} width={200} />);
    }

    const onScroll = ({ startIndex, stopIndex }) => {
        const page = (startIndex / 100) + 1;
        props.updateScroll({ currentPage: page, event: events.PAGING });
    }

    const onRowClick = ({ index }) => {
        let selectedRowsCurr = rowSelected;
        if (rowSelected.includes(index)) {
            selectedRowsCurr = rowSelected.filter(item => item !== index);
        } else {
            selectedRowsCurr = !!multiSelectable ? [...selectedRowsCurr, index] : [index];
        }
        setRowSelected(selectedRowsCurr);
        const rowsInStore = objectPath.has(scrollData, 'selectedRow') ? objectPath.get(scrollData, 'selectedRow') : {}
        props.updateScroll({ selectedRow: { ...rowsInStore, [props.requestId]: selectedRowsCurr } });
    }

    const rowStyleFormat = (row) => {
        if (!!rowSelected && rowSelected.includes(row.index)) {
            return {
                backgroundColor: '#b7b9bd',
                color: '#333'
            };
        }
        return {
            backgroundColor: '#fff',
            color: '#333'
        };
    }

    const handleSearch = (data, isSuccess, expression = null, searchText = null) => {
        if (isSuccess) {
            if (expression) {
                const {
                    searchString,
                } = getGraphProperties(props);

                const search = labelToField(expandExpression(expression), getColumns());
                setFilterData(data);

                if (!searchText || searchString !== searchText) {
                    props.updateScroll({ search, searchText, selectedRow: {}, currentPage: 1, event: events.SEARCH });
                }
            } else {
                setFilterData(data);
            }
        }
    }

    const renderSearchBarIfNeeded = (headerData) => {
        if (isEmpty(headerData)) {
            return;
        }

        const {
            searchString,
        } = getGraphProperties(props);

        const {
            searchBar,
            searchText,
            autoSearch,
            disableRefresh,
            selectColumnOption,
        } = properties;

        const {
            width,
            scroll,
        } = props;

        if (searchBar === false) {
            return;
        }

        const search = searchString !== null ? searchString : searchText,
            filteroption = headerData.filter(d => d.options.display === 'true');
        return ((filteroption.length || (data.length === 0)) &&
            <SearchBar
                data={orignalData}
                searchText={search}
                options={filteroption}
                handleSearch={handleSearch}
                scroll={props.scroll}
                autoSearch={autoSearch}
                columnOption={selectColumnOption}
                enableRefresh={!disableRefresh && scroll}
                cardWidth={width}
            />
        );
    }

    return (
        <div style={{ clear: "both" }}>
            {renderSearchBarIfNeeded(getHeaderData())}
            <div style={{ overflowX: "auto" }}>
                <div style={{ height: height, minWidth: width }}>
                    <InfiniteLoader
                        isRowLoaded={({ index }) => !!filterData[index]}
                        loadMoreRows={onScroll}
                        rowCount={size}
                    >
                        {({ onRowsRendered, registerChild }) => (
                            <AutoSizer>
                                {({ height, width }) => {
                                    return (
                                        <Table
                                            ref={registerChild}
                                            onRowsRendered={onRowsRendered}
                                            width={width + (columns.length * 80)}
                                            height={height}
                                            headerHeight={50}
                                            rowHeight={30}
                                            rowCount={filterData.length}
                                            rowGetter={({ index }) => filterData[index]}
                                            isRowLoaded={({ index }) => filterData[index]}
                                            sort={handleSortOrderChange}
                                            sortBy={stateSortOrder.column}
                                            sortDirection={stateSortOrder.order}
                                            onRowClick={onRowClick}
                                            rowStyle={rowStyleFormat}
                                        >
                                            {columnsDetail()}
                                        </Table>

                                    )
                                }}
                            </AutoSizer>
                        )}
                    </InfiniteLoader>
                </div>
            </div>
        </div>
    );
}

TableGraph.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
};

export default WithConfigHOC(properties)(TableGraph);
