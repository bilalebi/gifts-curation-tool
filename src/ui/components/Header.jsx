import React from 'react';
import { withRouter, Link } from 'react-router-dom';

import SearchField from './SearchField';

function Header(props) {
  const { authenticated, user } = props;

  return (
    <div data-sticky-container>
      <header
        id="masthead"
        className="masthead"
        data-sticky
        data-sticky-on="large"
        data-top-anchor="content:top"
        data-btm-anchor="content:bottom"
      >
        <div className="masthead-inner row">
          {/* <!-- local-title --> */}
          <div className="columns medium-6" id="local-title">
            <h1>
              <Link to={`${BASE_URL}/`} title="Back to GIFTs homepage">
                GIFTs
              </Link>
            </h1>
          </div>
          {/* <!-- /local-title --> */}
          {/* <!-- local-nav --> */}
          <div className="columns medium-6">
            {props.location.pathname != `${BASE_URL}/` && <SearchField {...props} />}
          </div>
          <nav>
            <ul id="local-nav" className="dropdown menu float-left" data-description="navigational">
              <li>
                <Link to={`${BASE_URL}/`}>Home</Link>
              </li>
              <li>
                <Link to={`${BASE_URL}/mappings`}>Mappings</Link>
              </li>
              <li>
                <Link to={`${BASE_URL}/unmapped`}>Unmapped</Link>
              </li>
              <li>
                <Link to={`${BASE_URL}/feedback`}>Feedback</Link>
              </li>
              {READ_ONLY === false ? (
                authenticated ? (
                  <li>
                    <Link to={`${BASE_URL}/logout`}>Logout</Link>
                  </li>
                ) : (
                  <li>
                    <Link to={`${BASE_URL}/login`}>Login</Link>
                  </li>
                )
              ) : null}
            </ul>
          </nav>
          {/* <!-- /local-nav --> */}
        </div>
      </header>
    </div>
  );
}

export default withRouter(Header);
