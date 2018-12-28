import React, { Component } from 'react';
import firebase from './services/firebase';
import List from './List';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      count: -1,
      error: null,
      loading: true,
    };

    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  async fetchData() {
    try {
      const countDoc = await firebase
        .firestore()
        .collection('messages')
        .doc('count')
        .get();

      this.setState({
        count: countDoc.exists ? countDoc.data().count : 0,
        error: null,
        loading: false,
      });
    } catch (error) {
      this.setState({
        count: -1,
        error,
        loading: false,
      });
    }
  }

  render() {
    const { loading, count, error } = this.state;

    if (loading) {
      return 'Loading...';
    }

    if (error) {
      return 'Error...';
    }

    return <List count={count} />;
  }
}
