import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

import LoadingSpinner from '../LoadingSpinner';
import '../../../styles/Alignment.css';

class Alignment extends Component {
  state = {
    alignments: null,
    loading: false,
    isPerfectMatch: false,
  };

  componentDidMount() {
    const { mappingId } = this.props;

    this.getAlignments(mappingId);

    window.addEventListener('scroll', () => {
      this.hidePosition();
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', () => null);
  }

  componentDidUpdate(prevProps) {
    const { mappingId } = this.props;

    if (mappingId === prevProps.mappingId) {
      return false;
    }

    this.getAlignments(mappingId);
  }

  getAlignments = (mappingId) => {
    const { history } = this.props;
    const apiURI = `${API_URL}/mapping/${mappingId}/pairwise/?format=json`;

    this.setState({
      loading: true,
    });

    axios
      .get(apiURI)
      .then((response) => {
        const details = response.data;
        let isTooLong = false;

        let alignments = null;
        let isPerfectMatch = false;
        if (details.alignments.length > 0) {
          alignments = [
            details.alignments[0].uniprot_alignment,
            details.alignments[0].ensembl_alignment,
          ];
          isPerfectMatch = details.alignments[0].alignment_type === 'perfect_match';

          if (10000 < alignments[0].length) {
            isTooLong = true;
          }
        }

        this.setState({
          alignments,
          isPerfectMatch,
          isTooLong,
          loading: false,
        });
      })
      .catch((e) => {
        console.log(e);
        history.push(`${BASE_URL}/error`);
      });
  };

  matchSequences = (sequences) => {
    const paired = sequences.reduce((accumulator, current) => {
      const accu = accumulator;

      current.split('').forEach((a, index) => {
        if (Object.prototype.toString.call(accu[index]) !== '[object Array]') {
          accu[index] = [];
        }

        accu[index].push(a);
      });

      return accu;
    }, []);

    return paired;
  };

  rowSize = 60;
  positions = undefined;
  startEndPosition = undefined;
  hidePositionTooltip = undefined;

  alignmentIDs = ['UNP', 'ENS'];

  calculatePositions = (alignments, size) => {
    this.positions = alignments.map((seq) => {
      let innerCounter = 0;

      return seq.split('').map(x => (x !== '-' ? ++innerCounter : null));
    });

    this.startEndPosition = alignments.map(seq =>
      seq
        .match(new RegExp(`.{1,${size}}`, 'g'))
        .map(chunk => chunk.replace(/-/g, '').length)
        .reduce(
          (accumulator, current, index) => {
            const accu = accumulator;

            if (index === 0) {
              accu[0][1] = current;

              return accu;
            }

            accu[index] = [accu[index - 1][1] + 1, accu[index - 1][1] + current];

            return accu;
          },
          [[1, null]],
        ));
  };

  createAlignmentVisualization = () => {
    const { alignments } = this.state;

    if (alignments === null) {
      return null;
    }

    this.calculatePositions(alignments, this.rowSize);
    const alignment = this.matchSequences(alignments);

    const rows = alignment.reduce((accu, value, index, array) => {
      if (index % this.rowSize === 0) {
        accu.push(array.slice(index, index + this.rowSize));
      }

      return accu;
    }, []);

    return (
      <Fragment>
        <div id="alignment-hover-tooltip" className="alignment__hover-position__wrapper">
          <div id="positionA" className="alignment__hover-position alignment__hover-position__A" />
          <div id="positionB" className="alignment__hover-position alignment__hover-position__B" />
        </div>

        {rows.map((row, rowIndex) => (
          <div className="alignment__row" key={`row-${rowIndex}`}>
            <div className="alignment__id-wrapper">
              {this.alignmentIDs.map(id => (
                <div className="alignment_id" key={`id-${id}:${rowIndex}`}>
                  {id}
                </div>
              ))}
            </div>

            <div className="alignment__seqs">
              <div className="alignment__column alignment__start">
                <div className="alignment__position">{this.startEndPosition[0][rowIndex][0]}</div>
                <div className="alignment__position">{this.startEndPosition[1][rowIndex][0]}</div>
              </div>

              {row.map((el, cellIndex) => {
                let extraCSSClasses = '';

                if (el.join('') !== el[0].repeat(el.length)) {
                  extraCSSClasses = 'alignment__changed';

                  if (el.indexOf('-') !== -1) {
                    extraCSSClasses = 'alignment__deleted';
                  }
                }

                return (
                  <div
                    className={`alignment__column ${extraCSSClasses}`}
                    onMouseEnter={this.showPosition}
                    onMouseLeave={this.hidePosition}
                    position-a={el[0]}
                    position-b={el[1]}
                    row-index={`${rowIndex}`}
                    cell-index={`${cellIndex}`}
                    key={`col-${rowIndex}:${cellIndex}`}
                  >
                    {el.map((x, i) => (
                      <div className="alignment__cell" key={`cell-${i}-${rowIndex}:${cellIndex}`}>
                        {x}
                      </div>
                    ))}
                  </div>
                );
              })}

              <div className="alignment__column alignment__end">
                <div className="alignment__position">{this.startEndPosition[0][rowIndex][1]}</div>
                <div className="alignment__position">{this.startEndPosition[1][rowIndex][1]}</div>
              </div>
            </div>
          </div>
        ))}
      </Fragment>
    );
  };

  showPosition = ({ currentTarget }) => {
    window.clearTimeout(this.hidePositionTooltip);

    const tooltip = document.getElementById('alignment-hover-tooltip');
    const elementA = document.getElementById('positionA');
    const elementB = document.getElementById('positionB');

    const targetPosition = currentTarget.getBoundingClientRect();
    const positionA = currentTarget.getAttribute('position-a');
    const positionB = currentTarget.getAttribute('position-b');
    const rowIndex = parseInt(currentTarget.getAttribute('row-index'), 10);
    const cellIndex = parseInt(currentTarget.getAttribute('cell-index'), 10);
    const index = rowIndex * this.rowSize + cellIndex;
    const valueA = this.positions[0][index];
    const valueB = this.positions[1][index];

    elementA.innerHTML = valueA !== null ? `${positionA}:${valueA}` : '-';
    elementB.innerHTML = valueB !== null ? `${positionB}:${valueB}` : '-';

    tooltip.style.top = `${targetPosition.y + (window.scrollY - 20)}px`;
    tooltip.style.left = `${targetPosition.x + (window.scrollX - 1)}px`;
    tooltip.style.height = `${targetPosition.height + 40}px`;
    tooltip.style.display = 'block';
  };

  hidePosition = () => {
    this.hidePositionTooltip = window.setTimeout(() => {
      const tooltip = document.getElementById('alignment-hover-tooltip');
      if (null === tooltip) {
        return;
      }
      tooltip.style.display = 'none';
    }, 20);
  };

  render() {
    const { alignments, loading, isPerfectMatch, isTooLong } = this.state;

    if (loading) {
      return <LoadingSpinner />;
    }

    if (isTooLong) {
      return (
        <div className="callout">
          Sorry, this alignment is too big to display here.
        </div>
      );
    }

    if (alignments === null) {
      return (
        <div className="callout">
          <em>No alignments have been run for this mapping</em>
        </div>
      );
    } /* else if (isPerfectMatch) {
      return (
        <div className="callout">
          <em>
            <span role="img" aria-label="party">
              🎉
            </span>{' '}
            Sequences are identical{' '}
            <span role="img" aria-label="party">
              🎉
            </span>
          </em>
        </div>
      );
    }  */

    return (
      <div className="row mapping__alignment__wrapper">
        <div className="column medium-12">
          <div className="alignment">{this.createAlignmentVisualization()}</div>
        </div>
      </div>
    );
  }
}

export default withRouter(Alignment);