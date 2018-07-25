import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate';

import Status from './Status';
import Filters from './Filters';

import '../../styles/ResultsTable.css';

class ResultsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 0,
      limit: 15,
      facets: [],
      results: [],
      totalCount: 0,
    };
  }

  componentDidMount() {
    this.loadResults();
  }

  handlePageClick = (data) => {
    const selected = data.selected;
    const offset = Math.ceil(selected * this.state.limit);
    this.setState({ offset }, () => {
      this.loadResults();
    });
  };

  loadResults = () => {
    const apiURI = 'http://193.62.52.185:5000/gifts/mappings';
    const params = {
      offset: this.state.offset,
      limit: this.state.limit,
      ...this.props.params,
      format: 'json',
    };
    axios
      .get(apiURI, { params })
      .then(d =>
        this.setState({ facets: d.data.facets, results: d.data.results, totalCount: d.data.count }))
      .catch(e => console.log(e));
  };

  render() {
    if (this.state.totalCount > 0) {
      return (
        <Fragment>
          <h2>Mappings</h2>
          <div className="row">
            <div className="column medium-2">
              <Filters
                data={this.state.facets}
                addFilter={this.props.addFilter}
                removeFilter={this.props.removeFilter}
              />
            </div>
            <div className="column medium-10">
              <div className="table tbody-zebra">
                <div className="table-head">
                  <div className="table-row">
                    <div className="table-cell" />
                    <div className="table-cell">Gene</div>
                    <div className="table-cell">Transcript</div>
                    <div className="table-cell">Start</div>
                    <div className="table-cell">End</div>
                    <div className="table-cell">Protein</div>
                    <div className="table-cell">Organism</div>
                  </div>
                </div>
                {this.state.results.map(row => (
                  <div
                    className="table-body"
                    key={row.entryMappings.reduce(
                      (total, mapping) =>
                        (total ? `${total}_${mapping.mappingId}` : mapping.mappingId),
                      undefined,
                    )}
                  >
                    {row.entryMappings.map((mapping) => {
                      const key = `${mapping.ensemblTranscript.enstId}_${
                        mapping.uniprotEntry.uniprotAccession
                      }`;
                      return (
                        <Link to={`/mapping/${mapping.mappingId}`} key={key} className="table-row">
                          <div className="table-cell">
                            <Status status={mapping.status} />
                          </div>
                          <div className="table-cell">{mapping.ensemblTranscript.enstId}</div>
                          <div className="table-cell">{mapping.ensemblTranscript.ensgId}</div>
                          <div className="table-cell">
                            {mapping.ensemblTranscript.seqRegionStart}
                          </div>
                          <div className="table-cell">{mapping.ensemblTranscript.seqRegionEnd}</div>
                          <div className="table-cell">{mapping.uniprotEntry.uniprotAccession}</div>
                          <div className="table-cell">{row.taxonomy.species}</div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
              <ReactPaginate
                pageCount={Math.ceil(this.state.totalCount / this.state.limit)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={this.handlePageClick}
                containerClassName="results-paginate"
              />
            </div>
          </div>
        </Fragment>
      );
    }
    return null;
  }
}
export default ResultsTable;
