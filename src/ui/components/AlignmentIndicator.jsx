import React from 'react';

import '../../styles/AlignmentIndicator.css';

const AlignmentIndicator = (props) => {
  if (props.difference === null && props.differenceName === null) {
    return null;
  } else if (+props.difference === 0 || props.differenceName === 'identical') {
    return (
      <span className="alignment-indicator" title="Identical sequences">
        I
      </span>
    );
  } else if (+props.difference <= 5 || props.differenceName === 'small') {
    return (
      <span
        className="alignment-indicator alignment-indicator--small"
        title="Small difference between sequences"
      >
        S
      </span>
    );
  } else if (+props.difference > 5 || props.differenceName === 'large') {
    return (
      <span
        className="alignment-indicator alignment-indicator--large"
        title="Large difference between sequences"
      >
        L
      </span>
    );
  }
  return null;
};

export default AlignmentIndicator;
