import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { Auth } from 'aws-amplify';
import { AUTH_TYPE } from "aws-appsync/lib/link/auth-link";
import AWSAppSyncClient from "aws-appsync";
import { Grid, Button } from 'semantic-ui-react';
import SearchBar from '../SearchBar/SearchBar.js';
import ListView from '../ListView/ListView.js';
import GraphView from '../GraphView/GraphView.js';
import AuthorPanel from '../AuthorPanel/AuthorPanel.js';
import ElasticSource from '../../logic/ElasticSource.js';
import getList from '../../graphql/getList.js';
import updateList from '../../graphql/updateList.js';

class App extends Component {

	constructor(props) {
		super(props);
		this.authorSource = new ElasticSource();
        this.gqlClient = new AWSAppSyncClient({
            url: 'https://gknwljusgbewvkj6bnqqrd7spe.appsync-api.eu-central-1.amazonaws.com/graphql',
            region: 'eu-central-1',
            disableOffline: true,
            auth: {
                type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
                jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken()
            },
        });
		this.state = {
			authorIndex: {},
            qualified: new Set(),
            disqualified: new Set(),
			selected: undefined,
            showDisqualified: false,
            operation: "search",
		}

		this.onSearch = this.onSearch.bind(this);
		this.onSelect = this.onSelect.bind(this);
		this.onChangeAuthorState = this.onChangeAuthorState.bind(this);
        this.onShowDisqualified = this.onShowDisqualified.bind(this);
        this.closeAuthorPanel = this.closeAuthorPanel.bind(this);
	}

	componentDidMount() {

        // Load lists
        this.gqlClient.query({query: getList, variables: {id: 'qualified'}})
            .then((r) => {
                let authorList = r.data.authorList;
                if (authorList && authorList.authorIDs.length !== 0) {
					let qualified = new Set(authorList.authorIDs);
					// Download qualified author data
					this.authorSource.getAuthorsById([...qualified]).then(
						authors => {
							let newAuthorIndex = {}
							for (let hit of authors.hits.hits) {
								let id = hit['_id'];
								let author = {...hit['_source']};
								author._id = id;
								author.score = '?';
								author.origin = 'user';
								author.status = 'qualified';
								newAuthorIndex[id] = author;
							}

							this.setState((prevState) => {
								for (let authorID in prevState.authorIndex) {
									let author = prevState.authorIndex[authorID];
									if (authorID in qualified) {
										author = {...author, status: 'qualified'};
									}
									newAuthorIndex[authorID] = author;
								}

								console.log(newAuthorIndex);

								return {
									authorIndex: newAuthorIndex,
									qualified: qualified
								};
							});
						}
					);
                }
            });
        this.gqlClient.query({query: getList, variables: {id: 'disqualified'}})
            .then((r) => {
                let authorList = r.data.authorList;
                if (authorList && authorList.authorIDs.length !== 0) {
                    this.setState((prevState) => {

                        let newAuthorIndex = {};
                        for (let key in authorList.authorIDs) {
                            let newAuthor = {
                                ...prevState.authorIndex[key],
                                status: 'disqualified'
                            };
                            newAuthorIndex[key] = newAuthor;
                        }

                        return {
                            authorIndex: {...prevState.authorIndex, ...newAuthorIndex},
                            disqualified: new Set(authorList.authorIDs)
                        }
                    });
                }
            });

		// Live chat
		window.intergramOnOpen = {};
        window.intergramOnOpen.visitorName = 'GUEST';  // Tmp until Amplify returns username
        window.intergramId = "-306549634";
        window.intergramCustomizations = {
            titleClosed: "Let's talk",
            titleOpen: "Let's talk",
            introMessage: "Feel free to ask or write us any ideas. We are usually here during working hours.",
            autoResponse: "Someone will be right with you in a few moments. We are usually here during working hours.",
            autoNoResponse: "It seems that there's no one at the other end at this time. We'll get back to you as soon as possible, by email or right here.",
            mainColor: "#ffae0d", // Can be any css supported color 'red', 'rgb(255,87,34)', etc
        };
		Auth.currentAuthenticatedUser().then(function(user) {
			window.intergramOnOpen.visitorName = user.username;
	    })
	}

	onSearch(query, callback) {
        let fields = [
            'name', 'coauthors', 'paper_stats.npapers',
            'latest_affiliation.affiliation.affstr',
            'latest_affiliation.institution.name',
            'papers.title', 'papers.keywords', 'papers.date',
        ];
		this.authorSource.getAuthors(query, fields).then(
            authors => {
    			this.setState((prevState) => {
                    if(callback) callback();

                    let selected;
        			let authorIndex = {};

					// Add new authors to index
        			for (let hit of authors.hits.hits) {
        				let id = hit['_id'];
        				let score = hit['_score']
        				let author = {...hit['_source']};
        				author._id = id;
        				author.score = score;
						author.origin = 'search';

                        if (prevState.qualified.has(id)) {
                            author.status = 'qualified';
                        } else if (prevState.disqualified.has(id)) {
                            author.status = 'disqualified';
                        } else {
                            author.status = null;
                        }

        				authorIndex[id] = author;
    					if (!selected) selected = id;
        			}

					// Recover qualified authors not in index
					for (let authorID of prevState.qualified) {
						if (!authorIndex.hasOwnProperty(authorID) &&
						    prevState.authorIndex.hasOwnProperty(authorID)) {

							authorIndex[authorID] = prevState.authorIndex[authorID];
							authorIndex[authorID].origin = 'user';
						}
					}

                    return {authorIndex: authorIndex, selected: selected};
                });
		    }
        );
        this.setState({operation:"search"});
	}

	onSelect(id) {
		this.setState({selected:id});
        this.setState({operation:"non-search"});
	}

	onChangeAuthorState(id, state) {
		this.setState((prevState) => {

			// Copy for inmutability
			let qualified = new Set(prevState.qualified);
			let disqualified = new Set(prevState.disqualified);

			// Update lists
            switch (state) {
                case 'qualified':
                    qualified.add(id);
                    disqualified.delete(id);
                    break;
                case 'disqualified':
                    qualified.delete(id);
                    disqualified.add(id);
                    break;
                default:
                    qualified.delete(id);
                    disqualified.delete(id);
            }

			// Persist
            this.gqlClient.mutate({
                mutation: updateList,
                variables: {
                    id: 'qualified',
                    authorIDs: [...qualified],
                }
            });
            this.gqlClient.mutate({
                mutation: updateList,
                variables: {
                    id: 'disqualified',
                    authorIDs: [...disqualified],
                }
            });

			// Create new authorIndex immutably
			let authorIndex = {
				...prevState.authorIndex,
				[id]:{
					...prevState.authorIndex[id],
					status: state
				}
			};

			// Return new state
            return {
				qualified: qualified,
				disqualified: disqualified,
    			authorIndex: authorIndex,
            }
		});
        this.setState({operation:"non-search"});
	}

    onShowDisqualified() {
        this.setState((prevState) =>
            ({showDisqualified: !prevState.showDisqualified}));
        this.setState({operation:"non-search"});
    }

    closeAuthorPanel() {
        this.setState({selected: undefined});
        this.setState({operation:"non-search"});
    }

    render() {
        return (
			<div>
                <Grid divided='vertically' columns="equal"
                      stretched style={{height: "100vh"}}>
                    <Grid.Row columns={1}>
                        <Grid.Column>
                            <SearchBar onSearch={this.onSearch} />
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Button
                                onClick={this.onShowDisqualified}
                                color={this.state.showDisqualified ?
                                    'purple' : 'grey'}
                            >
                                Show disqualified
                            </Button>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Column width={3}>
                        <ListView
        	        		authors={this.state.authorIndex}
        	        		showState={this.state.showDisqualified
                                ? [null, 'disqualified'] : [null]}
							showOrigin={['search']}
        	        		onSelect={this.onSelect}
        	        		selected={this.state.selected}
        	        		onChangeAuthorState={this.onChangeAuthorState}
        	        	/>
                    </Grid.Column>
                    <Grid.Column width={3}>
						{this.state.selected &&
                            <AuthorPanel
                                author={
                                    this.state.authorIndex[this.state.selected]}
                                onChangeAuthorState={this.onChangeAuthorState}
                                closeAuthorPanel={this.closeAuthorPanel}
                            />
						}
                    </Grid.Column>

                    <Grid.Column style={{minHeight: "80%"}}>
                        <GraphView id='graph'
        	        		authors={this.state.authorIndex}
                            showState={this.state.showDisqualified
                                ? undefined : ['qualified', null]}
							showOrigin={['search']}
        	        		onSelect={this.onSelect}
        	        		selected={this.state.selected}
                            operation={this.state.operation}
        	        		onChangeAuthorState={this.onChangeAuthorState}
        	        	/>
                    </Grid.Column>
                    <Grid.Column width={3}>
                        <ListView
        	        		authors={this.state.authorIndex}
        	        		showState={['qualified']}
        	        		onSelect={this.onSelect}
        	        		selected={this.state.selected}
        	        		onChangeAuthorState={this.onChangeAuthorState}
        	        	/>
                    </Grid.Column>
                </Grid>







                {/*<ListView id='lead-list'
	        		authors={this.state.authorIndex}
	        		showState='qualified'
	        		onSelect={this.onSelect}
	        		selected={this.state.selected}
	        		onChangeAuthorState={this.onChangeAuthorState}
	        	/>*/}


                {/* TODO: Live chat*/}

			</div>
        );
    }
}

export default withAuthenticator(App);
