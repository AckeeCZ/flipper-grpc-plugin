package com.ackee.flipper.grpc

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
        val id = UUID.randomUUID().toString()

        return object : ForwardingClientCall.SimpleForwardingClientCall<ReqT, RespT>(
            next.newCall(
                method,
                callOptions
            )
        ) {

            private var headers: Metadata? = null

            override fun start(responseListener: ClientCall.Listener<RespT>, headers: Metadata) {
                this.headers = headers
                class LoggingClientCallListener :
                    ForwardingClientCallListener.SimpleForwardingClientCallListener<RespT>(
                        responseListener
                    ) {

                    private var headers: Metadata? = null
                    private var message: RespT? = null

                    override fun onClose(status: Status, trailers: Metadata) {
                        super.onClose(status, trailers)
                        flipperGrpcPlugin.reportResponse(
                            Response(
                                id = id,
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
                super.start(LoggingClientCallListener(), headers)
            }

            override fun sendMessage(message: ReqT) {
                super.sendMessage(message)
                flipperGrpcPlugin.reportRequest(
                    Request(
                        id = id,
                        authority = next.authority(),
                        method = method.fullMethodName,
                        data = message?.toJson() ?: "",
                        unixTimestampMs = System.currentTimeMillis(),
                        headers = headers?.toHeaders().orEmpty()
                    )
                )
            }
        }
    }
}

private val gson = GsonBuilder().setPrettyPrinting().create()
private fun Any.toJson() = gson.toJson(this)
