import gql from 'graphql-tag';

export default gql`
query getList($id: ID!) {
    authorList(id: $id) {
        authorIDs
    }
}`;
