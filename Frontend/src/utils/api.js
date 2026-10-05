export const apiFetch = async (url, options = {}, navigate) => {
    const token = localStorage.getItem("token");
try{
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
} catch (error) {

        // Backend/server is down

        console.log("Backend connection error:", error);

        return{
            backendDown:true
        };
}
};