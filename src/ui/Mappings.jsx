import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import isEqual from 'lodash-es/isEqual';

import LoadingSpinner from './components/LoadingSpinner';
import ResultsTable from './components/ResultsTable';

import '../styles/Home.css';

let isLoading = true;

class Mappings extends Component {
  state = {
    results: null,
    facets: {},
  }

  handlePageClick = (data) => {
    const initialPage = data.selected;
    const offset = Math.ceil(this.props.initialPage * this.props.limit);

    if (offset === this.props.offset && initialPage === this.props.initialPage) {
      return;
    }

    this.setState({
      results: null,
    });

    this.props.changePageParams({
      offset,
      initialPage,
    });
  };

  componentDidMount() {
    this.loadResults();
  }

  componentDidUpdate(prevProps) {
    if (
      isLoading ||
      null === this.state.results ||
      !isEqual(prevProps.activeFacets, this.props.activeFacets) ||
      prevProps.searchTerm !== this.props.searchTerm
    ) {
      this.loadResults();
    }
  }

  getFacetsAsString = () =>
    Object.keys(this.props.activeFacets || {})
      .map(key => `${key}:${this.props.activeFacets[key]}`)
      .join(',');

  loadResults = () => {
    isLoading = true;
    const { history, clearSearchTerm } = this.props;
    const apiURI = `${API_URL}/mappings`;
    const params = {
      searchTerm: this.props.searchTerm,
      facets: this.getFacetsAsString(),
      offset: this.props.offset,
      limit: this.props.limit,
      format: 'json',
    }

    axios
      .get(apiURI, { params })
      .then(({ data, status }) => {
        if (status === 204) {
          clearSearchTerm(() => {
            history.push(`${BASE_URL}/no-results`);
          });

          return;
        }

        const onlyIsoforms = data.results.every(d =>
          d.entryMappings.every(mapping => !mapping.uniprotEntry.isCanonical));

        const groupedResults = this.groupByIsoform(data.results);

        this.setState({
          params: this.props.params,
          facets: data.facets,
          results: groupedResults,
          totalCount: data.count,
          displayIsoforms: onlyIsoforms,
        }, () => {
          isLoading = false;
        });
      })
      .catch((e) => {
        console.log(e);
        history.push(`${BASE_URL}/error`);
      });
  };

  groupByIsoform = results =>
    results.map(row => ({
      taxonomy: row.taxonomy,
      canonical: row.entryMappings.filter(mapping => mapping.uniprotEntry.isCanonical === true),
      isoforms: row.entryMappings.filter(mapping => mapping.uniprotEntry.isCanonical === false),
    }));

  render() {
    const propsToPass = {
      addFilter: this.props.addFilter,
      removeFilter: this.props.removeFilter,
      handlePageClick: this.handlePageClick,
      activeFacets: this.props.activeFacets,
      params: {
        offset: this.state.offset,
        limit: this.state.limit,
        format: 'json',
      },
      facets: this.state.facets,
      results: this.state.results,
      loadResults: this.loadResults,
      pageCount: Math.ceil(this.state.totalCount / this.props.limit),
      history: this.props.history,
      initialPage: this.props.initialPage,
      clearSearchTerm: this.props.clearSearchTerm,
    };

    return (isLoading || null === this.state.results)
      ? <LoadingSpinner />
      : <ResultsTable {...propsToPass} />;
    
  }
}

Mappings.propTypes = {
  searchTerm: PropTypes.string,
  defaultOrganism: PropTypes.number,
  history: PropTypes.object.isRequired,
  clearSearchTerm: PropTypes.func,
};

Mappings.defaultProps = {
  searchTerm: '',
  defaultOrganism: null,
  clearSearchTerm: null,
};

export default withRouter(Mappings);
