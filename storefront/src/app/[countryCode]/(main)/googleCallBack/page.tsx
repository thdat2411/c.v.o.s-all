"use client" // include with Next.js 13+

import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"
import { decodeToken } from "react-jwt"

export default function GoogleCallback() {
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer>()
  const [code, setCode] = useState<string | null>(null)
  const [state, setState] = useState<string | null>(null)

  // Capture code and state from the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    setCode(queryParams.get("code"))
    setState(queryParams.get("state"))
  }, [])

  // Send the code to your backend to get the token
  const sendCallback = async () => {
    const { token } = await fetch(
      `http://localhost:9000/auth/customer/google/callback?code=${code}&state=${state}`,
      {
        credentials: "include",
        method: "POST",
      }
    ).then((res) => res.json())

    if (!token) {
      alert("Authentication Failed")
      return
    }

    return token
  }

  // Fetch user profile from Google
  const fetchUserProfile = async () => {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code: code || "",
          client_id:
            "655599102301-gqui877d2ghlaeit4i57m3r546sl50dm.apps.googleusercontent.com",
          client_secret: "GOCSPX-IeRIuRqy f47Eo4uDZIHzmvbDeDSw",
          redirect_uri: "http://localhost:8000/vn/googleCallBack",
          grant_type: "authorization_code",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const { access_token } = await response.json()
      const userProfileResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )

      if (!userProfileResponse.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const {
        email,
        given_name: first_name,
        family_name: last_name,
      } = await userProfileResponse.json()

      return { email, first_name, last_name }
    } catch (error) {
      console.error(error)
      throw new Error("Failed to fetch user profile from Google")
    }
  }

  // Create a new customer
  const createCustomer = async (
    token: string,
    email: string,
    first_name: string,
    last_name: string
  ) => {
    await fetch(`http://localhost:9000/store/customers`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key":
          "pk_c0a85c0e1426da5892cffc0fb9c9758f1d04af162b198c8e5425842896925470",
      },
      body: JSON.stringify({
        email: email,
        first_name: first_name,
        last_name: last_name,
      }),
    }).then((res) => res.json())
  }

  // Refresh token if necessary
  const refreshToken = async (token: string) => {
    const result = await fetch(`http://localhost:9000/auth/token/refresh`, {
      credentials: "include",
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json())

    return result.token
  }

  // Validate the callback and handle customer creation or token refresh
  const validateCallback = async () => {
    let token = await sendCallback()

    if (!token) {
      return
    }

    const shouldCreateCustomer =
      (decodeToken(token) as { actor_id: string }).actor_id === ""

    if (shouldCreateCustomer) {
      // Fetch the user profile from Google
      const { email, first_name, last_name } = await fetchUserProfile()

      // Create customer with the fetched Google profile data
      await createCustomer(token, email, first_name, last_name)

      token = await refreshToken(token)
    }

    // Use token to send authenticated requests
    const { customer: customerData } = await fetch(
      `http://localhost:9000/store/customers/me`,
      {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key":
            "pk_c0a85c0e1426da5892cffc0fb9c9758f1d04af162b198c8e5425842896925470",
        },
      }
    ).then((res) => res.json())

    setCustomer(customerData)
    setLoading(false)
  }

  useEffect(() => {
    if (!loading || !code || !state) {
      return
    }

    validateCallback()
  }, [loading, code, state])

  return (
    <div>
      {loading && <span>Loading...</span>}
      {customer && <span>Created customer {customer.email} with Google.</span>}
    </div>
  )
}
