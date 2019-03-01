
import PropTypes from 'prop-types';
import React from "react";
import _ from 'lodash';
import AbstractGraph from "../AbstractGraph";
import { properties } from "./default.config";
import './styles.css'
import { parseSrc } from '@/lib/ui-components/utils.js'
import {
    select,
    zoom,
    event,
    tree,
    hierarchy
  } from "d3";
import * as siteIcons from './images.js';

class TreeGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
        this.root = null;
        this.treeData = null;
        this.treemap = null;
    }

    componentWillMount() {
        this.initiate(this.props)
    }

    componentDidMount() {
        const {
            data
        } = this.props;

        if (!data)
            return

        this.elementGenerator();
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isEqual(this.props, nextProps)) {
            this.initiate(nextProps);
        }
    }

    componentDidUpdate() {
        const {
            data
        } = this.props;

        if (!data)
            return

        this.elementGenerator();
    }

    getGraph = () => {
        return this.getSVG();
    }

    getGraphContainer = () => {
        return this.getGraph().select('.tree-graph-container');
    }

    // Toggle children on click.
    click = (d) => {
        d.clicked = true;
        if (d.children) {
            d._children = d.children;
            d.children = null;
            this.collapse(d)
        } else {
            d.children = d._children;
            d._children = null;
            this.props.onClickChild(d);
        }
        this.update(d);
    }
    
    collapse = (d) => {
        if (d.children) {
            d._children = d.children
            d._children.forEach(this.collapse)
            d.children = null
        }
    }

    // generate methods which helps to create charts
    elementGenerator = () => {
        const {
            data
        } = this.props;

        // declares a tree layout and assigns the size
        this.treemap = tree().size([this.getAvailableHeight(), this.getAvailableWidth()]);
        this.treeData = data[0];
        // Assigns parent, children, height, depth
        this.root = hierarchy(this.treeData, (d) => { return d.children; });
        
        //form x and y axis
        
        this.root.x0 = this.getAvailableHeight() / 2;
        this.root.y0 = 0;

        this.update(this.root)
    }

    initiate = (props) => {
        this.setAvailableWidth(props);
        this.setAvailableHeight(props);
    }

    setAvailableWidth = (props) => {
        const {
            width
        } = props;
        const {
            margin
        } = this.getConfiguredProperties();
        this.availableWidth = width - margin.left - margin.right
    }

    setAvailableHeight = (props) => {
        const {
            height
        } = props;
        const {
            margin
        } = this.getConfiguredProperties();
        this.availableHeight = height - margin.top - margin.bottom
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
            transition: {
                duration
            },
            rectNode
        } = this.getConfiguredProperties();

        let i = 0;

        // ****************** Nodes section ***************************

        // Update the nodes...
        const node = svg.selectAll('g.node')
            .data(nodes, (d) => {
                return d.id || (d.id = ++i);
            });

        // Enter any new modes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", (d) => {
                return d.parent ?
                    "translate(" + d.parent.y + "," + d.parent.x + ")" :
                    "translate(" + source.y0 + "," + source.x0 + ")";
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
            .attr('width', () => {
                return (rectNode.width - rectNode.textMargin * 2) < 0 ? 0 :
                    (rectNode.width - rectNode.textMargin * 2)
            })
            .attr('height', () => {
                return (rectNode.height - rectNode.textMargin * 2) < 0 ? 0 :
                    (rectNode.height - rectNode.textMargin * 2)
            })
            .append('xhtml').html((d) => {
                let img = this.fetchImage(d.data.apiData, d.data.contextName);
                const desc = (d.data.description) ? d.data.description : 'No description given';
                const rectColorText = d.children ? "#F9F8FF" : "#020202"
                return '<div style="width: ' +
                    (rectNode.width - rectNode.textMargin * 2) + 'px; height: ' +
                    (rectNode.height - rectNode.textMargin * 2) + 'px;" class="node-text wordwrap">' +
                    '<div style="width:22%%;float:left"><img style="width: 20px;" src="' + parseSrc(img) + '" /></div>' +
                    '<div style="width:78%;float:right;font-size: 8px;color:' + rectColorText + '">' + d.data.name + '</div>' +
                    '<div style="width:22%%;float:left;font-size: 8px;"></div>' +
                    '<div style="width:75%;float:left;font-size: 8px;margin-left:4%;color:' + rectColorText + '">' + desc + '</div>' +
                    '</div>';
            })

        // UPDATE
        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.select('rect')
            .attr('class', (d) => {
                return d.children ? 'node-rect-closed' : 'node-rect';
            })
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
            .style("fill", (d) => {
                return d.clicked ? "#58A2FF" : (d.children ? "#58A2FF" : "#D9D9D9");
            });

    }
    
    fetchImage =(apiData, contextName) => {
        let icon,
            iconType;
        if (contextName === 'zone') {
            iconType = (apiData.publicZone) ? 'publiczone' : 'privatezone'
        }

        if (apiData._avatarData) {
            icon = apiData._avatarData;
        } else if (siteIcons[contextName]) {
            icon = siteIcons[contextName];
        } else if (iconType && siteIcons[iconType]) {
            icon = siteIcons[iconType];
        }
        return icon;
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
                return this.diagonal(d)
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
                return this.diagonal(d)
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

    diagonal = (d) => {
        const {
            rectNode
        } = this.getConfiguredProperties();

        // Creates a curved (diagonal) path from parent to the child nodes
        var p0 = {
                x: d.x + rectNode.height / 2,
                y: (d.y)
            },
            p3 = {
                x: d.parent.x + rectNode.height / 2,
                y: d.parent.y - 0 // -12, so the end arrows are just before the rect node
            },
            m = (p0.y + p3.y) / 2,
            p = [p0, {
                x: p0.x,
                y: m
            }, {
                x: p3.x,
                y: m
            }, p3];
        p = p.map( (d) => {
            return [d.y, d.x];
        });

        return 'M' + p[0] + 'C' + p[1] + ' ' + p[2] + ' ' + p[3];

    }

    zoomed = () => {
        this.getGraphContainer().attr("transform", event.transform);
    }

    getLeftMargin = () => 30;
    
    render() {
        const { width, height } = this.props;
        const { margin } = this.getConfiguredProperties();
        return (
            <div className="line-graph">
                <svg
                    width={width}
                    height={height}
                    ref={ (node) => {
                        this.node = node;
                        select(node)
                        .call(zoom()
                        .scaleExtent([1 / 2, 8])
                        .on("zoom", this.zoomed)
                    )}
                }
                >
                    <g className='tree-graph-container' transform={ `translate(${this.getLeftMargin()},${margin.top})` }>

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
