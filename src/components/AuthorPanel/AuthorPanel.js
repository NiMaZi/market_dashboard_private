import React, { Component } from 'react';
import { Card, Button, Divider, Label } from 'semantic-ui-react';

class AuthorPanel extends Component{

    constructor(props) {
        super(props);

        this.onQualify = this.onQualify.bind(this);
        this.onDis = this.onDis.bind(this);
        this.onUndo = this.onUndo.bind(this);
    }

    onQualify() {
		this.props.onChangeAuthorState(this.props.author._id, 'qualified');
	}

	onDis() {
		this.props.onChangeAuthorState(this.props.author._id, 'disqualified');
	}

	onUndo() {
		this.props.onChangeAuthorState(this.props.author._id, null);
	}

	render() {

        let latest_papers = this.props.author.papers.sort((p1, p2) => {
            if (p1.date < p2.date) return -1;
            if (p1.date > p2.date) return 1;
            return 0;
        }).reverse().slice(0, 10);

        let latest_keywords = [...new Set(
            latest_papers
                .map((p) => p.keywords)
                .reduce((x, y) => x.concat(y), [])
                .filter((kw) => kw)
        )].slice(0, 20);

        let latest_collabs = this.props.author.coauthors.sort((c1, c2) => {
            if (c1.last < c2.last) return -1;
            if (c1.last > c2.last) return 1;
            return 0;
        }).reverse().slice(0, 10);

        let buttons;
        if (this.props.author.status === 'qualified') {
            buttons = (
                <Card.Content>
                    <Button basic color='teal' onClick={this.onUndo}>
                        Not qualified
                    </Button>
                    <Button basic icon='x' style={{float: 'right'}}
                            onClick={this.props.closeAuthorPanel}/>
                </Card.Content>
            );
        } else if (this.props.author.status === 'disqualified') {
            buttons = (
                <Card.Content>
                    <Button basic color='teal' onClick={this.onUndo}>
                        Not disqualified
                    </Button>
                    <Button basic icon='x' style={{float: 'right'}}
                            onClick={this.props.closeAuthorPanel}/>
                </Card.Content>
            );
        } else {
            buttons = (
                <Card.Content>
                    <Button basic color='green' onClick={this.onQualify}>
                        Qualify
                    </Button>
                    <Button basic color='red' onClick={this.onDis}>
                        Disqualify
                    </Button>
                    <Button basic icon='x' style={{float: 'right'}}
                            onClick={this.props.closeAuthorPanel}/>
                </Card.Content>
            );
        }

        let author = this.props.author;
        let googleLink = "https://google.com/search?q=" + author.name;
        googleLink += "%20" + author.latest_affiliation.affiliation.affstr;

		return (
            <Card fluid style={{height: "92vh", overflow: "scroll"}}>
                {buttons}
                <Card.Content>
                    <Card.Header>
                        {this.props.author.name}
                        <Button
                            circular
                            color='google plus'
                            icon='google'
                            style={{float: 'right'}}
                            href={googleLink}
                            target="_blank" />
                    </Card.Header>
                    <Card.Meta>
                        Number of publications:
                        {this.props.author.paper_stats.npapers}
                    </Card.Meta>
                    <Card.Meta>
                        Biophysics focus:
                        {this.props.author.score}
                    </Card.Meta>
                    <Card.Description>
                        {this.props.author.latest_affiliation
                            .affiliation.affstr}
                    </Card.Description>
                    <Divider />
                    <Card.Header>Latest keywords</Card.Header>
                    {latest_keywords.map((kw) =>
                        <Label key={kw} color='teal' style={{marginTop: '2px'}}>
                            {kw}
                        </Label>
                    )}
                    <Divider />
                    <Card.Header>Latest publications</Card.Header>
                    <br/>
                    {latest_papers.map((p) =>
                        <div key={p.title}>
                            <Card.Description>
                                <a href={"https://www.ncbi.nlm.nih.gov/pubmed/?term="+p.title.replace(/ /g,"%20")} target="_blank">
                                    {p.title}
                                </a>
                            </Card.Description>
                            <Card.Meta>
                                {p.date}
                            </Card.Meta>
                            <br/>
                        </div>
                    )}
                    <Divider />
                    <Card.Header>Latest collaborations</Card.Header>
                    <br/>
                    {latest_collabs.map((c) =>
                        <div key={c.last_paper_title + c.name}>
                            <Card.Description>
                                <a href={"https://www.ncbi.nlm.nih.gov/pubmed/?term="+c.last_paper_title.replace(/ /g,"%20")} target="_blank">
                                    {c.last_paper_title}
                                </a>
                            </Card.Description>
                            <Card.Meta>
                                {c.last + ' - ' + c.name}
                            </Card.Meta>
                            <br/>
                        </div>
                    )}
                </Card.Content>
            </Card>
		);
	}
}

export default AuthorPanel;
