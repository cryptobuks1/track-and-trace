
import {
  fork,
  all
} from 'redux-saga/effects';
import watchAuthActions from './authentication.saga';
import watchAssets from './asset.saga';

const rootSaga = function* () {
  yield all([
    fork(watchAuthActions),
    fork(watchAssets)
  ])
}

export default rootSaga