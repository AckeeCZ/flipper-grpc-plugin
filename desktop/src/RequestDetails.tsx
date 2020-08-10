import React from "react";
import {Header, Request, Response} from "./types";
import {Component, FlexColumn, ManagedTable, Panel, styled, Text} from 'flipper';

const WrappingText = styled(Text)({
    wordWrap: 'break-word',
    width: '100%',
    lineHeight: '125%',
    padding: '3px 0',
});


type RequestDetailsProps = {
    request: Request;
    response: Response | null | undefined;
};

type RequestDetailsState = {};


export default class RequestDetails extends Component<RequestDetailsProps, RequestDetailsState> {

    static Container = styled(FlexColumn)({
        height: '100%',
        overflow: 'auto',
    });

    render() {
        const {request, response} = this.props;
        return (
            <RequestDetails.Container>
                {request.headers.length > 0 ? (
                    <Panel
                        heading={'Request Headers'}
                        floating={false}
                        padded={false}>
                        <HeaderInspector headers={request.headers}/>
                    </Panel>
                ) : null}

                {request.data != null ? (
                    <Panel
                        heading={'Request Body'}
                        floating={false}
                        padded={false}>
                        <BodyInspector
                            data={request.data}
                        />
                    </Panel>
                ) : null}

                {response ? (
                    <>
                        {response.headers.length > 0 ? (
                            <Panel
                                heading={`Response Headers`}
                                floating={false}
                                padded={false}>
                                <HeaderInspector headers={response.headers}/>
                            </Panel>
                        ) : null}
                        {response.data != null ? (
                            <Panel
                                heading={`Response Body`}
                                floating={false}
                                padded={false}>
                                <BodyInspector
                                    data={response.data}
                                />
                            </Panel>
                        ) : null}
                    </>
                ) : null}

            </RequestDetails.Container>
        )
    }
}

const KeyValueColumnSizes = {
    key: '30%',
    value: 'flex',
};

const KeyValueColumns = {
    key: {
        value: 'Key',
        resizable: false,
    },
    value: {
        value: 'Value',
        resizable: false,
    },
};

type HeaderInspectorProps = {
    headers: Array<Header>;
};

type HeaderInspectorState = {
    computedHeaders: Object;
};

class HeaderInspector extends Component<HeaderInspectorProps, HeaderInspectorState> {
    render() {
        const computedHeaders: Map<string, string> = this.props.headers.reduce(
            (sum, header) => {
                return sum.set(header.key, header.value);
            },
            new Map(),
        );

        const rows: any = [];
        computedHeaders.forEach((value: string, key: string) => {
            rows.push({
                columns: {
                    key: {
                        value: <WrappingText>{key}</WrappingText>,
                    },
                    value: {
                        value: <WrappingText>{value}</WrappingText>,
                    },
                },
                copyText: value,
                key,
            });
        });

        return rows.length > 0 ? (
            <ManagedTable
                multiline={true}
                columnSizes={KeyValueColumnSizes}
                columns={KeyValueColumns}
                rows={rows}
                autoHeight={true}
                floating={false}
                zebra={false}
            />
        ) : null;
    }
}


const BodyContainer = styled.div({
    paddingTop: 10,
    paddingBottom: 10,
});

class JSONText extends Component<{ children: any }> {
    static NoScrollbarText = styled(Text)({
        overflowY: 'hidden',
    });

    render() {
        const jsonObject = this.props.children;
        return (
            <JSONText.NoScrollbarText code whiteSpace="pre" selectable>
                {JSON.stringify(jsonObject, null, 2)}
                {'\n'}
            </JSONText.NoScrollbarText>
        );
    }
}


class BodyInspector extends Component<{
    data: string
}> {
    render() {
        const {data} = this.props;
        const parsed = JSON.parse(data);
        return <BodyContainer>
            <JSONText>{parsed}</JSONText>
        </BodyContainer>
    }
}
