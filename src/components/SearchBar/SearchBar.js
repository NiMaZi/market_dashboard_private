import React, { Component } from 'react';
import { Segment, Input, Grid, Label } from 'semantic-ui-react';
import QueryHelp from '../QueryHelp/QueryHelp.js';

class SearchBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            search: 'abstract:"single molecule"',
            affiliation: 'Vrije Universiteit Amsterdam',
            focused: false,
            loading: false,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleNotLoading = this.handleNotLoading.bind(this);
    }

    componentDidMount() {
        this.props.onSearch({
            'search': this.state.search,
            'affiliation': this.state.affiliation,
        });
    }

    handleSubmit(event) {
        this.setState({loading: true});
        this.props.onSearch(
            {
                'search': this.state.search,
                'affiliation': this.state.affiliation,
            },
            this.handleNotLoading
        );
        event.preventDefault();
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleFocus(event) {
        this.setState({focused: true});
    }

    handleBlur(event) {
        this.setState({focused: false});
    }

    handleNotLoading() {
        this.setState({loading: false});
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <Segment inverted>
                    <Grid columns="equal" stretched>
                        <Grid.Column>
                            <Input type="text" name="search"
                                fluid
                                icon={{ name: 'search', circular: true, link: true }}
                                loading={this.state.loading}
                                value={this.state.search}
                                onChange={this.handleChange}
                                labelPosition="right"
                            >
                                <Label>Search</Label>
                                <input />
                                <QueryHelp>
                                    <Label color='teal'>?</Label>
                                </QueryHelp>
                            </Input>
                        </Grid.Column>
                        <Grid.Column>
                            <Input type="text" name="affiliation" label='Affiliation'
                                fluid
                                icon={{ name: 'search', circular: true, link: true }}
                                loading={this.state.loading}
                                value={this.state.affiliation}
                                onChange={this.handleChange} />
                        </Grid.Column>
                        <button type="submit" style={{display: "none"}}></button>
                    </Grid>
                </Segment>
            </form>
        );
    }
}

export default SearchBar;
