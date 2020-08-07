import React, {PureComponent} from "react";
import {colors, Glyph, styled, Text} from "flipper";
import {padStart} from 'lodash';
import {Request, Response} from "./types";

export const TextEllipsis = styled(Text)({
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    lineHeight: '18px',
    paddingTop: 4,
});


function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return `${padStart(date.getHours().toString(), 2, '0')}:${padStart(
        date.getMinutes().toString(),
        2,
        '0',
    )}:${padStart(date.getSeconds().toString(), 2, '0')}.${padStart(
        date.getMilliseconds().toString(),
        3,
        '0',
    )}`;
}


export class TimestampColumn extends PureComponent<{
    timestamp: number;
}> {
    render() {
        const {timestamp} = this.props;

        return (
            <TextEllipsis> {formatTimestamp(timestamp)} </TextEllipsis>
        );
    }
}

const Icon = styled(Glyph)({
    marginTop: -3,
    marginRight: 3,
});

export class StatusColumn extends PureComponent<{
    children?: string;
}> {
    render() {
        const {children} = this.props;
        let glyph;

        if (children != null && children != 'OK') {
            glyph = <Icon name="stop" color={colors.red}/>;
        }

        return (
            <TextEllipsis>
                {glyph}
                {children}
            </TextEllipsis>
        );
    }
}

export class DurationColumn extends PureComponent<{
    request: Request;
    response: Response | null | undefined;
}> {
    static Text = styled(Text)({
        flex: 1,
        textAlign: 'right',
        paddingRight: 10,
    });

    render() {
        const {request, response} = this.props;
        const duration = response ? response.timestamp - request.timestamp : undefined;
        return (
            <DurationColumn.Text selectable={false}>
                {duration != null ? duration.toLocaleString() + 'ms' : ''}
            </DurationColumn.Text>
        );
    }
}
