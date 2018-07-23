import React from 'react'
import DataTables from 'material-ui-datatables'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Tooltip} from 'react-lightweight-tooltip'
import _ from 'lodash'
import SuperSelectField from 'material-ui-superselectfield'
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import objectPath from "object-path";

import { theme } from "../../theme";
import AbstractGraph from "../AbstractGraph"
import columnAccessor from "../../utils/columnAccessor"
import tooltipStyle from './tooltipStyle'
import "./style.css"
import style from './style'
import {properties} from "./default.config"
import { pick } from '../../utils/helpers'

import SearchBar from "../../SearchBar"
import InfoBox from "../../../../components/InfoBox"

const PROPS_FILTER_KEY = ['data', 'height', 'width', 'context', 'selectedColumns']
const STATE_FILTER_KEY = ['selected', 'data', 'fontSize', 'contextMenu', 'showInfoBox']
class Table extends AbstractGraph {

    constructor(props, context) {
        super(props, properties)
        this.handleSortOrderChange   = this.handleSortOrderChange.bind(this)
        this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this)
        this.handleNextPageClick     = this.handleNextPageClick.bind(this)
        this.handleSearch            = this.handleSearch.bind(this)
        this.handleRowSelection      = this.handleRowSelection.bind(this)
        this.handleContextMenu       = this.handleContextMenu.bind(this)
        this.handleColumnSelection   = this.handleColumnSelection.bind(this)
        this.selectionColumnRenderer = this.selectionColumnRenderer.bind(this)
        this.onInfoBoxCloseHandler   = this.onInfoBoxCloseHandler.bind(this);

        this.columns = `${props.configuration.id}-columns`

        /**
        */
        this.originalData = []
        this.keyColumns = {}
        this.currentPage = 1
        this.filterData = []
        this.selectedRows = {}
        this.htmlData = {}
        this.state = {
            selected: [],
            data: [],
            fontSize: style.defaultFontsize,
            contextMenu: null,
            columns: [],
            showInfoBox: false,
        }
    }

    componentWillMount() {
        this.initiate(this.props);
    }

    componentDidMount() {
        this.checkFontsize()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(pick(this.props, ...PROPS_FILTER_KEY), pick(nextProps, ...PROPS_FILTER_KEY))
          || !_.isEqual(pick(this.state, ...STATE_FILTER_KEY), pick(nextState, ...STATE_FILTER_KEY))
    }

    componentWillReceiveProps(nextProps) {

        if (!_.isEqual(pick(this.props, ...PROPS_FILTER_KEY), pick(nextProps, ...PROPS_FILTER_KEY))) {
            // reset font size on resize
            if(this.props.height !== nextProps.height || this.props.width !== nextProps.width) {
                this.setState({ fontSize: style.defaultFontsize})
            }

            if(this.props.context && this.props.context[this.columns] === nextProps.context[this.columns]) {
                this.initiate(nextProps);
            }
        }
    }

    componentDidUpdate() {
        this.checkFontsize();
        const { contextMenu } = this.state;
        if (contextMenu) {
            this.openContextMenu();
        }
    }

    isEmptyData() {
        const {
            data
        } = this.props;

       return _.isEmpty(data);
    }

    initiate(props) {


        const {
            context,
            selectedColumns
        } = props

        const {
            selectColumnOption,
            matchingRowColumn
        } = this.getConfiguredProperties()

        if(this.isEmptyData()) {
            return;
        }

        const columns = this.getColumns();

        if (!columns)
            return;

        let columnNameList = []
        this.keyColumns    = {}
        this.filterData    = []

        // generate random key for each column and assign that key to the values in data
        columns.forEach( d => {
            columnNameList.push(d.column)
            this.keyColumns[ d.selection ? d.label : `${d.column}_${Math.floor(100000 + Math.random() * 900000)}`] = d
        })

        props.data.forEach( d => {
            let data = {};
            for(let key in this.keyColumns) {
                if(this.keyColumns.hasOwnProperty(key)) {
                    const columnData = Object.assign({}, this.keyColumns[key]);

                    delete columnData.totalCharacters;

                    const accessor = columnAccessor(columnData);
                    data[key] = accessor(d);

                    // add tooltip column data if it doesn't exist in column array
                    if(columnData.tooltip && !columnNameList.includes(columnData.tooltip.column)) {
                        data[columnData.tooltip.column] = columnAccessor({column: columnData.tooltip.column})(d)
                    }

                    // add matching row data if it doesn't exist in column array
                    if(matchingRowColumn && !columnNameList.includes(matchingRowColumn)) {
                        data[matchingRowColumn] = columnAccessor({column: matchingRowColumn})(d)
                    }
                }
            }

            this.filterData.push(data)
        })

        this.originalData = this.filterData

        /*
         * On data change, resetting the paging and filtered data to 1 and false respectively.
         */
        this.resetFilters();

        let columnsContext = false

        if(selectedColumns) {
            columnsContext = selectedColumns
        } else {
            columnsContext = context && context.hasOwnProperty(this.columns) ? context[this.columns] : false
        }

        // filter columns who will be display in table
        const filteredColumns = columns.filter( d => {
            Object.assign(d, {value: d.label})

            //Must return all the columns
            if(!selectColumnOption) {
                return true
            }

            //Only selected Columns
            if(columnsContext) {
                return columnsContext.indexOf(d.label) > -1 || false
            } else {
                //Configured Columns
                return d.display !== false
            }
        })

        this.updateData(filteredColumns);
    }

    decrementFontSize() {
        this.setState({
            fontSize: this.state.fontSize - 1
        })
    }

    checkFontsize() {
        if(this.container && this.container.querySelector('table').clientWidth > this.container.clientWidth) {
            this.decrementFontSize();
        }
    }

    resetFilters() {
        this.currentPage = 1;
        this.selectedRows = {};
    }

    handleSearch(data, isSuccess) {
        if(isSuccess) {
            this.resetFilters();
            this.filterData = data;
            this.updateData();
        }
    }

    updateData(columns = this.state.columns) {
        const {
            limit,
        } = this.getConfiguredProperties();

        const offset = limit * (this.currentPage - 1);
        this.setState({
            data : this.filterData.slice(offset, offset + limit),
            selected: this.selectedRows[this.currentPage] ? this.selectedRows[this.currentPage]: [],
            columns
        });
    }

    getColumns() {
        const {
            configuration,
        } = this.props;

        return configuration.data.columns;
    }

    getKeyColumns() {
        return this.keyColumns;
    }

    // filter and formatting columns for table header
    getHeaderData() {
        const columns = this.getKeyColumns()
        let headerData = []
        for(let index in columns) {
            if(columns.hasOwnProperty(index)) {
                const columnRow = columns[index]
                if(this.state.columns.filter( d => d.value === columnRow.label).length) {
                    headerData.push({
                        key: index,
                        label: columnRow.label || columnRow.column,
                        sortable: true,
                        columnText: columnRow.selection ? "" : (columnRow.label || columnRow.column),
                        columField: index,
                        type: columnRow.selection ? "selection" : "text",
                        style: {
                          textIndent: '2px'
                        }
                    })
                }
            }
        }

        return headerData
    }

    getTableData(columns) {
        const {
            highlight,
            highlightColor
        } = this.getConfiguredProperties();

        if(!columns)
            return []

        const keyColumns = this.getKeyColumns()

        return this.state.data.map((d, j) => {

            let data = {},
              highlighter = false;

            const keyData = this.replaceKeyFromColumn(d)

            for (let key in keyColumns) {
                if(keyColumns.hasOwnProperty(key)) {

                    const columnObj  = keyColumns[key],
                        originalData = d[key];
                    let columnData   = originalData;

                    // get substring of data upto defined total characters
                    if(columnObj.totalCharacters) {
                        columnData = columnAccessor({column: columnObj.column, totalCharacters: columnObj.totalCharacters})(keyData)
                    }

                    // enable tooltip on mouse hover
                    if((columnData || columnData === 0) && columnObj.tooltip) {

                        let fullText = d[columnObj.tooltip.column] || originalData

                        fullText = Array.isArray(fullText) ? fullText.join(", ") : fullText

                        const hoverContent = (
                            <div key={`tooltip_${j}_${key}`}>
                                {fullText}
                                <CopyToClipboard text={fullText ? fullText.toString() : ''}><button title="copy" className="btn btn-link btn-xs fa fa-copy pointer text-white"></button></CopyToClipboard>
                            </div>
                        )

                        columnData = (
                            <Tooltip key={`tooltip_${j}_${key}`}
                                content={[hoverContent]}
                                styles={tooltipStyle}>
                                    {columnData}
                            </Tooltip>
                        )
                    }

                    // highlight the entire row if highlight array have a column with non-empty value
                    if(highlight && highlight.includes(columnObj.column) && originalData) {
                        highlighter = true
                    }

                    /**
                     * indicate column value with colors,
                     *  if column value configured in color array as a key with given color as a value. For e.g. -
                     * color {"insla": "red", "outsla": "green"}
                     */
                    if (columnObj.colors && columnObj.colors[originalData]) {
                        columnData =  (
                            <div style={{ background:  columnObj.colors[originalData] || '', width: "10px", height: "10px", borderRadius: "50%", marginRight: "6px" }}></div>
                        )
                    }

                    if(columnObj.infoBox && columnData) {
                        columnData =  (
                            <div onClick={(e) => {
                                //e.stopPropagation();
                                this.openInfoBox({ 
                                    infoBoxRow: keyData, 
                                    infoBoxColumn: columnObj.column,
                                    infoBoxData: originalData,
                                    infoBoxScript: columnObj.infoBox 
                                })
                            }}>
                                {columnData}
                            </div>
                        )
                    }

                    if(columnData) {
                        data[key] = typeof(columnData) === "boolean" ? columnData.toString().toUpperCase() : columnData
                    }
                }
            }

            if(highlighter)
                Object.keys(data).map(key => {
                    return data[key] = <div style={{ background: highlightColor || '', height: style.row.height, padding: "10px 0" }}>
                        {data[key]}</div>
                })

            return data
        })
    }

    handleSortOrderChange(column, order) {
        this.filterData = this.filterData.sort(
          (a, b) => {
             if(order === 'desc')
               return b[column] > a[column] ? 1 : -1

            return a[column] > b[column] ? 1 : -1
          }
        );

        /**
         * Resetting the paging due to sorting
         */
        this.resetFilters();
        this.updateData();
    }

    handlePreviousPageClick() {
        --this.currentPage;
        this.updateData();
    }

    handleNextPageClick() {
        ++this.currentPage;
        this.updateData();
    }

    handleClick(key) {
        if(this.props.onMarkClick && this.state.data[key])
           this.props.onMarkClick(this.replaceKeyFromColumn(this.state.data[key]));
    }

    handleRowSelection(selectedRows) {
        const {
            multiSelectable,
            matchingRowColumn
        } = this.getConfiguredProperties();

        if(!multiSelectable) {
            this.handleClick(...selectedRows)
            this.selectedRows = {}
        }

        this.selectedRows[this.currentPage] = selectedRows.slice();
        this.setState({
            selected: this.selectedRows[this.currentPage]
        })

        const { onSelect } = this.props;
        if (onSelect) {
            let matchingRows = []

            let rows = {}
            const selectedData = this.getSelectedRows()

            if(selectedData.length > 1) {
                rows = selectedData.map( d => this.replaceKeyFromColumn(d))
            } else {
                let row =  selectedData.length ? selectedData[0] : {}
                /**
                 * Compare `matchingRowColumn` value with all available datas and if equal to selected row,
                 * then save all matched records in store under "matchedRows",
                **/
                if(matchingRowColumn) {
                    const key = this.getKeyByColumnName(matchingRowColumn) || matchingRowColumn

                    matchingRows = this.filterData.filter( (d) => {
                        return (row[key] || row[key] === 0) && row !== d && row[key] === d[key]
                    });

                    if(matchingRows.length) {
                        matchingRows = matchingRows.map( d => this.replaceKeyFromColumn(d))
                    }
                }
                rows = this.replaceKeyFromColumn(row)
            }
            onSelect({rows, matchingRows});
        }

    }

    // replace random generated keys of columns from actual column name
    replaceKeyFromColumn(row) {
        const columns = this.getKeyColumns()
        let updatedRow = {}
        for (let key in row) {
            if(row.hasOwnProperty(key)) {
                objectPath.set(updatedRow, columns[key] ? columns[key].column : key, row[key]);
            }
        }
        return updatedRow
    }

    // pass column name and get column key (random generated at component will mount/ update)
    getKeyByColumnName(column) {
        const columns = this.getKeyColumns()
        for (let key in columns) {
            if(columns.hasOwnProperty(key) && columns[key].column === column) {
                return key
            }
        }
        return false
    }

    getMenu() {
        const {
            menu,
            multiMenu
        } = this.getConfiguredProperties();

        if (multiMenu && this.getSelectedRows().length > 1) {
            return multiMenu
        }

        return menu || false
    }

    handleContextMenu(event) {
        const menu = this.getMenu()

        if (!menu) {
            return false;
        }
        event.preventDefault()
        const { clientX: x, clientY: y } = event;
        this.setState({ contextMenu: { x, y } });
        return true;
    }

    handleCloseContextMenu = () => {
        this.setState({ contextMenu: null });
        this.closeContextMenu();
    }

    closeContextMenu = () => {
        document.body.removeEventListener('click', this.handleCloseContextMenu);
        const node = document.getElementById('contextMenu');
        if (node) node.remove();
    }

    openContextMenu = () => {
        const { contextMenu: { x, y } } = this.state;
        const menu = this.getMenu()

        this.closeContextMenu();
        document.body.addEventListener('click', this.handleCloseContextMenu);

        const node = document.createElement('ul');
        node.classList.add('contextMenu');
        node.id = 'contextMenu';
        node.style = `top: ${y}px; left: ${x}px; z-index: 100000;`;

        const { goTo, context, configuration: { id } } = this.props;
        context.id = id;

        menu.forEach((item) => {
            const { text, rootpath, params } = item;
            const pathname = `${process.env.PUBLIC_URL}/${rootpath}`
            const li = document.createElement('li');
            li.textContent = text;
            const queryParams = (params && Object.getOwnPropertyNames(params).length > 0) ?
                    Object.assign({}, context, params) : Object.assign({}, context);
            li.onclick = (e) => {
                // dispatch a push to the menu link
                goTo && goTo(pathname, queryParams);
            };
            node.append(li);
        });
        document.body.append(node);
    }

    getSelectedRows() {
        const {
            limit
        } = this.getConfiguredProperties();

        let selected = [];
        for(let page in this.selectedRows) {
            if(this.selectedRows.hasOwnProperty(page)) {
                this.selectedRows[page].forEach((index) => {
                    selected.push(this.filterData[(page - 1) * limit + index])
                })
            }
        }
        return selected;
    }

    renderSearchBarIfNeeded(headerData) {
        const {
            searchBar,
            searchText
        } = this.getConfiguredProperties();

        if(searchBar === false)
           return;

        return (
          <SearchBar
            data={this.originalData}
            searchText={searchText}
            options={headerData}
            handleSearch={this.handleSearch}
            columns={this.getColumns()}
          />
        );
    }

    removeHighlighter(data = []) {
        const {
            highlight
        } = this.getConfiguredProperties();

        if(!data.length)
          return data

        if(highlight) {
            this.state.selected.forEach( (key) => {
                if(highlight && data[key]) {
                    for (let i in data[key]) {
                        if (data[key].hasOwnProperty(i)) {
                            if(data[key][i].props.style)
                                data[key][i].props.style.background = ''
                        }
                    }
                }
            })
        }
        return data
    }


    handleColumnSelection(columns, name) {
        const {
            onColumnSelection,
            goTo,
            context
        } = this.props

        let columnsData = []
        columns.forEach( d => {columnsData.push(d.label)})
        this.setState({ columns })

        if(onColumnSelection) {
            onColumnSelection(columnsData)
        }

        goTo && goTo(window.location.pathname, Object.assign({}, context, {[this.columns]: JSON.stringify(columnsData)}))

    }

    getColumnListItem() {

        return  this.getColumns().map( column => {
          return (
            <div style={{
                whiteSpace: 'normal',
                display: 'flex',
                justifyContent: 'space-between',
                lineHeight: 'normal',
                fontSize: '0.8em'
              }}
              key={column.label}
              label={column.label}
              value={column.label}>
                {column.label}
            </div>)
        })
    }

    selectionColumnRenderer(values, hintText) {
        if (!values) return hintText
        const { value, label } = values
        if (Array.isArray(values)) {
           return values.length
              ? `Select Columns`
              : hintText
        }
        else if (label || value) return label || value
        else return hintText
    }

    filteredColumnBar(selectColumnOption = false) {
        const {
            id
        } = this.props

        if(!selectColumnOption) {
            return
        }

        const customHintTextAutocomplete = (
            <span style={{ fontSize: '0.8em' }}>Type something</span>
        )

        return (
            <div style={{float:'right', display: 'flex', paddingRight: 15}}>
                <SuperSelectField
                    name={id}
                    multiple
                    checkPosition='left'
                    hintTextAutocomplete={customHintTextAutocomplete}
                    hintText='Select Columns'
                    onSelect={this.handleColumnSelection}
                    value={this.state.columns}
                    keepSearchOnSelect
                    elementHeight={40}
                    selectionsRenderer={this.selectionColumnRenderer}
                    style={{ minWidth: 150, margin: 10, outline: 'white', fontSize: '1em'}}
                    innerDivStyle={{border: '1px solid #dad1d1'}}
                    underlineFocusStyle={{outline: 'white'}}
                    autocompleteStyle={{fontSize: '0.8em'}}
                    errorStyle={{fontSize: '0.8em'}}
                >
                    {this.getColumnListItem()}
                </SuperSelectField>
            </div>
        )
    }

    openInfoBox({
        infoBoxRow,
        infoBoxColumn,
        infoBoxData,
        infoBoxScript
    }) {
        this.setState({
            showInfoBox: true,
            infoBoxRow,
            infoBoxColumn,
            infoBoxData,
            infoBoxScript
        })
    }

    onInfoBoxCloseHandler() {
        this.setState({
            showInfoBox: false
        })
    }

    renderInfoBox() {
        let { showInfoBox, infoBoxRow, infoBoxColumn, infoBoxScript, infoBoxData  } = this.state;

        return (
            showInfoBox && 
            <InfoBox
                infoBoxRow={infoBoxRow}
                infoBoxColumn={infoBoxColumn}
                infoBoxData={infoBoxData}
                onInfoBoxClose={this.onInfoBoxCloseHandler}
                infoBoxScript={infoBoxScript}
            >
                Yeah
            </InfoBox>
        )
    }

    render() {
        const {
            height, 
            data
        } = this.props;

        const {
            limit,
            selectable,
            multiSelectable,
            showCheckboxes,
            hidePagination,
            searchBar,
            selectColumnOption
        } = this.getConfiguredProperties();

        if(this.isEmptyData()) {
            return this.renderMessage('No data to visualize')
        }

        let tableData  = this.getTableData(this.getColumns());
        const headerData = this.getHeaderData()


        // overrite style of highlighted selected row
        tableData = this.removeHighlighter(tableData)

        let showFooter = (data.length <= limit && hidePagination !== false) ? false : true,
          heightMargin  =  showFooter ?  100 : 80

          heightMargin = searchBar === false ? heightMargin * 0.3 : heightMargin

          heightMargin = selectColumnOption ? heightMargin + 50 : heightMargin

        return (
            <MuiThemeProvider muiTheme={theme}>
                <div ref={(input) => { this.container = input; }}
                    onContextMenu={this.handleContextMenu}
                    >
                        {this.renderInfoBox()}
                        {this.filteredColumnBar(selectColumnOption)}
                        <div style={{clear:"both"}}></div>

                        {this.renderSearchBarIfNeeded(headerData)}
                        <DataTables
                            columns={headerData}
                            data={tableData}
                            showHeaderToolbar={false}
                            showFooterToolbar={showFooter}
                            selectable={selectable}
                            multiSelectable={multiSelectable}
                            selectedRows={this.state.selected}
                            showCheckboxes={showCheckboxes}
                            showRowSizeControls={false}
                            onNextPageClick={this.handleNextPageClick}
                            onPreviousPageClick={this.handlePreviousPageClick}
                            onSortOrderChange={this.handleSortOrderChange}
                            onRowSelection={this.handleRowSelection}
                            page={this.currentPage}
                            count={this.filterData.length}
                            rowSize={limit}
                            tableStyle={style.table}
                            tableHeaderColumnStyle={Object.assign({}, style.headerColumn, {fontSize: this.state.fontSize})}
                            tableRowStyle={style.row}
                            tableRowColumnStyle={Object.assign({}, style.rowColumn, {fontSize: this.state.fontSize})}
                            tableBodyStyle={Object.assign({}, style.body, {height: `${height - heightMargin}px`})}
                            footerToolbarStyle={style.footerToolbar}
                        />
                </div>
            </MuiThemeProvider>
        );
    }
}

Table.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};

export default Table;
