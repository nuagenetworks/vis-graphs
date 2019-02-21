
import PropTypes from 'prop-types';
import React from "react";
import * as d3 from "d3";
import _ from 'lodash';
import AbstractGraph from "../AbstractGraph";
import { properties } from "./default.config";
import { List } from 'immutable';
import './styles.css'
import { parseSrc } from '@/lib/ui-components/utils.js'

const rectNode = { width : 120, height : 45, textMargin : 5 }
const diagonal = (d) => {
    // Creates a curved (diagonal) path from parent to the child nodes
    var p0 = {
        x : d.x + rectNode.height / 2,
        y : (d.y)
    }, p3 = {
        x : d.parent.x + rectNode.height / 2,
        y : d.parent.y  - 0 // -12, so the end arrows are just before the rect node
    }, m = (p0.y + p3.y) / 2, p = [ p0, {
        x : p0.x,
        y : m
    }, {
        x : p3.x,
        y : m
    }, p3 ];
    p = p.map(function(d) {
        return [ d.y, d.x ];
    });

    return 'M' + p[0] + 'C' + p[1] + ' ' + p[2] + ' ' + p[3];

}

// TODO: Make this dynamic as per graph config
const PAGINATION = 2;

class TreeGraph extends AbstractGraph {
    path = null;
    root = null;
    colorScale = d3.scaleOrdinal(properties.colors);
    treeData = null;
    treemap = null;

    state = { refresh: false };

    constructor(props) {
        super(props, properties);
    }

    componentWillMount() {
        this.initiate(this.props)
    }

    componentDidMount() {
        const {
            data
        } = this.props;

        if (!data || !data.length)
            return

        this.elementGenerator();
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isEqual(this.props, nextProps)) {
            this.refresh();
            this.initiate(nextProps);
        }
    }

    componentDidUpdate() {
        const {
            data
        } = this.props;

        if (!data || !data.length)
            return

        this.elementGenerator();
    }

    getGraph = () => {
        return this.getSVG();
    }

    getGraphContainer = () => {
        return this.getGraph().select('.line-graph-container');
    }

    // generate methods which helps to create charts
    elementGenerator = () => {
        const svg = this.getGraph();

        // for generating transition
        svg.select('.line-graph-container')
            .attr("transform", "translate(100, 0)")

        this.update(this.root)
    }

    // NOTE: Function used in paging
    paginate = (d) => {
        this.setPage(d.parent, d.no);
        // this.update(this.root);
        this.update(d.parent);
        this.refresh();
    }

    // NOTE: Function used in paging
    setPage = (d, currentPage) => {
        const newChild = new List(d.children);
        const newAltChild = new List(d._children);

        const updatedChildren = newAltChild.filter((d1) => currentPage === d1.pageNo).toJS();
        const updatedAltChildren = newAltChild.concat(newChild).filter((d1) => currentPage !== d1.pageNo).toJS();

        d.currentPage = currentPage;
        d.children = updatedChildren;
        d._children = updatedAltChildren;
    }

    refresh = () => {
        this.setState({ refresh: !this.state.refresh });
    }

    reset = (d, depth = 0) => {
        // TODO
    }

    parseData = () => {
        // TODO
    }

    // Toggle children on click.
    click = (d) => {
        d.clicked = true;
        if (d.children) {
            this.collapse(d);
        } else {
            this.props.onClickChild(d);

            // NOTE: Replace the above with lines below to activate paging
            /*
                this.initializePageDetails(d, true)
                const { currentPage } = d;
                const hiddenChildrenList = new List(d._children);
                const updatedChildren = hiddenChildrenList.filter((d1) => currentPage === d1.pageNo).toJS();
                const updatedAltChildren = hiddenChildrenList.filter((d1) => currentPage !== d1.pageNo).toJS();

                d.children = updatedChildren;
                d._children = updatedAltChildren;
            */
        }
        this.update(d);
        // NOTE: Uncomment the lines below to activate paging
        // this.refresh();
    }

    collapse = (d) => {
        if (d.children) {
            d._children = new List(d.children).toJS();
            d._children.forEach(this.collapse)
            d.children = null;

            // NOTE: Replace the above with lines below to activate paging
            /*
                const _childrenList = new List(d._children);
                const childrenList = new List(d.children);
                if (!d._children) {
                    d._children = childrenList.toJS();
                } else {
                    d._children = childrenList.concat(_childrenList).toJS();
                }
                d._children.forEach(this.collapse)
                d.children = null;
            */
        }
    }

    // NOTE: Function used in paging
    showPerPage = (d) => {
        if (d.children) {
            // NOTE: Uncomment the lines below to activate paging
            // this.initializePageDetails(d)
            const { currentPage } = d;
            const childrenList = new List(d.children);

            const updatedChildren = childrenList.filter((d1) => currentPage === d1.pageNo).toJS();
            const updatedAltChildren = childrenList.filter((d1) => currentPage !== d1.pageNo).toJS();

            d.children = updatedChildren;
            d._children = updatedAltChildren;
        }
    }

    // NOTE: Function used in paging
    initializePageDetails = (d, nodeWillOpen) => {
        if (nodeWillOpen && d._children) {
            d.currentPage = 1;
            d._children.forEach((d1, i) => {
                d1.pageNo = Math.ceil((i + 1) / PAGINATION);
                // this.initializePageDetails(d1);
            })
        }
        else if (d.children) {
            d.currentPage = 1;
            d.children.forEach((d1, i) => {
                d1.pageNo = Math.ceil((i + 1) / PAGINATION);
                // this.initializePageDetails(d1);
            })
        }
    }

    // NOTE: Function used in paging
    updatePageLinks = (d) => {
        const svg = this.getGraphContainer();
        const nodes = this.treeData.descendants();

        let parents = nodes.filter((d) => {
            return d.children && d.data.children && (d.data.children.length > PAGINATION);
        });

        svg.selectAll(".page").remove();

        parents.forEach((p) => {
            if (!p.children)
                return;

            const totalChildren = p.data.children.length;
            const totalPages = Math.ceil(totalChildren / PAGINATION);
            const currentPage = p.currentPage;

            let p1 = p.children[p.children.length - 1];
            let p2 = p.children[0];

            let pagingData = [];
            if (currentPage > 1) {
                pagingData.push({
                    type: "prev",
                    parent: p,
                    no: (currentPage - 1)
                });
            }

            if (currentPage < totalPages) {
                pagingData.push({
                    type: "next",
                    parent: p,
                    no: (currentPage + 1)
                });
            }

            let pageControl = svg.selectAll(".page");

            pageControl.data(pagingData, (d) => {
                return (d.parent.id + d.type);
            }).enter()
                .append("g")
                .attr("class", "page")
                .attr("transform", (d) => {
                    const x = (d.type === "next") ? p2.y : p1.y;
                    const y = (d.type === "prev") ? (p2.x - 30) : (p1.x + 30);
                    return "translate(" + x + "," + y + ")";
                }).on("click", this.paginate);

            pageControl
                .append("circle")
                .attr("r", 15)
                .style("fill", (d) => {
                    return d.parent ? this.colorScale(d.parent.id) : this.colorScale();
                })
            pageControl
                .append("image")
                .attr("xlink:href", (d) => {
                    // TODO: Move icons inside vis-graphs repo
                    if (d.type === "next") {
                        return "https://dl.dropboxusercontent.com/s/p7qjclv1ulvoqw3/icon1.png"
                    } else {
                        return "https://dl.dropboxusercontent.com/s/mdzt36poc1z39s3/icon3.png"
                    }
                })
                .attr("x", -12.5)
                .attr("y", -12.5)
                .attr("width", 25)
                .attr("height", 25);
        });
    }

    initiate = (props) => {
        const {
            data,
            height,
            width
        } = props;
        
        if (!data || !data.length)
            return;

        this.root = d3.hierarchy(data[0], (d) => {
            return d.children
        });
        this.root.x0 = height / 2;
        this.root.y0 = 0;
        this.treemap = d3.tree().size([height, width]);
        this.treeData = this.treemap(this.root);

        // collapse all nodes
        // this.root.children.forEach(this.collapse);

        // NOTE: Uncomment the lines below to activate paging
        // this.initializePageDetails(this.root);
        // this.showPerPage(this.root);
    }

    update = (source) => {
        // Assigns the x and y position for the nodes
        this.treeData = this.treemap(this.root);

        // Compute the new tree layout.
        const nodes = this.treeData.descendants(),
            links = this.treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach((d) => { d.y = d.depth * 180 });

        this.updateNodes(source, nodes);
        this.updateLinks(source, links);
        // NOTE: Uncomment the lines below to activate paging
        // this.updatePageLinks();

        // Store the old positions for transition.
        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    updateNodes = (source, nodes) => {
        // update graph
        const svg = this.getGraphContainer();

        const {
            transition: {duration}
        } = this.getConfiguredProperties();

        let i = 0;

        // ****************** Nodes section ***************************

        // Update the nodes...
        const node = svg.selectAll('g.node')
            .data(nodes, (d) => { return d.id || (d.id = ++i); });

        // Enter any new modes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", (d) => {
                return d.parent 
                  ? "translate(" + d.parent.y + "," + d.parent.x + ")" 
                  : "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', this.click);

            nodeEnter.append('g').append('rect')
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', rectNode.width)
                .attr('height', rectNode.height)
                .attr('class', 'node-rect')

            nodeEnter.append('foreignObject')
                .attr('x', rectNode.textMargin)
                .attr('y', rectNode.textMargin)
                .attr('width', function () {
                    return (rectNode.width - rectNode.textMargin * 2) < 0 ? 0 :
                        (rectNode.width - rectNode.textMargin * 2)
                })
                .attr('height', function () {
                    return (rectNode.height - rectNode.textMargin * 2) < 0 ? 0 :
                        (rectNode.height - rectNode.textMargin * 2)
                })
                .append('xhtml').html(function (d) {
                    const desc = (d.data.description) ? d.data.description : 'No description given';
                    const rectColorText = d.children ? "#F9F8FF" : "#020202"
                    return '<div style="width: ' +
                        (rectNode.width - rectNode.textMargin * 2) + 'px; height: ' +
                        (rectNode.height - rectNode.textMargin * 2) + 'px;" class="node-text wordwrap">' +
                        '<div style="width:22%%;float:left"><img style="width: 20px;" src="' + parseSrc(d.data.avatarData) + '" /></div>' +
                        '<div style="width:78%;float:right;font-size: 8px;color:'+rectColorText+'">' + d.data.name + '</div>' +
                        '<div style="width:22%%;float:left;font-size: 8px;"></div>' +
                        '<div style="width:75%;float:left;font-size: 8px;margin-left:4%;color:'+rectColorText+'">' + desc + '</div>' +
                        '</div>';
                })

        // UPDATE
        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.select('rect')
        .attr('class', function(d) { return d.children ? 'node-rect-closed' : 'node-rect'; })
        .attr('cursor', 'pointer');
        
        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration((d) => {
                return d.children ? 0 : duration;
            })
            .attr("transform", (d) => {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Remove any exiting nodes
        node.exit().transition()
            .duration(duration)
            .attr("transform", (d) => {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeUpdate.select("rect")
            .style("fill", function(d) { return d.clicked ? "#58A2FF" : (d.children ? "#58A2FF" : "#D9D9D9");});

    }

    updateLinks = (source, links) => {
        // update graph
        const svg = this.getGraphContainer();

        const {
            transition: {
                duration
            },
            stroke
        } = this.getConfiguredProperties();

        // ****************** links section ***************************
        // Update the links...
        const link = svg.selectAll('path.link').data(links, (d) => {
            return d.id;
        });

        // // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', (d) => {
                return diagonal(d)
            })
            .attr("stroke-width", stroke.width)
            .attr("marker-start", "url(#start-arrow)");

        this.addArrowAtEndOfAllLink(svg);

        // UPDATE
        linkEnter.merge(link);
        
        // Remove any exiting links
        link.exit().transition()
        .duration(duration)
        .attr('d', (d) => {
            return diagonal(d)
        })
        .remove();
    }

    addArrowAtEndOfAllLink(svg) {
        svg.append("svg:defs").append('marker')
		.attr('id', 'start-arrow')
		.attr('viewBox', '0 -5 10 10')
		.attr('refX', 0)
		.attr('refY', 0)
		.attr('markerWidth', 6)
		.attr('markerHeight', 6)
		.attr('orient', 'auto')
		.attr('class', 'arrow')
		.append('path')
		.attr('d', 'M10,-5L0,0L10,5');
    }

    render() {
        const { width, height } = this.props;
        const { refresh } = this.state;
        return (
            <div className="line-graph">
                <svg width={width} height={height} key={refresh}>
                    <g ref={node => this.node = node} width={width} height={height}>
                        <g className='line-graph-container'></g>
                    </g>
                </svg>
            </div>
        );
    }
}
TreeGraph.propTypes = {
    configuration: PropTypes.object,
    response: PropTypes.object,
    parseData: PropTypes.func,
    fetchChildren: PropTypes.func,
};

export default TreeGraph;
