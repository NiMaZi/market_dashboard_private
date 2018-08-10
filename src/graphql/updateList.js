import gql from 'graphql-tag';

export default gql`
mutation updateList ($id: ID!, $authorIDs: [ID!]!) {
    putAuthorList(id: $id, authorIDs: $authorIDs)
}`;
