import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import cyspringy from 'cytoscape-springy';
import './GraphView.css'

class GraphView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            renderedPositions:{},
        };
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        let renderedPositions={};
        for (let i=0;i<this.cy.nodes()['length'];i++){
            renderedPositions[this.cy.nodes()[i].data()['id']]={x:this.cy.nodes()[i].position('x'),y:this.cy.nodes()[i].position('y')};
        }
        this.setState({
            renderedPositions:renderedPositions
        });
        this.props.onSelect(event.target.id());
    }

    reloadGraph(operation) {
        if (operation === "search" || Object.keys(this.state.renderedPositions).length === 0) {

            let elems = [];
            for (let author_id in this.props.authors) {

                let author = this.props.authors[author_id];
                if ((this.props.showState !== undefined &&
                     !this.props.showState.includes(author.status)) ||
                    (this.props.showOrigin !== undefined &&
                     !this.props.showOrigin.includes(author.origin))) {

                    continue;
                }

                elems.push({
                    group: 'nodes',
                    data: {
                        id: author._id,
                        name: author.name,
                        score: author.score,
                        npapers: author.paper_stats.npapers,
                        selected: author._id === this.props.selected,
                        qualified: author.status === 'qualified',
                    },
                    selected: false,
                    selectable: true,
                    grabbable: false,
                });
                for (let coauthor of author.coauthors) {
                    if (this.props.authors.hasOwnProperty(coauthor._id)) {
                        elems.push({
                            group: 'edges',
                            data: {
                                source: author._id,
                                target: coauthor._id,
                            },
                            selected: false,
                            selectable: false,
                            grabbable: false,
                        });

                    }
                }
            }

            this.cy.elements().remove();
            this.cy.add(elems);

            cyspringy(cytoscape);
            this.cy.layout({
                name: 'springy',
                animate: true, // whether to show the layout as it's running
                maxSimulationTime: 15000, // max length in ms to run the layout
                fit: true, // whether to fit the viewport to the graph
                padding: 30, // padding on fit
                randomize: false, // whether to use random initial positions
                infinite: false, // overrides all other options for a forces-all-the-time mode

                // springy forces and config
                stiffness: 15,
                repulsion: 600,
                damping: 0.5,
                edgeLength: function( edge ){
                    var length = edge.data('length');
                    if( length !== undefined && !isNaN(length) ){
                      return length;
                    }
                }
            }).run();
        } else {
            let elems = [];
            for (let author_id in this.props.authors) {

                let author = this.props.authors[author_id];
                if ((this.props.showState !== undefined &&
                     !this.props.showState.includes(author.status)) ||
                    (this.props.showOrigin !== undefined &&
                     !this.props.showOrigin.includes(author.origin))) {

                    continue;
                }

                elems.push({
                    group: 'nodes',
                    data: {
                        id: author._id,
                        name: author.name,
                        score: author.score,
                        npapers: author.paper_stats.npapers,
                        selected: author._id === this.props.selected,
                        qualified: author.status === 'qualified',
                    },
                    position:{
                        x: this.state.renderedPositions[author._id].x,
                        y: this.state.renderedPositions[author._id].y,
                    },
                    selected: false,
                    selectable: true,
                    grabbable: false,
                });
                for (let coauthor of author.coauthors) {
                    if (this.props.authors.hasOwnProperty(coauthor._id)) {
                        elems.push({
                            group: 'edges',
                            data: {
                                source: author._id,
                                target: coauthor._id,
                            },
                            selected: false,
                            selectable: false,
                            grabbable: false,
                        });

                    }
                }
            }

            this.cy.elements().remove();
            this.cy.add(elems);
        }
    }

    componentDidMount() {
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: [],
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(name)',
                        'background-fit': 'contain',
                        'background-color': (ele) =>
                            ele.data('selected') ? 'white' : '#ffae0d',
                        'border-color': (ele) =>
                            ele.data('qualified') ? 'green': '#ffae0d',
                        'border-width': (ele) => ele.data('qualified') ? 2 : 0,
                        'width': 'mapData(npapers, 0, 200, 10, 100)',
                        'height': 'mapData(npapers, 0, 200, 10, 100)',
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                    }
                }
            ]
        });

        this.cy.on('select', this.onClick);

        this.reloadGraph();
    }

    render() {

        if (this.cy) this.reloadGraph(this.props.operation);

        return (
            <div id="cy"></div>
        );

    }
}

export default GraphView;
