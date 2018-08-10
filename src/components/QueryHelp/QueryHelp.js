import React, { Component } from 'react';
import { Popup, Divider, List, Icon } from 'semantic-ui-react';

class QueryHelp extends Component{

	render() {
        return (
            <Popup trigger={this.props.children} wide='very' >
				<Popup.Header>Query Syntax</Popup.Header>
				<Popup.Content>
					<Divider/>
						<h4>Use quotes to query a phrase</h4>
						<List>
							<List.Item style={{fontFamily: "monospace"}}>
								<List.Icon name='search' style={{marginRight: '8px'}}/>
								"Atomic Force Microscope"
							</List.Item>
							<List.Item style={{fontFamily: "monospace"}}>
								<List.Icon name='search' style={{marginRight: '8px'}}/>
								"Cognitive Psychology"
							</List.Item>
							<List.Item style={{fontFamily: "monospace"}}>
								<List.Icon name='search' style={{marginRight: '8px'}}/>
								"Cell Culture"
							</List.Item>
						</List>
						<h4>Multiple terms without quotes are interpreted as OR:</h4>
						<div style={{fontFamily: "monospace"}}>
							Cognitive Psychology
							<Icon name='angle right' inline />
							Cognitive OR Psychology
						</div>
					<Divider/>
						<h4>Use AND, OR, NOT to combine queries</h4>
						<List>
							<List.Item style={{fontFamily: "monospace"}}>
								<List.Icon name='search' style={{marginRight: '8px'}}/>
								"protein" AND (AFM OR "Atomic Force Microscope")
							</List.Item>
							<List.Item style={{fontFamily: "monospace"}}>
								<List.Icon name='search' style={{marginRight: '8px'}}/>
								"behaviour" AND EEG AND NOT fMRI
							</List.Item>
						</List>
					<Divider/>
						<h4>Search fields</h4>
						You can search in <b>title</b>, <b>abstract</b>, <b>body</b> and
					    <b>keywords</b>.
						<List>
							<List.Item style={{fontFamily: "monospace"}}>
								<List.Icon name='search' style={{marginRight: '8px'}}/>
								title:protein AND keywords:protein AND body:AFM
							</List.Item>
							<List.Item style={{fontFamily: "monospace"}}>
								<List.Icon name='search' style={{marginRight: '8px'}}/>
								abstract:(tissue AND viscoelasticity)
							</List.Item>
						</List>
					<Divider/>
						<h4>Fuzzyness and Proximity</h4>
						Using <b>~</b> on a term will express spelling
						flexibility (Levenshtein Edit Distance).
						<br/>
						<div style={{fontFamily: "monospace"}}>
							neural <b>&ne;</b> neuron
							<br/>
							neural~2 <b>=</b> neuron
						</div>
						<br/>
						Using it on a phrase will determine how many other
						words can be between the terms in the phrase.
						<br/>
						<div style={{fontFamily: "monospace"}}>
							"fluorecent microscopy" <b>&ne;</b>
						    "fluorecent and confocal microscopy"
							<br/>
							"fluorecent microscopy"~2 <b>=</b>
						    "fluorecent and confocal microscopy"
						</div>
					<Divider/>
						<h4>Stemming</h4>
						You don't need to worry about simple morphological
						variations, such as plurals.
						<br/><br/>
						<div style={{fontFamily: "monospace"}}>
							microscopy <b>=</b>	microscope
						</div>
						<div style={{fontFamily: "monospace"}}>
							cells <b>=</b> cell
						</div>
				</Popup.Content>
			</Popup>
        )
	}
}

export default QueryHelp;
