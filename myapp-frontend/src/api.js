function apiFetch(path, options={}) {
  const url = `${process.env.REACT_APP_API_URL}${path}`;
  options = {...options};
  options.credentials = "include";
  if (options.data) {
    options.body = JSON.stringify(options.data);
    delete options["data"];
    if (!options.method) {
      options.method = "POST";
    }
    if (!options.headers){
      options.headers = {};
    }
    if (!options.headers["Content-Type"]) {
      options.headers['Content-Type'] = 'application/json';
    }
  }
  return fetch(url, options).then(response => {
    if (response.status < 200 || response.status >= 400) {
      throw response;
    }
    return response;
  });
}

export default class API {
  static getToken() {
    return apiFetch("/auth/token");
  }

  static getCurrentCompany() {
    return apiFetch("/proxy/v1/companies/current");
  }

  static createPurchase(data) {
    return apiFetch("/proxy/v1/purchases", {data});
  }
}
