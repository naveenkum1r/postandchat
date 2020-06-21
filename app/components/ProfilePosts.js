import React, { useEffect, useState } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadinfDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function ProfilePosts() {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: ourRequest.token })
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("There was a problem in getting posts")
      }
    }
    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  if (isLoading) return <LoadinfDotsIcon />
  return (
    <div className="list-group">
      {posts.map((post) => {
        return <Post post={post} key={post._id} noAuthor={true} />
      })}
    </div>
  )
}

export default ProfilePosts
