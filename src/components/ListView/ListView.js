import React, { Component } from 'react';
import { List, Header, Button } from 'semantic-ui-react';
import FileSaver from 'file-saver';
import AuthorCard from '../AuthorCard/AuthorCard.js';

class ListView extends Component {

	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	onClick(key) {
		this.props.onSelect(this.props.authors[key]._id);
	}

	onQualify(key) {
		this.props.onChangeAuthorState(this.props.authors[key]._id,'qualified');
	}

	onDis(key) {
		this.props.onChangeAuthorState(this.props.authors[key]._id,'disqualified');
	}

	onUndo(key) {
		this.props.onChangeAuthorState(this.props.authors[key]._id,null);
	}

    onSave() {
        let toSave = "Author,Affiliation\n";
        for (let key in this.props.authors) {
            if (this.props.authors[key].status === 'qualified'){
                toSave += (this.props.authors[key].name.toString()
                        + ',"'
                        + this.props.authors[key].latest_affiliation.affiliation.affstr.toString()
                        + '"\n');
            }
        }
        var blob = new Blob([toSave],{type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob,"leads.csv");
    }

    render() {
    	let authorCards=[];
    	for (let key in this.props.authors) {

			let author = this.props.authors[key];
			if ((this.props.showState !== undefined &&
				 !this.props.showState.includes(author.status)) ||
				(this.props.showOrigin !== undefined &&
				 !this.props.showOrigin.includes(author.origin))) {

				continue;
			}

    		authorCards.push(
    			<AuthorCard
    				key={this.props.authors[key]._id}
    				onClick={()=>this.onClick(key)}
    				onQualify={()=>this.onQualify(key)}
    				onDis={()=>this.onDis(key)}
    				onUndo={()=>this.onUndo(key)}
    				status={this.props.authors[key].status}
    				author={{
    					...this.props.authors[key],
    					selected: false
    				}}
    			/>
    		);
    	}

        return (
            <div style={{height: "82vh", overflow: "scroll"}}>
                <Header as='h3' dividing>
                    {authorCards.length}
                    {authorCards.length === 50 ? '+ ' : ' '  /* TODO: Remove */}
                    authors
                </Header>
                {this.props.showState.includes('qualified') &&
                    <Button onClick={()=>this.onSave()}>Save</Button>
                }
                <List>{authorCards}</List>
            </div>
        );
    }
}

export default ListView;
