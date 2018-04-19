import React, { Component } from 'react';
import { View } from 'react-native';

import Header from './../../components/header';
import RegisterForm from './../../components/wallet2/RegisterForm';

export default class Signup extends Component {
  static navigationOptions = {
    title: 'Register',
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header navigation={this.props.navigation} back title="Register" />
        <RegisterForm navigation={this.props.navigation} />
      </View>
    );
  }
}
