import axios from "axios";
const baseUrl = "/api/blogs";

let token = null;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
};

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const create = (blog) => {
  const request = axios.post(baseUrl, blog, {
    headers: {
      Authorization: token,
    },
  });
  return request.then((response) => response.data);
};

const deleteBlog = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`, {
    headers: {
      Authorization: token,
    },
  });
  return request.then((response) => response.data);
};

const update = (id, blog) => {
  const request = axios.put(`${baseUrl}/${id}`, blog);
  return request.then((response) => response.data);
};

export default { getAll, create, setToken, update, deleteBlog };
