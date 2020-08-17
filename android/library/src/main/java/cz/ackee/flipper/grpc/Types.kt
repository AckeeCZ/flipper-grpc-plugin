package cz.ackee.flipper.grpc

import io.grpc.Metadata

data class Header(val key: String, val value: String)

fun Metadata.toHeaders(): List<Header> {
    return keys().mapNotNull {
        try {
            Header(
                it,
                get(Metadata.Key.of(it, Metadata.ASCII_STRING_MARSHALLER)).toString()
            )
        } catch (e: Exception) {
            null
        }
    }
}

data class Request(
    val id: String,
    val unixTimestampMs: Long,
    val authority: String,
    val method: String,
    val headers: List<Header>,
    val data: String
)

data class Response(
    val id: String,
    val unixTimestampMs: Long,
    val status: String,
    val cause: String?,
    val headers: List<Header>,
    val data: String?
)