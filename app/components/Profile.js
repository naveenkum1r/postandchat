import React, { useEffect, useContext } from "react"
import { useImmer } from "use-immer"
import Page from "./Page"
import { useParams, NavLink, Route, Switch } from "react-router-dom"
import Axios from "axios"

import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import ProfileFollowers from "./ProfileFollowers"
import ProfileFollowing from "./ProfileFollowing"

function Profile() {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" },
    },
  })
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchdata() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
        setState((draft) => {
          draft.profileData = response.data
        })
      } catch (e) {
        console.log("there was a problem or the request was cancelled")
      }
    }
    fetchdata()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()
      async function fetchdata() {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
          setState((draft) => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("there was a problem or the request was cancelled")
        }
      }
      fetchdata()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.startFollowingRequestCount])

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()
      async function fetchdata() {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
          setState((draft) => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("there was a problem or the request was cancelled")
        }
      }
      fetchdata()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.stopFollowingRequestCount])
  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount++
    })
  }
  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            UnFollow <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          {Boolean(!state.profileData.counts.postCount) && appState.user.username != state.profileData.profileUsername && <p className="lead text-center">{state.profileData.profileUsername} doesn't have any post yet</p>}
          {Boolean(!state.profileData.counts.postCount) && appState.user.username == state.profileData.profileUsername && <p className="lead text-center">You don't have any post yet. Try creating a post</p>}
          {Boolean(state.profileData.counts.postCount) && <ProfilePosts />}
        </Route>
        <Route path="/profile/:username/followers">
          {Boolean(!state.profileData.counts.followerCount) && !appState.loggedIn && <p className="lead text-center">Sign in to follow {state.profileData.profileUsername} </p>}
          {Boolean(!state.profileData.counts.followerCount) && appState.user.username != state.profileData.profileUsername && <p className="lead text-center">{state.profileData.profileUsername} doesn't have any follower yet</p>}
          {Boolean(!state.profileData.counts.followerCount) && appState.user.username == state.profileData.profileUsername && <p className="lead text-center">You don't have any follower yet. Try creating some more posts</p>}
          {Boolean(state.profileData.counts.followerCount) && <ProfileFollowers />}
        </Route>
        <Route path="/profile/:username/following">
          {Boolean(!state.profileData.counts.followingCount) && appState.user.username != state.profileData.profileUsername && <p className="lead text-center">{state.profileData.profileUsername} doesn't follow anybody.</p>}
          {Boolean(!state.profileData.counts.followingCount) && appState.user.username == state.profileData.profileUsername && <p className="lead text-center">You aren't following anybody. Follow people to get posts in feed</p>}
          {Boolean(state.profileData.counts.followingCount) && <ProfileFollowing />}
        </Route>
      </Switch>
    </Page>
  )
}

export default Profile
