import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';

class AuthorCard extends Component{

	constructor(props) {
		super(props);
		this.state = {
			selected: this.props.author.selected
		};

        this.handleClick = this.handleClick.bind(this);
	}

    handleClick() {
        this.props.onClick();
        this.setState((prevState) => ({selected: !prevState.selected}));
    }

	render() {

        let buttons;
        if (this.props.status === 'qualified') {
            buttons = (
                <Card.Content extra>
                    <Button basic color='teal' onClick={this.props.onUndo}>
                        Not qualified
                    </Button>
                </Card.Content>
            );
        } else if (this.props.status === 'disqualified') {
            buttons = (
                <Card.Content extra>
                    <Button basic color='teal' onClick={this.props.onUndo}>
                        Not disqualified
                    </Button>
                </Card.Content>
            );
        } else {
            buttons = (
                <Card.Content extra>
                    <Button basic color='green' onClick={this.props.onQualify}>
                        Qualify
                    </Button>
                    <Button basic color='red' onClick={this.props.onDis}>
                        Disqualify
                    </Button>
                </Card.Content>
            );
        }

        return (
            <Card fluid onClick={this.handleClick} raised={this.state.selected}>
                <Card.Content>
                    <Card.Header>{this.props.author.name}</Card.Header>
                    <Card.Meta>
                        Number of publications:
                        {this.props.author.paper_stats.npapers}
                    </Card.Meta>
                    <Card.Meta>
                        Score:
                        {this.props.author.score}
                    </Card.Meta>
                    <Card.Description>
                        {this.props.author.latest_affiliation
                            .affiliation.affstr}
                    </Card.Description>
                </Card.Content>
                {buttons}
            </Card>
        )
	}
}

export default AuthorCard;
