import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import { withCookies } from 'react-cookie';
import SimpleMED from 'simplemde';

import Comment from './Comment';

import '../../../styles/CommentsSection.css';

class CommentsSection extends Component {
  state = {};

  textEditor = null;

  componentDidMount() {
    const { isLoggedIn } = this.props;

    if (this.textEditor === null && isLoggedIn) {
      this.createTextEditor();
    }
  }

  componentDidUpdate() {
    const { isLoggedIn } = this.props;

    if (this.textEditor === null && isLoggedIn) {
      this.createTextEditor();
    }

    // fix this re-render issue later
    if (this.textEditor) {
      this.textEditor.render(document.getElementById('text-editor'));
    }
  }

  createTextEditor = () => {
    const element = document.getElementById('text-editor');

    if (element === null) {
      return false;
    }

    this.textEditor = new SimpleMED({
      element,
      initialValue: '',
      hideIcons: ['image'],
    });
  };

  saveComment = () => {
    const {
      mappingId, isLoggedIn, history, cookies, afterSaveCallback,
    } = this.props;

    const apiURI = `${API_URL}/mapping/${mappingId}/comments/`;
    const comment = {
      text: this.textEditor.value(),
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies.get('jwt')}`,
      },
    };

    axios
      .post(apiURI, comment, config)
      .then(() => {
        this.textEditor.value('');
        afterSaveCallback(mappingId, isLoggedIn);
      })
      .catch(() => {
      // .catch((e) => {
      //   console.log(e);
        history.push(`${BASE_URL}/error`);
      });
  };

  render() {
    const { isLoggedIn, comments } = this.props;

    if (isLoggedIn === false) {
      return null;
    }

    return (
      <div className="comments-section">
        {comments.map(comment => (
          <Comment
            details={comment}
            key={`${comment.user}-${comment.timeAdded}-${Math.random()}`}
          />
        ))}

        <div className="comment row">
          <div className="column medium-12">
            <div className="comment__avatar">?</div>
            <div className="comment__details">
              <textarea id="text-editor" />
              <button className="comments-section__save-button button" onClick={this.saveComment}>
                Add comment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CommentsSection.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  mappingId: PropTypes.number.isRequired,
  history: PropTypes.object.isRequired,
  cookies: PropTypes.object.isRequired,
  afterSaveCallback: PropTypes.func.isRequired,
  comments: PropTypes.array,
};

CommentsSection.defaultProps = {
  comments: [],
};

export default withRouter(withCookies(CommentsSection));
