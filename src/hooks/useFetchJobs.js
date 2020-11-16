import React, { useReducer, useEffect } from 'react'
import axios from 'axios'

const ACTIONS = {
  MAKE_REQUEST: 'make-request',
  GET_DATA: 'get-data',
  ERROR: 'error',
  UPDATE_HAS_NEXT_PAGE: 'update-has-next-page',
}

// const CORS = 'https://cors-anywhere.herokuapp.com/'
// const BASE_URL = `${CORS}https://jobs.github.com/positions.json`
const BASE_URL = `/positions.json`

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.MAKE_REQUEST:
      return { loading: true, jobs: [] }
    case ACTIONS.GET_DATA:
      return { ...state, loading: false, jobs: action.payload.jobs }
    case ACTIONS.ERROR:
      return { ...state, loading: false, error: action.payload.error, jobs: [] }
    case ACTIONS.UPDATE_HAS_NEXT_PAGE:
      return { ...state, hasNextPage: action.payload.hasNextPage }
    default:
      return state
  }
}

function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, {
    jobs: [],
    loading: true,
    error: false,
  })

  useEffect(() => {
    const cancelToken1 = axios.CancelToken.source()
    const cancelToken2 = axios.CancelToken.source()
    const getData = async () => {
      dispatch({ type: ACTIONS.MAKE_REQUEST })
      try {
        const { data } = await axios.get(BASE_URL, {
          cancelToken: cancelToken1.token,
          params: { markdown: true, page, ...params },
        })
        dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: data } })
      } catch (error) {
        if (axios.isCancel(error)) return
        dispatch({ type: ACTIONS.ERROR, payload: { error } })
      }
    }
    const checkHasNextPage = async () => {
      try {
        const { data } = await axios.get(BASE_URL, {
          cancelToken: cancelToken2.token,
          params: { markdown: true, page: page + 1, ...params },
        })
        dispatch({
          type: ACTIONS.UPDATE_HAS_NEXT_PAGE,
          payload: { hasNextPage: data.length !== 0 },
        })
      } catch (error) {
        if (axios.isCancel(error)) return
        dispatch({ type: ACTIONS.ERROR, payload: { error } })
      }
    }
    getData()
    checkHasNextPage()

    return () => {
      cancelToken1.cancel()
      cancelToken2.cancel()
    }
  }, [params, page])

  return state
}

export default useFetchJobs
