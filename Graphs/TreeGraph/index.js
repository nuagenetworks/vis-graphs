import React from "react";
import * as d3 from "d3";
import AbstractGraph from "../AbstractGraph";
import { properties } from "./default.config";
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
        // this.update();
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

        // this.update();
    }

    getGraph() {
        return this.getSVG();
    }

     /////////////////// PGING FUNCS

    paginate = (d) => {
        d.parent.page = d.no;
        this.setPage(d.parent);
        this.update(this.root);
    }

    setPage = (d) => {
        if (d && d.kids) {
            d.children = [];
            d.kids.forEach((d1, i) => {
                if (d.page === d1.pageNo) {
                    d.children.push(d1);
                }
            })
        }
    }

    reset = (d) => {

        if (d && d.kids) {
            d.page = 1;
            d.children = [];
            d.kids.forEach((d1, i) => {
                d1.pageNo = Math.ceil((i + 1) / PAGINATION);
                if (d.page === d1.pageNo) {
                    d.children.push(d1)
                }
                this.reset(d1);
            })
        }
    }

    initiate = (props) => {
        const {
            data,
            height,
            width
        } = props;

        if (!data || !data.length)
            return;

        this.root = d3.hierarchy(data[0], (d) => { return d.children; });
        this.root.x0 = height / 2;
        this.root.y0 = 0;

        this.reset(this.root.data)

        // Collapse after the second level
        // this.root.kids.forEach(this.collapse);
        // this.update(this.root);
    }

    // generate methods which helps to create charts
    elementGenerator = () => {
        const svg = this.getGraph();

        // for generating transition   
        svg.select('.line-graph-container')
            .attr("transform", "translate(100, 0)")

        this.update(this.root)
    }

    parseData = (props) => {
        // TODO: parse input data from redux into graph format
    }

    update = (source) => {
        // update graph
        const svg = this.getGraph().select('.line-graph-container');

        let i = 0,
            duration = 750;

        // declares a tree layout and assigns the size
        const treemap = d3.tree().size([this.props.height, this.props.width])
            .separation((a, b) => {
                return a.parent == b.parent ? 1 : 3;
            });

        // Assigns the x and y position for the nodes
        const treeData = treemap(this.root);

        // Compute the new tree layout.
        const nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach((d) => { d.y = d.depth * 180 });

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
                return d.children || d._children ? -10 : 10;
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
                const sam = d.parent ? this.colorScale(d.parent.id) : this.colorScale();
                return d._children ? "white" : sam;
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
            .attr('d', (d) => { return diagonal(d, d.parent) });

        // Remove any exiting links
        const linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', (d) => {
                const o = { x: source.x, y: source.y }
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        const parents = nodes.filter((d) => {
            return (d.kids && d.kids.length > PAGINATION) ? true : false;
        });
        svg.selectAll(".page").remove();
        parents.forEach((p) => {
            if (p._children)
                return;
            const p1 = p.children[p.children.length - 1];
            const p2 = p.children[0];
            let pagingData = [];
            if (p.page > 1) {
                pagingData.push({
                    type: "prev",
                    parent: p,
                    no: (p.page - 1)
                });
            }
            if (p.page < Math.ceil(p.kids.length / PAGINATION)) {
                pagingData.push({
                    type: "next",
                    parent: p,
                    no: (p.page + 1)
                });
            }

            const pageControl = svg.selectAll(".page");
            
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

    collapse = (d) => {
        // collapse graph
        if (d.children) {
            d._children = d.children
            d._children.forEach(this.collapse)
            d.children = null
        }
    }

    click = (d) => {
        // Toggle children on click.
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        this.update(d);
    }

    render() {
        const { width, height } = this.props;
        return (
            <div className="line-graph">
                <svg width={width} height={height}>
                    <g ref={node => this.node = node} height={width} height={height}>
                        <g className='line-graph-container' ></g>
                        <g className='legend'></g>
                    </g>
                </svg>
            </div>
        );
    }
}
TreeGraph.propTypes = {
    configuration: React.PropTypes.object,
    response: React.PropTypes.object
};

export default TreeGraph
