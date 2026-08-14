interface ApiErrorBody {
    response?: {
        data?: {
            error?: string;
        };
        status?: number;
    };
}

export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
    if (error && typeof error === "object" && "response" in error) {
        const { response } = error as ApiErrorBody;
        return response?.data?.error || fallback;
    }
    return fallback;
};

export const getApiStatus = (error: unknown): number | undefined => {
    if (error && typeof error === "object" && "response" in error) {
        const { response } = error as ApiErrorBody;
        return response?.status;
    }
    return undefined;
};
