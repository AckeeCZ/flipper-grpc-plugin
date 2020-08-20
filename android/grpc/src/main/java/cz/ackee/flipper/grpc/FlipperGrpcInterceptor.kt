package cz.ackee.flipper.grpc

import com.google.gson.GsonBuilder
import io.grpc.*
import java.util.*

/**
 * Interceptor that logs requests and responses from gRPC server
 */
internal class FlipperGrpcInterceptor(
    private val flipperGrpcPlugin: FlipperGrpcPlugin
) : ClientInterceptor {

    override fun <ReqT : Any?, RespT : Any?> interceptCall(
        method: MethodDescriptor<ReqT, RespT>,
        callOptions: CallOptions,
        next: Channel
    ): ClientCall<ReqT, RespT> {
        val requestId = UUID.randomUUID().toString()
        return LoggingForwardingClientCall(
            flipperGrpcPlugin,
            requestId,
            method,
            next,
            callOptions
        )
    }
}

private class LoggingForwardingClientCall<ReqT, RespT>(
    private val flipperGrpcPlugin: FlipperGrpcPlugin,
    private val requestId: String,
    private val method: MethodDescriptor<ReqT, RespT>,
    private val next: Channel,
    callOptions: CallOptions
) : ForwardingClientCall.SimpleForwardingClientCall<ReqT, RespT>(next.newCall(
    method,
    callOptions
)) {

    private var headers: Metadata? = null

    override fun start(responseListener: ClientCall.Listener<RespT>, headers: Metadata) {
        this.headers = headers
        super.start(
            LoggingClientCallListener(
                flipperGrpcPlugin,
                requestId,
                responseListener
            ), headers
        )
    }

    override fun sendMessage(message: ReqT) {
        super.sendMessage(message)
        flipperGrpcPlugin.reportRequest(
            Request(
                id = requestId,
                authority = next.authority(),
                method = method.fullMethodName,
                data = message?.toJson() ?: "",
                unixTimestampMs = System.currentTimeMillis(),
                headers = headers?.toHeaders().orEmpty()
            )
        )
    }
}

private class LoggingClientCallListener<RespT>(
    private val flipperGrpcPlugin: FlipperGrpcPlugin,
    private val requestId: String,
    responseListener: ClientCall.Listener<RespT>
) : ForwardingClientCallListener.SimpleForwardingClientCallListener<RespT>(
    responseListener
) {

    private var headers: Metadata? = null
    private var message: RespT? = null

    override fun onClose(status: Status, trailers: Metadata) {
        super.onClose(status, trailers)
        flipperGrpcPlugin.reportResponse(
            Response(
                id = requestId,
                unixTimestampMs = System.currentTimeMillis(),
                status = status.code.toString(),
                cause = status.description,
                headers = (this.headers ?: trailers).toHeaders(),
                data = message?.toJson()
            )
        )
    }

    override fun onMessage(message: RespT) {
        super.onMessage(message)
        this.message = message
    }

    override fun onHeaders(headers: Metadata?) {
        super.onHeaders(headers)
        this.headers = headers
    }
}

private val gson = GsonBuilder().setPrettyPrinting().create()
private fun Any.toJson() = gson.toJson(this)
