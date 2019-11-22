import  React from 'react';
import "react-filter-box/lib/react-filter-box.css";
import isEqual from 'lodash/isEqual'
import ReactFilterBox from "react-filter-box";

import "./index.css";
import AutoCompleteHandler from './AutoCompleteHandler';
import AdvancedResultProcessing from './AdvancedResultProcessing';

import { FaRegSmile as SmileUp, FaRegFrown as SmileDown, FaSearch as SearchIcon } from 'react-icons/fa';

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [],
            isOk: true,
            query: (this.props.searchText && typeof (this.props.searchText) === 'string') ? this.props.searchText : '',
        }

        const {
            options,
            data,
            scroll
        } = this.props
        
        this.autoCompleteHandler = new AutoCompleteHandler(data, options, scroll)
        this.onChange = this.onChange.bind(this)
        this.onParseOk = this.onParseOk.bind(this)
        this.setTimeout = null;
        this.expressions = null;
        this.query = (this.props.searchText && typeof (this.props.searchText) === 'string') ? this.props.searchText : '';
        this.finalExpression = null;
        this.searchWidth = this.props.cardWidth;
    }

    componentDidMount () {
        const { query } = this.state

        if(query) {
            this.refs.filterBox.onSubmit(query)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!isEqual(nextProps.data, this.props.data) || !isEqual(nextState, this.state) || !isEqual(nextProps.cardWidth, this.props.cardWidth)) {
            this.searchWidth = nextProps.cardWidth;
            return true;
        }

        return false;
    }

    componentDidUpdate () {
        const { query } = this.state

        if(query) {
            this.refs.filterBox.onSubmit(query)
        }
    }

    onChange (query, result) {
        if(!result.isError) {
            this.query = query;
            this.finalExpression = result;
        } else {
            clearTimeout(this.setTimeout);
        }

        this.setState({
            isOk: !result.isError,
            query
        })
    }

    onParseOk(expressions) {
        const {
            autoSearch,
        } = this.props;

        if (autoSearch !== false) {
            clearTimeout(this.setTimeout);
            this.setTimeout = setTimeout(() => this.processQuery(expressions), 1000);
        }
    }

    processQuery(expressions) {
        const {
            options,
            data,
            scroll,
            columns = false,
        } = this.props;

        if (!isEqual(this.expressions, expressions)) {
            this.expressions = expressions;
            if (scroll) {
                this.props.handleSearch(data, this.state.isOk, expressions, this.query)
            } else {
                const filteredData = new AdvancedResultProcessing(options, columns).process(data, expressions)
                this.props.handleSearch(filteredData, this.state.isOk)
            }
        }
    }

    renderIcon () {
        var style = {
            marginTop: 10,
            marginLeft: 5
        }

        return this.state.isOk ? <SmileUp size={20} color="green" style={style}/> :
        <SmileDown size={20} style={style} color="#a94442" />
    }

    render() {
        const {
            query
        } = this.state

        const {
            options,
            data,
            autoSearch,
            columnOption,
        } = this.props;

        return (
            <div style={{ display: "flex", maxWidth: (columnOption ? this.searchWidth - 70 : this.searchWidth), margin: "6px 5px 5px 6px"}}>
                <div className="search-label">
                    Search: &nbsp;
                </div>
                <div className="filter search">
                        <ReactFilterBox
                            ref="filterBox"
                            data={data}
                            onChange={this.onChange}
                            autoCompleteHandler={this.autoCompleteHandler}
                            query={query}
                            options={options}
                            onParseOk={this.onParseOk}
                        /> 
                    <div className="filter-icon">
                        { this.renderIcon() }
                    </div>
                </div>
                {
                    autoSearch === false &&
                    <div style={{marginTop: "10px"}}>
                        <SearchIcon size={18} style={{cursor: 'hand'}} onClick={() => this.processQuery(this.finalExpression)}/>
                    </div>
                }
            </div>
        )
    }
}
