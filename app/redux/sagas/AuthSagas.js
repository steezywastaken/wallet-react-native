import { take, all, call, put, takeEvery } from 'redux-saga/effects';
import {
  FETCH_ACCOUNTS_ASYNC,
  FETCH_DATA_ASYNC,
  LOGIN_USER_ASYNC,
  REGISTER_USER_ASYNC,
  UPDATE_AUTH_FORM_STATE,
  APP_LOAD_FINISH,
  CHANGE_PASSWORD_ASYNC,
  LOGOUT_USER_ASYNC,
} from './../types';

import * as Rehive from './../../util/rehive';

function* loginUser(action) {
  try {
    let response = yield call(Rehive.login, action.payload);

    yield put({
      type: LOGIN_USER_ASYNC.success,
      payload: response.token,
    });
  } catch (error) {
    console.log(error);
    yield put({ type: LOGIN_USER_ASYNC.error, error });
    yield put({
      type: UPDATE_AUTH_FORM_STATE,
      payload: {
        inputState: 'email',
        authState: 'login',
        textFooterRight: 'next',
      },
    });
  }
  // let twoFactorResponse = await AuthService.twoFactorAuth();
  // if (twoFactorResponse.status === 'success') {
  //   const authInfo = twoFactorResponse.data;
  //   if (authInfo.sms === true || authInfo.token === true) {
  //     this.props.navigation.navigate('AuthVerifySms', {
  //       loginInfo: loginInfo,
  //       isTwoFactor: true,
  //     });
  //   } else {
  //     Auth.login(this.props.navigation, loginInfo);
  //   }
  // } else {
  //   Alert.alert('Error', twoFactorResponse.message, [{ text: 'OK' }]);
  // }
}

function* registerUser(action) {
  try {
    let response = yield call(Rehive.register, action.payload);

    yield put({
      type: REGISTER_USER_ASYNC.success,
      payload: response.token,
    });
  } catch (error) {
    console.log(error);
    yield put({ type: REGISTER_USER_ASYNC.error, error });
    yield put({
      type: UPDATE_AUTH_FORM_STATE,
      payload: {
        inputState: 'email',
        authState: 'register',
        textFooterRight: 'Next',
      },
    });
  }
}

function* logoutUser() {
  try {
    let response = yield call(Rehive.logout);
    yield put({
      type: LOGOUT_USER_ASYNC.success,
      payload: response.token,
    });
  } catch (error) {
    console.log(error);
    yield put({ type: LOGOUT_USER_ASYNC.error, error });
  }
}

function* appLoad() {
  try {
    Rehive.initializeSDK();
    yield all([
      put({ type: FETCH_ACCOUNTS_ASYNC.pending }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'profile' }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'mobile_number' }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'email_address' }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'crypto_address' }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'bank_account' }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'address' }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'document' }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'company' }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'company_bank_account' }),
      put({ type: FETCH_DATA_ASYNC.pending, payload: 'company_currency' }),
    ]);
    for (let i = 0; i < 11; i++) {
      yield take([FETCH_ACCOUNTS_ASYNC.success, FETCH_DATA_ASYNC.success]);
    }
    yield put({ type: APP_LOAD_FINISH });
  } catch (error) {
    console.log(error);
    yield put({ type: LOGIN_USER_ASYNC.error, error });
  }
}

function* changePassword(action) {
  try {
    yield call(Rehive.changePassword, action.payload);
    yield put({
      type: CHANGE_PASSWORD_ASYNC.success,
    });
  } catch (error) {
    console.log(error);
    yield put({ type: CHANGE_PASSWORD_ASYNC.error, error });
  }
}

export const authSagas = all([
  takeEvery(LOGIN_USER_ASYNC.success, appLoad),
  takeEvery(LOGIN_USER_ASYNC.pending, loginUser),
  takeEvery(REGISTER_USER_ASYNC.success, appLoad),
  takeEvery(REGISTER_USER_ASYNC.pending, registerUser),
  takeEvery(CHANGE_PASSWORD_ASYNC.pending, changePassword),
  takeEvery(LOGOUT_USER_ASYNC.pending, logoutUser),
]);