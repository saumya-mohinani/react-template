/*
 *
 * HomeContainer reducer
 *
 */
import produce from 'immer';
import { createActions } from 'reduxsauce';
import get from 'lodash/get';

export const { Types: songContainerTypes, Creators: songContainerCreators } = createActions({
  requestGetSongs: ['query'],
  successGetSongs: ['data'],
  failureGetSongs: ['error'],
  requestGetTrack: ['id'],
  clearSongs: []
});
export const initialState = { query: null, songsData: [], songsError: null, loading: false };

/* eslint-disable default-case, no-param-reassign */
export const songContainerReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case songContainerTypes.REQUEST_GET_SONGS:
        draft.loading = true;
        draft.query = action.query;
        break;
      case songContainerTypes.REQUEST_GET_TRACK:
        draft.loading = true;
        break;
      case songContainerTypes.CLEAR_SONGS:
        draft.loading = false;
        draft.songsData = [];
        break;
      case songContainerTypes.SUCCESS_GET_SONGS:
        draft.loading = false;
        draft.songsData = action.data;
        draft.songsError = null;
        break;
      case songContainerTypes.FAILURE_GET_SONGS:
        draft.loading = false;
        draft.songsData = [];
        draft.songsError = get(action.error, 'message', 'something_went_wrong');
        break;
    }
  });

export default songContainerReducer;
