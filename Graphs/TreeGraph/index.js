
import React from "react";
import * as d3 from "d3";
import AbstractGraph from "../AbstractGraph";
import { properties } from "./default.config";
import { List } from 'immutable';
import './styles.css'

const diagonal = (s, d) => {
    // Creates a curved (diagonal) path from parent to the child nodes
    const path = `M ${s.y} ${s.x}
    C ${(s.y + d.y) / 2} ${s.x},
        ${(s.y + d.y) / 2} ${d.x},
        ${d.y} ${d.x}`

    return path
}

// TODO: Make this dynamic as per graph config
const PAGINATION = 2;

class TreeGraph extends AbstractGraph {
    path = null;
    root = null;
    colorScale = d3.scaleOrdinal(d3.schemeCategory10);
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
        if (this.props !== nextProps) {
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

    paginate = (d) => {
        this.setPage(d.parent, d.no);
        // this.update(this.root);
        this.update(d.parent);
        this.setState({ refresh: !this.state.refresh })
    }

    setPage = (d, currentPage) => {
        const newChild = new List(d.children);
        const newAltChild = new List(d._children);

        const updatedChildren = newAltChild.filter((d1) => currentPage === d1.pageNo).toJS();
        const updatedAltChildren = newAltChild.concat(newChild).filter((d1) => currentPage !== d1.pageNo).toJS();

        d.currentPage = currentPage;
        d.children = updatedChildren;
        d._children = updatedAltChildren;
    }

    reset = (d, depth = 0) => {
        // TODO
    }

    parseData = () => {
        // TODO
    }

    // Toggle children on click.
    click = (d) => {
        if (d.children) {
            this.collapse(d);
        } else {
            this.initializePageDetails(d, true)
            const { currentPage } = d;
            const hiddenChildrenList = new List(d._children);
            const updatedChildren = hiddenChildrenList.filter((d1) => currentPage === d1.pageNo).toJS();
            const updatedAltChildren = hiddenChildrenList.filter((d1) => currentPage !== d1.pageNo).toJS();

            d.children = updatedChildren;
            d._children = updatedAltChildren;
        }
        this.update(d);
        this.setState({ refresh: !this.state.refresh })
    }

    collapse = (d) => {
        if (d.children) {
            const _childrenList = new List(d._children);
            const childrenList = new List(d.children);
            if (!d._children) {
                d._children = childrenList.toJS();
            } else {
                d._children = childrenList.concat(_childrenList).toJS();
            }
            d._children.forEach(this.collapse)
            d.children = null;
        }
    }

    showPerPage = (d) => {
        if (d.children) {
            this.initializePageDetails(d)
            const { currentPage } = d;
            const childrenList = new List(d.children);

            const updatedChildren = childrenList.filter((d1) => currentPage === d1.pageNo).toJS();
            const updatedAltChildren = childrenList.filter((d1) => currentPage !== d1.pageNo).toJS();

            d.children = updatedChildren;
            d._children = updatedAltChildren;
        }
    }

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
                    const x = (d.type == "next") ? p2.y : p1.y;
                    const y = (d.type == "prev") ? (p2.x - 30) : (p1.x + 30);
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
                    if (d.type == "next") {
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
        this.root.children.forEach(this.collapse);

        this.initializePageDetails(this.root);
        this.showPerPage(this.root);
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
        this.updatePageLinks();

        // Store the old positions for transition.
        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    updateNodes = (source, nodes) => {
        // update graph
        const svg = this.getGraphContainer();

        let i = 0,
            duration = 750;

        // ****************** Nodes section ***************************

        // Update the nodes...
        const node = svg.selectAll('g.node')
            .data(nodes, (d) => { return d.id || (d.id = ++i); });

        // Enter any new modes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", (d) => {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', this.click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style("fill", (d) => {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", (d) => {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", (d) => {
                return d.children || d._children ? "end" : "start";
            })
            .text((d) => { return d.data.name; });

        // UPDATE
        const nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", (d) => {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style("fill", (d) => {
                const nodeColor = d.parent ? this.colorScale(d.parent.id) : this.colorScale();
                return d.data.children ? nodeColor : "white";
            })
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        const nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", (d) => {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);
    }

    updateLinks = (source, links) => {
        // update graph
        const svg = this.getGraphContainer();;

        let i = 0,
            duration = 750;

        // ****************** links section ***************************

        // Update the links...
        const link = svg.selectAll('path.link')
            .data(links, (d) => { return d.id; });

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', (d) => {
                const o = { x: source.x0, y: source.y0 }
                return diagonal(o, o)
            });

        // UPDATE
        const linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', (d) => {
                return diagonal(d, d.parent)
            });

        // Remove any exiting links
        const linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', (d) => {
                const o = { x: source.x, y: source.y }
                return diagonal(o, o)
            })
            .remove();
    }

    render() {
        const { width, height } = this.props;
        const { refresh } = this.state;
        return (
            <div className="line-graph">
                <svg width={width} height={height} updateSVG={refresh}>
                    <g ref={node => this.node = node} width={width} height={height} updateSVG={refresh}>
                        <g className='line-graph-container' updateSVG={refresh} ></g>
                    </g>
                </svg>
            </div>
        );
    }
}
TreeGraph.propTypes = {
    configuration: React.PropTypes.object,
    response: React.PropTypes.object,
    parseData: React.PropTypes.func,
    fetchChildren: React.PropTypes.func,
};

export default TreeGraph;
