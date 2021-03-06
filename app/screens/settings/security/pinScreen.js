import React, { Component } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { connect } from 'react-redux';
import {
  setPin,
  resetPin,
  activateFingerprint,
  newItem,
} from './../../../redux/actions';

import Colors from './../../../config/colors';
import Header from './../../../components/header';
import PinModal from './../../../components/PinModal';

import { Button, PopUpGeneral, CodeInput } from './../../../components/common';

class PinScreen extends Component {
  static navigationOptions = {
    title: 'Set pin/fingerprint',
  };

  state = {
    new_pin: '',
    modalVisible: false,
    modalType: 'none',
    pinState: 'none',
    pinVisible: true,
    hasFingerprintScanner: false,
    hasSavedFingerprints: false,
  };

  componentDidMount() {
    if (Expo.Fingerprint.hasHardwareAsync()) {
      this.setState({ hasFingerprintScanner: true });
      if (Expo.Fingerprint.isEnrolledAsync()) {
        this.setState({ hasSavedFingerprints: true });
      }
    }
  }

  setPin = confirm_pin => {
    const { new_pin } = this.state;
    if (new_pin === confirm_pin) {
      this.setState({ modalVisible: false });
      this.props.setPin(new_pin);
      this.props.navigation.goBack();
    } else {
      this.setState({ modalVisible: true, modalType: 'errorPin' });
    }
  };

  resetPin = () => {
    this.props.resetPin();
    this.setState({ modalVisible: true, modalType: 'resetPin' });
  };

  renderMainContainer() {
    const { pin, fingerprint, company_config } = this.props;
    const { hasFingerprintScanner, hasSavedFingerprints, showPin } = this.state;
    if (showPin) {
      return (
        <View>
          <CodeInput
            ref={component => (this._pinInput2 = component)}
            secureTextEntry
            activeColor="gray"
            autoFocus
            inactiveColor="lightgray"
            className="border-b"
            codeLength={4}
            space={7}
            size={30}
            inputPosition="center"
            containerStyle={{ marginTop: 0, paddingBottom: 16, minHeight: 40 }}
            onFulfill={code =>
              this.setState({
                new_pin: code,
                modalVisible: true,
                modalType: 'setPinConfirm',
              })
            }
          />

          <Button
            label="CANCEL"
            textColor={company_config.colors.primaryContrast}
            backgroundColor={company_config.colors.primary}
            onPress={() => this.setState({ showPin: false })}
          />
        </View>
      );
    } else {
      return (
        <View style={{ alignContent: 'center' }}>
          {!hasFingerprintScanner ? (
            <Text>No fingerprint scanner</Text>
          ) : !hasSavedFingerprints ? (
            <Text>No fingerprints saved</Text>
          ) : (
            <Button
              label="ACTIVATE FINGERPRINT"
              textColor={company_config.colors.primaryContrast}
              backgroundColor={company_config.colors.primary}
              onPress={this.activateFingerprint}
            />
          )}

          <Button
            label="SET PIN"
            textColor={company_config.colors.secondaryContrast}
            backgroundColor={company_config.colors.secondary}
            onPress={() => this.setState({ showPin: true })}
          />

          {pin || fingerprint ? (
            <Button
              label="RESET"
              textColor={company_config.colors.primary}
              backgroundColor="transparent"
              onPress={this.resetPin}
            />
          ) : null}
        </View>
      );
    }
  }

  activateFingerprint = async () => {
    if (Platform.OS === 'android') {
      this.setState({
        modalVisible: true,
        modalType: 'setFingerprint',
      });
    }
    let result = await Expo.Fingerprint.authenticateAsync('Biometric scan');

    if (result.success) {
      this.props.activateFingerprint();
      this.setState({
        modalVisible: true,
        modalType: 'confirmFingerprint',
      });
    } else {
      this.props.pinFail('Unable to authenticate with biometrics');
    }
  };

  iosScan = async () => {
    let result = await Expo.Fingerprint.authenticateAsync('Biometric scan');

    if (!result.success) {
      this.props.navigation.goBack();
    }
    return null;
  };

  renderModal() {
    const { modalVisible, modalType } = this.state;

    let contentText = '';
    let actionText = 'CANCEL';
    let action = () => {
      this.setState({ modalVisible: false });
      this.props.navigation.goBack();
    };
    let showPin = false;
    let errorText = '';
    switch (modalType) {
      case 'setFingerprint':
        contentText = 'Please scan your fingerprint to activate this feature';
        action = () => {
          if (Platform.os !== 'ios') {
            Expo.Fingerprint.cancelAuthenticate();
          }
          this.setState({ modalVisible: false, modalType: 'none' });
        };
        break;
      case 'confirmFingerprint':
        contentText = 'Fingerprint has been set';
        actionText = 'CLOSE';
        break;
      case 'inputPinError':
        errorText = 'Incorrect pin';
      // case 'setPin':
      //   contentText = 'Please input a pin to secure your account';
      //   // this.pinInput.clear();
      //   showPin = true;
      //   break;
      case 'setPinConfirm':
        contentText = 'Please confirm your pin';
        // this._pinInput.clear();
        showPin = true;
        break;
      case 'setPinSuccess':
        contentText = 'Pin has been set';
        break;
      case 'errorPin':
        contentText = 'Pin and confirm pin do not match';
        actionText = 'CLOSE';
        action = () =>
          this.setState({ modalVisible: false, modalType: 'none' });
        break;
      case 'resetPin':
        contentText = 'Pin and fingerprint reset';
        actionText = 'CLOSE';
        action = () =>
          this.setState({ modalVisible: false, modalType: 'none' });
        break;
      default:
        contentText = '';
    }
    return (
      <PopUpGeneral
        visible={modalVisible}
        contentText={contentText}
        textActionOne={actionText}
        onPressActionOne={action}
        errorText={errorText}
        // onDismiss={actionFunction}
      >
        {showPin ? (
          <CodeInput
            ref={component => (this._pinInput = component)}
            secureTextEntry
            activeColor="gray"
            autoFocus
            inactiveColor="lightgray"
            className="border-b"
            codeLength={4}
            space={7}
            size={30}
            inputPosition="center"
            containerStyle={{ marginTop: 0, paddingBottom: 24 }}
            onFulfill={code => this.setPin(code)}
          />
        ) : null}
      </PopUpGeneral>
    );
  }

  // _onInputPinComplete(code) {
  //   const { pin } = this.props;
  //   const { modalType } = this.state;
  //   switch (modalType) {
  //     case 'inputPin':
  //       if (pin === code) {
  //         this.setState({
  //           modalVisible: false,
  //           modalType: 'none',
  //           pinState: 'landing',
  //         });
  //       } else {
  //         this.setState({ modalType: 'inputPinError' });
  //       }
  //       break;
  //     case 'setPinConfirm':
  //       this.setPin(code);
  //       break;
  //   }
  // }

  render() {
    const { pin, fingerprint, company_config } = this.props;
    const { pinVisible } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <Header
          navigation={this.props.navigation}
          title="Set pin/fingerprint"
          back
          colors={company_config.colors}
        />
        <KeyboardAvoidingView
          keyboardShouldPersistTaps={'never'}
          style={styles.viewStyleContainer}
          behavior={'padding'}>
          {/* {fingerprint && Platform.OS === 'ios' ? (
            this.iosScan()
          ) : ( */}
          <PinModal
            pin={pin}
            fingerprint={fingerprint}
            modalVisible={pinVisible}
            onSuccess={() => this.setState({ pinVisible: false })}
            onDismiss={() => this.props.navigation.goBack()}
          />
          )
          {this.renderMainContainer()}
          {this.renderModal()}
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = {
  viewStyleContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  buttonStyle: {
    flex: 1,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  commentText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'black',
  },
  pinInfo: {
    flex: 2,
    flexDirection: 'column',
    padding: 20,
  },
  pinTextStyle: {
    paddingTop: 16,
    justifyContent: 'center',
  },
};
const mapStateToProps = ({ auth }) => {
  const { pin, fingerprint, company_config } = auth;
  return { pin, fingerprint, company_config };
};

export default connect(mapStateToProps, {
  setPin,
  activateFingerprint,
  resetPin,
})(PinScreen);
