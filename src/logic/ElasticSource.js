import * as elasticsearch from 'elasticsearch-browser';
import elasticQuery from './elasticQuery.js';

class ElasticSource {
    constructor() {
        this.queryBase = elasticQuery;
        this.es = new elasticsearch.Client({
          host: {
            host: '35.204.28.131',
            port: 9200,
          }
        });
    }

    getAuthors(query_params, source, size) {

        if (size === undefined) size = 50; // TODO: Think about good default

        let search = query_params.search;
        let affialition = query_params.affiliation;

        if (search) {
            search = search.replace(/(^|\s)(\w+:)/g, "$1papers.$2");
        }

        let query = JSON.parse(JSON.stringify(this.queryBase));  // Deep copy

        if (!query.bool) query.bool = {};
        if (!query.bool.must) query.bool.must = [];
        if (!query.bool.filter) query.bool.filter = [];

        query.bool.must = query.bool.must.concat([
            {
                "nested": {
                    "path": "papers",
                    "score_mode": "sum",
                    "query": {
                        "query_string": {
                            "query": search
                        }
                    }
                }
            }
        ]);
        query.bool.filter = query.bool.filter.concat([
            {
                "match_phrase": {
                    "latest_affiliation.affiliation.affstr": affialition
                }
            }
        ]);

        // Construct body
        let body = {
          "size": size,
          "_source": source || [],
          "query": query
        }

        // Perform request
        return this.es.search({index: 'authors', body: body});
    }

    getAuthorsById(ids) {
        return this.es.search({
            index: 'authors',
            body: {
                "size": 10000,  // TODO: do properly
                "_source": [],
                "query": {
                    "ids": {
                        "values": ids
                    }
                }
            }
        })
    }
}

export default ElasticSource;
