import mockData from "./mock-data";

export const extractLocations = (events) => {
  const extractedLocations = events.map((event) => event.location);
  const locations = [...new Set(extractedLocations)];
  return locations;
};

const checkToken = async (accessToken) => {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
  );
  const result = await response.json();
  return result;
};

export const getEvents = async () => {
  if (window.location.href.startsWith("http://localhost")) {
    return mockData;
  }

  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    return null; // Return null if access token is not available
  }
  const tokken = await getAccessToken();
  if (!tokken) {
    return null;
  }
  try {
    const tokenCheck = await checkToken(accessToken);
    if (tokenCheck.error) {
      throw new Error("Invalid access token");
    }

    removeQuery();
    const url =
      "https://udiwrusn56.execute-api.us-east-2.amazonaws.com/dev/api/get-events" +
      "/" +
      accessToken;
    const response = await fetch(url);
    const result = await response.json();
    return result.events || null; // Return fetched events or null if no events are fetched
  } catch (error) {
    console.error("Error fetching events:", error);
    return null; // Return null if there's an error
  }
};

const removeQuery = () => {
  let newurl;
  if (window.history.pushState && window.location.pathname) {
    newurl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname;
    window.history.pushState("", "", newurl);
  } else {
    newurl = window.location.protocol + "//" + window.location.host;
    window.history.pushState("", "", newurl);
  }
};

const getToken = async (code) => {
  const encodeCode = encodeURIComponent(code);
  const response = await fetch(
    "https://udiwrusn56.execute-api.us-east-2.amazonaws.com/dev/api/token" +
      "/" +
      encodeCode
  );
  const { access_token } = await response.json();
  if (access_token) {
    localStorage.setItem("access_token", access_token);
  }
  return access_token;
};

export const getAccessToken = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    if (code) {
      return getToken(code);
    } else {
      const response = await fetch(
        "https://udiwrusn56.execute-api.us-east-2.amazonaws.com/dev/api/get-auth-url"
      );
      const result = await response.json();
      const { authURL } = result;
      window.location.href = authURL;
    }
  }
  return accessToken;
};
