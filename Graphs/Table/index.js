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
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import ReactTooltip from 'react-tooltip';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FaRegClipboard } from 'react-icons/fa';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import { properties } from "./default.config";
import { events } from '../../utils/types';
import SearchBar from "../../SearchBar";
import { expandExpression, labelToField } from '../../utils/helpers';
import columnAccessor from "../../utils/columnAccessor";
import style from './style';
import { 
    FILTER_COLUMN_MAX_HEIGHT, 
    FILTER_COLUMN_WIDTH, 
    LIMIT,
    FOOTER_HEIGHT,
 } from '../../constants';

let container = '';
let selectedRows = [];
let displayColumn = [];
let unformattedData = {};
let isAllColumnSelected = false;

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
        currentPage: objectPath.has(scrollData, 'currentPage') ? objectPath.get(scrollData, 'currentPage') : 1,
    }
}

const getRemovedColumns = (columns, filterColumns, selectedColumns) => {
    let removedColumns = [];
    columns.forEach(d => {
        if (d.displayOption) {
            if (d.display === false || !filterColumns.length || !filterColumns.find(column => d.column === column)) {
                removedColumns.push(`${d.label || d.column}`);
            }
        } else if (selectedColumns && selectedColumns.length) {
            if (!selectedColumns.find(column => d.label === column)) {
                removedColumns.push(`${d.label || d.column}`)
            }
        } else if (d.display === false) {
            removedColumns.push(`${d.label || d.column}`);
        }
    });
    return removedColumns;
}

const getColumnByContext = (columns, context) => {
    const filterColumns = [];
    let removedColumnsKey = '';
    columns.forEach(d => {
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

const setSelectedRows = (props) => {
    const {
        scrollData,
        requestId,
    } = props;

    const selectedRows = objectPath.has(scrollData, 'selectedRow') ? objectPath.get(scrollData, 'selectedRow') : [];
    return !isEmpty(selectedRows) ? (selectedRows[requestId] || []) : [];
}


/**
 * get columns current displayOption type selected.:
 * - key will find the value on which table column is dependent (displayOption).
 * - default value of queryKey is ALL for the case which does not have (displayOption)
 * - find respective combination of key values in filterContext
 * @param {object} props - @param {object} context : filterContext,
 *                         @param {object} columns : tableColumn
 * @returns {string}
 *
 *  Sample inputs:
 *
        context = {
          "domainID": "dbcdeaad-d333-11eb-81b2-3503897bc1a8",
          "domainName": "vss-domain",
          "duration": "15",
          "endTime": "now",
          "enterpriseID": "b8f99841-d333-11eb-81b2-5d0ab7c08ea2",
          "enterpriseName": "vss-corp",
          "eventType": "TCA-bytes"
        }

        columns = [
            { "column": "timestamp", "label": "Timestamp", "timeFormat": "%b %d, %y %X"},
            { "column": "nuage_metadata.vportId", "label": "VPort ID", "totalCharacters": 20, "tooltip" : {"column": "nuage_metadata.vportId"}, "displayOption": {"eventType": ["ALL", "ACL_DENY", "IP_MAC_SPOOF"] } },
            { "column": "nuage_metadata.subnetName", "label": "Subnet", "displayOption": {"eventType": ["ALL", "ACL_DENY", "IP_MAC_SPOOF"] } }
        ]

    Sample output (for the above inputs):
        key = eventType
        queryKey = "TCA-bytes"

    @returns {string} "ALLTCA-bytes"
 */
const selectedContext = (props) => {
    const { context, columns } = props;
    let key = [];
    columns.forEach(column => {
        if(column.displayOption){
            key.push(...Object.keys(column.displayOption));
        }
    });
    key = uniq(key);
    let queryKey = 'ALL';
    key.forEach(element => {
        if(context && context[element]) {
            queryKey += context[element];
        }
    });
    return queryKey
}


/**
 * Modified colum data:
 * -remove subtring from data according to columnData tabify options.
 * -tabify option conatins object
 * -tabify options key represent value to remove from data
 * -tabify options value represent dynamic value (value from d) to remove from data
 * @param {string} data - current data selected column value,
 * @param {object} columnData - selected column config properties,
 * @param {object} d - current data value
 *
 *
 *  Sample inputs:
 *
        data = "[SystemID:146.31.164.73] NSG:ovs-2(SystemID:146.31.164.73) - Underlay Test returned a DEGRADED status."

        columnData = { "column": "description", "label": "Description","sort":false, "width":500, "totalCharacters": 80, "tooltip" : {"column": "description"}, "tabify": {"NSG ":"alarmedObjectID", "SystemID:":"systemID"} }

        d = {
          "ID": "a17f8ce7-d245-11ec-b639-3ba9acb97f00",
          "parentID": "199d22f0-cb0b-11ec-b639-3b97ea120875",
          "title": "Underlay Test Degraded",
          "systemID": "146.31.164.73",
          "reason": "[SystemID:146.31.164.73] NSG:ovs-2(SystemID:146.31.164.73) - Underlay Test returned a DEGRADED status.",
          "description": "[SystemID:146.31.164.73] NSG:ovs-2(SystemID:146.31.164.73) - Underlay Test returned a DEGRADED status.",
          "alarmedObjectID": "199d22f0-cb0b-11ec-b639-3b97ea120875",
          "severity": "MAJOR"
        }

    Sample new selected column data (for the above inputs):

    *   @param {string} data - "Underlay Test returned a DEGRADED status."
 */
const tabifyData = (data, columnData, d) => {
    const tabifyKeys = Object.keys(columnData.tabify);
    tabifyKeys.forEach((key) => {
        const valueToReplace = `${key}${d[columnData.tabify[key]]}`;
        if (data[columnData.column].includes(valueToReplace)) {
            const index = data[columnData.column].lastIndexOf(valueToReplace);
            data[columnData.column] = data[columnData.column]
              .substring(index)
              .replace(valueToReplace, "")
              .replace(") -", "")
              .replace("] ", "")
              .replace(/\n/, "");
        }
    });
};

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
        onSelect,
    } = props;

    const {
        multiSelectable,
        selectColumnOption,
        rowHeight,
        headerHeight,
        searchBar,
        disableRefresh,
        matchingRowColumn,
        id,
    } = properties;

    const vizID = id && id.replace(/-/g, '');
    const contextKey = vizID && Object.keys(context).filter(key => key.startsWith(vizID) && key.endsWith('size'));
    const customSize = contextKey.length && context[contextKey] !== '1000' ? context[contextKey] : size;

    const getColumns = () => (properties.columns || []);
    let graphHeight = searchBar !== false ? height - FOOTER_HEIGHT : height;

    if (selectColumnOption) {
        graphHeight -= 35;
    }

    if (scroll) {
        selectedRows = setSelectedRows(props);
        if(!isEqual(graphHeight, height)) {
            graphHeight -= 25; 
        } else {
            graphHeight -= FOOTER_HEIGHT;
        }
    }

    if(searchBar === false && (!scroll) && (!selectColumnOption)) {
        graphHeight -= 35;
    }
    const filteredColumn = selectedContext({context, columns: getColumns()})
    const { filterColumns } = getColumnByContext(getColumns(), context);
    const removedColumns = getRemovedColumns(getColumns(), filterColumns, selectedColumns);
    const removedColumn = objectPath.has(scrollData, `removedColumn.${filteredColumn}`) ? objectPath.get(scrollData, `removedColumn.${filteredColumn}`) : uniq(removedColumns);

    const [stateSortOrder, setStateSortOrder] = useState({});
    const [rowSelected, setRowSelected] = useState(selectedRows);
    const [filterData, setFilterData] = useState(data);
    const [orignalData, setOrignalData] = useState(data);
    const [startIndex, setStartIndex] = useState(0);
    const [stateColumn, setStateColumn] = useState(removedColumn);
    const [onRowOver, setOnRowOver] = useState(null);
    const [currentStartIndex, setCurrentStartIndex] = useState(0);
    const [tooltipStatus, setTooltipStatus] = useState(false);

    useEffect(() => {
        initiate(props);
    }, [props.data, props.scrollData]);

    useEffect(() => {
        return () => {
            cleanup();
        }
    }, []);

    const cleanup = () => {
        selectedRows = [];
        displayColumn = [];
    }

    const setRemovedColumn = () => {
        const {
            updateScroll,
        } = props;

        if (!isEmpty(displayColumn) || isAllColumnSelected) {
            const contextKey = selectedContext({context, columns: getColumns()});
            updateScroll({
                [`removedColumn`]: {...scrollData.removedColumn, [contextKey]: displayColumn},
                event: events.REMOVED_COLUMNS
            });
        }
    }

    const {
        sort,
        currentPage,
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

        const currentIndex = (currentPage - 1) * LIMIT;

        if (!isEqual(currentIndex, startIndex)) {
            setStartIndex(currentIndex);
        }

        const filterData = [];
        const columnNameList = [];

        columns.forEach(d => {
            columnNameList.push(d.column);
        });

        props.data.forEach(d => {
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

                    //Format alarm table description.
                    if(columnData.tabify) {
                        tabifyData(data, columnData, d);
                    }

                    if (columnData.tooltip && !columnNameList.includes(columnData.tooltip.column)) {
                        data[columnData.tooltip.column] = columnAccessor({ column: columnData.tooltip.column })(d);
                    }

                    if (matchingRowColumn && !columnNameList.includes(matchingRowColumn)) {
                        data[matchingRowColumn] = columnAccessor({ column: matchingRowColumn })(d);
                    }
                }
            }

            filterData.push(data);
            unformattedData[random] = d;
        });
        setFilterData(filterData);
        setOrignalData(filterData);
        setStateColumn(removedColumn);
    }

    const handleScrollSorting = (sortBy, sortDirection) => {
        const selectedColumn = getColumns().find(item => item.column === sortBy);
        if (!selectedColumn || selectedColumn.sort === false) {
            return;
        }

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

        setRowSelected([]);
        setFilterData(orderBy(filterData, [sortBy], [sortDirection]));
    }

    const handleSortOrderChange = ({ sortBy, sortDirection }) => {
        scroll ? handleScrollSorting(sortBy, sortDirection) : handleStaticSorting(sortBy, sortDirection)
    }

    const getHeaderData = () => {
        const { ESColumns, properties = {} } = props;
        let columnKeys = new Map();

        if (ESColumns) {
            ESColumns.forEach(item => {
                columnKeys.set(item.key, true);
            });
        }

        const columns = getColumns();
        let headerData = [];
        const conditionProcessColumnDataType = properties.searchBar && properties.enableNumericSearch;
        for (let index in columns) {
            if (columns.hasOwnProperty(index)) {
                const columnRow = columns[index];
                const displayColumn = stateColumn.includes(columnRow.label || columnRow.column) ? 'false' : 'true';
                const sort = !isEmpty(columnKeys) ? columnKeys.get(columnRow.column) : true;
                // save typeof column value if enableNumericSearch is true
                const columnType = conditionProcessColumnDataType && ESColumns ? ESColumns.filter(val => val.key === columnRow.column)[0] : null;
                const headerColumn = {
                    name: index,
                    label: columnRow.label || columnRow.column,
                    width: columnRow.width,
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
                    },
                    tooltip: columnRow.tooltip,
                    totalCharacters: columnRow.totalCharacters,
                    columnDataType: columnType ? columnType.type : null,
                    colors: columnRow.colors
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
                {stateSortOrder.column === dataKey && <SortIndicator sortDirection={stateSortOrder.order.toUpperCase()} />}
            </div>
        );
    }

    const hoverContent = (cellData, columnIndex, rowIndex) => {
        return <div key={`tooltip_${cellData}_${columnIndex}_${rowIndex}`}>
            {cellData} &nbsp;
        <CopyToClipboard text={cellData ? cellData.toString() : ''}>
                <button style={{ background: '#000', padding: 1 }} title="copy">
                    <FaRegClipboard size={10} color="#fff" />
                </button>
            </CopyToClipboard>
        </div>
    }

    const renderTooltip = (cellData, columnIndex, rowIndex) => {
        const place = rowIndex === currentStartIndex ? 'bottom' : 'top';
        // top calculate position of tooltip, -20 is to show tooltip below element when element at top of table otherwise -15 is to show tooltip above element.
        const top = rowIndex === currentStartIndex ? (rowHeight * (rowIndex + 1)) - 20 : (rowHeight * rowIndex) - 15;

        //calculate tooltip left position based on the column width. column width default is 150
        let left = 0;
        if (cellData){
            for(var ii=0; ii < columnIndex ; ii++) {
                if (columns[ii].width) {
                    left = left + (parseInt(columns[ii].width))
                } else {
                    left = left + 150;
                }
            }
            left = left - 3 * cellData.length
        }

        return <ReactTooltip
            id={`tooltip_${cellData}_${columnIndex}_${rowIndex}`}
            place={place}
            delayUpdate={1000}
            afterShow={() => setTooltipStatus(true)}
            afterHide={() => setTooltipStatus(false)}
            overridePosition={() => ({ left, top })}
            getContent={[() => hoverContent(cellData, columnIndex, rowIndex)]}
        />;
    }

    const cellRendererData = (cellData, columnIndex, rowIndex, column) => {
        const isScrollable = props.properties.columDataScrollable && props.properties.columDataScrollable.includes(column.columnField)
        const data = (!isScrollable && !!column.totalCharacters && !!cellData && cellData.length > column.totalCharacters) ? cellData.slice(0, column.totalCharacters) + '...' : cellData;

        if (column.colors && column.colors.hasOwnProperty(cellData)) {
            return  (
                <div style={{ background:  column.colors[cellData] || '', width: "10px", height: "10px", borderRadius: "50%", marginRight: "6px" }}></div>
            );
        }

        return (
            <div style={{overflowX: isScrollable ? 'scroll' : 'none'}}>
                <p data-tip='' data-for={`tooltip_${cellData}_${columnIndex}_${rowIndex}`}>{data}</p>
                { !!column.tooltip && renderTooltip(cellData, columnIndex, rowIndex)}
            </div>
        );
    }

    const columnsDetail = () => {
        return columns.map(column => (
            <Column
                label={column.label}
                dataKey={(column.columnField)}
                cellDataGetter={({ dataKey, rowData }) => {
                    let data = get(rowData, dataKey);
                    // In certain cases, data is processed incorrectly and the value is an object.
                    // We do not support javascript objects to be displayed in a column, but we do support react elements to be displayed
                    data = typeof(data) === "boolean" ? data.toString().toUpperCase()
                        : (typeof data === "object") ? React.isValidElement(data) ? data : null : data;
                    return data;
                }}
                headerRenderer={headerRenderer}
                headerStyle={props.properties.headerStyle}
                width={column.width || 150}
                cellRenderer={({cellData, columnIndex, rowIndex}) => cellRendererData(cellData, columnIndex, rowIndex, column)}
            />
            ));
    }

    const onScroll = ({ startIndex }) => {
        const page = (startIndex / LIMIT) + 1;
        props.updateScroll({ currentPage: page, event: events.PAGING });
    }

    const onRowClick = ({ index }) => {
        let selectedRowsCurr = rowSelected;
        if (rowSelected.includes(index)) {
            selectedRowsCurr = rowSelected.filter(item => item !== index);
        } else {
            selectedRowsCurr = !!multiSelectable ? [...selectedRowsCurr, index] : [index];
        }

        if (!multiSelectable) {
            handleClick(...selectedRowsCurr);
            selectedRows = [];
        }

        setRowSelected(selectedRowsCurr);
        if (onSelect) {
            let matchingRows = [];
            let rows = {};
            const selectedData = getSelectedRows(selectedRowsCurr);
            if (selectedData.length > 1) {
                rows = selectedData;
            } else {
                let row = selectedData.length ? selectedData[0] : {};
                if (matchingRowColumn && row) {
                    const value = objectPath.get(row, matchingRowColumn);
                    matchingRows = props.data.filter((d) => {
                        const matchingRowValue = objectPath.get(d, matchingRowColumn);
                        return (value || value === 0) && !isEqual(row, d) && value === matchingRowValue;
                    });
                }
                rows = row;
            }
            onSelect({ rows, matchingRows });
        }
        const rowsInStore = objectPath.has(scrollData, 'selectedRow') ? objectPath.get(scrollData, 'selectedRow') : {}
        props.updateScroll({ selectedRow: { ...rowsInStore, [props.requestId]: selectedRowsCurr } });
    }

    const onRowMouseOver = ({ index }) => {
        setOnRowOver(index);
    }

    const onRowMouseOut = () => {
        setOnRowOver(null);
    }

    const rowStyleFormat = (row) => {
        let rowHighlight = false;
        props.properties.rowHighlighCondition && props.properties.rowHighlighCondition.forEach( item => {
            if (item.type === "RELATIONAL") {
                switch (item.operator) {
                    case ">":
                        if (data[row["index"]] && data[row["index"]].testResult[item.column1] > data[row["index"]].testResult[item.column2]) {
                            rowHighlight = true;
                        }
                        break;
                    case "<":
                        if (data[row["index"]] && data[row["index"]].testResult[item.column1] < data[row["index"]].testResult[item.column2]) {
                            rowHighlight = true;
                        }
                        break;
                    default:
                        if (data[row["index"]] && data[row["index"]].testResult[item.column1] === data[row["index"]].testResult[item.column2]) {
                            rowHighlight = true;
                        }
                        break;
                }            
            } else {
                if (data[row["index"]] && data[row["index"]].testResult[item.column1] === item.value) {
                    rowHighlight = true;
                }
            }
        });

        if (!!rowSelected && rowSelected.includes(row.index)) {
            return {
                backgroundColor: '#b7b9bd',
                color: rowHighlight ? '#f00' : '#333'
            };
        } else if (row.index === onRowOver) {
            return {
                backgroundColor: '#f2f2f2',
                color: rowHighlight ? '#f00' : '#333',
                cursor: 'pointer'
            }
        }
        return {
            backgroundColor: '#fff',
            color: rowHighlight ? '#f00' : '#333'
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

    const filteredColumnBar = (selectColumnOption = false) => {
        if (!selectColumnOption) {
            return
        }

        const MenuProps = {
            PaperProps: {
                style: {
                    maxHeight: FILTER_COLUMN_MAX_HEIGHT,
                    width: FILTER_COLUMN_WIDTH,
                },
            },
            classes: {
                root: 'select-column'
            },
            getContentAnchorEl: null
        };

        return (
            <div className={'select-column'} style={{ flex: "none" }}>
                <Select
                    labelId="demo-mutiple-checkbox-label"
                    id="demo-mutiple-checkbox"
                    multiple
                    displayEmpty={true}
                    value={stateColumn}
                    onChange={handleColumnSelection}
                    renderValue={(selected) => 'Select Columns'}
                    MenuProps={MenuProps}
                    classes={{
                        root: 'select-column',
                        selectMenu: 'select-column',
                        select: 'select-column'
                    }}
                >
                    {getColumns().map((name) => (
                        <MenuItem
                            key={name.label || name.column}
                            value={name.label || name.column}
                            classes={{
                                root: 'select-column',
                                selected: 'select-column'
                            }}
                        >
                            <Checkbox checked={stateColumn.indexOf(name.label || name.column) === -1} size="small"/>
                            <ListItemText
                                disableTypography
                                primary={name.label || name.column}
                                classes={{root: 'select-column'}}
                            />
                        </MenuItem>
                    ))}
                </Select>
            </div>
        )
    }

    const handleColumnSelection = (event) => {
        displayColumn = event.target.value;
        isAllColumnSelected = isEmpty(displayColumn) ? true : false;
        setStateColumn(event.target.value);
        setRemovedColumn();
    }

    const handleContextMenu = (event) => {
        const menu = getMenu(props);

        if (!menu) {
            return false;
        }
        event.preventDefault();
        const { clientX: x, clientY: y } = event;
        openContextMenu({ x, y });
        return true;
    }

    const handleClick = (key) => {
        if (props.onMarkClick && filterData[key]) {
            if (unformattedData[filterData[key]['row_id']]) {
                props.onMarkClick(unformattedData[filterData[key]['row_id']]);
            }
        }
    }

    const openContextMenu = (contextMenu) => {
        const { x, y } = contextMenu;
        const menu = getMenu(props);

        closeContextMenu();
        document.body.addEventListener('click', handleCloseContextMenu);

        const node = document.createElement('ul');
        node.classList.add('contextMenu');
        node.id = 'contextMenu';
        node.style = `top: ${y}px; left: ${x}px; z-index: 100000;`;

        const { goTo, context, properties } = props;
        const { id } = properties || {};
        context.id = id;

        menu.forEach(item => {
            const { text, rootpath, params } = item;
            const pathname = `${process.env.PUBLIC_URL}/${rootpath}`;
            const li = document.createElement('li');
            li.textContent = text;
            const queryParams = (params && Object.getOwnPropertyNames(params).length > 0) ?
                Object.assign({}, context, params) : Object.assign({}, context);
            li.onclick = (e) => {
                goTo && goTo(pathname, queryParams);
            };
            node.append(li);
        });
        document.body.append(node);
    }

    const closeContextMenu = () => {
        document.body.removeEventListener('click', handleCloseContextMenu);
        const node = document.getElementById('contextMenu');
        if (node) {
            node.remove();
        }
    }

    const handleCloseContextMenu = () => {
        closeContextMenu();
    }

    const getSelectedRows = (selectedRowsCurr = rowSelected) => {
        let selected = [];
        if (Array.isArray(selectedRowsCurr)) {
            selectedRowsCurr.forEach((rowindex) => selected.push(props.data[rowindex]))
        }
        return selected;
    }

    const getMenu = (props) => {
        const {
            menu,
            multiMenu,
        } = props.properties;

        if (multiMenu && getSelectedRows().length > 1) {
            return multiMenu;
        }

        return menu || false;
    }

    const noRowsRenderer = () => (
        <span style={{ fontSize: '1.5em' }} className='center-text' > No data to visualize </span>
    );

    const resetScrollData = () => {
        return (
            scroll && !disableRefresh ?
                <div style={{ flex: "none" }}>
                    <IconButton
                        tooltip="Refresh"
                        tooltipPosition={'top-left'}
                        style={style.refresh}
                        onClick={() => props.updateScroll({ currentPage: 1, selectedRow: {}, event: events.REFRESH })}
                    >
                        <RefreshIcon className='refreshIcon' />
                    </IconButton>
                </div>
                : ''
        )
    }

    const graphWidth = (columns.length * 120) > width ? (columns.length * 120) : width;

    return (
        <React.Fragment>
            <div ref={(input) => { container = input; }}
                onContextMenu={props.handleContextMenu ? props.handleContextMenu : handleContextMenu}
            >
                <div style={{ float: 'right', display: 'flex', paddingRight: !disableRefresh ? 10 : 15 }}>
                    {filteredColumnBar(selectColumnOption)}
                    {resetScrollData()}
                </div>
                <div style={{ clear: "both" }}></div>
                {renderSearchBarIfNeeded(getHeaderData())}
                <div style={{ overflowX: "auto" }}>
                    <div style={{ height: graphHeight, minWidth: width }}>
                        <InfiniteLoader
                            isRowLoaded={({ index }) => !!filterData[index]}
                            loadMoreRows={onScroll}
                            rowCount={customSize}
                            threshold={1}
                        >
                            {({ onRowsRendered, registerChild }) => (
                                <AutoSizer>
                                    {({ height, width }) => {
                                        return (
                                            <Table
                                                ref={registerChild}
                                                onRowsRendered={(props) => {
                                                    setCurrentStartIndex(props.startIndex);
                                                    onRowsRendered(props);
                                                }}
                                                width={graphWidth}
                                                height={height}
                                                headerHeight={headerHeight}
                                                rowHeight={rowHeight}
                                                rowCount={filterData.length}
                                                rowGetter={({ index }) => filterData[index]}
                                                isRowLoaded={({ index }) => filterData[index]}
                                                sort={handleSortOrderChange}
                                                sortBy={stateSortOrder.column}
                                                sortDirection={!!stateSortOrder.order ? stateSortOrder.order.toUpperCase() : ''}
                                                onRowClick={!tooltipStatus && onRowClick}
                                                onRowMouseOver={onRowMouseOver}
                                                onRowMouseOut={onRowMouseOut}
                                                rowStyle={rowStyleFormat}
                                                scrollToIndex={parseInt(startIndex)}
                                                noRowsRenderer={noRowsRenderer}
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

            {scroll && <div className="totalData" style={{ clear: "both" }}></div>}
            {scroll && <div style={{ float: 'right', display: 'flex', paddingRight: 15 }}>
                TotalData: {size || data.length || 0}
            </div>}
        </React.Fragment>
    );
}

TableGraph.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
};
export default WithConfigHOC(properties)(TableGraph)