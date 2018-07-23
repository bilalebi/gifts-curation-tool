import React from 'react';
import { Link } from 'react-router-dom';
import Status from './Status';
import Paginator from './Pagination';
import '../../styles/ResultsTable.css';

function ResultsTable(props) {
  if (props.data.results) {
    return (
      <Paginator.Pagination fetchPage={props.fetchPage} currentPage="1" itemsPerPage="20">
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
          <Paginator.Page>
            <Paginator.Item
              template={row => (
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
                        <div className="table-cell">{mapping.ensemblTranscript.seqRegionStart}</div>
                        <div className="table-cell">{mapping.ensemblTranscript.seqRegionEnd}</div>
                        <div className="table-cell">{mapping.uniprotEntry.uniprotAccession}</div>
                        <div className="table-cell">{row.taxonomy.species}</div>
                      </Link>
                    );
                  })}
                </div>
              )}
            />
          </Paginator.Page>
        </div>
        <Paginator.Pager
          template={button => () => (
            <button className={`button ${button.classes}`} onClick={button.onClick}>
              {button.label}
            </button>
          )}
        >
          <Paginator.Previous />
          <Paginator.Steps />
          <Paginator.Next />
        </Paginator.Pager>
      </Paginator.Pagination>
    );
  }
  return <div>Loading</div>;
}

export default ResultsTable;
