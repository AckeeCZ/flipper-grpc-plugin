export type RequestId = string;

export type Header = {
    key: string;
    value: string;
};

export type Request = {
    id: RequestId;
    timestamp: number;
    authority: string;
    method: string;
    headers: Array<Header>;
    data: string | null | undefined;
};

export type Response = {
    id: RequestId;
    timestamp: number;
    status: string;
    headers: Array<Header>;
    cause: string | null;
    data: string | null | undefined;
};
