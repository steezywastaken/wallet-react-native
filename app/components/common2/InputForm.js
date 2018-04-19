import React, { Component } from 'react';
import { ScrollView, KeyboardAvoidingView } from 'react-native';

class InputForm extends Component {
  render() {
    const { reference, children } = this.props;

    const { containerStyle } = styles;

    return (
      <ScrollView
        keyboardDismissMode={'interactive'}
        keyboardShouldPersistTaps="always"
        ref={reference}>
        {children}
      </ScrollView>
    );
  }
}

const styles = {
  containerStyle: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 10,
    justifyContent: 'center',
    paddingRight: 25,
    paddingBottom: 15,
  },
};

export { InputForm };
