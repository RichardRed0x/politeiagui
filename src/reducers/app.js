import * as act from "../actions/types";
import { TOP_LEVEL_COMMENT_PARENTID } from "../lib/api";
import { uniqueID } from "../helpers";
import {
  PROPOSAL_STATUS_UNREVIEWED,
  PROPOSAL_VOTING_ACTIVE,
  PAYWALL_STATUS_PAID,
  PROPOSAL_USER_FILTER_SUBMITTED,
  SORT_BY_NEW
} from "../constants";

export const DEFAULT_STATE = {
  isShowingSignupConfirmation: false,
  replyParent: TOP_LEVEL_COMMENT_PARENTID,
  newProposal: {
    name: "",
    description: ""
  },
  adminProposalsShow: PROPOSAL_STATUS_UNREVIEWED,
  publicProposalsShow: PROPOSAL_VOTING_ACTIVE,
  userProposalsShow: PROPOSAL_USER_FILTER_SUBMITTED,
  proposalCredits: 0,
  submittedProposals: {},
  draftProposals: null,
  identityImportResult: { errorMsg: "", successMsg: "" },
  onboardViewed: false,
  commentsSortOption: { value: SORT_BY_NEW, label: SORT_BY_NEW }
};

const app = (state = DEFAULT_STATE, action) => (({
  [act.SET_REPLY_PARENT]: () => ({ ...state, replyParent: action.payload || TOP_LEVEL_COMMENT_PARENTID }),
  [act.RECEIVE_NEW_PROPOSAL]: () => action.error ? state : ({ ...state,
    submittedProposals: {
      ...state.submittedProposals,
      lastSubmitted: action.payload.censorshiprecord.token,
      [action.payload.censorshiprecord.token]: action.payload
    }
  }),
  [act.SAVE_DRAFT_PROPOSAL]: () => {
    const newDraftProposals = state.draftProposals;
    const draftId = action.payload.draftId || uniqueID("draft");
    return { ...state,
      draftProposals: {
        ...newDraftProposals,
        newDraft: true,
        lastSubmitted: action.payload.name,
        [draftId]: {
          ...action.payload,
          draftId
        }
      }
    };
  },
  [act.DELETE_DRAFT_PROPOSAL]: () => {
    const draftId = action.payload;
    if (!state.draftProposals[draftId]) {
      return state;
    }
    const newDraftProposals = state.draftProposals;
    delete newDraftProposals[draftId];
    return { ...state,
      draftProposals: newDraftProposals
    };
  },
  [act.LOAD_DRAFT_PROPOSALS]: () => ({ ...state, draftProposals: action.payload }),
  [act.REQUEST_SETSTATUS_PROPOSAL]: () => {
    if (action.error) return state;
    const { status, token } = action.payload;
    if (!(token in state.submittedProposals)) return state;
    else {
      return {
        ...state,
        submittedProposals: {
          ...state.submittedProposals,
          [token]: {
            ...state.submittedProposals[token],
            status
          }
        }
      };
    }
  },
  [act.SET_PROPOSAL_APPROVED]: () => ({ ...state, isProposalStatusApproved: action.payload }),
  [act.RECEIVE_USERNAMES]: () => ({ ...state, usernamesById: action.payload.usernamesById }),
  [act.SET_VOTES_END_HEIGHT]: () => ({ ...state, votesEndHeight: { ...state.votesEndHeight, [action.payload.token]: action.payload.endheight } }),
  [act.REQUEST_SIGNUP_CONFIRMATION]: () => ({ ...state, isShowingSignupConfirmation: true }),
  [act.RESET_SIGNUP_CONFIRMATION]: () => ({ ...state, isShowingSignupConfirmation: false }),
  [act.CHANGE_ADMIN_FILTER_VALUE]: () => ({ ...state, adminProposalsShow: action.payload }),
  [act.CHANGE_PUBLIC_FILTER_VALUE]: () => ({ ...state, publicProposalsShow: action.payload }),
  [act.CHANGE_USER_FILTER_VALUE]: () => ({ ...state, userProposalsShow: action.payload }),
  [act.UPDATE_USER_PAYWALL_STATUS]: () => ({
    ...state,
    userPaywallStatus: action.payload.status,
    userAlreadyPaid: action.payload.status === PAYWALL_STATUS_PAID,
    userPaywallConfirmations: action.payload.currentNumberOfConfirmations
  }),
  [act.SET_PROPOSAL_CREDITS]: () => ({
    ...state,
    proposalCredits: (action.payload || 0)
  }),
  [act.SUBTRACT_PROPOSAL_CREDITS]: () => ({
    ...state,
    proposalCredits: state.proposalCredits - (action.payload || 0)
  }),
  [act.CSRF_NEEDED]: () => ({ ...state, csrfIsNeeded: action.payload }),
  [act.CLEAN_STATE]: () => ({
    ...state,
    isShowingSignupConfirmation: false
  }),
  [act.SHOULD_AUTO_VERIFY_KEY]: () => ({ ...state, shouldVerifyKey: action.payload }),
  [act.IDENTITY_IMPORTED]: () => ({ ...state, identityImportResult: action.payload }),
  [act.SET_ONBOARD_AS_VIEWED]: () => ({ ...state, onboardViewed: true }),
  [act.SET_COMMENTS_SORT_OPTION]: () => ({ ...state, commentsSortOption: action.payload })
})[action.type] || (() => state))();

export default app;
