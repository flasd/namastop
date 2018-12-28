import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InfiniteLoader, List } from 'react-virtualized';
import BlockUi from 'react-block-ui';
import firebase from './services/firebase';

export default class MessageList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      inFlight: false,
    };

    this.fetchMoreData = this.fetchMoreData.bind(this);
    this.isRowLoaded = this.isRowLoaded.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.lastSeen = null;
    this.hasMore = true;
  }

  componentDidMount() {
    this.fetchMoreData();
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  async fetchMoreData() {
    await new Promise(r =>
      this.setState(
        {
          inFlight: true,
        },
        r,
      ),
    );

    const { lastSeen, hasMore } = this;

    if (!hasMore) {
      return;
    }

    try {
      const ref = firebase.firestore().collection('messages');
      const query = (lastSeen ? ref.startAfter(lastSeen) : ref).limit(25);

      const querySnapshot = await query.get();

      if (querySnapshot.empty) {
        this.setState({
          error: null,
          inFlight: false,
        });

        return;
      }

      this.setState(currentState => ({
        list: [
          ...currentState.list,
          ...querySnapshot.docs.map(doc =>
            Object.assign({}, doc.data(), {
              id: doc.id,
            }),
          ),
        ],
        inFlight: false,
        error: null,
      }));
    } catch (error) {
      this.setState({
        error,
        inFlight: false,
      });
    }
  }

  isRowLoaded({ index }) {
    const { list } = this.state;

    return !!list[index];
  }

  renderRow({ key, index, styles }) {
    const { list } = this.state;

    if (list.length === 0) {
      return null;
    }

    const message = list[index];
    return (
      <div key={key} style={styles}>
        {message.text}
      </div>
    );
  }

  render() {
    const { inFlight, error } = this.state;
    const { count } = this.props;

    if (error) {
      return 'Erro!';
    }

    return (
      <BlockUi blocking={inFlight}>
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.fetchMoreData}
          rowCount={count}
        >
          {({ onRowsRendered, registerChild }) => (
            <List
              height={window.innerHeight}
              onRowsRendered={onRowsRendered}
              ref={registerChild}
              rowCount={count}
              rowHeight={24}
              rowRenderer={this.renderRow}
              width={300}
            />
          )}
        </InfiniteLoader>
      </BlockUi>
    );
  }
}

MessageList.propTypes = {
  count: PropTypes.number.isRequired,
};
