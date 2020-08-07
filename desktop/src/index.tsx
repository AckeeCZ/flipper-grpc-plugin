import React from 'react';
import {Button, DetailSidebar, FlexColumn, FlexRow, FlipperPlugin, SearchableTable, TableBodyRow} from 'flipper';

import {Request, RequestId, Response} from "./types";
import RequestDetails from "./RequestDetails";
import {DurationColumn, StatusColumn, TextEllipsis, TimestampColumn} from "./RequestTableRowComponents";

const COLUMN_SIZE = {
    requestTimestamp: 100,
    url: 100,
    method: 'flex',
    status: 200,
    duration: 100,
};

const COLUMN_ORDER = [
    {key: 'requestTimestamp', visible: true},
    {key: 'url', visible: true},
    {key: 'method', visible: true},
    {key: 'status', visible: true},
    {key: 'duration', visible: true},
];

const COLUMNS = {
    requestTimestamp: {value: 'Request Time'},
    url: {value: 'URL'},
    method: {value: 'Method'},
    status: {value: 'Status'},
    duration: {value: 'Duration'},
};

type State = {
    selectedId: string | null,
};

type PersistedState = {
    requests: { [id: string]: Request };
    responses: { [id: string]: Response };
};

export default class extends FlipperPlugin<State, any, PersistedState> {

    static defaultPersistedState = {
        requests: {},
        responses: {},
    };

    static persistedStateReducer(
        persistedState: PersistedState,
        method: string,
        data: Request | Response,
    ) {
        switch (method) {
            case 'newRequest':
                return Object.assign({}, persistedState, {
                    requests: {...persistedState.requests, [data.id]: data as Request},
                });
            case 'newResponse':
                return Object.assign({}, persistedState, {
                    responses: {...persistedState.responses, [data.id]: data as Response},
                });
            default:
                return persistedState;
        }
    }

    constructor(props: any) {
        super(props);
        this.state = {
            selectedId: null
        };
    }

    render() {
        const {requests, responses} = this.props.persistedState;
        const {selectedId} = this.state;
        const rows: any = [];

        for (const [, req] of Object.entries(requests)) {
            rows.push(buildRow(req, responses[req.id]))
        }

        let highlightedRows = selectedId ? new Set([selectedId]) : null;
        return <FlexColumn grow={true}>
            <SearchableTable
                virtual={true}
                multiline={false}
                multiHighlight={false}
                stickyBottom={true}
                floating={false}
                columnSizes={COLUMN_SIZE}
                columns={COLUMNS}
                columnOrder={COLUMN_ORDER}
                rows={rows}
                onRowHighlighted={this.onRowHighlighted}
                highlightedRows={highlightedRows}
                rowLineHeight={26}
                allowRegexSearch={true}
                allowBodySearch={true}
                zebra={false}
                clearSearchTerm={false}
                defaultSearchTerm={''}
                actions={
                    <FlexRow>
                        <Button onClick={this.clearTable}>Clear Table</Button>
                    </FlexRow>
                }
            />

            <DetailSidebar width={500}>{this.renderSidebar()}</DetailSidebar>
        </FlexColumn>
    }

    onRowHighlighted = (selectedIds: Array<RequestId>) => {
        this.setState({selectedId: selectedIds.length == 0 ? null : selectedIds[0]});
    };

    clearTable() {
        this.setState({
            selectedId: null
        });
        this.props.setPersistedState({responses: {}, requests: {}});
    }

    renderSidebar() {
        const {requests, responses} = this.props.persistedState;
        const {selectedId} = this.state;

        if (!selectedId) {
            return null;
        }
        const requestWithId = requests[selectedId];
        if (!requestWithId) {
            return null;
        }
        return <RequestDetails
            request={requestWithId}
            response={responses[selectedId]}
        />
    }
}


function buildRow(
    request: Request,
    response: Response | null | undefined,
): TableBodyRow | null | undefined {
    if (request == null) {
        return null;
    }

    return {
        columns: {
            requestTimestamp: {
                value: (
                    <TimestampColumn timestamp={request.timestamp}/>
                ),
            },
            url: {
                value: (
                    <TextEllipsis>{request.authority}</TextEllipsis>
                ),
                isFilterable: true,
            },
            method: {
                value: <TextEllipsis>{request.method}</TextEllipsis>,
                isFilterable: true,
            },
            status: {
                value: (
                    <StatusColumn>{response ? response.status : undefined}</StatusColumn>
                ),
                isFilterable: true,
            },
            duration: {
                value: <DurationColumn request={request} response={response}/>,
            },
        },
        key: request.id,
        filterValue: `${request.method} ${request.authority}`,
        sortKey: request.timestamp,
        copyText: "",
        highlightOnHover: true,
        style: undefined,
        requestBody: request.data,
        responseBody: response == undefined ? undefined : response.data,
    };
}
