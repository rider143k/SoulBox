export function saveAuth(token) {
  localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}
