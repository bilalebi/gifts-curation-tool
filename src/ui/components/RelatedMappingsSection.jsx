import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import ProteinReviewStatus from './ProteinReviewStatus';
import Arrow from './Arrow';
import StatusIndicator from './StatusIndicator';
import AlignmentIndicator from './AlignmentIndicator';

const RelatedMapping = props => (
  <tr className="related-mapping">
    <td>
      <StatusIndicator status={props.status} />
    </td>
    <td>
      <Link to={`/mapping/${props.id}`}>
        <span>
          <ProteinReviewStatus entryType={props.entryType} />
          {props.uniprotAccession} (v{props.sequenceVersion})
        </span>
      </Link>
    </td>
    <td>
      {props.enstId} (v{props.enstVersion})
    </td>
    <td>{props.geneId}</td>
    <td>{props.geneName}</td>
    <td>{`${props.chromosome || 'NA'}:${props.start}-${props.end}`}</td>
    <td>
      <AlignmentIndicator difference={props.alignment_difference} />
    </td>
  </tr>
);

const RelatedMappingsSection = props => (
  <table className="related-mappings">
    <thead>
      <tr>
        <th />
        <th>Protein</th>
        <th>Transcript</th>
        <th>Gene ID</th>
        <th>Gene Name</th>
        <th>Position</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {props.mappings.map(item => (
        <RelatedMapping
          id={item.mappingId}
          enstId={item.ensemblTranscript.enstId}
          geneId={item.ensemblTranscript.ensgId}
          geneName={item.ensemblTranscript.ensgName}
          enstVersion={item.ensemblTranscript.enstVersion}
          sequenceVersion={item.uniprotEntry.sequenceVersion}
          uniprotAccession={item.uniprotEntry.uniprotAccession}
          entryType={item.uniprotEntry.entryType}
          status={item.status}
          alignment_difference={item.alignment_difference}
          chromosome={item.ensemblTranscript.chromosome}
          start={item.ensemblTranscript.seqRegionStart}
          end={item.ensemblTranscript.seqRegionEnd}
          active={props.active === item.mappingId}
          onChange={props.onChange}
          key={item.mappingId}
        />
      ))}
    </tbody>
  </table>
);

export default RelatedMappingsSection;
