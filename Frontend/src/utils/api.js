export const apiFetch = async (url, options = {}, navigate) => {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return null;
    }

    return response;
};