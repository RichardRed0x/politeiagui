import React from "react";
import TimeAgo from "timeago-react";
import ProposalImages from "../ProposalImages";
import DownloadBundle from "../DownloadBundle";
import Message from "../Message";
import actions from "../../connectors/actions";
import connector from "../../connectors/thingLink";
import {
  PROPOSAL_STATUS_CENSORED,
  PROPOSAL_STATUS_PUBLIC,
  PROPOSAL_STATUS_UNREVIEWED,
  PROPOSAL_VOTING_NOT_STARTED,
  PROPOSAL_STATUS_UNREVIEWED_CHANGES,
  PROPOSAL_VOTING_ACTIVE,
  PROPOSAL_VOTING_FINISHED
} from "../../constants";
import { getProposalStatus } from "../../helpers";
import VoteStats from "../VoteStats";
import { withRouter } from "react-router";
import ButtonWithLoadingIcon from "./ButtonWithLoadingIcon";
import Tooltip from "../Tooltip";

const ThingLinkComp = ({
  Link,
  Expando,
  id,
  expanded = false,
  name,
  author,
  authorid,
  domain,
  rank = 0,
  userid,
  draftId,
  version,
  subreddit,
  subreddit_id,
  created_utc,
  title,
  url,
  permalink,
  is_self,
  selftext,
  selftext_html,
  thumbnail,
  otherFiles,
  review_status,
  numcomments,
  lastSubmitted,
  loggedInAsEmail,
  isAdmin,
  userCanExecuteActions,
  onChangeStatus,
  onStartVote,
  setStatusProposalToken,
  onDeleteDraftProposal,
  setStatusProposalError,
  tokenFromStartingVoteProp,
  isTestnet,
  getVoteStatus,
  confirmWithModal,
  userId
}) => {
  const voteStatus = getVoteStatus(id) && getVoteStatus(id).status;
  const displayVersion = review_status === PROPOSAL_STATUS_PUBLIC;
  const isVotingActiveOrFinished = voteStatus === PROPOSAL_VOTING_ACTIVE || voteStatus === PROPOSAL_VOTING_FINISHED;
  const isEditable = authorid === userId && !isVotingActiveOrFinished && review_status !== PROPOSAL_STATUS_CENSORED;
  return (
    <div
      className={`thing id-${id} odd link ${
        review_status === PROPOSAL_STATUS_CENSORED ? "spam" : null
      }`}
      data-author={author}
      data-author-fullname=""
      data-domain={domain}
      data-fullname={name}
      data-rank={rank}
      data-subreddit={subreddit}
      data-subreddit-fullname={subreddit_id}
      data-timestamp={created_utc}
      data-type="link"
      data-url={url}
      id={`thing_${name}`}
    >
      <p className="parent" />
      {thumbnail &&
        ![ "image", "default", "nsfw", "self" ].find(sub => sub === thumbnail) ? (
          <Link className="thumbnail may-blank loggedin" href={url}>
            <img alt="Thumb" height={70} src={thumbnail} width={70} />
          </Link>
        ) : null}
      {is_self ? <Link className="thumbnail self may-blank" href={url} /> : null}
      <div className="entry unvoted">
        <p className="title" style={{ display: "flex" }}>
          <Link className="title may-blank loggedin" href={url} tabIndex={rank}>
            {title} {review_status === PROPOSAL_STATUS_UNREVIEWED_CHANGES ?
              <span className="font-12 warning-color">(edited)</span> : null}
          </Link>{" "}
          {domain ? (
            <span className="domain">
              (<Link href={`/domain/${domain}/`}>{domain}</Link>)
            </span>
          ) : null}
          {isEditable ?
            <div style={{ flex: "1", display: "flex", justifyContent: "flex-end" }}>
              <Link
                href={`/proposals/${id}/edit`}
                className="edit-proposal"
                onClick={() => null}>
                <i className="fa fa-edit right-margin-5" />
                Edit
              </Link>
            </div> : null}
        </p>
        <p className="tagline">
          <span className="submitted-by">
            submitted{" "}
            <Tooltip
              text={new Date(created_utc * 1000).toLocaleString()}
              wrapperStyle={{
                display: "inline"
              }}
              tipStyle={{
                right: "-10px",
                top: "20px",
                width: "100px",
                textAlign: "center"
              }}>
              <TimeAgo
                style={{ cursor: "pointer" }}
                datetime={created_utc * 1000}
              />
            </Tooltip>
            {author &&
              <span>
                {" by "}
                {isAdmin && (
                  <Link href={`/user/${authorid}`}>{author}</Link>
                )}
                {!isAdmin && <span> {author} </span>}
              </span>
            }
            {displayVersion && version ? ` - version ${version}` : null}
            {numcomments > 0 &&
              <span> - {numcomments}{numcomments === 1 ? " comment" : " comments"} </span>
            }
          </span>
        </p>
        {!draftId && (
          <p className="tagline proposal-token">
            {id} • {getProposalStatus(review_status)}
          </p>
        )}
        {draftId && (
          <div className="tagline proposal-draft">
            Saved as draft
            <span
              className="delete-draft"
              onClick={() => {
                confirmWithModal("CONFIRM_ACTION",
                  { message: "Are you sure you want to delete this draft?" }).then(
                  ok => ok && onDeleteDraftProposal(draftId)
                );
              }}>
              <i className="fa fa-trash" />
              Delete
            </span>
          </div>
        )}
        {
          review_status === 4 &&
          <VoteStats token={id} />
        }
        {expanded &&
          (lastSubmitted === id ? (
            <Message height="80px" type="info">
              <span>
                <p
                  style={{
                    marginTop: "0.4166667em",
                    marginBottom: "0.4166667em"
                  }}
                >
                  Your proposal has been created, but it will not be public
                until an admin approves it. You can{" "}
                  <DownloadBundle message="download your proposal" /> and use
                the{" "}
                  <a
                    href="https://github.com/decred/politeia/tree/master/politeiad/cmd/politeia_verify"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    politeia_verify tool
                  </a>{" "}
                  to prove that your submission has been accepted for review by
                  Politeia.
                </p>
              </span>
            </Message>
          ) : (
            <div style={{ marginTop: "15px", marginBottom: "15px" }}>
              <DownloadBundle />
            </div>
          ))}
        <Expando {...{ expanded, is_self, selftext, selftext_html }} />
        <ProposalImages readOnly files={otherFiles} />
        {isAdmin ? (
          <ul className="flat-list buttons">
            <li className="first">
              <Link
                className="bylink comments may-blank"
                data-event-action="comments"
                href={permalink}
              >
                permalink
              </Link>
            </li>
            {isAdmin
              ? review_status === PROPOSAL_STATUS_UNREVIEWED || review_status === PROPOSAL_STATUS_UNREVIEWED_CHANGES
                ? (authorid !== userid) || isTestnet
                  ? [
                    <li key="spam">
                      <form
                        className="toggle remove-button"
                        onSubmit={e =>
                          onChangeStatus(
                            loggedInAsEmail,
                            id,
                            PROPOSAL_STATUS_CENSORED
                          ) && e.preventDefault()
                        }
                      >
                        <button
                          className={`togglebutton access-required${!userCanExecuteActions ? " not-active disabled" : ""}`}
                          data-event-action="spam"
                          type="submit"
                        >
                          spam
                        </button>
                      </form>
                    </li>,
                    <li key="approve">
                      <form
                        className="toggle approve-button"
                        onSubmit={e =>
                          onChangeStatus(
                            loggedInAsEmail,
                            id,
                            PROPOSAL_STATUS_PUBLIC
                          ) && e.preventDefault()
                        }
                      >
                        <button
                          className={`togglebutton access-required${!userCanExecuteActions ? " not-active disabled" : ""}`}
                          data-event-action="approve"
                          type="submit"
                          disabled={!userCanExecuteActions}
                        >
                          approve
                        </button>
                      </form>
                    </li>
                  ]
                  : <Message type="info" header="Third party review required" body="Your proposal must be reviewed by another admin." />
                : review_status === PROPOSAL_STATUS_PUBLIC && voteStatus === PROPOSAL_VOTING_NOT_STARTED ?
                  <li key="start-vote">
                    <ButtonWithLoadingIcon
                      className={`c-btn c-btn-primary${!userCanExecuteActions ? " not-active disabled" : ""}`}
                      onClick={e =>
                        onStartVote(
                          loggedInAsEmail,
                          id
                        ) && e.preventDefault()
                      }
                      text="Start Vote"
                      data-event-action="start-vote"
                      isLoading={tokenFromStartingVoteProp === id}
                    />
                  </li> : null
              : null}
          </ul>
        ) : null}
        {setStatusProposalError && setStatusProposalToken === id ? (
          <Message
            key="error"
            type="error"
            header="Error setting proposal status"
            body={setStatusProposalError}
          />
        ) : null}
      </div>
      <div className="child" />
      <div className="clearleft" />
    </div>
  );
};

export const Comp = actions(ThingLinkComp);

class ThingLink extends React.Component {

  componentDidMount() {
    const { isProposalStatusApproved, history } = this.props;
    if (isProposalStatusApproved)
      history.push("/");
  }

  render() {
    return <Comp {...this.props} />;
  }
}

export default connector(withRouter(ThingLink));
