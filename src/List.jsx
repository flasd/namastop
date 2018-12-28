import React, { Component } from 'react';
import { Button } from 'reactstrap';
import TimeAgo from 'react-timeago';
import portugueseSettings from 'react-timeago/lib/language-strings/pt-br';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import BlockUi from 'react-block-ui';
import firebase from './services/firebase';
import styles from './List.module.css';

const languageFormatter = buildFormatter(portugueseSettings);

export default class MessageList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      inFlight: false,
    };

    this.fetchMoreData = this.fetchMoreData.bind(this);
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
      const query = (lastSeen ? ref.startAfter(lastSeen) : ref).limit(2);

      const querySnapshot = await query.get();

      if (querySnapshot.empty) {
        this.setState({
          error: null,
          inFlight: false,
        });

        this.hasMore = false;

        return;
      }

      this.hasMore = querySnapshot.docs.length >= 2;
      this.lastSeen = querySnapshot.docs[querySnapshot.docs.length - 1];

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

  render() {
    const { list, inFlight, error } = this.state;

    if (error) {
      return 'Erro!';
    }

    return (
      <BlockUi blocking={inFlight}>
        {list.map(item => (
          <div key={item.id} className={styles.container}>
            <div className={styles.itemWrapper}>
              <div className={styles.itemHeader}>
                <div>
                  <img
                    src={item.fromPicture}
                    alt="foto de quem agradeceu"
                    className={styles.picture}
                  />
                </div>
                <div className={styles.name}>{item.fromName}</div>
                <div className={styles.agradeceu}> agradeceu </div>
                <div>
                  <img
                    src={item.toPicture}
                    alt="foto de quem agradeceu"
                    className={styles.picture}
                  />
                </div>
                <div className={styles.name}>{item.toName}</div>
              </div>
              <div className={styles.message}>
                {item.text
                  .replace(/<(@)\w+(\|?\w+)>/g, '$1$2')
                  .replace('|', '')}
              </div>
              <div className={styles.time}>
                <TimeAgo
                  date={item.createdAt.toDate()}
                  formatter={languageFormatter}
                />
              </div>
            </div>
          </div>
        ))}
        {this.hasMore && !inFlight && (
          <Button color="primary" block onClick={this.fetchMoreData}>
            Carregar Mais
          </Button>
        )}
      </BlockUi>
    );
  }
}
